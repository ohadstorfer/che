// Edge function: POST /functions/v1/hablar-reply  (SSE)
// Pancho answers one learner turn (docs/hablar-hld.md §4.5).
//
// Two ways in:
//  - multipart { audio | text, session_id, turn_id, paused_seconds? }: the line
//    itself. It is transcribed and stored as hablar-transcribe stores it, then
//    answered on the same stream, which opens with `transcript`. What current
//    builds send.
//  - JSON { session_id, turn_id, paused_seconds? }: a line already stored (a
//    draft from hablar-transcribe, or a retry after a dropped stream).
// Either way the server answers the text it transcribed, never text from the
// client. Silence comes back as plain JSON { status: "empty" }, not a stream.
// The response is an SSE stream:
//
//   transcript {"turn_id","text"}                          the line, as stored (multipart only)
//   correction {"has_error","verdict","corrected"}        the verdict, as soon as it is written
//   text      {"seq":n,"delta":"Jaja, "}                 reply text as it's written
//   text_fix  {"seq":n,"from":"…","to":"…"}              sentence n was rewritten by the guard
//   audio     {"seq":n,"text":"…","mp3":"<base64>"}      one per sentence, in order
//   done      {"turn_id","tomas_turn_id","wrap_up","ended","audio_path"}
//   feedback  {has_error,verdict,severity,corrected,spans,why_en,better,better_en}   usually before done, may come after
//   error     {"stage":"claude|tts|feedback","retry":bool,"seq"?}
//
// Two Claude calls run in parallel: the streamed reply (cached persona + the
// chat's level/scene block + history) and the streamed feedback, which never
// holds the reply up: `done` goes out as soon as the reply's audio has, and a
// slower feedback follows it on the same stream. Pancho ends the chat himself by
// closing his goodbye with END_MARKER, which is stripped before anything is
// sent or spoken. Each finished sentence goes through the rioplatense guard
// and then to ElevenLabs; several can be in TTS at once, but audio is sent in
// order. All of it runs under EdgeRuntime.waitUntil, so a client that drops
// mid-stream still gets its turn saved, and calling again with the same
// turn_id replays the stored result as one burst.

import { json, preflight } from "../_shared/cors.ts";
import { MAX_AUDIO_BYTES, spokenDraft, type TurnRow, typedDraft } from "../_shared/hablar-draft.ts";
import { offendingWords } from "../_shared/rioplatense.ts";
import { SentenceSplitter } from "../_shared/sentences.ts";
import { sseStream, toBase64, type SseWriter } from "../_shared/sse.ts";
import {
  CLAUDE_OPTIONS,
  background,
  caller,
  claudeUsage,
  clockOf,
  concatBytes,
  exchangeOf,
  MarkerStripper,
  sessionElapsed,
  GRACE_SECONDS,
  hablarEnv,
  isUuid,
  loadSession,
  logUsage,
  nextUserIdx,
  recordPause,
  serviceClient,
  sessionRow,
  shouldCloseSoon,
  shouldWrapUp,
  synthesize,
  TALK_SPEED,
  tomasVoice,
  topicOf,
  TTS_MODEL,
  type Env,
  type Session,
  type Topic,
  type Usage,
} from "../_shared/hablar.ts";
import {
  CLOSE_SOON_NOTE,
  END_MARKER,
  ENGLISH_NOTE,
  FEEDBACK_SCHEMA,
  FEEDBACK_SYSTEM,
  feedbackInput,
  GUARD_SYSTEM,
  PERSONA,
  sessionBlock,
  SIMPLIFY_NOTE,
  turnText,
  WRAP_UP_NOTE,
  type Feedback,
} from "../_shared/hablar-prompt.ts";
import { Anthropic, earlyVerdict, MODEL, plain, sameWords, streamedStructured } from "../_shared/hablar-claude.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const HISTORY_TURNS = 20;
const TTS_PARALLEL = 3;
const LATE_SECONDS = 120; // a draft recorded in the grace period may still be sent a little later
const FALLBACK_LINE = "Perdón, se me cortó. ¿Me lo repetís?";

