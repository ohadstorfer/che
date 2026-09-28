// Edge function: POST /functions/v1/hablar-reply  (SSE)
// Pancho answers one learner turn (docs/hablar-hld.md §4.5).
//
// Body: { session_id, turn_id, paused_seconds? }. The turn is the draft
// hablar-transcribe stored — the server answers the text it transcribed, never
// text from the client. The response is an SSE stream:
//
//   text      {"seq":n,"delta":"Jaja, "}                 reply text as it's written
//   text_fix  {"seq":n,"from":"…","to":"…"}              sentence n was rewritten by the guard
//   audio     {"seq":n,"text":"…","mp3":"<base64>"}      one per sentence, in order
//   feedback  {has_error,severity,corrected,spans,why_en,better,goals_done}
//   done      {"turn_id","tomas_turn_id","wrap_up","ended","goals_done","audio_path"}
//   error     {"stage":"claude|tts|feedback","retry":bool,"seq"?}
//
// Two Claude calls run in parallel: the streamed reply (cached persona + the
// chat's level/scene block + history) and the structured feedback, which never
// holds the reply up. Each finished sentence goes through the rioplatense guard
// and then to ElevenLabs; several can be in TTS at once, but audio is sent in
// order. All of it runs under EdgeRuntime.waitUntil, so a client that drops
// mid-stream still gets its turn saved, and calling again with the same
// turn_id replays the stored result as one burst.

import { json, preflight } from "../_shared/cors.ts";
import { offendingWords } from "../_shared/rioplatense.ts";
import { SentenceSplitter } from "../_shared/sentences.ts";
import { sseStream, toBase64, type SseWriter } from "../_shared/sse.ts";
import {
  CLAUDE_OPTIONS,
  background,
  caller,
  CHAT_SECONDS,
  claudeUsage,
  concatBytes,
  sessionElapsed,
  GRACE_SECONDS,
  hablarEnv,
  isUuid,
  loadSession,
  logUsage,
  nextUserIdx,
  recordPause,
  serviceClient,
  shouldWrapUp,
  synthesize,
  tomasVoice,
  topicOf,
  TTS_MODEL,
  type Env,
  type Session,
  type Topic,
  type Usage,
} from "../_shared/hablar.ts";
import {
  FEEDBACK_SCHEMA,
  FEEDBACK_SYSTEM,
  feedbackInput,
  GUARD_SYSTEM,
  PERSONA,
  sessionBlock,
  SIMPLIFY_NOTE,
  WRAP_UP_NOTE,
  type Feedback,
} from "../_shared/hablar-prompt.ts";
import { Anthropic, MODEL, plain, structured } from "../_shared/hablar-claude.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const HISTORY_TURNS = 20;
const TTS_PARALLEL = 3;
const LATE_SECONDS = 120; // a draft recorded in the grace period may still be sent a little later
const FALLBACK_LINE = "Perdón, se me cortó. ¿Me lo repetís?";

type Turn = {
  id: string;
  conversation_id: string;
  idx: number | null;
  role: "user" | "tomas";
  status: "draft" | "final";
  text: string;
  audio_path: string | null;
  feedback: Feedback | null;
  meta: Record<string, unknown>;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function storedReply(db: SupabaseClient, turnId: string): Promise<Turn | null> {
  const { data } = await db.from("conversation_turns").select("*").eq("reply_to", turnId).maybeSingle();
  return (data as Turn) ?? null;
}

/** A turn already answered, sent again as one burst. */
async function replay(sse: SseWriter, db: SupabaseClient, user: Turn, tomas: Turn, session: Session) {
  sse.send("text", { seq: 0, delta: tomas.text });
  if (tomas.audio_path) {
    const { data } = await db.storage.from("hablar").download(tomas.audio_path);
    if (data) sse.send("audio", { seq: 0, text: tomas.text, mp3: toBase64(new Uint8Array(await data.arrayBuffer())) });
  }
  const { data: fresh } = await db.from("conversation_turns").select("feedback").eq("id", user.id).maybeSingle();
  if (fresh?.feedback) sse.send("feedback", fresh.feedback);
  sse.send("done", {
    turn_id: user.id,
    tomas_turn_id: tomas.id,
    wrap_up: Boolean(tomas.meta?.wrap_up),
    ended: Boolean(tomas.meta?.ended),
    goals_done: session.goals_done,
    audio_path: tomas.audio_path,
    replay: true,
  });
  sse.close();
}

/** Only what the schema promised, with goals limited to this chat's own. */
function cleanFeedback(raw: Feedback, line: string, goalIds: string[]): Feedback {
  const spans = (raw.spans ?? []).filter((s) => s && typeof s.from === "string" && typeof s.to === "string");
  return {
    has_error: Boolean(raw.has_error),
    severity: raw.has_error ? (raw.severity === "none" ? "minor" : raw.severity) : "none",
    corrected: String(raw.corrected || line),
    spans: raw.has_error ? spans : [],
    why_en: raw.has_error ? String(raw.why_en ?? "") : "",
    better: String(raw.better ?? ""),
    goals_done: [...new Set((raw.goals_done ?? []).filter((g) => goalIds.includes(g)))],
  };
}

/** A tiny semaphore: at most n TTS requests in flight. */
function limiter(n: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active >= n) await new Promise<void>((r) => queue.push(r));
    active++;
    try {
      return await fn();
    } finally {
      active--;
      queue.shift()?.();
    }
  };
}

