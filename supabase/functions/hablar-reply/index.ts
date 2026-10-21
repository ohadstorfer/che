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
// client. Silence comes back as plain JSON { status: "empty" }, not a stream;
// so does a line that can't be made out, as { status: "unclear" }, to an app
// that sent `unclear=ask` (it asks her to say it again, then sends `take`).
// The response is an SSE stream:
//
//   transcript {"turn_id","text"}                          the line, as stored (multipart only)
//   text      {"seq":n,"delta":"Jaja, "}                 reply text as it's written
//   text_fix  {"seq":n,"from":"…","to":"…"}              sentence n was rewritten by the guard
//   audio     {"seq":n,"text":"…","mp3":"<base64>"}      one per sentence, in order
//   done      {"turn_id","tomas_turn_id","wrap_up","ended","audio_path"}   ended on her last line (the eighth)
//   error     {"stage":"claude|tts","retry":bool,"seq"?}
//
// One Claude call per turn: the streamed reply (cached persona + the chat's
// level/scene block + history). Her line is not graded here: Pancho only
// recasts a mistake in his reply, and hablar-end grades every line at once for
// the summary. Pancho ends the chat himself by
// closing his goodbye with END_MARKER, which is stripped before anything is
// sent or spoken. Each finished sentence goes through the rioplatense guard
// and then to ElevenLabs; several can be in TTS at once, but audio is sent in
// order. All of it runs under EdgeRuntime.waitUntil, so a client that drops
// mid-stream still gets its turn saved, and calling again with the same
// turn_id replays the stored result as one burst.

import { json, preflight } from "../_shared/cors.ts";
import { lastPanchoLine, MAX_AUDIO_BYTES, panchoEnded, spokenDraft, type TurnRow, typedDraft } from "../_shared/hablar-draft.ts";
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
  GOODBYE_FROM_EXCHANGE,
  MarkerStripper,
  sessionElapsed,
  hablarEnv,
  isUuid,
  loadSession,
  logUsage,
  nextUserIdx,
  pastLastLine,
  recordPause,
  serviceClient,
  sessionRow,
  shouldCloseSoon,
  shouldWrapUp,
  soundsLikeGoodbye,
  synthesize,
  TAB_MESSAGES,
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
  GUARD_SYSTEM,
  PERSONA,
  sessionBlock,
  SIMPLIFY_NOTE,
  turnText,
  unsureNote,
  WRAP_UP_NOTE,
} from "../_shared/hablar-prompt.ts";
import { Anthropic, MODEL, plain, REPLY_MODEL, REPLY_THINKING } from "../_shared/hablar-claude.ts";
import { reported, reportError } from "../_shared/posthog.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const HISTORY_TURNS = 20;
const TTS_PARALLEL = 3;
// Said when the model wrote nothing (or only END_MARKER): asks for her line
// again, or, when the chat has to end anyway, closes it.
const FALLBACK_LINE = "Perdón, se me cortó. ¿Me lo repetís?";
const FALLBACK_GOODBYE = "Bueno, me tengo que ir. ¡Chau, nos vemos!";
// How long a run holds a turn (`meta.answering_at` on her line) before another
// request may answer it instead. Longer than the slowest turn: two Claude tries
// (45 s each), a guard rewrite, and TTS at 10 s a sentence.
const ANSWER_LEASE_SECONDS = 200;

type Turn = TurnRow;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function storedReply(db: SupabaseClient, turnId: string): Promise<Turn | null> {
  const { data } = await db.from("conversation_turns").select("*").eq("reply_to", turnId).maybeSingle();
  return (data as Turn) ?? null;
}

/** A run is answering this turn right now (it took it less than ANSWER_LEASE_SECONDS ago). */
function beingAnswered(user: Turn, now = Date.now()): boolean {
  const at = Date.parse(String(user.meta?.answering_at ?? ""));
  return Number.isFinite(at) && now - at < ANSWER_LEASE_SECONDS * 1000;
}

