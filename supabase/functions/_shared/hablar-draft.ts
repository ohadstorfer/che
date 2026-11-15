// A learner line, stored as the turn's draft: what hablar-reply answers. Shared
// by hablar-transcribe (the line alone, for the confirm bubble of older builds)
// and hablar-reply (the line and the answer in one request).
//
// The same turn_id sent again replaces the draft (a re-record) or, for the same
// bytes or a turn already sent, returns what is stored without another
// speech-to-text call.

import { json } from "./cors.ts";
import {
  audioExt,
  background,
  isSilenceHallucination,
  isUuid,
  logUsage,
  looksEnglish,
  pastLastLine,
  sttKeyterms,
  TAB_MESSAGES,
  topicOf,
  transcribe,
  type Env,
  type Session,
} from "./hablar.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const MAX_AUDIO_BYTES = 0.9 * 1024 * 1024; // ≈ 26 s of audio: the app stops at 20 s
// Speech-to-text requests, not recordings: a line is heard twice (with and
// without keyterms), three times when it may be English.
export const MAX_STT_PER_CHAT = 200;
const MAX_TYPED_CHARS = 300;
/** Lines of any kind, drafts included: the backstop under every chat's own cap. */
const MAX_TURNS_PER_CHAT = 80;

/** A conversation_turns row, as far as the drafts care. */
export type TurnRow = {
  id: string;
  conversation_id: string;
  idx: number | null;
  role: "user" | "tomas";
  status: "draft" | "final";
  text: string;
  audio_path: string | null;
  // deno-lint-ignore no-explicit-any
  feedback: any;
  meta: Record<string, unknown>;
};

export type DraftOutcome =
  /** The stored line: a new or replaced draft, or a turn already sent. */
  | { turn: TurnRow }
  /** Nothing usable was heard. */
  | { empty: true }
  /** Something was said, but not clearly enough to answer or correct: she is asked to say it again. */
  | { unclear: true }
  /** Refused; send this as-is. */
  | { error: Response };

async function sha256(bytes: ArrayBuffer) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * The chat takes no new line: it ended, or it is past its last line's time
 * (pastLastLine, the bound hablar-reply answers by too). A line already sent
 * is checked before this, so a retry of it is replayed rather than refused.
 */
function closed(session: Session): Response | null {
  if (session.ended_at) return json({ error: "ended" }, { status: 409 });
  if (pastLastLine(session)) return json({ error: "time_up" }, { status: 409 });
  return null;
}

/**
 * Pancho said goodbye: his latest line closed the chat (`meta.ended`). The chat
 * only gets its ended_at when the app calls hablar-end, so an app closed during
 * the goodbye leaves it open; this keeps new lines out all the same. Refused
 * like a closed chat, so the app goes to the summary.
 */
export const panchoEnded = (last: { meta?: Record<string, unknown> | null } | null | undefined): Response | null =>
  last?.meta?.ended === true ? json({ error: "ended" }, { status: 409 }) : null;

