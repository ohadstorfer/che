// Edge function: POST /functions/v1/hablar-start
// Opens today's chat with Pancho (docs/hablar-hld.md §4.3).
//
// Body: { kind: 'scenario'|'free', topic_id?, level_override? }, or
// { kind: 'unit', lesson_id, level_override? } for a unit's Speaking lesson on
// the road (hablar-unit.ts). Culture chats are closed to new starts; old ones
// still load through topicOf.
// One chat per local day (staff excepted), enforced by a unique (user_id, local_date) index:
// a second start that day gets 409 with the existing session. The opener is
// pre-recorded and bundled, so no model or TTS call happens here; its text is
// written in as turn 0. The clock (hablar.ts CLOCK, by level) runs from the row's started_at.
//
// A unit chat is none of the day's business: it may be had any number of
// times a day, and doesn't count toward the free chats. The lesson decides
// whether she may open it, the way the road does. Its scene is the unit's,
// written the first time anyone opens it — that one start waits on a model
// and a TTS call.

import { json, preflight } from "../_shared/cors.ts";
import { speakingUnit, unitScenario } from "../_shared/hablar-unit.ts";
import {
  caller,
  clockOf,
  deadlineAt,
  freeOpener,
  isUuid,
  hablarEnv,
  localDate,
  profileTimezone,
  publicAudioUrl,
  resolveLevel,
  serviceClient,
  topicOf,
  type Line,
} from "../_shared/hablar.ts";

/** Chats a free account gets, in total. */
const FREE_CHATS = 3;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const who = await caller(req, env);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });

  let body: { kind?: string; topic_id?: string | null; lesson_id?: string | null; level_override?: string | null };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }
  const kind = String(body.kind ?? "");
  if (!["scenario", "free", "unit"].includes(kind)) {
    return json({ error: "kind must be scenario, free or unit" }, { status: 400 });
  }

  const db = serviceClient(env);
  const lessonId = kind === "unit" ? String(body.lesson_id ?? "") : null;
  const unit = lessonId && isUuid(lessonId) ? await speakingUnit(db, lessonId) : null;
  if (kind === "unit" && !unit) return json({ error: "no such lesson" }, { status: 404 });
  const topicId = kind === "free" ? null : unit ? unit.id : String(body.topic_id ?? "");

  const [tz, { data: courseCefr }, { data: profile }, { data: premium }, { count }] = await Promise.all([
    profileTimezone(db, who.userId),
    db.rpc("hablar_level", { p_user: who.userId }),
    db.from("profiles").select("role").eq("user_id", who.userId).maybeSingle(),
    db.rpc("is_premium", { p_user: who.userId }),
    db.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", who.userId).neq("kind", "unit"),
  ]);
  // Staff test freely: no clock, no daily limit.
  const unlimited = profile?.role === "admin" || profile?.role === "reviewer";

  // The free tier gets FREE_CHATS chats in all; after that, premium only
  // (the app's lib/premium.tsx agrees, and shows the paywall on this 402).
  if (unit) {
    const { data: open } = await db.rpc("lesson_open_to", { p_user: who.userId, p_lesson: lessonId });
    if (!open) return json({ error: "paywall", paywall: true }, { status: 402 });
  } else if (!unlimited && !premium && (count ?? 0) >= FREE_CHATS) {
    return json({ error: "paywall", paywall: true }, { status: 402 });
  }
  const today = localDate(tz);
  // A unit chat is pitched at the unit's own level, not wherever she is now.
  const asked = resolveLevel(unit ? unit.cefr : courseCefr as string | null, body.level_override);
  const stored = unit ? await unitScenario(db, env, unit, asked) : null;
  if (unit && !stored) return json({ error: "could not write the scene" }, { status: 503 });
  const topic = topicOf(kind, topicId, asked, stored);
  if (!topic) return json({ error: "no such topic" }, { status: 404 });
  // A scenario runs at the level of the version it plays (a B1-only scene
  // asked for at A2 is a B1 chat), so Pancho and the scene agree.
  const level = topic.scenario?.band ?? asked;

  const opener: Line | null = topic.scenario?.opener ?? topic.culture?.opener ??
    freeOpener(level, `${who.userId}${today}`);
  if (!opener) return json({ error: "no opener for this level" }, { status: 500 });

  const { data: session, error } = await db
    .from("conversations")
    .insert({
      user_id: who.userId,
      local_date: today,
      kind,
      topic_id: topicId,
      level,
      unlimited,
      ...(unit ? { lesson_id: lessonId, scenario: stored } : {}),
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await db
        .from("conversations")
        .select("id, ended_at, started_at, paused_seconds")
        .eq("user_id", who.userId)
        .eq("local_date", today)
        .neq("kind", "unit")
        .maybeSingle();
      return json(
        {
          error: "done_today",
          done_today: true,
          summary_id: existing?.id ?? null,
          session_id: existing?.id ?? null,
          ended: Boolean(existing?.ended_at),
        },
        { status: 409 },
      );
    }
    console.error("conversation insert failed", error.message);
    return json({ error: "could not start" }, { status: 500 });
  }

  const openerTurnId = crypto.randomUUID();
  const audioUrl = publicAudioUrl(env.url, opener.audio);
  await db.from("conversation_turns").insert({
    id: openerTurnId,
    conversation_id: session.id,
    idx: 0,
    role: "tomas",
    status: "final",
    text: opener.es,
    text_en: opener.en,
    meta: { opener: true, audio_url: audioUrl },
  });

  return json({
    session_id: session.id,
    kind,
    topic_id: topicId,
    level,
    local_date: today,
    started_at: session.started_at,
    deadline_at: unlimited ? null : deadlineAt(session.started_at, 0, level),
    limit_seconds: unlimited ? null : clockOf(level).stop,
    unlimited,
    opener: { turn_id: openerTurnId, text: opener.es, text_en: opener.en, audio_url: audioUrl },
    goals: [],
    key_phrases: (topic.scenario?.key_phrases ?? []).map((p) => ({
      es: p.es,
      en: p.en,
      audio_url: publicAudioUrl(env.url, p.audio),
    })),
    title: stored?.title_en ?? null,
    role_es: stored?.role_es ?? null,
    key_words: topic.culture ? (topic.culture.opener.keyterms ?? []).slice(0, 3) : [],
  });
});
