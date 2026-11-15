// Edge function: POST /functions/v1/hablar-end
// Closes the Hablar chat and builds its summary (docs/hablar-hld.md §2.5, §4.7).
//
// Body: { session_id, reason: 'user'|'time', paused_seconds? }. Idempotent: a
// chat that already has a summary gets the same one back, and two calls at
// once (a retry while the first is still grading) credit the streak once. The summary is built
// here: hablar-reply graded each line while Pancho answered it (hablar-grade.ts);
// a line still ungraded is graded now, and the top 3 corrections are kept;
// then one structured call for "what went well". The three corrected lines
// are recorded in Pancho's voice for ▶️ and Decilo.
//
// The chat credits the day's streak through finish_lesson (the same RPC a
// finished lesson uses, so a comeback day banks and buys back the same way),
// but only if the chat's own local day is still today: a chat left open and
// closed the next day doesn't credit the old day. A chat she said nothing in
// doesn't credit it at all. There is no XP in the app yet.

import { json, preflight } from "../_shared/cors.ts";
import {
  CLAUDE_OPTIONS,
  background,
  caller,
  claudeUsage,
  hablarEnv,
  localDate,
  logUsage,
  profileTimezone,
  recordPause,
  serviceClient,
  sessionRow,
  synthesize,
  TALK_SPEED,
  tomasVoice,
  TTS_MODEL,
  type Usage,
} from "../_shared/hablar.ts";
import { quotesHold, SUMMARY_SCHEMA, SUMMARY_SYSTEM, type Feedback } from "../_shared/hablar-prompt.ts";
import { Anthropic, MODEL, structured } from "../_shared/hablar-claude.ts";
import { gradeLine, scenePhrases } from "../_shared/hablar-grade.ts";
import { reported, reportError } from "../_shared/posthog.ts";

const SEVERITY_RANK: Record<string, number> = { meaning: 0, target: 1, minor: 2, none: 3 };
/** How long to wait for a line hablar-reply is still grading, and how often to look. */
const GRADING_WAIT_MS = 6000;
const GRADING_POLL_MS = 400;