async function runTurn(opts: {
  env: Env;
  db: SupabaseClient;
  sse: SseWriter;
  session: Session;
  topic: Topic;
  user: Turn;
  userIdx: number;
  userId: string;
}) {
  const { env, db, sse, session, topic, user, userIdx } = opts;
  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });
  const usage: Usage[] = [];
  const goalIds = topic.goals.map((g) => g.id);
  const elapsed = sessionElapsed(session);
  const wrapUp = shouldWrapUp(elapsed, goalIds, session.goals_done);
  const tomasId = crypto.randomUUID();

  // History: every sent line before this one, oldest first.
  const { data: rows } = await db
    .from("conversation_turns")
    .select("idx, role, status, text, meta")
    .eq("conversation_id", session.id)
    .not("idx", "is", null)
    .lt("idx", userIdx)
    .order("idx", { ascending: false })
    .limit(HISTORY_TURNS);
  const history = ((rows ?? []) as Turn[]).filter((t) => t.role === "tomas" || t.status === "final").reverse();
  const opener = history.find((t) => t.idx === 0)?.text ??
    (await db.from("conversation_turns").select("text").eq("conversation_id", session.id).eq("idx", 0).maybeSingle())
      .data?.text ?? "";
  const tomasBefore = [...history].reverse().find((t) => t.role === "tomas")?.text ?? null;

  const notes = [
    session.hint_turns.includes(userIdx) && session.hint_turns.includes(userIdx - 2) ? SIMPLIFY_NOTE : "",
    wrapUp ? WRAP_UP_NOTE : "",
  ].filter(Boolean);
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "[La charla empieza.]" },
    ...history.map((t): Anthropic.MessageParam => ({
      role: t.role === "tomas" ? "assistant" : "user",
      content: t.text || "…",
    })),
    {
      role: "user",
      content: [{
        type: "text",
        text: [user.text, ...notes].join("\n\n"),
        cache_control: { type: "ephemeral" },
      }],
    },
  ];
  const system = [
    { type: "text" as const, text: PERSONA, cache_control: { type: "ephemeral" as const } },
    {
      type: "text" as const,
      text: sessionBlock({ level: session.level, scenario: topic.scenario, culture: topic.culture, opener }),
      cache_control: { type: "ephemeral" as const },
    },
  ];

  // ----- feedback, in parallel -----
  let feedback: Feedback | null = null;
  const feedbackDone = structured<Feedback>(client, {
    system: FEEDBACK_SYSTEM,
    schema: FEEDBACK_SCHEMA as unknown as Record<string, unknown>,
    input: feedbackInput({ level: session.level, goals: topic.goals, goalsDone: session.goals_done, tomasBefore, line: user.text }),
  })
    .then(({ value, usage: u, ms }) => {
      usage.push(claudeUsage({ conversation_id: session.id, turn_id: user.id, model: MODEL, stage: "feedback", ms }, u));
      if (!value) throw new Error("no feedback");
      feedback = cleanFeedback(value, user.text, goalIds);
      sse.send("feedback", feedback);
    })
    .catch((err) => {
      console.error("feedback failed", err);
      sse.send("error", { stage: "feedback", retry: false });
    });

  // ----- sentence pipe: guard → TTS → audio in order -----
  const voiceId = await tomasVoice(db).catch((err) => {
    console.error(err);
    return null;
  });
  const slot = limiter(TTS_PARALLEL);
  const sentences: string[] = [];
  const audio: (Uint8Array<ArrayBuffer> | null)[] = [];
  let emitChain = Promise.resolve();
  let spokenSoFar = "";

  const enqueue = (raw: string) => {
    const seq = sentences.length;
    sentences.push(raw);
    const previousText = spokenSoFar;
    spokenSoFar += (spokenSoFar ? " " : "") + raw;
    const job = (async () => {
      let text = raw;
      if (offendingWords(text).length) {
        try {
          const fix = await plain(client, { system: GUARD_SYSTEM, input: text });
          usage.push(claudeUsage({ conversation_id: session.id, turn_id: tomasId, model: MODEL, stage: "guard", ms: fix.ms }, fix.usage));
          if (fix.text && !offendingWords(fix.text).length) {
            text = fix.text;
            sentences[seq] = text;
            sse.send("text_fix", { seq, from: raw, to: text });
          } else {
            console.warn("guard: sentence still off after rewrite", offendingWords(fix.text || raw));
          }
        } catch (err) {
          console.error("guard rewrite failed", err);
        }
      }
      if (!voiceId) return null;
      return await slot(async () => {
        const t0 = Date.now();
        try {
          const mp3 = await synthesize({ key: env.elevenKey, voiceId, text, previousText });
          usage.push({
            conversation_id: session.id,
            turn_id: tomasId,
            provider: "elevenlabs",
            model: TTS_MODEL(),
            stage: "tts",
            tts_chars: text.length,
            ms: Date.now() - t0,
          });
          return mp3;
        } catch (err) {
          console.error(err);
          return null;
        }
      });
    })();
    emitChain = emitChain.then(async () => {
      const mp3 = await job;
      audio[seq] = mp3;
      if (mp3) sse.send("audio", { seq, text: sentences[seq], mp3: toBase64(mp3) });
      else sse.send("error", { stage: "tts", retry: false, seq });
    });
  };

  // ----- the reply, streamed -----
  const splitter = new SentenceSplitter();
  let deltaSeq = 0;
  let replyText = "";
  const t0 = Date.now();
  try {
    const stream = client.messages.stream({
      model: MODEL,
      // Backstop for the prompt's 40-word limit (~70–80 tokens of Spanish).
      max_tokens: 150,
      // deno-lint-ignore no-explicit-any
      ...({ thinking: { type: "disabled" } } as any),
      system,
      messages,
    });
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        replyText += ev.delta.text;
        sse.send("text", { seq: deltaSeq++, delta: ev.delta.text });
        for (const s of splitter.push(ev.delta.text)) enqueue(s);
      }
    }
    const final = await stream.finalMessage();
    usage.push(claudeUsage({ conversation_id: session.id, turn_id: tomasId, model: MODEL, stage: "reply", ms: Date.now() - t0 }, final.usage));
    const rest = splitter.flush();
    if (rest) enqueue(rest);
  } catch (err) {
    console.error("reply failed", err);
    // Give the turn back so the retry can claim it again straight away.
    await db.from("conversation_turns").update({ status: "draft", idx: null }).eq("id", user.id);
    sse.send("error", { stage: "claude", retry: true });
    sse.close();
    await feedbackDone;
    await logUsage(db, usage);
    return;
  }
  if (!replyText.trim()) {
    sse.send("text", { seq: deltaSeq++, delta: FALLBACK_LINE });
    enqueue(FALLBACK_LINE);
  }

  await emitChain;
  await Promise.race([feedbackDone, sleep(15_000)]);

  // ----- save, then done -----
  const text = sentences.join(" ");
  const clips = audio.filter((a): a is Uint8Array<ArrayBuffer> => !!a);
  const audioPath = clips.length ? `${opts.userId}/${session.id}/${user.id}-tomas.mp3` : null;
  const ended = wrapUp || sessionElapsed(session) >= CHAT_SECONDS;

  let goalsDone = session.goals_done;
  const fb = feedback as Feedback | null;
  if (fb?.goals_done.length) {
    const { data: s } = await db.from("conversations").select("goals_done").eq("id", session.id).single();
    goalsDone = [...new Set([...(s?.goals_done ?? []), ...fb.goals_done])];
    await db.from("conversations").update({ goals_done: goalsDone }).eq("id", session.id);
  }
  const [{ error: insertErr }] = await Promise.all([
    db.from("conversation_turns").insert({
      id: tomasId,
      conversation_id: session.id,
      idx: userIdx + 1,
      role: "tomas",
      status: "final",
      text,
      audio_path: audioPath,
      reply_to: user.id,
      meta: { wrap_up: wrapUp, ended },
    }),
    fb ? db.from("conversation_turns").update({ feedback: fb }).eq("id", user.id) : Promise.resolve(),
  ]);
  if (insertErr) console.error("tomas turn insert failed", insertErr.message);

  sse.send("done", { turn_id: user.id, tomas_turn_id: tomasId, wrap_up: wrapUp, ended, goals_done: goalsDone, audio_path: audioPath });
  sse.close();

  await Promise.all([
    audioPath
      ? db.storage.from("hablar").upload(audioPath, new Blob([concatBytes(clips)], { type: "audio/mpeg" }), {
        contentType: "audio/mpeg",
        upsert: true,
      }).then(({ error }) => error && console.error("reply mp3 upload failed", error.message))
      : Promise.resolve(),
    feedbackDone.then(async () => {
      // Feedback that came after the 15 s cap still lands on the turn.
      const late = feedback as Feedback | null;
      if (late && !fb) await db.from("conversation_turns").update({ feedback: late }).eq("id", user.id);
    }),
  ]);
  await logUsage(db, usage);
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const who = await caller(req, env);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });

  let body: { session_id?: string; turn_id?: string; paused_seconds?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!isUuid(body.turn_id)) return json({ error: "turn_id must be a uuid" }, { status: 400 });

  const db = serviceClient(env);
  // Read together rather than one after another: each is a round trip before
  // Pancho can start talking. The turn is checked against the session below.
  const [session, { data: turnRow }, stored] = await Promise.all([
    loadSession(db, body.session_id, who.userId),
    db.from("conversation_turns").select("*").eq("id", body.turn_id).maybeSingle(),
    storedReply(db, body.turn_id),
  ]);
  if (!session) return json({ error: "no such session" }, { status: 404 });
  // Not waited on: nothing below needs the write, only the value on `session`.
  background(recordPause(db, session, body.paused_seconds));
  const topic = topicOf(session.kind, session.topic_id, session.level);
  if (!topic) return json({ error: "this chat's topic no longer exists" }, { status: 410 });

  let user = turnRow as Turn | null;
  if (!user || user.conversation_id !== session.id || user.role !== "user") {
    return json({ error: "no such turn" }, { status: 404 });
  }

  // Already answered, or being answered by an earlier request: replay.
  let answered = stored;
  if (!answered && user.status === "final") {
    for (let i = 0; i < 25 && !answered; i++) {
      await sleep(1000);
      answered = await storedReply(db, user.id);
    }
  }
  if (answered) {
    const sse = sseStream();
    background(replay(sse, db, user, answered, session));
    return sse.response;
  }

  if (session.ended_at) return json({ error: "ended" }, { status: 409 });
  if (sessionElapsed(session) >= CHAT_SECONDS + GRACE_SECONDS + LATE_SECONDS) {
    return json({ error: "time_up" }, { status: 409 });
  }
  if (!user.text.trim()) return json({ error: "empty turn" }, { status: 400 });

  // Claim the draft: it becomes final and gets its place in the chat.
  let userIdx = user.idx ?? -1;
  if (user.status === "draft") {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: top } = await db
        .from("conversation_turns")
        .select("idx")
        .eq("conversation_id", session.id)
        .not("idx", "is", null)
        .order("idx", { ascending: false })
        .limit(1)
        .maybeSingle();
      userIdx = nextUserIdx(top?.idx ?? 0);
      const { data: claimed, error } = await db
        .from("conversation_turns")
        .update({ status: "final", idx: userIdx })
        .eq("id", user.id)
        .eq("status", "draft")
        .select("*")
        .maybeSingle();
      if (error?.code === "23505") continue; // idx taken meanwhile
      if (error) return json({ error: "could not claim the turn" }, { status: 500 });
      if (!claimed) return json({ error: "turn is being answered", retry: true }, { status: 409 });
      user = claimed as Turn;
      break;
    }
    if (user.status !== "final") return json({ error: "could not claim the turn", retry: true }, { status: 409 });
  }
  if (userIdx < 1) return json({ error: "turn has no place in the chat" }, { status: 409 });

  const sse = sseStream();
  background(
    runTurn({ env, db, sse, session, topic, user, userIdx, userId: who.userId }).catch((err) => {
      console.error("turn failed", err);
      sse.send("error", { stage: "claude", retry: true });
      sse.close();
    }),
  );
  return sse.response;
});
