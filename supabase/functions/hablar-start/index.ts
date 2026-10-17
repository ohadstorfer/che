// Edge function: POST /functions/v1/hablar-start
// Opens a chat with Pancho (docs/hablar-hld.md §4.3).
//
// Body: { kind: 'scenario'|'free', topic_id?, level_override? }, or
// { kind: 'unit', lesson_id, level_override? } for a unit's Speaking lesson on
// the road (hablar-unit.ts). Culture chats are closed to new starts; old ones
// still load through topicOf.
//
// The limits (20261016000001_hablar_chat_limits.sql, staff excepted from all):
//  - The Speaking tab: CHATS_PER_DAY chats per local day, one open at a time.
//    A start while one is open gets 409 `open` with that session; past the
//    day's last gets 429 `daily_limit`. The database gives each chat its slot
//    of the day, so the limit holds even if two starts race. Each chat takes
//    TAB_MESSAGES lines (hablar-draft.ts, hablar-reply).
//  - A unit chat is none of the day's business, and doesn't count toward the
//    free chats; the lesson decides whether she may open it, the way the road
//    does. It is had once: an open one is resumed (409 `open`), and one she
//    spoke in is done (409 `chat_done`, with its summary). Past
//    COURSE_CHATS_PER_DAY unit chats in a day,
//    429 `course_break`.
//
// The opener is pre-recorded and bundled, so no model or TTS call happens
// here; its text is written in as turn 0. A unit chat's scene is the unit's,
// written the first time anyone opens it — that one start waits on a model
// and a TTS call.

import { json, preflight } from "../_shared/cors.ts";
import { speakingUnit, unitScenario } from "../_shared/hablar-unit.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  caller,
  CHATS_PER_DAY,
  clockOf,
  COURSE_CHATS_PER_DAY,
  deadlineAt,
  freeOpener,
  isUuid,
  hablarEnv,
  localDate,
  profileTimezone,
  publicAudioUrl,
  resolveLevel,
  serviceClient,
  TAB_MESSAGES,
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
  if (!unlimited) {
    const refused = unit ? await unitRefusal(db, who.userId, lessonId!, today) : await dayRefusal(db, who.userId, today);
    if (refused) return refused;
  }
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
    // Lost a race: another start took the day's last slot (23514, the slot
    // check) or opened this lesson's chat (23505). Answer as if it had come first.
    if (error.code === "23514" || error.code === "23505") {
      const refused = unit ? await unitRefusal(db, who.userId, lessonId!, today) : await dayRefusal(db, who.userId, today);
      if (refused) return refused;
      return json({ error: "could not start", retry: true }, { status: 409 });
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
    // Lines she may say: eight on the Speaking tab; a unit chat has no count to show.
    message_limit: unit ? null : TAB_MESSAGES,
    // The Speaking tab's chats left today after this one; null where no day's count applies.
    chats_left_today: unit || unlimited ? null : Math.max(0, CHATS_PER_DAY - (session.day_slot ?? CHATS_PER_DAY)),
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

/**
 * Why a Speaking-tab chat can't start today, if it can't: one is still open
 * (409, resume it), or the day's chats are used (429). Null when it can.
 */
async function dayRefusal(db: SupabaseClient, userId: string, today: string): Promise<Response | null> {
  const { data } = await db
    .from("conversations")
    .select("id, ended_at")
    .eq("user_id", userId)
    .eq("local_date", today)
    .not("day_slot", "is", null)
    .order("started_at", { ascending: false });
  const rows = (data ?? []) as { id: string; ended_at: string | null }[];
  const open = rows.find((r) => !r.ended_at);
  if (open) return json({ error: "open", session_id: open.id, ended: false }, { status: 409 });
  if (rows.length >= CHATS_PER_DAY) {
    return json(
      { error: "daily_limit", daily_limit: true, limit: CHATS_PER_DAY, used: rows.length, summary_id: rows[0]?.id ?? null },
      { status: 429 },
    );
  }
  return null;
}

/**
 * Why this unit chat can't start, if it can't: it is open (409, resume it),
 * it was had already (409 `chat_done`: a chat she said something in — one
 * left with nothing said can be had again, or she'd be stuck on the road), or
 * Pancho has had his fill of unit chats today (429 `course_break`).
 */
async function unitRefusal(db: SupabaseClient, userId: string, lessonId: string, today: string): Promise<Response | null> {
  const [{ data }, { count: todays }] = await Promise.all([
    db
      .from("conversations")
      .select("id, ended_at, summary")
      .eq("user_id", userId)
      .eq("kind", "unit")
      .eq("lesson_id", lessonId)
      .eq("unlimited", false)
      .order("started_at", { ascending: false }),
    db
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "unit")
      .eq("unlimited", false)
      .eq("local_date", today),
  ]);
  const rows = (data ?? []) as { id: string; ended_at: string | null; summary: { turns?: number } | null }[];
  const open = rows.find((r) => !r.ended_at);
  if (open) return json({ error: "open", session_id: open.id, ended: false }, { status: 409 });
  for (const r of rows) {
    // Ended without its summary (the app never called hablar-end): her stored lines say.
    let spoke = (r.summary?.turns ?? 0) > 0;
    if (!r.summary) {
      const { count } = await db
        .from("conversation_turns")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", r.id)
        .eq("role", "user")
        .eq("status", "final");
      spoke = (count ?? 0) > 0;
    }
    if (spoke) {
      return json({ error: "chat_done", chat_done: true, summary_id: r.id, session_id: r.id, ended: true }, { status: 409 });
    }
  }
  if ((todays ?? 0) >= COURSE_CHATS_PER_DAY) {
    return json({ error: "course_break", course_break: true, limit: COURSE_CHATS_PER_DAY }, { status: 429 });
  }
  return null;
}
