// Edge function: POST /functions/v1/hablar-end
// Closes the Hablar chat and builds its summary (docs/hablar-hld.md §2.5, §4.7).
//
// Body: { session_id, reason: 'user'|'time', paused_seconds? }. Idempotent: a
// chat that already has a summary gets the same one back. The summary is built
// from what is stored — the top 3 corrections from the
// feedback already on the turns, nothing re-graded — plus one structured call
// for "phrases worth keeping" and "what went well". The three corrected lines
// are recorded in Pancho's voice for ▶️ and Decilo.
//
// The chat credits the day's streak through finish_lesson (the same RPC a
// finished lesson uses, so a comeback day banks and buys back the same way),
// but only if the chat's own local day is still today: a chat left open and
// closed the next day doesn't credit the old day. There is no XP in the app yet.

import { json, preflight } from "../_shared/cors.ts";
import {
  CLAUDE_OPTIONS,
  background,
  caller,
  claudeUsage,
  hablarEnv,
  loadSession,
  localDate,
  logUsage,
  profileTimezone,
  recordPause,
  serviceClient,
  synthesize,
  TALK_SPEED,
  tomasVoice,
  TTS_MODEL,
  type Usage,
} from "../_shared/hablar.ts";
import { LEVEL_GRAMMAR, SUMMARY_SCHEMA, SUMMARY_SYSTEM, type Feedback } from "../_shared/hablar-prompt.ts";
import { Anthropic, MODEL, structured } from "../_shared/hablar-claude.ts";

const SEVERITY_RANK: Record<string, number> = { meaning: 0, target: 1, minor: 2, none: 3 };

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const who = await caller(req, env);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });

  let body: { session_id?: string; reason?: string; paused_seconds?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }
  const db = serviceClient(env);
  const session = await loadSession(db, body.session_id, who.userId);
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
      .select("id, idx, role, status, text, feedback")
      .eq("conversation_id", session.id)
      .not("idx", "is", null)
      .order("idx"),
  ]);
  const turns = (rows ?? []).filter((t) => t.role === "tomas" || t.status === "final");
  const userTurns = turns.filter((t) => t.role === "user");

  // Top 3 corrections: what blocks meaning first, then the level's targets, then the rest; earlier first.
  const corrections = userTurns
    .filter((t) => (t.feedback as Feedback | null)?.has_error)
    .map((t) => ({ t, f: t.feedback as Feedback }))
    .sort((a, b) => (SEVERITY_RANK[a.f.severity] ?? 3) - (SEVERITY_RANK[b.f.severity] ?? 3) || a.t.idx - b.t.idx)
    .slice(0, 3)
    .map(({ t, f }) => ({
      turn_id: t.id as string,
      said: t.text as string,
      corrected: f.corrected,
      better: f.better,
      why_en: f.why_en,
      spans: f.spans,
      severity: f.severity,
      audio_path: null as string | null,
    }));

  const usage: Usage[] = [];
  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });

  const extras = (async () => {
    if (!userTurns.length) return { phrases: [] as { es: string; en: string }[], went_well: null as string | null };
    const input = [
      `Level: ${session.level}`,
      `Grammar the level allows (for the phrases): ${LEVEL_GRAMMAR[session.level]}`,
      "Conversation:",
      ...turns.map((t) => `${t.role === "tomas" ? "Pancho" : "Learner"}: ${t.text}`),
      corrections.length
        ? `Corrections shown to the learner:\n${corrections.map((c) => `- "${c.said}" → "${c.corrected}" (natural: "${c.better}")`).join("\n")}`
        : "The learner made no corrected mistakes.",
    ].join("\n");
    try {
      const { value, usage: u, ms } = await structured<{ phrases: { es: string; en: string }[]; went_well: string }>(client, {
        system: SUMMARY_SYSTEM,
        schema: SUMMARY_SCHEMA as unknown as Record<string, unknown>,
        input,
        maxTokens: 2000,
      });
      usage.push(claudeUsage({ conversation_id: session.id, model: MODEL, stage: "summary", ms }, u));
      return { phrases: (value?.phrases ?? []).slice(0, 5), went_well: value?.went_well ?? null };
    } catch (err) {
      console.error("summary call failed", err);
      return { phrases: [], went_well: null };
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
      }
    }));
  })();

  // A unit chat she said something in finishes its Speaking lesson on the road.
  const lessonId = session.kind === "unit" && userTurns.length ? session.lesson_id ?? null : null;

  // The streak: only for a chat whose day is still today where she lives. A
  // unit chat finished on a later day still finishes its lesson, credited to
  // that day.
  const streak = (async () => {
    const today = localDate(await profileTimezone(db, who.userId));
    if (today !== session.local_date && !lessonId) return { credited: false, row: null };
    const { data, error } = await who.asUser.rpc("finish_lesson", {
      p_local_date: today,
      ...(lessonId ? { p_lesson_id: lessonId } : {}),
    });
    if (error) {
      console.error("finish_lesson failed", error.message);
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

  const [{ phrases, went_well }, , credit] = await Promise.all([extras, recordings, streak]);

  const summary = {
    kind: session.kind,
    topic_id: session.topic_id,
    level: session.level,
    started_at: session.started_at,
    ended_at: endedAt,
    reason: session.end_reason ?? reason,
    turns: userTurns.length,
    corrections,
    phrases,
    went_well,
    streak_credited: credit.credited,
    ...(session.kind === "unit" ? { title: session.scenario?.title_en ?? null, lesson_done: Boolean(lessonId && credit.credited) } : {}),
  };
  await db.from("conversations").update({ summary }).eq("id", session.id);
  background(logUsage(db, usage));

  return json({ summary, streak: credit.row });
});