/** A turn already answered, sent again as one burst. */
async function replay(sse: SseWriter, db: SupabaseClient, user: Turn, tomas: Turn) {
  sse.send("text", { seq: 0, delta: tomas.text });
  if (tomas.audio_path) {
    const { data } = await db.storage.from("hablar").download(tomas.audio_path);
    if (data) sse.send("audio", { seq: 0, text: tomas.text, mp3: toBase64(new Uint8Array(await data.arrayBuffer())) });
  }
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
  const ids = { user_id: opts.userId, session_id: session.id };
  const exchange = exchangeOf(userIdx);
  // A chat closes on her eighth line, and is told to start closing two before.
  const wrapUp = shouldWrapUp(elapsed, exchange);
  const closeSoon = !wrapUp && shouldCloseSoon(elapsed, exchange);
  const english = user.meta?.lang === "en";
  const unsure = Array.isArray(user.meta?.unsure)
    ? (user.meta.unsure as unknown[]).filter((w): w is string => typeof w === "string")
    : [];
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

  const notes = [
    english ? ENGLISH_NOTE : "",
    unsure.length ? unsureNote(unsure) : "",
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
      text: sessionBlock({ level: session.level, unit: session.kind === "unit", scenario: topic.scenario, culture: topic.culture, opener }),
      cache_control: { type: "ephemeral" as const },
    },
  ];

  // ----- sentence pipe: guard → TTS → audio in order -----
  // Not waited on here: the reply starts streaming while the voice id loads.
  const voice = tomasVoice(db).catch((err) => {
    console.error(err);
    reportError("hablar-reply", err, { ...ids, stage: "voice" });
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
          reportError("hablar-reply", err, { ...ids, stage: "guard" });
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
          reportError("hablar-reply", err, { ...ids, stage: "tts" });
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
      model: REPLY_MODEL,
      // Backstop for the prompt's 40-word limit (~70–80 tokens of Spanish).
      max_tokens: 200,
      // deno-lint-ignore no-explicit-any
      ...({ thinking: REPLY_THINKING, output_config: { effort: "low" } } as any),
      system,
      messages,
    });
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") take(endMark.push(ev.delta.text));
    }
    take(endMark.flush());
    const final = await stream.finalMessage();
    usage.push(claudeUsage({ conversation_id: session.id, turn_id: tomasId, model: REPLY_MODEL, stage: "reply", ms: Date.now() - t0 }, final.usage));
    const rest = splitter.flush();
    if (rest) enqueue(rest);
  } catch (err) {
    console.error("reply failed", err);
    reportError("hablar-reply", err, { ...ids, stage: "claude" });
    // Give the turn back so the retry can claim it again straight away.
    await db.from("conversation_turns").update({ status: "draft", idx: null }).eq("id", user.id);
    sse.send("error", { stage: "claude", retry: true });
    sse.close();
    // Sentences already in TTS still cost: wait for them before the usage is
    // written. Their audio goes nowhere (sending after close does nothing).
    await emitChain;
    await logUsage(db, usage);
    return;
  }
  // The chat ends on this reply whatever he says: her last line, or the backstop clock.
  const mustEnd = wrapUp || sessionElapsed(session) >= clockOf(session.level).stop;
  // Nothing to say (or only the marker): a line of our own instead. It asks her
  // to say hers again, so the marker doesn't end the chat; a chat that ends
  // anyway gets a goodbye, not a question nobody can answer.
  const fallback = !replyText.trim();
  if (fallback) {
    const line = mustEnd ? FALLBACK_GOODBYE : FALLBACK_LINE;
    sse.send("text", { seq: deltaSeq++, delta: line });
    enqueue(line);
  }

  await emitChain;

  // ----- save, then done -----
  const text = sentences.join(" ");
  const clips = audio.filter((a): a is Uint8Array<ArrayBuffer> => !!a);
  const audioPath = clips.length ? `${opts.userId}/${session.id}/${user.id}-tomas.mp3` : null;
  // A goodbye that forgot the marker ends the chat too, once it has had a few exchanges.
  const goodbye = !fallback && !endMark.found && exchange >= GOODBYE_FROM_EXCHANGE && soundsLikeGoodbye(replyText);
  if (goodbye) console.log("goodbye without marker", { conversation: session.id, exchange });
  const ended = mustEnd || (endMark.found && !fallback) || goodbye;

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
  if (insertErr) {
    // Not saved, so nothing of this run is kept: no mp3 (the path is the stored
    // reply's, and would overwrite its voice) and no id the app could ask about.
    // Another run that answered the same line first wins: the app is pointed at
    // its reply, which a reload shows.
    console.error("tomas turn insert failed", insertErr.message);
    const first = insertErr.code === "23505" ? await storedReply(db, user.id) : null;
    if (first) {
      sse.send("done", {
        turn_id: user.id,
        tomas_turn_id: first.id,
        wrap_up: Boolean(first.meta?.wrap_up),
        ended: Boolean(first.meta?.ended),
        audio_path: first.audio_path,
      });
    } else {
      reportError("hablar-reply", new Error(`tomas turn insert failed: ${insertErr.message}`), { ...ids, stage: "save" });
      sse.send("done", { turn_id: user.id, wrap_up: wrapUp, ended, audio_path: null });
    }
    sse.close();
    await logUsage(db, usage);
    return;
  }

  sse.send("done", { turn_id: user.id, tomas_turn_id: tomasId, wrap_up: wrapUp, ended, audio_path: audioPath });
  const upload = audioPath
    ? db.storage.from("hablar").upload(audioPath, new Blob([concatBytes(clips)], { type: "audio/mpeg" }), {
      contentType: "audio/mpeg",
      upsert: true,
    }).then(({ error }) => error && console.error("reply mp3 upload failed", error.message))
    : Promise.resolve();
  sse.close();

  await upload;
  await logUsage(db, usage);
}

