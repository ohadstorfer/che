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
  clockOf,
  GRACE_SECONDS,
  isSilenceHallucination,
  logUsage,
  looksEnglish,
  sessionElapsed,
  sttKeyterms,
  topicOf,
  transcribe,
  type Env,
  type Session,
} from "./hablar.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const MAX_AUDIO_BYTES = 1.5 * 1024 * 1024; // ≈ 45 s of audio
export const MAX_STT_PER_CHAT = 80;
const MAX_TYPED_CHARS = 300;
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
  /** Refused; send this as-is. */
  | { error: Response };

async function sha256(bytes: ArrayBuffer) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function closed(session: Session): Response | null {
  if (session.ended_at) return json({ error: "ended" }, { status: 409 });
  if (sessionElapsed(session) >= clockOf(session.level).stop + GRACE_SECONDS) return json({ error: "time_up" }, { status: 409 });
  return null;
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
}): Promise<DraftOutcome> {
  const { env, db, session, turnId, audio, existing } = opts;
  if (opts.sttCount >= MAX_STT_PER_CHAT) return { error: json({ error: "too many recordings" }, { status: 429 }) };
  const shut = closed(session) ?? foreign(existing, session);
  if (shut) return { error: shut };

  const bytes = await audio.arrayBuffer();
  const mime = audio.type || "application/octet-stream";
  const ext = audioExt(mime);
  const hash = await sha256(bytes);
  if (existing && (existing.status === "final" || existing.meta?.audio_sha === hash)) return { turn: existing };

  const t0 = Date.now();
  let text = "";
  let audioSeconds: number | null = null;
  let language: "es" | "en" = "es";
  let calls = 1;
  try {
    ({ text, audioSeconds, language, calls } = await transcribe({
      key: env.elevenKey,
      audio: new Blob([bytes], { type: mime }),
      filename: `turn.${ext}`,
      keyterms: sttKeyterms(topicOf(session.kind, session.topic_id, session.level, session.scenario), session.level),
      english: true,
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

  const audioPath = `${opts.userId}/${session.id}/${turnId}.${ext}`;
  const { data, error } = await db.from("conversation_turns").upsert({
    id: turnId,
    conversation_id: session.id,
    role: "user",
    status: "draft",
    text,
    audio_path: audioPath,
    // `lang: "en"`: she said it in English; hablar-reply tells Pancho and the feedback.
    meta: { audio_sha: hash, audio_seconds: audioSeconds, ...(language === "en" ? { lang: "en" } : {}) },
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
  const shut = closed(session) ?? foreign(existing, session);
  if (shut) return { error: shut };

  if (existing) {
    if (existing.status === "final") return { turn: existing };
  } else {
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
    meta: { typed: true, ...(looksEnglish(text) ? { lang: "en" } : {}) },
  }).select("*").single();
  if (error || !data) {
    console.error("typed draft upsert failed", error?.message);
    return { error: json({ error: "could not save" }, { status: 500 }) };
  }
  return { turn: data as TurnRow };
}