type Turn = TurnRow;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function storedReply(db: SupabaseClient, turnId: string): Promise<Turn | null> {
  const { data } = await db.from("conversation_turns").select("*").eq("reply_to", turnId).maybeSingle();
  return (data as Turn) ?? null;
}

/** A turn already answered, sent again as one burst. */
async function replay(sse: SseWriter, db: SupabaseClient, user: Turn, tomas: Turn) {
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
    audio_path: tomas.audio_path,
    replay: true,
  });
  sse.close();
}

/** Only what the schema promised. */
function cleanFeedback(raw: Feedback, line: string, english = false): Feedback {
  // A line said in English is never a mistake: she is shown the Spanish for it.
  if (english && raw.verdict !== "unclear") raw = { ...raw, has_error: false, verdict: "note" };
  const spans = (raw.spans ?? []).filter((s) => s && typeof s.from === "string" && typeof s.to === "string");
  const corrected = String(raw.corrected || line);
  // A tick only for a line that is right as it stands: an English word, a tú
  // form or a garbled transcript is not an error, but it is not "Correct" either.
  let quiet: Feedback["verdict"] = raw.verdict === "note" || raw.verdict === "unclear" ? raw.verdict : "correct";
  let better = raw.verdict === "unclear" ? "" : String(raw.better ?? "").trim();
  // A suggestion that is her own words again says nothing — and when only an
  // accent differs (andas / andás), it was the recogniser's guess, not her stress.
  if (better && sameWords(better, corrected)) better = "";
  if (quiet === "note" && !better) quiet = "correct";
  // Outside a note, the Argentine way is shown only when her line really sounds foreign.
  const unnatural = Boolean(raw.unnatural) && Boolean(better);
  if (quiet !== "note" && !unnatural) better = "";
  return {
    has_error: Boolean(raw.has_error),
    verdict: raw.has_error ? "error" : quiet,
    severity: raw.has_error ? (raw.severity === "none" ? "minor" : raw.severity) : "none",
    corrected,
    spans: raw.has_error ? spans : [],
    why_en: raw.has_error ? String(raw.why_en ?? "") : "",
    unnatural,
    better,
    better_en: better ? String(raw.better_en ?? "") : "",
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
  const elapsed = sessionElapsed(session);
  const exchange = exchangeOf(userIdx);
  const wrapUp = shouldWrapUp(elapsed, exchange, session.level);
  const closeSoon = !wrapUp && shouldCloseSoon(elapsed, exchange, session.level);
  const english = user.meta?.lang === "en";
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
    english ? ENGLISH_NOTE : "",
    session.hint_turns.includes(userIdx) && session.hint_turns.includes(userIdx - 2) ? SIMPLIFY_NOTE : "",
    wrapUp ? WRAP_UP_NOTE : "",
    closeSoon ? CLOSE_SOON_NOTE : "",
  ];
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
        text: turnText(user.text, notes),
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
  // Streamed, so the verdict (right or wrong, and the fixed line) goes out the
  // moment it is written — usually before Pancho's first sentence. The why and
  // the better phrasing follow in the full `feedback`.
  let verdictSent = false;
  const feedbackDone = streamedStructured<Feedback>(client, {
    system: FEEDBACK_SYSTEM,
    schema: FEEDBACK_SCHEMA as unknown as Record<string, unknown>,
    input: feedbackInput({ level: session.level, tomasBefore, line: user.text, english }),
    onText: (soFar) => {
      if (verdictSent) return;
      const verdict = earlyVerdict(soFar, user.text);
      if (!verdict) return;
      verdictSent = true;
      sse.send(
        "correction",
        english && verdict.verdict !== "unclear" ? { has_error: false, verdict: "note", corrected: user.text } : verdict,
      );
    },
  })
    .then(async ({ value, usage: u, ms }) => {
      usage.push(claudeUsage({ conversation_id: session.id, turn_id: user.id, model: MODEL, stage: "feedback", ms }, u));
      if (!value) throw new Error("no feedback");
      const fb = cleanFeedback(value, user.text, english);
      sse.send("feedback", fb);
      // Saved before the stream closes, so the summary (built once it has) sees it.
      const { error } = await db.from("conversation_turns").update({ feedback: fb }).eq("id", user.id);
      if (error) console.error("feedback save failed", error.message);
    })
    .catch((err) => {
      console.error("feedback failed", err);
      sse.send("error", { stage: "feedback", retry: false });
    });

  // ----- sentence pipe: guard → TTS → audio in order -----
  // Not waited on here: the reply starts streaming while the voice id loads.
  const voice = tomasVoice(db).catch((err) => {
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
      const voiceId = await voice;
      if (!voiceId) return null;
      return await slot(async () => {
        const t0 = Date.now();
        try {
          const mp3 = await synthesize({ key: env.elevenKey, voiceId, text, previousText, speed: TALK_SPEED[session.level] });
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
  const endMark = new MarkerStripper(END_MARKER);
  let deltaSeq = 0;
  let replyText = "";
  const take = (delta: string) => {
    if (!delta) return;
    replyText += delta;
    sse.send("text", { seq: deltaSeq++, delta });
    for (const s of splitter.push(delta)) enqueue(s);
  };
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
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") take(endMark.push(ev.delta.text));
    }
    take(endMark.flush());
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

  // ----- save, then done -----
  const text = sentences.join(" ");
  const clips = audio.filter((a): a is Uint8Array<ArrayBuffer> => !!a);
  const audioPath = clips.length ? `${opts.userId}/${session.id}/${user.id}-tomas.mp3` : null;
  const ended = wrapUp || endMark.found || sessionElapsed(session) >= clockOf(session.level).stop;

  const { error: insertErr } = await db.from("conversation_turns").insert({
    id: tomasId,
    conversation_id: session.id,
    idx: userIdx + 1,
    role: "tomas",
    status: "final",
    text,
    audio_path: audioPath,
    reply_to: user.id,
    meta: { wrap_up: wrapUp, ended },
  });
  if (insertErr) console.error("tomas turn insert failed", insertErr.message);

  // The learner can answer now; a feedback still in flight follows on the stream.
  sse.send("done", { turn_id: user.id, tomas_turn_id: tomasId, wrap_up: wrapUp, ended, audio_path: audioPath });
  const upload = audioPath
    ? db.storage.from("hablar").upload(audioPath, new Blob([concatBytes(clips)], { type: "audio/mpeg" }), {
      contentType: "audio/mpeg",
      upsert: true,
    }).then(({ error }) => error && console.error("reply mp3 upload failed", error.message))
    : Promise.resolve();
  await Promise.race([feedbackDone, sleep(15_000)]);
  sse.close();

  await Promise.all([upload, feedbackDone]);
  await logUsage(db, usage);
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const db = serviceClient(env);
  const spoken = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
  return spoken ? speak(req, env, db) : answerStored(req, env, db);
});

/** JSON `{ session_id, turn_id }`: answer a line already stored (a draft, a retry, a replay). */
async function answerStored(req: Request, env: Env, db: SupabaseClient): Promise<Response> {
  let body: { session_id?: string; turn_id?: string; paused_seconds?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Read together rather than one after another, the auth check included: each
  // is a round trip before Pancho can start talking. Nothing read is used until
  // the caller is known and owns the session; the turn is checked against it below.
  const turnId = isUuid(body.turn_id) ? body.turn_id : null;
  const [who, row, { data: turnRow }, stored] = await Promise.all([
    caller(req, env),
    sessionRow(db, body.session_id),
    turnId
      ? db.from("conversation_turns").select("*").eq("id", turnId).maybeSingle()
      : Promise.resolve({ data: null }),
    turnId ? storedReply(db, turnId) : Promise.resolve(null),
  ]);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });
  if (!turnId) return json({ error: "turn_id must be a uuid" }, { status: 400 });
  const session = row && row.user_id === who.userId ? row : null;
  if (!session) return json({ error: "no such session" }, { status: 404 });
  // Not waited on: nothing below needs the write, only the value on `session`.
  background(recordPause(db, session, body.paused_seconds));
  return answer({ env, db, userId: who.userId, session, user: turnRow as Turn | null, stored });
}

/**
 * Multipart `{ audio | text, session_id, turn_id, paused_seconds? }`: the line
 * and its answer in one request. The line is stored as hablar-transcribe stores
 * it, then answered on the same stream, which opens with `transcript` — one
 * round trip, one cold start and one auth check fewer than a transcribe call
 * followed by a reply call. Sent again with the same turn_id it neither
 * transcribes nor answers twice.
 */
async function speak(req: Request, env: Env, db: SupabaseClient): Promise<Response> {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_AUDIO_BYTES + 64 * 1024) {
    return json({ error: "audio too long" }, { status: 413 });
  }
  // The auth check runs while the upload is read, not before it.
  const [who, form] = await Promise.all([caller(req, env), req.formData().catch(() => null)]);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });
  if (!form) return json({ error: "expected multipart/form-data" }, { status: 400 });
  const turnId = form.get("turn_id");
  if (!isUuid(turnId)) return json({ error: "turn_id must be a uuid" }, { status: 400 });
  const typed = form.get("text");
  // Not `instanceof File`: the edge runtime can hand an upload back as a plain Blob.
  const audio = form.get("audio");
  if (typeof typed !== "string" && (!audio || typeof audio === "string" || audio.size === 0)) {
    return json({ error: "audio or text is required" }, { status: 400 });
  }
  if (audio && typeof audio !== "string" && audio.size > MAX_AUDIO_BYTES) {
    return json({ error: "audio too long" }, { status: 413 });
  }

  const sessionId = form.get("session_id");
  const [session, { count }, { data: existing }, stored] = await Promise.all([
    loadSession(db, sessionId, who.userId),
    typeof typed !== "string" && isUuid(sessionId)
      ? db.from("hablar_usage").select("id", { count: "exact", head: true }).eq("conversation_id", sessionId).eq("stage", "stt")
      : Promise.resolve({ count: 0 }),
    db.from("conversation_turns").select("*").eq("id", turnId).maybeSingle(),
    storedReply(db, turnId),
  ]);
  if (!session) return json({ error: "no such session" }, { status: 404 });
  background(recordPause(db, session, form.get("paused_seconds")));

  const out = typeof typed === "string"
    ? await typedDraft({ db, session, turnId, raw: typed, existing: existing as Turn | null })
    : await spokenDraft({
      env,
      db,
      userId: who.userId,
      session,
      turnId,
      audio: audio as Blob,
      existing: existing as Turn | null,
      sttCount: count ?? 0,
    });
  if ("error" in out) return out.error;
  if ("empty" in out) return json({ text: "", turn_id: turnId, status: "empty" });
  return answer({ env, db, userId: who.userId, session, user: out.turn, stored, transcript: true });
}