/** Pancho's latest line in the chat, for panchoEnded. */
export async function lastPanchoLine(db: SupabaseClient, sessionId: string) {
  const { data } = await db
    .from("conversation_turns")
    .select("text, meta")
    .eq("conversation_id", sessionId)
    .eq("role", "tomas")
    .not("idx", "is", null)
    .order("idx", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { text: string; meta: Record<string, unknown> | null } | null;
}

/** A placed line of the chat (idx set), as `recentLines` reads it. */
export type PlacedLine = Pick<TurnRow, "idx" | "role" | "status" | "text" | "meta">;

/**
 * Enough of the chat's latest placed lines to hold all of them: eight of hers,
 * Pancho's answers and the opener make 17. Read once per turn and reused (the
 * cap, Pancho's last line, the turn's place, the history), since each read is
 * a round trip before Pancho can start talking. Newest first.
 */
export const RECENT_LINES = 24;
export async function recentLines(db: SupabaseClient, sessionId: unknown): Promise<PlacedLine[] | null> {
  if (!isUuid(sessionId)) return null;
  const { data, error } = await db
    .from("conversation_turns")
    .select("idx, role, status, text, meta")
    .eq("conversation_id", sessionId)
    .not("idx", "is", null)
    .order("idx", { ascending: false })
    .limit(RECENT_LINES);
  return error ? null : (data as PlacedLine[]);
}

/** Pancho's latest line among `recent` (lastPanchoLine without the read). */
export const lastPanchoOf = (recent: PlacedLine[]) => recent.find((t) => t.role === "tomas") ?? null;

/** overCap without the read: her sent lines among `recent`. */
export const overCapOf = (recent: PlacedLine[]): Response | null =>
  recent.filter((t) => t.role === "user" && t.status === "final").length >= TAB_MESSAGES
    ? json({ error: "message_limit", limit: TAB_MESSAGES }, { status: 429 })
    : null;

/**
 * A chat takes eight lines (TAB_MESSAGES): a ninth is refused
 * before anything is heard, with 429 `message_limit`, which the app reads as
 * the chat being over. A re-record of the draft in hand is not a new line.
 */
export async function overCap(db: SupabaseClient, session: Session): Promise<Response | null> {
  const { count } = await db
    .from("conversation_turns")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", session.id)
    .eq("role", "user")
    .eq("status", "final");
  return (count ?? 0) >= TAB_MESSAGES ? json({ error: "message_limit", limit: TAB_MESSAGES }, { status: 429 }) : null;
}

function foreign(existing: TurnRow | null, session: Session): Response | null {
  if (existing && (existing.conversation_id !== session.id || existing.role !== "user")) {
    return json({ error: "turn_id belongs to something else" }, { status: 409 });
  }
  return null;
}

/** A spoken line: speech to text, then stored as the draft. */
export async function spokenDraft(opts: {
  env: Env;
  db: SupabaseClient;
  userId: string;
  session: Session;
  turnId: string;
  audio: Blob;
  existing: TurnRow | null;
  /** Speech-to-text calls this chat has made so far. */
  sttCount: number;
  /**
   * What to do with a clip that can't be made out: "ask" her to say it again
   * (the app said it can), or "take" the best guess (she was asked already).
   * Left out by apps from before the question existed: the best guess.
   */
  doubt?: "ask" | "take";
  /** The chat's latest lines, already read (recentLines): spares the cap and last-line reads. */
  recent?: PlacedLine[] | null;
}): Promise<DraftOutcome> {
  const { env, db, session, turnId, audio, existing } = opts;
  const recent = opts.recent ?? null;
  const mine = foreign(existing, session);
  if (mine) return { error: mine };
  // Sent already: a retry, answered or replayed by hablar-reply. Nothing is
  // heard again, and a chat that has closed since doesn't refuse it.
  if (existing?.status === "final") return { turn: existing };
  if (opts.sttCount >= MAX_STT_PER_CHAT) return { error: json({ error: "too many recordings" }, { status: 429 }) };
  const shut = closed(session) ?? (recent ? overCapOf(recent) : await overCap(db, session));
  if (shut) return { error: shut };

  // What Pancho just said is the best hint of what she says next; read while the clip is.
  const lastLine = recent ? Promise.resolve(lastPanchoOf(recent)) : lastPanchoLine(db, session.id);
  const bytes = await audio.arrayBuffer();
  const mime = audio.type || "application/octet-stream";
  const ext = audioExt(mime);
  const hash = await sha256(bytes);
  if (existing?.meta?.audio_sha === hash) return { turn: existing };
  const last = await lastLine;
  const said = panchoEnded(last);
  if (said) return { error: said };
  const tomasBefore = last?.text ?? null;

  const t0 = Date.now();
  let text = "";
  let audioSeconds: number | null = null;
  let language: "es" | "en" = "es";
  let calls = 1;
  let unclear: boolean | undefined;
  let unsure: string[] | undefined;
  let plain: string | undefined;
  try {
    ({ text, audioSeconds, language, calls, unclear, unsure, plain } = await transcribe({
      key: env.elevenKey,
      audio: new Blob([bytes], { type: mime }),
      filename: `turn.${ext}`,
      keyterms: sttKeyterms(
        topicOf(session.kind, session.topic_id, session.level, session.scenario),
        session.level,
        tomasBefore,
      ),
      english: true,
      doubt: opts.doubt ?? "take",
    }));
  } catch (err) {
    console.error(err);
    return { error: json({ error: "stt_failed", retry: true, detail: String(err).slice(0, 300) }, { status: 502 }) };
  }
  // One row per request: a line heard twice cost twice.
  const usage = logUsage(db, Array.from({ length: calls }, () => ({
    conversation_id: session.id,
    turn_id: turnId,
    provider: "elevenlabs" as const,
    model: "scribe_v2",
    stage: "stt" as const,
    audio_seconds: audioSeconds,
    ms: Math.round((Date.now() - t0) / calls),
  })));

  if (isSilenceHallucination(text)) {
    background(usage);
    return { empty: true };
  }
  if (unclear) {
    background(usage);
    return { unclear: true };
  }

  const audioPath = `${opts.userId}/${session.id}/${turnId}.${ext}`;
  const { data, error } = await db.from("conversation_turns").upsert({
    id: turnId,
    conversation_id: session.id,
    role: "user",
    status: "draft",
    text,
    audio_path: audioPath,
    // A re-record under the same turn_id: a grade of the words before is not this line's.
    feedback: null,
    // `lang: "en"`: she said it in English; hablar-reply tells Pancho and the feedback.
    // `unsure`: words the recogniser may have misheard; hablar-reply keeps them out of the correction.
    // `plain`: the line heard without the keyterms, where it differs; the grading reads her own forms from it.
    meta: {
      audio_sha: hash,
      audio_seconds: audioSeconds,
      ...(language === "en" ? { lang: "en" } : {}),
      ...(language === "es" && unsure?.length ? { unsure } : {}),
      ...(language === "es" && plain ? { plain } : {}),
    },
  }).select("*").single();
  if (error || !data) {
    console.error("draft upsert failed", error?.message);
    return { error: json({ error: "could not save" }, { status: 500 }) };
  }

  background(Promise.all([
    usage,
    db.storage.from("hablar").upload(audioPath, new Blob([bytes], { type: mime }), {
      contentType: mime,
      upsert: true,
    }).then(({ error }) => error && console.error("clip upload failed", error.message)),
  ]));
  return { turn: data as TurnRow };
}

/** A line she typed instead of saying: stored as a draft turn like a transcript. */
export async function typedDraft(opts: {
  db: SupabaseClient;
  session: Session;
  turnId: string;
  raw: string;
  existing: TurnRow | null;
}): Promise<DraftOutcome> {
  const { db, session, turnId, existing } = opts;
  const text = opts.raw.replace(/\s+/g, " ").trim();
  if (!text) return { error: json({ error: "text is empty" }, { status: 400 }) };
  if (text.length > MAX_TYPED_CHARS) return { error: json({ error: "text too long" }, { status: 413 }) };
  const mine = foreign(existing, session);
  if (mine) return { error: mine };
  // Sent already: a retry, answered or replayed by hablar-reply.
  if (existing?.status === "final") return { turn: existing };
  const shut = closed(session);
  if (shut) return { error: shut };
  // Read together: each is a round trip before the line is stored.
  const [last, full] = await Promise.all([lastPanchoLine(db, session.id), existing ? null : overCap(db, session)]);
  const said = panchoEnded(last) ?? full;
  if (said) return { error: said };
  if (!existing) {
    const { count } = await db
      .from("conversation_turns")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", session.id)
      .eq("role", "user");
    if ((count ?? 0) >= MAX_TURNS_PER_CHAT) return { error: json({ error: "too many turns" }, { status: 429 }) };
  }

  const { data, error } = await db.from("conversation_turns").upsert({
    id: turnId,
    conversation_id: session.id,
    role: "user",
    status: "draft",
    text,
    audio_path: null,
    feedback: null,
    meta: { typed: true, ...(looksEnglish(text) ? { lang: "en" } : {}) },
  }).select("*").single();
  if (error || !data) {
    console.error("typed draft upsert failed", error?.message);
    return { error: json({ error: "could not save" }, { status: 500 }) };
  }
  return { turn: data as TurnRow };
}
