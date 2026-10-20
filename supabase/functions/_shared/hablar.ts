// What the five hablar-* functions share (docs/hablar-hld.md §4).
//
// Auth and the session row, the server clock that decides when time is up, the
// learner's level, and the bundled scenario content. The pure helpers at the
// top (clock, level, dilo compare, turn numbering) are unit-tested in
// hablar_test.ts; the rest talks to Supabase or ElevenLabs.

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import content from "./hablar-content.json" with { type: "json" };

// ---------------------------------------------------------------------------
// Content (bundled JSON, written by the hablar:tts script)
// ---------------------------------------------------------------------------

export type Band = "A1" | "A2" | "B1" | "B2";
export type Goal = { id: string; es: string; en: string };
export type Line = { es: string; en: string; audio: string | null };
/** One level's take on a scenario, whole: setting and role already filled in. */
export type ScenarioVersion = {
  setting_es: string;
  setting_en: string;
  role_es: string;
  /** Written scenarios leave it to the app's bundle; a unit's scene carries it. */
  role_en?: string;
  goals: Goal[];
  key_phrases: Line[];
  opener: Line;
  keyterms: string[];
  /** A unit's scene: the forms the unit taught, for Pancho to stay near. */
  words?: string[];
  /** A scene for her first days (section 1): Pancho keeps to the words she has and to one-word answers. */
  first_steps?: boolean;
};
export type ScenarioDoc = {
  id: string;
  title_es: string;
  title_en: string;
  versions: Partial<Record<Band, ScenarioVersion>>;
};
/** A scenario at one level: what a chat actually runs. */
export type Scenario = ScenarioVersion & { id: string; title_es: string; title_en: string; band: Band };
export type CultureOpener = Line & { keyterms?: string[] };
export type Content = {
  scenarios: ScenarioDoc[];
  openers: { free: Record<Band, Line[]>; culture: Record<string, CultureOpener> };
};

export const CONTENT = content as unknown as Content;

/** The band closest to `want` that the scenario is written for; the easier one on a tie. */
export function nearestBand(written: Band[], want: Band): Band | null {
  let best: Band | null = null;
  for (const b of BANDS) {
    if (!written.includes(b)) continue;
    if (best === null || Math.abs(BANDS.indexOf(b) - BANDS.indexOf(want)) < Math.abs(BANDS.indexOf(best) - BANDS.indexOf(want))) best = b;
  }
  return best;
}

/** A scenario at a level: that level's version, or the nearest one written. */
export function scenarioAt(id: string | null | undefined, level: Band): Scenario | null {
  const doc = CONTENT.scenarios.find((s) => s.id === id);
  if (!doc) return null;
  const band = nearestBand(Object.keys(doc.versions) as Band[], level);
  const v = band ? doc.versions[band] : undefined;
  return v && band ? { ...v, id: doc.id, title_es: doc.title_es, title_en: doc.title_en, band } : null;
}
export const cultureOpener = (id: string | null | undefined) => (id ? CONTENT.openers.culture[id] ?? null : null);

/** A free-chat opener for the band, the same one all day for a learner (seed = user id + date). */
export function freeOpener(level: Band, seed: string): Line | null {
  const pool = CONTENT.openers.free[level] ?? [];
  if (!pool.length) return null;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}

export type Topic = {
  scenario: Scenario | null;
  culture: { id: string; opener: CultureOpener } | null;
  goals: Goal[];
};

/**
 * What a session is about, from its kind, topic id and level. Null if the
 * topic no longer exists. A unit chat's scene isn't in the bundle: it is the
 * copy the conversation kept (`stored`, the row's `scenario`).
 */
export function topicOf(kind: string, topicId: string | null, level: Band, stored?: Scenario | null): Topic | null {
  if (kind === "unit") return stored ? { scenario: stored, culture: null, goals: stored.goals } : null;
  if (kind === "scenario") {
    const scenario = scenarioAt(topicId, level);
    return scenario ? { scenario, culture: null, goals: scenario.goals } : null;
  }
  if (kind === "culture") {
    const opener = cultureOpener(topicId);
    return opener ? { scenario: null, culture: { id: topicId!, opener }, goals: [] } : null;
  }
  return { scenario: null, culture: null, goals: [] };
}

/**
 * Public URL of a pre-recorded clip. The recorded course lives under AUDIO_URL
 * (the app's EXPO_PUBLIC_AUDIO_URL) when that is set; the openers written here
 * at run time (hablar-unit.ts) stay in the Supabase `audio` bucket, which is
 * the only storage a function can write to.
 */