async function answer(opts: {
  env: Env;
  db: SupabaseClient;
  userId: string;
  session: Session;
  user: Turn | null;
  stored: Turn | null;
  /** Open the stream with the line itself (the one-request path). */
  transcript?: boolean;
}): Promise<Response> {
  const { env, db, session } = opts;
  const topic = topicOf(session.kind, session.topic_id, session.level, session.scenario);
  if (!topic) return json({ error: "this chat's topic no longer exists" }, { status: 410 });

  let user = opts.user;
  if (!user || user.conversation_id !== session.id || user.role !== "user") {
    return json({ error: "no such turn" }, { status: 404 });
  }
  const lead = (sse: SseWriter) => {
    if (opts.transcript) sse.send("transcript", { turn_id: user!.id, text: user!.text });
  };

  // Already answered, or being answered by an earlier request: replay.
  let answered = opts.stored;
  if (!answered && user.status === "final") {
    for (let i = 0; i < 25 && !answered; i++) {
      await sleep(1000);
      answered = await storedReply(db, user.id);
    }
  }
  if (answered) {
    const sse = sseStream();
    lead(sse);
    background(replay(sse, db, user, answered));
    return sse.response;
  }

  if (session.ended_at) return json({ error: "ended" }, { status: 409 });
  if (sessionElapsed(session) >= clockOf(session.level).stop + GRACE_SECONDS + LATE_SECONDS) {
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
  lead(sse);
  background(
    runTurn({ env, db, sse, session, topic, user, userIdx, userId: opts.userId }).catch((err) => {
      console.error("turn failed", err);
      sse.send("error", { stage: "claude", retry: true });
      sse.close();
    }),
  );
  return sse.response;
}