Deno.serve(reported("hablar-end", async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const db = serviceClient(env);

  // The auth check, the body and the session together: each is a round trip.
  // Nothing read is used until the caller is known and owns the session.
  type Body = { session_id?: string; reason?: string; paused_seconds?: number; local_date?: string };
  const read = req.json().then((b) => (b && typeof b === "object" ? b : {}) as Body, () => null);
  const [who, body, row] = await Promise.all([
    caller(req, env),
    read,
    read.then((b) => (b ? sessionRow(db, b.session_id) : null)),
  ]);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });
  if (!body) return json({ error: "invalid JSON" }, { status: 400 });
  const session = row && row.user_id === who.userId ? row : null;
  if (!session) return json({ error: "no such session" }, { status: 404 });
  if (session.summary) return json({ summary: session.summary, streak: null });
  const reason = body.reason === "time" ? "time" : "user";
  const endedAt = session.ended_at ?? new Date().toISOString();
  // Independent writes and the read, together rather than one after another.
  const [, , { data: rows }] = await Promise.all([
    recordPause(db, session, body.paused_seconds),
    session.ended_at
      ? Promise.resolve()
      : db.from("conversations").update({ ended_at: endedAt, end_reason: reason }).eq("id", session.id).is("ended_at", null),
    db
      .from("conversation_turns")
      .select("id, idx, role, status, text, feedback, meta")
      .eq("conversation_id", session.id)
      .not("idx", "is", null)
      .order("idx"),
  ]);
  const turns = (rows ?? []).filter((t) => t.role === "tomas" || t.status === "final");
  const userTurns = turns.filter((t) => t.role === "user");

  const usage: Usage[] = [];
  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });
  const phrases = scenePhrases(session);

  // hablar-reply grades each line while Pancho answers it. Its last line may
  // still be in grading (the goodbye is barely over): wait for that a moment
  // rather than grade it twice.
  const inFlight = (t: (typeof userTurns)[number]) => {
    const meta = t.meta as Record<string, unknown> | null;
    if (meta?.grade_failed) return false;
    const at = Date.parse(String(meta?.answering_at ?? ""));
    return Number.isFinite(at) && Date.now() - at < GRADING_WAIT_MS * 3;
  };
  const missing = () => userTurns.filter((t) => !t.feedback && t.text);
  for (let waited = 0; waited < GRADING_WAIT_MS && missing().some(inFlight); waited += GRADING_POLL_MS) {
    await new Promise((r) => setTimeout(r, GRADING_POLL_MS));
    const ids = missing().map((t) => t.id);
    const { data: fresh } = await db.from("conversation_turns").select("id, feedback, meta").in("id", ids);
    for (const f of fresh ?? []) {
      const t = userTurns.find((x) => x.id === f.id);
      if (!t) continue;
      if (f.feedback) t.feedback = f.feedback;
      t.meta = f.meta;
    }
  }

  // Whatever is still ungraded (its grading failed, or an older build's chat)
  // is graded now. With several, the first call writes the grading prompt to
  // the cache and the rest read it.
  const grade = async (t: (typeof userTurns)[number]) => {
    const i = turns.indexOf(t);
    const tomasBefore = turns.slice(0, i).reverse().find((x) => x.role === "tomas")?.text ?? null;
    try {
      const feedback = await gradeLine({ client, db, session, turn: t, tomasBefore, phrases, usage });
      if (feedback) t.feedback = feedback;
    } catch (err) {
      console.error("grading failed", err);
      reportError("hablar-end", err, { user_id: who.userId, session_id: session.id, stage: "feedback" });
    }
  };
  const ungraded = missing();
  if (ungraded.length > 2) {
    await grade(ungraded[0]);
    await Promise.all(ungraded.slice(1).map(grade));
  } else {
    await Promise.all(ungraded.map(grade));
  }

  // Top 3 corrections: what blocks meaning first, then the level's targets, then the rest; earlier first.
  const corrections = userTurns
    .filter((t) => (t.feedback as Feedback | null)?.has_error)
    .map((t) => ({ t, f: t.feedback as Feedback }))
    .sort((a, b) => (SEVERITY_RANK[a.f.severity] ?? 3) - (SEVERITY_RANK[b.f.severity] ?? 3) || a.t.idx - b.t.idx)
    .slice(0, 3)
    .map(({ t, f }) => ({
      turn_id: t.id as string,
      // What she said, as the grading made it out (her own forms where the hints had smoothed them).
      said: f.heard || (t.text as string),
      corrected: f.corrected,
      better: f.better,
      why_en: f.why_en,
      spans: f.spans,
      severity: f.severity,
      audio_path: null as string | null,
    }));

  const extras = (async () => {
    if (!userTurns.length) return { went_well: null as string | null };
    const input = [
      `Level: ${session.level}`,
      "Conversation:",
      ...turns.map((t) => {
        const f = t.role === "user" ? (t.feedback as Feedback | null) : null;
        const off = f?.has_error || f?.verdict === "note" || f?.verdict === "unclear";
        return `${t.role === "tomas" ? "Pancho" : `Learner${off ? " (had a mistake)" : ""}`}: ${f?.heard || t.text}`;
      }),
      corrections.length
        ? `Corrections shown to the learner:\n${corrections.map((c) => `- "${c.said}" → "${c.corrected}"${c.better ? ` (natural: "${c.better}")` : ""}`).join("\n")}`
        : "The learner made no corrected mistakes.",
    ].join("\n");
    // Her lines, and the words in them a correction fixed: what "went well" may quote.
    // A line shown as a note (a tú form, a word from Spain) isn't praised either.
    const said = userTurns
      .filter((t) => !["note", "unclear"].includes((t.feedback as Feedback | null)?.verdict ?? ""))
      .map((t) => {
        const f = t.feedback as Feedback | null;
        return { heard: f?.heard || (t.text as string), fixed: f?.has_error ? f.spans.map((s) => s.from) : [] };
      });
    try {
      // Praise that quotes what she didn't say (or said wrong) is written
      // once more, then left out.
      let wentWell: string | null = null;
      for (let attempt = 0; attempt < 2 && !wentWell; attempt++) {
        const { value, usage: u, ms } = await structured<{ went_well: string }>(client, {
          system: SUMMARY_SYSTEM,
          schema: SUMMARY_SCHEMA as unknown as Record<string, unknown>,
          input: attempt ? `${input}\n\nQuote only words copied exactly from a Learner line with no mistake.` : input,
          maxTokens: 2000,
        });
        usage.push(claudeUsage({ conversation_id: session.id, model: MODEL, stage: "summary", ms }, u));
        if (value?.went_well && quotesHold(value.went_well, said)) wentWell = value.went_well;
      }
      return { went_well: wentWell };
    } catch (err) {
      console.error("summary call failed", err);
      reportError("hablar-end", err, { user_id: who.userId, session_id: session.id, stage: "summary" });
      return { went_well: null };
    }
  })();

  const recordings = (async () => {
    if (!corrections.length) return;
    const voiceId = await tomasVoice(db).catch(() => null);
    if (!voiceId) return;
    await Promise.all(corrections.map(async (c, i) => {
      const t0 = Date.now();
      try {
        const mp3 = await synthesize({ key: env.elevenKey, voiceId, text: c.corrected, speed: TALK_SPEED[session.level] });
        const path = `${who.userId}/${session.id}/summary-${i}.mp3`;
        const { error } = await db.storage.from("hablar").upload(path, new Blob([mp3], { type: "audio/mpeg" }), {
          contentType: "audio/mpeg",
          upsert: true,
        });
        if (!error) c.audio_path = path;
        usage.push({
          conversation_id: session.id,
          turn_id: c.turn_id,
          provider: "elevenlabs",
          model: TTS_MODEL(),
          stage: "tts",
          tts_chars: c.corrected.length,
          ms: Date.now() - t0,
        });
      } catch (err) {
        console.error("correction clip failed", err);
        reportError("hablar-end", err, { user_id: who.userId, session_id: session.id, stage: "tts" });
      }
    }));
  })();

  // A unit chat she said something in finishes its Speaking lesson on the road.
  const lessonId = session.kind === "unit" && userTurns.length ? session.lesson_id ?? null : null;

  // The streak: only for a chat whose day is still today where she lives. A
  // unit chat finished on a later day still finishes its lesson, credited to
  // that day.
  const streak = (async () => {
    // The streak counts in the phone's days (every other lesson sends them), so
    // hers wins when she sends it: a profile with no timezone, or one left
    // behind by a trip, would put a chat on the wrong day. Only a date a real
    // clock could show right now is believed.
    const sent = typeof body.local_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.local_date) ? body.local_date : null;
    const near = sent !== null && Math.abs(Date.parse(`${sent}T12:00:00Z`) - Date.now()) <= 38 * 3600_000;
    const profileToday = localDate(await profileTimezone(db, who.userId));
    const today = near ? sent : profileToday;
    // The chat's day was set at start in the profile's timezone; it is still
    // today if either clock agrees (a chat across midnight UTC, or a trip).
    const sameDay = session.local_date === profileToday || session.local_date === today;
    // A chat she said nothing in (opened and ended right away) credits nothing:
    // not the day, and not a comeback buy-back either.
    if (!userTurns.length || (!sameDay && !lessonId)) return { credited: false, row: null };
    // Only one call credits a chat: a second end() sent while the first is
    // still grading (the first one's connection dropped) finds the claim taken
    // and leaves finish_lesson to it. It still says credited, since the other
    // call is crediting it.
    const { data: claimed, error: claimError } = await db
      .from("conversations")
      .update({ streak_claimed_at: new Date().toISOString() })
      .eq("id", session.id)
      .is("streak_claimed_at", null)
      .select("id");
    if (claimError) {
      console.error("streak claim failed", claimError.message);
      reportError("hablar-end", new Error(claimError.message), { user_id: who.userId, session_id: session.id, stage: "streak_claim", code: claimError.code });
      return { credited: false, row: null };
    }
    if (!claimed?.length) return { credited: true, row: null };
    const { data, error } = await who.asUser.rpc("finish_lesson", {
      p_local_date: today,
      ...(lessonId ? { p_lesson_id: lessonId } : {}),
    });
    if (error) {
      console.error("finish_lesson failed", error.message);
      reportError("hablar-end", new Error(error.message), { user_id: who.userId, session_id: session.id, stage: "finish_lesson", code: error.code });
      // Handed back, so the next end() can try again.
      await db.from("conversations").update({ streak_claimed_at: null }).eq("id", session.id);
      return { credited: false, row: null };
    }
    const row = (data as Record<string, unknown>[] | null)?.[0] ?? null;
    return {
      credited: true,
      row: row
        ? { current_streak: row.current_streak, previous_streak: row.previous_streak, recoverable_streak: row.recoverable_streak }
        : null,
    };
  })();

  const [{ went_well }, , credit] = await Promise.all([extras, recordings, streak]);

  const summary = {
    kind: session.kind,
    topic_id: session.topic_id,
    level: session.level,
    started_at: session.started_at,
    ended_at: endedAt,
    reason: session.end_reason ?? reason,
    turns: userTurns.length,
    corrections,
    went_well,
    streak_credited: credit.credited,
    ...(session.kind === "unit" ? { title: session.scenario?.title_en ?? null, lesson_done: Boolean(lessonId && credit.credited) } : {}),
  };
  await db.from("conversations").update({ summary }).eq("id", session.id);
  background(logUsage(db, usage));

  return json({ summary, streak: credit.row });
}));