export const publicAudioUrl = (supabaseUrl: string, path: string | null | undefined) => {
  if (!path) return null;
  const root = path.startsWith("hablar/units/") ? null : Deno.env.get("AUDIO_URL")?.replace(/\/*$/, "");
  return `${root || `${supabaseUrl}/storage/v1/object/public/audio`}/${path}`;
};

// ---------------------------------------------------------------------------
// Limits (the "Chat limits UX" canvas, 20261016000001_hablar_chat_limits.sql).
// A Speaking-tab chat is three a day; a unit chat is had once, outside the
// day's count, with a high cap on how many fit in a day. Every chat is eight
// lines long (a unit chat too, since 2026-10-18: cost per chat is bounded).
// ---------------------------------------------------------------------------

/**
 * Chats a day, Course and Speaking together (since 2026-10-18): a unit chat
 * and a Speaking-tab chat each take one. The database's day_slot check holds
 * the Speaking tab's share; hablar-start counts both kinds.
 */
export const CHATS_PER_DAY = 3;
/** Lines she says in a chat (any kind); Pancho's answer to the last one closes it. */
export const TAB_MESSAGES = 8;

/** The lines a chat allows her: eight, whatever its kind. Null would mean no cap. */
export const messageCap = (_s: { kind: string }): number | null => TAB_MESSAGES;

// ---------------------------------------------------------------------------
// The clock (§4.5 step 2). The server decides; the client timer is a display.
// Since the chat limits a chat is measured in lines, and the clock is only a
// backstop for one left running: ten minutes of her own time (Pancho's turn
// and the app in the background don't count). The app no longer shows it.
// ---------------------------------------------------------------------------

/** A chat's clock, in seconds of chat time, and the exchange count that nudges Pancho to close. */
export type Clock = {
  /** Pancho is told it's about time to close. */
  closeSoon: number;
  /** Pancho is told to close now. */
  wrap: number;
  /** The hard stop. */
  stop: number;
  /** The same nudge as `closeSoon`, by exchanges: a chat shouldn't drag even with time left. */
  closeSoonExchanges: number;
};
const BACKSTOP = { closeSoon: 480, wrap: 540, stop: 600 };
const SHORT: Clock = { ...BACKSTOP, closeSoonExchanges: 6 };
// Beginners speak slowly: a unit chat nudges them to close two exchanges later.
const LONG: Clock = { ...BACKSTOP, closeSoonExchanges: 8 };
/** The only place the numbers live on the server (the app's chatSeconds mirrors `stop`). */
export const CLOCK: Record<Band, Clock> = { A1: LONG, A2: LONG, B1: SHORT, B2: SHORT };
/** A level's clock; an unknown level gets the short one. */
export const clockOf = (level: string | null | undefined): Clock => CLOCK[level as Band] ?? SHORT;
export const GRACE_SECONDS = 30; // a turn already being recorded at the hard stop still counts
export const PAUSE_CAP_SECONDS = 900; // at most 15 min of background time
export const MAX_HINTS = 3;

/** Paused time that counts: what the client reported, never more than 15 min or than the wall time itself. */
export function effectivePaused(reported: number, wallSeconds: number): number {
  const p = Number.isFinite(reported) ? reported : 0;
  return Math.max(0, Math.min(p, PAUSE_CAP_SECONDS, Math.max(0, wallSeconds)));
}

/** Chat time used, in seconds: wall time since start minus the pauses. */
export function elapsedSeconds(startedAt: string | Date, pausedSeconds: number, now = new Date()): number {
  const wall = (now.getTime() - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, wall - effectivePaused(pausedSeconds, wall));
}

/** Chat time used so far; a staff chat's clock never runs. */
export function sessionElapsed(s: { started_at: string; paused_seconds: number; unlimited?: boolean }, now = new Date()): number {
  return s.unlimited ? 0 : elapsedSeconds(s.started_at, s.paused_seconds, now);
}

/** When the level's time runs out, as the server sees it now. */
export function deadlineAt(startedAt: string | Date, pausedSeconds: number, level: Band, now = new Date()): string {
  const wall = (now.getTime() - new Date(startedAt).getTime()) / 1000;
  const paused = effectivePaused(pausedSeconds, wall);
  return new Date(new Date(startedAt).getTime() + (clockOf(level).stop + paused) * 1000).toISOString();
}

/** The stored pause total after a client report: it only grows, and caps at 15 min. */
export function mergePaused(stored: number, reported: unknown): number {
  const r = Number(reported);
  const next = Number.isFinite(r) ? Math.max(stored, Math.floor(r)) : stored;
  return Math.max(0, Math.min(next, PAUSE_CAP_SECONDS));
}

// Pancho decides when the chat ends (the END_MARKER on his goodbye). These
// nudge him when he hasn't: by the chat's line cap (a Speaking-tab chat), by
// exchanges (a unit chat, and what keeps a beginner's chat from dragging), or
// by the backstop clock.
const WRAP_EXCHANGES = 10;
/** How many lines before the cap Pancho is told to start closing (the app shows "2 messages left"). */
export const CLOSE_SOON_BEFORE_CAP = 2;

/** The learner's nth line, from its idx (opener 0, learner lines 1, 3, 5…). */
export const exchangeOf = (userIdx: number) => Math.ceil(userIdx / 2);

/** Must this reply close the chat? At her last line (`cap`), after ten exchanges, or at the backstop's wrap time. */
export function shouldWrapUp(elapsed: number, exchange: number, level: Band, cap: number | null = null): boolean {
  return elapsed >= clockOf(level).wrap || exchange >= (cap ?? WRAP_EXCHANGES);
}

/** Should Pancho be told it's about time to close? Two lines before the cap; else by exchanges (six; eight for a beginner); or by time. */
export function shouldCloseSoon(elapsed: number, exchange: number, level: Band, cap: number | null = null): boolean {
  const clock = clockOf(level);
  return elapsed >= clock.closeSoon || exchange >= (cap === null ? clock.closeSoonExchanges : cap - CLOSE_SOON_BEFORE_CAP);
}

// ---------------------------------------------------------------------------
// Level
// ---------------------------------------------------------------------------

export const BANDS: Band[] = ["A1", "A2", "B1", "B2"];

/** 'A2.3' → 'A2'. Anything past B2 is B2; anything unknown is A1. */
export function bandOf(cefr: string | null | undefined): Band {
  const b = String(cefr ?? "").slice(0, 2).toUpperCase();
  if ((BANDS as string[]).includes(b)) return b as Band;
  return b.startsWith("C") ? "B2" : "A1";
}

/**
 * The level a chat runs at. `override` is 'easier' | 'mine' | 'harder' (the
 * level chip), or a band outright; anything else means her course level.
 */
export function resolveLevel(courseCefr: string | null | undefined, override?: string | null): Band {
  const mine = bandOf(courseCefr);
  const o = String(override ?? "").trim();
  if ((BANDS as string[]).includes(o.toUpperCase())) return o.toUpperCase() as Band;
  const i = BANDS.indexOf(mine);
  if (o === "easier") return BANDS[Math.max(0, i - 1)];
  if (o === "harder") return BANDS[Math.min(BANDS.length - 1, i + 1)];
  return mine;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** YYYY-MM-DD in a time zone. A bad zone falls back to Buenos Aires (the profiles default). */
export function localDate(timeZone: string | null | undefined, now = new Date()): string {
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  try {
    return fmt(timeZone || "America/Argentina/Buenos_Aires");
  } catch {
    return fmt("America/Argentina/Buenos_Aires");
  }
}

// ---------------------------------------------------------------------------
// Decilo: say the fixed version again (§4.4 step 5). No model involved.
// ---------------------------------------------------------------------------

/** The same normalizer as explain-answer's answerKey: lower case, no punctuation, single spaces. */
export const answerKey = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

/** Word-level edit distance. */
export function wordDistance(a: string[], b: string[]): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/** equal → ok, one word off → almost, otherwise again. */
export function diloCompare(said: string, target: string): "ok" | "almost" | "again" {
  const a = answerKey(said);
  const b = answerKey(target);
  if (!a || !b) return "again";
  if (a === b) return "ok";
  return wordDistance(a.split(" "), b.split(" ")) === 1 ? "almost" : "again";
}

// ---------------------------------------------------------------------------
// Turn numbering: opener 0, user turns odd, Pancho's reply = user idx + 1.
// ---------------------------------------------------------------------------

/** The idx a user turn gets when it is sent, given the highest idx so far. */
export const nextUserIdx = (maxIdx: number | null | undefined) => {
  const m = maxIdx ?? 0;
  return m % 2 === 1 ? m + 2 : m + 1;
};

// ---------------------------------------------------------------------------
// Speech-to-text hints
// ---------------------------------------------------------------------------

// Scribe leans toward the keyterms it is given, so they are the words she is
// likely to say next: what Pancho just asked, then the scene's own phrases and
// words. Measured on real learner clips (2026-10-11): with these, "Bate, por
// favor" after "¿Café o mate?" is heard as "Mate, por favor". Everyday words
// are left out — boosted, they get heard where they were not said ("Con
// medialuna" came back as "¿Cómo te llamas?" with cómo/te/llamás boosted).
const TOO_COMMON = new Set(
  ("el la los las un una unos unas de del al y o u que qué en con por para es no sí si me te se lo le mi tu su a e yo vos " +
    "muy más ya hay hola cómo como bien eso esto esta este pero porque ah eh").split(" "),
);
const MAX_KEYTERMS = 100; // past a hundred Scribe bills every clip as twenty seconds

/** Is the term worth boosting: it has a word in it that is not an everyday one. */
function boostable(term: string): boolean {
  const words = term.split(/\s+/);
  if (term.length > 50 || words.length > 5) return false;
  return words.some((w) => w.length > 2 && !TOO_COMMON.has(w.toLowerCase()));
}

/**
 * Scribe keyterms for her next line: the words of Pancho's last line, the
 * scene's key phrases and keyterms, then the words the unit taught. Unique
 * (whatever the capitals), at most a hundred.
 */
export function sttKeyterms(topic: Topic | null, _level: Band, tomasBefore?: string | null): string[] {
  const scene = topic?.scenario;
  const candidates = [
    ...wordsOf(tomasBefore ?? ""),
    ...(scene?.key_phrases ?? []).flatMap((p) => phraseWords(p.es)),
    ...(scene?.keyterms ?? topic?.culture?.opener.keyterms ?? []),
    ...(scene?.words ?? []),
  ];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of candidates) {
    const k = t.trim();
    if (!k || !boostable(k) || seen.has(k.toLowerCase())) continue;
    seen.add(k.toLowerCase());
    out.push(k);
    if (out.length === MAX_KEYTERMS) break;
  }
  return out;
}

/** Known things STT invents on silence (Whisper-style hallucinations). */
const SILENCE = [
  "gracias por ver", "gracias por ver el video", "subtítulos realizados por", "subtitulos realizados por",
  "suscríbete", "suscribete", "amaraorg", "gracias por su atención", "gracias por mirar",
];
/** The same, but only when it is all she "said": a real line can have the word in it. */
const SILENCE_ALONE = ["música", "musica"];

export function isSilenceHallucination(text: string): boolean {
  const k = answerKey(text);
  if (!k) return true;
  if (SILENCE_ALONE.includes(k)) return true;
  return SILENCE.some((s) => k === answerKey(s) || (k.length < 60 && k.includes(answerKey(s))));
}

// A line said in English. The recogniser is forced to Spanish (that is what
// keeps a learner's mistakes as she said them), so English comes back as
// English words, as nothing, or as nonsense. These tell which, from the words
// alone. Words both languages have (a, come, son, he, has) count for neither;
// no, me and ok count as Spanish, so a one-word "No" is never sent round again.
const ENGLISH = new Set(
  ("i i'm im i'd i'll i've you you're your we they it it's its the this that these those is are am was were be do don't dont " +
    "does doesn't did didn't can can't could would should will won't have had want wanna need like know think mean say " +
    "what what's how why where when who which and or but with for from of to in on at my not yes yeah please sorry thanks " +
    "thank hello hi hey bye there here some any very really just too also because about maybe").split(" "),
);
const SPANISH = new Set(
  ("el la los las un una unos unas de del al y o u que qué en con por para es soy sos somos está estoy estás están hay yo vos " +
    "él ella nosotros ustedes ellos mi mis tu tus su sus te se lo le les nos sí si pero como cómo muy más menos bien mal hola " +
    "chau gracias perdón quiero querés quiere tengo tenés tiene puedo podés puede voy vas va vamos gusta gustan porque cuando " +
    "cuándo donde dónde quién cuál cuánto este esta esto ese esa eso acá allá ahora hoy ayer mañana también tampoco ya todo " +
    "nada algo mucho poco bueno dale che claro entiendo sé no me ok okay uno dos tres cuatro cinco seis diez").split(" "),
);
/**
 * A key phrase's words, without the names in it: a phrase like "Me llamo Sam,
 * ¿y vos?" is a model, and boosting "Sam" made Scribe hear "soy Ohad" as
 * "sum sam ohad" (2026-10-20). A name is a capitalised word that doesn't open
 * the phrase.
 */
const phraseWords = (text: string) =>
  (text.normalize("NFC").replace(/’/g, "'").match(/[\p{L}']+/gu) ?? [])
    .filter((w, i) => i === 0 || w[0] === w[0].toLowerCase())
    .map((w) => w.toLowerCase());

const wordsOf = (text: string) => text.normalize("NFC").toLowerCase().replace(/’/g, "'").match(/[\p{L}']+/gu) ?? [];

/** Is the line English? At least half its words are plainly English, and more of them than are plainly Spanish. */
export function looksEnglish(text: string): boolean {
  const words = wordsOf(text);
  const en = words.filter((w) => ENGLISH.has(w)).length;
  const es = words.filter((w) => SPANISH.has(w)).length;
  return en > 0 && en > es && en * 2 >= words.length;
}

/** Does the line have anything plainly Spanish in it: a common word, one of the chat's keyterms, an accent or ñ? */
export function looksSpanish(text: string, keyterms: string[] = []): boolean {
  if (/[áéíóúñ¿¡]/i.test(text)) return true;
  const known = new Set(keyterms.flatMap(wordsOf));
  return wordsOf(text).some((w) => SPANISH.has(w) || known.has(w));
}

/**
 * Is a forced-Spanish transcript worth a second pass with the language left to
 * the recogniser? Only when it gave nothing usable: silence, a hallucination,
 * or a line with nothing Spanish in it. A line that already reads as English
 * needs no second pass.
 */
export function wantsLanguageRetry(text: string, keyterms: string[] = []): boolean {
  if (looksEnglish(text)) return false;
  return isSilenceHallucination(text) || !looksSpanish(text, keyterms);
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

export type Env = {
  url: string;
  serviceRole: string;
  anon: string;
  anthropicKey: string;
  elevenKey: string;
};

/** The secrets every hablar function needs; null when one is missing. */
export function hablarEnv(): Env | null {
  const env = {
    url: Deno.env.get("SUPABASE_URL") ?? "",
    serviceRole: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    anon: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    anthropicKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
    elevenKey: Deno.env.get("ELEVENLABS_API_KEY") ?? "",
  };
  return Object.values(env).every(Boolean) ? env : null;
}

export const serviceClient = (env: Env) => createClient(env.url, env.serviceRole, { auth: { persistSession: false } });

/** The caller, checked by Supabase, and a client that acts as her (for RPCs that read auth.uid()). */
export async function caller(req: Request, env: Env): Promise<{ userId: string; asUser: SupabaseClient } | null> {
  const asUser = createClient(env.url, env.anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data } = await asUser.auth.getUser();
  return data?.user ? { userId: data.user.id, asUser } : null;
}

export type Session = {
  id: string;
  user_id: string;
  local_date: string;
  kind: "scenario" | "culture" | "free" | "unit";
  /** A unit chat: its unit's id. */
  topic_id: string | null;
  level: Band;
  started_at: string;
  ended_at: string | null;
  end_reason: string | null;
  paused_seconds: number;
  hints_used: number;
  hint_turns: number[];
  goals_done: string[];
  summary: Record<string, unknown> | null;
  /** Staff chat: no clock, no daily limit. */
  unlimited: boolean;
  /** A unit chat: the Speaking lesson it plays, and the scene it ran. */
  lesson_id?: string | null;
  scenario?: Scenario | null;
};

/** The session row, whoever it belongs to — check `user_id` before using it. */
export async function sessionRow(db: SupabaseClient, sessionId: unknown): Promise<Session | null> {
  if (typeof sessionId !== "string" || !isUuid(sessionId)) return null;
  const { data } = await db.from("conversations").select("*").eq("id", sessionId).maybeSingle();
  return (data as Session) ?? null;
}

/** The session, if it exists and belongs to the caller. */
export async function loadSession(db: SupabaseClient, sessionId: unknown, userId: string): Promise<Session | null> {
  const row = await sessionRow(db, sessionId);
  return row && row.user_id === userId ? row : null;
}

/** Store a client pause report if it moves the total; returns the total. */
export async function recordPause(db: SupabaseClient, session: Session, reported: unknown): Promise<number> {
  const next = mergePaused(session.paused_seconds, reported);
  if (next !== session.paused_seconds) {
    // Taken in memory first, so a caller that runs the write in the
    // background still reads the new pause from `session`.
    session.paused_seconds = next;
    await db.from("conversations").update({ paused_seconds: next }).eq("id", session.id);
  }
  return next;
}

export async function profileTimezone(db: SupabaseClient, userId: string): Promise<string> {
  const { data } = await db.from("profiles").select("timezone").eq("user_id", userId).maybeSingle();
  return data?.timezone ?? "America/Argentina/Buenos_Aires";
}

export const isUuid = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export type Usage = {
  conversation_id: string;
  turn_id?: string | null;
  provider: "anthropic" | "elevenlabs";
  model?: string | null;
  stage: "stt" | "reply" | "feedback" | "hint" | "translate" | "summary" | "tts" | "guard";
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
  cache_write_tokens?: number | null;
  audio_seconds?: number | null;
  tts_chars?: number | null;
  ms?: number | null;
};

/** Usage rows from an Anthropic response's usage block. */
export function claudeUsage(
  base: Omit<Usage, "provider" | "input_tokens" | "output_tokens" | "cache_read_tokens" | "cache_write_tokens">,
  usage: {
    input_tokens?: number | null;
    output_tokens?: number | null;
    cache_read_input_tokens?: number | null;
    cache_creation_input_tokens?: number | null;
  } | undefined,
): Usage {
  return {
    ...base,
    provider: "anthropic",
    input_tokens: usage?.input_tokens ?? null,
    output_tokens: usage?.output_tokens ?? null,
    cache_read_tokens: usage?.cache_read_input_tokens ?? null,
    cache_write_tokens: usage?.cache_creation_input_tokens ?? null,
  };
}

export async function logUsage(db: SupabaseClient, rows: Usage[]) {
  if (!rows.length) return;
  const { error } = await db.from("hablar_usage").insert(rows);
  if (error) console.error("hablar_usage insert failed", error.message);
}

/** Run work after the response is sent (Supabase's EdgeRuntime.waitUntil), or just let it run. */
export function background(work: Promise<unknown>) {
  const guarded = work.catch((err) => console.error("hablar background work failed", err));
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(guarded);
}

// ---------------------------------------------------------------------------
// ElevenLabs
// ---------------------------------------------------------------------------

const ELEVEN = "https://api.elevenlabs.io/v1";
/**
 * How fast Pancho speaks at each level. Said slowly by the voice itself, not
 * stretched afterwards, so it stays natural. Beginner and Intermediate get it
 * very slow, Advanced a little under native, Local at full native speed.
 * (ElevenLabs takes 0.7–1.2.)
 */
export const TALK_SPEED: Record<Band, number> = { A1: 0.75, A2: 0.75, B1: 0.9, B2: 1 };

export const TTS_MODEL = () => Deno.env.get("HABLAR_TTS_MODEL") || "eleven_flash_v2_5";
/**
 * How steady Pancho's voice stays, 0–1. Lower lets the pitch move more — the
 * rise and fall of porteño speech — at the cost of a less even read. A secret,
 * so it can be tuned by ear without a deploy.
 */
export const TTS_STABILITY = () => {
  const v = Number(Deno.env.get("HABLAR_TTS_STABILITY"));
  return Number.isFinite(v) && v >= 0 && v <= 1 && Deno.env.get("HABLAR_TTS_STABILITY") ? v : 0.6;
};

let voiceCache: string | null = null;

/** Pancho's ElevenLabs voice: HABLAR_TOMAS_VOICE_ID, else the `voices` row 'tomas'. */
export async function tomasVoice(db: SupabaseClient): Promise<string> {
  const override = Deno.env.get("HABLAR_TOMAS_VOICE_ID");
  if (override) return override;
  if (voiceCache) return voiceCache;
  const { data } = await db.from("voices").select("provider_id").eq("id", "tomas").maybeSingle();
  if (!data?.provider_id) throw new Error("no 'tomas' row in voices");
  voiceCache = data.provider_id as string;
  return voiceCache;
}

const TTS_TIMEOUT_MS = 10_000;
const STT_TIMEOUT_MS = 20_000;
/** Claude calls give up after this, with one retry, instead of the SDK's
 *  default ten minutes and two. */
export const CLAUDE_OPTIONS = { timeout: 45_000, maxRetries: 1 };

/** One sentence as mp3 bytes, over the streaming endpoint (lower time to first byte). */
export async function synthesize(opts: {
  key: string;
  voiceId: string;
  text: string;
  previousText?: string;
  /** Speaking speed, 0.7–1.2 (1 is natural): TALK_SPEED for the chat's level. */
  speed?: number;
  signal?: AbortSignal;
}): Promise<Uint8Array<ArrayBuffer>> {
  const model = TTS_MODEL();
  const res = await fetch(`${ELEVEN}/text-to-speech/${opts.voiceId}/stream?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": opts.key, "content-type": "application/json" },
    // Sentences play in order, so one hung request would silence every one
    // after it until the function timed out.
    signal: opts.signal ?? AbortSignal.timeout(TTS_TIMEOUT_MS),
    body: JSON.stringify({
      text: opts.text,
      model_id: model,
      // Only the flash/turbo models accept a forced language.
      ...(/flash|turbo/.test(model) ? { language_code: "es" } : {}),
      ...(opts.previousText ? { previous_text: opts.previousText.slice(-500) } : {}),
      voice_settings: {
        stability: TTS_STABILITY(),
        similarity_boost: 0.85,
        style: 0,
        use_speaker_boost: true,
        speed: opts.speed ?? 1,
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`elevenlabs tts ${res.status}: ${detail.slice(0, 300)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export type Transcript = {
  text: string;
  audioSeconds: number | null;
  /** "en" when she said the line in English (only looked for with `english`). */
  language: "es" | "en";
  /** Speech-to-text requests made. */
  calls: number;
  /** The line can't be made out well enough to answer or correct (only with `doubt: "ask"`): ask her to say it again. */
  unclear?: boolean;
  /** Words of the line Scribe may have misheard (only with `doubt`): not hers to be corrected on. */
  unsure?: string[];
};
type ScribeOptions = { key: string; audio: Blob; filename: string; keyterms: string[] };
/** One hearing of a clip: the text, and each word with how sure Scribe was of it (log probability, 0 = certain). */
export type Hearing = {
  text: string;
  audioSeconds: number | null;
  /** `w` bare (for comparing), `raw` as written in the line. */
  words: { w: string; raw: string; lp: number }[];
};

// How sure Scribe has to be of a line for it to stand. From the clips of
// 2026-10-11: invented words ("Soy un gemero", "Ponme de alguna") sit below
// these, plain lines above.
const SURE_MIN = -0.9;
const UNSURE_MEAN = -0.5;
/** Below this, Scribe was guessing at the word. */
const SHAKY_WORD = -0.5;
/** How alike two stretches must sound (share of letters in common) for one to be the other misheard. */
const ALIKE = 0.5;

/** Letters and digits only, accents off: "No, media luna" and "No medialuna" are the same line. */
const bare = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Letter-level edit distance. */
function letterDistance(a: string, b: string): number {
  return wordDistance([...a], [...b]);
}

/** Where two word lists part ways: each stretch of `a` (as [from, to) indexes) and the words `b` has in its place. */
function stretches(a: string[], b: string[]): { from: number; to: number; other: string[] }[] {
  // Longest common subsequence, then walk it.
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: { from: number; to: number; other: string[] }[] = [];
  let i = 0, j = 0, open: { from: number; to: number; other: string[] } | null = null;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      open = null;
      i++, j++;
      continue;
    }
    if (!open) out.push(open = { from: i, to: i, other: [] });
    if (j < b.length && (i === a.length || lcs[i][j + 1] >= lcs[i + 1][j])) open.other.push(b[j++]);
    else open.to = ++i;
  }
  return out;
}

/** Sounds she makes while thinking; Scribe writes them one time and not the next. */
const FILLERS = new Set(["eh", "ehh", "em", "mm", "mmm", "ah", "oh", "este"]);

/**
 * Can the hinted hearing of a clip be believed? Scribe is heard twice, with
 * the keyterms (`hinted`) and without (`plain`). The keyterms pull a mumbled
 * word toward the right one ("Bate, por favor" → "Mate, por favor"), and now
 * and then put a word that was never said ("Sí, por favor" → "Café, por
 * favor"); the plain hearing is too loose to be the answer itself (on a short
 * clip it wanders into other languages), but where the two part ways is where
 * the doubt is. The hinted line stands when every such place is one of:
 *  - small: figures, a short word, or two stretches that sound alike (del/el, Lio/Leo);
 *  - a keyterm put where the plain hearing was guessing;
 *  - words that are no keyterm (so the hints did not put them) and that Scribe was sure of.
 * Otherwise, or when Scribe was guessing at the hinted line itself, it does
 * not: she is asked to say it again.
 */
export function hearingHolds(hinted: Hearing, plain: Hearing | null, keyterms: string[]): boolean {
  if (!hinted.words.length) return true; // silence is somebody else's question
  const h = hinted.words.filter((x) => !FILLERS.has(x.w));
  // A little word is often half-swallowed and still right; a long one Scribe doubts is likely made up.
  if (h.some((x) => x.w.length > 3 && x.lp < SURE_MIN) || (h.length && mean(h.map((x) => x.lp)) < UNSURE_MEAN)) return false;
  if (!plain || bare(hinted.text) === bare(plain.text)) return true;
  const p = plain.words.filter((x) => !FILLERS.has(x.w));
  // The plain hearing got nothing: only a full line survives that.
  if (!p.length) return h.length >= 3;
  const known = new Set(keyterms.flatMap(wordsOf).map(bare));
  const short = (ws: string[]) => ws.length <= 1 && ws.join("").length <= 3;
  /** The hinted hearing's own words for a stretch (the first match is close enough for a confidence check). */
  const now = (ws: string[]) => ws.map((w) => h.find((x) => x.w === w)!);
  return stretches(p.map((x) => x.w), h.map((x) => x.w)).every((d) => {
    const was = p.slice(d.from, d.to);
    const a = was.map((x) => x.w).join("");
    const b = d.other.join("");
    if (/\d/.test(a + b)) return true;
    if (short(was.map((x) => x.w)) && short(d.other)) return true;
    if (a && b && 1 - letterDistance(a, b) / Math.max(a.length, b.length) >= ALIKE) return true;
    // No keyterm here: the hints did not put these words, Scribe heard them. Sure of them, they stand.
    if (!d.other.some((w) => known.has(w))) return d.other.length > 0 && now(d.other).every((x) => x.lp >= SHAKY_WORD);
    return was.some((x) => x.lp < SHAKY_WORD);
  });
}

/**
 * The words of the hinted hearing that may not be what she said: the ones
 * Scribe was guessing at, and the ones the plain hearing heard differently
 * ("Pablo francés" after "¿Hablás francés?"). Passed on so a misheard word is
 * never corrected as her mistake. At most six, as written in the line.
 */
export function unsureWords(hinted: Hearing, plain: Hearing | null): string[] {
  const h = hinted.words.filter((x) => !FILLERS.has(x.w));
  const differs = new Set<string>();
  if (plain && plain.words.length && bare(hinted.text) !== bare(plain.text)) {
    const p = plain.words.filter((x) => !FILLERS.has(x.w));
    for (const d of stretches(p.map((x) => x.w), h.map((x) => x.w))) for (const w of d.other) differs.add(w);
  }
  const out: string[] = [];
  for (const x of h) {
    if ((x.lp < SHAKY_WORD || differs.has(x.w)) && x.raw && !out.includes(x.raw)) out.push(x.raw);
  }
  return out.slice(0, 6);
}

/**
 * Speech to text with Scribe v2, forced to Spanish, bytes sent as they came
 * (§4.4 step 3).
 *
 * With `english`, a line said in English is given back as English: a forced
 * transcript with nothing Spanish in it is heard again with the language left
 * to Scribe, and that second transcript is kept only if it reads as English —
 * a beginner's accented Spanish is never handed to language detection alone.
 *
 * With `doubt`, the clip is heard twice at once, with and without the
 * keyterms. The hinted hearing is the transcript, and the words it may have
 * misheard come back as `unsure`. With "ask", a line `hearingHolds` won't
 * vouch for comes back `unclear`; with "take" it is given anyway (she was
 * already asked once, or the app is too old to ask).
 */
export async function transcribe(
  opts: ScribeOptions & { english?: boolean; doubt?: "ask" | "take" },
): Promise<Transcript> {
  const twice = !!opts.doubt && opts.keyterms.length > 0;
  const [hinted, plain] = await Promise.all([
    scribe(opts, "es"),
    // A failed second hearing is not worth losing the line over.
    twice
      ? scribe({ ...opts, keyterms: [] }, "es").catch((err) => {
        console.error("stt plain pass failed", err);
        return null;
      })
      : Promise.resolve(null),
  ]);
  let calls = twice ? 2 : 1;
  const es = (h: Hearing): Transcript => ({ text: h.text, audioSeconds: h.audioSeconds, language: "es", calls });
  const en = (h: Hearing): Transcript => ({ text: h.text, audioSeconds: h.audioSeconds, language: "en", calls });

  if (opts.english) {
    if (looksEnglish(hinted.text)) return en(hinted);
    if (wantsLanguageRetry(hinted.text, opts.keyterms)) {
      calls++;
      const free = await scribe(opts, null).catch((err) => {
        console.error("stt second pass failed", err);
        return null;
      });
      if (free && looksEnglish(free.text)) return en(free);
    }
  }
  const unsure = opts.doubt ? unsureWords(hinted, plain) : [];
  return {
    ...es(hinted),
    ...(opts.doubt === "ask" && !hearingHolds(hinted, plain, opts.keyterms) ? { unclear: true } : {}),
    ...(unsure.length ? { unsure } : {}),
  };
}

/** One Scribe request; `language` null leaves the language to Scribe. */
async function scribe(opts: ScribeOptions, language: "es" | null): Promise<Hearing> {
  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("file", opts.audio, opts.filename);
  if (language) form.append("language_code", language);
  form.append("tag_audio_events", "false");
  form.append("no_verbatim", "false");
  form.append("temperature", "0");
  // Keyterms are Spanish: on the free pass they would pull English toward them.
  if (language) for (const k of opts.keyterms) form.append("keyterms", k);
  const res = await fetch(`${ELEVEN}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": opts.key },
    body: form,
    signal: AbortSignal.timeout(STT_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`elevenlabs stt ${res.status}: ${detail.slice(0, 300)}`);
  }
  const body = await res.json();
  // deno-lint-ignore no-explicit-any
  const words: any[] = Array.isArray(body.words) ? body.words : [];
  const last = words.length ? Number(words[words.length - 1].end) : NaN;
  return {
    text: String(body.text ?? "").trim(),
    audioSeconds: Number.isFinite(last) ? last : null,
    words: words
      .filter((w) => w?.type === "word" && bare(String(w.text ?? "")))
      .map((w) => ({
        w: bare(String(w.text)),
        raw: String(w.text).trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""),
        lp: Number.isFinite(Number(w.logprob)) ? Number(w.logprob) : 0,
      })),
  };
}

/** File extension for a recorded clip, from its MIME type. */
export function audioExt(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  return "bin";
}

/** Byte arrays joined — mp3 frames concatenate into one playable file. */
export function concatBytes(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// End marker: Pancho ends his goodbye with it; it is never shown or spoken.
// ---------------------------------------------------------------------------

/** Her lines before a goodbye without the marker counts as the end (no "chau" in the first exchanges). */
export const GOODBYE_FROM_EXCHANGE = 3;

/**
 * Pancho said goodbye but forgot the END_MARKER: the reply's last sentence
 * takes leave (chau, nos vemos, hasta luego…) and asks nothing. Left alone,
 * the chat would go on past his goodbye.
 */
export function soundsLikeGoodbye(reply: string): boolean {
  const text = reply.trim();
  if (!text || text.endsWith("?")) return false;
  const sentences = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const last = sentences[sentences.length - 1] ?? "";
  return /\b(chau|nos vemos|hasta luego|hasta la próxima|hasta mañana|nos hablamos)\b/i.test(last);
}

/**
 * Takes the streamed reply a delta at a time and passes on everything but the
 * marker. A tail that could be the start of the marker is held back until the
 * next delta shows whether it is; anything after the marker is dropped.
 */
export class MarkerStripper {
  found = false;
  private held = "";
  constructor(private readonly marker: string) {}

  push(delta: string): string {
    if (this.found) return "";
    const buf = this.held + delta;
    const at = buf.indexOf(this.marker);
    if (at >= 0) {
      this.found = true;
      this.held = "";
      return buf.slice(0, at);
    }
    let keep = Math.min(buf.length, this.marker.length - 1);
    while (keep > 0 && !this.marker.startsWith(buf.slice(buf.length - keep))) keep--;
    this.held = buf.slice(buf.length - keep);
    return buf.slice(0, buf.length - keep);
  }

  /** What was held back, once the stream is over (it wasn't the marker). */
  flush(): string {
    const rest = this.found ? "" : this.held;
    this.held = "";
    return rest;
  }
}