Deno.serve(reported("hablar-reply", async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const db = serviceClient(env);
  const spoken = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
  return spoken ? speak(req, env, db) : answerStored(req, env, db);
}));

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
 * The app's `unclear` field: "ask" when it can ask her to say a line again,
 * "take" on the recording after it did. Apps from before the field send none.
 */
function doubtOf(form: FormData): "ask" | "take" {
  return form.get("unclear") === "ask" ? "ask" : "take";
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
      doubt: doubtOf(form),
    });
  if ("error" in out) return out.error;
  if ("empty" in out) return json({ text: "", turn_id: turnId, status: "empty" });
  if ("unclear" in out) return json({ text: "", turn_id: turnId, status: "unclear" });
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

  // Already answered, or being answered by an earlier request: replay. A line
  // sent before runs took the turn (no `answering_at`) is waited for as well.
  let answered = opts.stored;
  if (!answered && user.status === "final" && (beingAnswered(user) || !user.meta?.answering_at)) {
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
  // Pancho said goodbye; the app went before it could call hablar-end.
  if (user.status === "final") {
    const said = panchoEnded(await lastPanchoLine(db, session.id));
    if (said) return said;
  }
  // The same bound hablar-draft stores her line by: a line it took is answered.
  if (pastLastLine(session)) return json({ error: "time_up" }, { status: 409 });
  if (!user.text.trim()) return json({ error: "empty turn" }, { status: 400 });

  // Claim the draft: it becomes final and gets its place in the chat. This run
  // takes the turn with it (`answering_at`), so a retry waits for the reply
  // instead of writing a second one.
  let userIdx = user.idx ?? -1;
  if (user.status === "draft") {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: top } = await db
        .from("conversation_turns")
        .select("idx, role, meta")
        .eq("conversation_id", session.id)
        .not("idx", "is", null)
        .order("idx", { ascending: false })
        .limit(1)
        .maybeSingle();
      // The chat's last line is Pancho's goodbye: nothing goes after it.
      const said = top?.role === "tomas" ? panchoEnded(top) : null;
      if (said) return said;
      userIdx = nextUserIdx(top?.idx ?? 0);
      // Past the chat's last line: the draft stays a draft, and the app ends the chat.
      if (exchangeOf(userIdx) > TAB_MESSAGES) {
        return json({ error: "message_limit", limit: TAB_MESSAGES }, { status: 429 });
      }
      const { data: claimed, error } = await db
        .from("conversation_turns")
        .update({ status: "final", idx: userIdx, meta: { ...user.meta, answering_at: new Date().toISOString() } })
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
  } else {
    // Sent, not answered, and no run holds it any more (it died, or it never
    // took it): this one takes it over. Taken in the update itself, so two
    // retries at once can't both win; while a run still holds it, the app
    // tries again later and gets the reply replayed.
    const staleBefore = new Date(Date.now() - ANSWER_LEASE_SECONDS * 1000).toISOString();
    const { data: taken, error } = await db
      .from("conversation_turns")
      .update({ meta: { ...user.meta, answering_at: new Date().toISOString() } })
      .eq("id", user.id)
      .eq("status", "final")
      .or(`meta->>answering_at.is.null,meta->>answering_at.lt."${staleBefore}"`)
      .select("*")
      .maybeSingle();
    if (error) return json({ error: "could not claim the turn" }, { status: 500 });
    if (!taken) return json({ error: "turn is being answered", retry: true }, { status: 409 });
    user = taken as Turn;
  }
  if (userIdx < 1) return json({ error: "turn has no place in the chat" }, { status: 409 });

  const sse = sseStream();
  lead(sse);
  background(
    runTurn({ env, db, sse, session, topic, user, userIdx, userId: opts.userId }).catch((err) => {
      console.error("turn failed", err);
      reportError("hablar-reply", err, { user_id: opts.userId, session_id: session.id, stage: "turn" });
      sse.send("error", { stage: "claude", retry: true });
      sse.close();
    }),
  );
  return sse.response;
}
