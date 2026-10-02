// Edge function: POST /functions/v1/hablar-transcribe
// Speech to text for the Hablar chat (docs/hablar-hld.md §4.4).
//
// Multipart: audio (the recorded blob, sent as-is — mp4/AAC from Safari,
// webm/Opus from Chrome), session_id, turn_id, purpose ('turn' | 'dilo'),
// target (dilo only), paused_seconds (optional, the client's pause total).
//
// purpose=turn stores the line as a draft user turn, which is what the client
// shows in the confirm bubble and what hablar-reply later answers — the server
// keeps the transcript, and hablar-reply only ever answers what is stored here.
// The same turn_id sent again replaces the draft (a re-record) or, for the same
// bytes or a turn already sent, returns what is stored (_shared/hablar-draft.ts).
// Current builds send a turn straight to hablar-reply, which stores it the same
// way and answers it in the same request; this path stays for older builds.
//
// A typed turn sends `text` instead of `audio` (purpose=turn only): the keyboard
// for a denied mic, a noisy room, or a line the mic keeps mishearing. It is
// stored the same way, marked typed, with no clip and no speech-to-text call.
// purpose=dilo compares what she said with the fixed line; no model call.

import { json, preflight } from "../_shared/cors.ts";
import {
  type DraftOutcome,
  MAX_AUDIO_BYTES as MAX_BYTES,
  MAX_STT_PER_CHAT,
  spokenDraft,
  type TurnRow,
  typedDraft,
} from "../_shared/hablar-draft.ts";
import {
  audioExt,
  background,
  caller,
  type Env,
  diloCompare,
  hablarEnv,
  isSilenceHallucination,
  isUuid,
  loadSession,
  logUsage,
  recordPause,
  serviceClient,
  transcribe,
} from "../_shared/hablar.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 64 * 1024) {
    return json({ error: "audio too long" }, { status: 413 });
  }
  // The auth check runs while the upload is read, not before it.
  const [who, form] = await Promise.all([caller(req, env), req.formData().catch(() => null)]);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });
  if (!form) return json({ error: "expected multipart/form-data" }, { status: 400 });
  const typed = form.get("text");
  if (typeof typed === "string") return typedTurn(env, who.userId, form, typed);

  // Not `instanceof File`: the edge runtime can hand an upload back as a plain Blob.
  const audio = form.get("audio");
  if (!audio || typeof audio === "string" || audio.size === 0) {
    return json({
      error: "audio is required",
      got: {
        content_type: req.headers.get("content-type"),
        content_length: req.headers.get("content-length"),
        fields: [...form.keys()],
        audio: audio == null ? null : typeof audio === "string" ? `string(${audio.length})` : `blob(${audio.size}, ${audio.type})`,
      },
    }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) return json({ error: "audio too long" }, { status: 413 });

  const purpose = String(form.get("purpose") ?? "turn");
  if (purpose !== "turn" && purpose !== "dilo") return json({ error: "purpose must be turn or dilo" }, { status: 400 });
  const turnId = form.get("turn_id");
  if (purpose === "turn" && !isUuid(turnId)) return json({ error: "turn_id must be a uuid" }, { status: 400 });

  const db = serviceClient(env);
  const sessionId = form.get("session_id");
  // Read together: each is a round trip before speech-to-text can start.
  // Nothing is used until the session is known to be the caller's.
  const [session, { count }, { data: existing }] = await Promise.all([
    loadSession(db, sessionId, who.userId),
    isUuid(sessionId)
      ? db.from("hablar_usage").select("id", { count: "exact", head: true }).eq("conversation_id", sessionId).eq("stage", "stt")
      : Promise.resolve({ count: 0 }),
    purpose === "turn" && isUuid(turnId)
      ? db.from("conversation_turns").select("*").eq("id", turnId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!session) return json({ error: "no such session" }, { status: 404 });
  // Not waited on: nothing below needs the write, only the value on `session`.
  background(recordPause(db, session, form.get("paused_seconds")));
  if ((count ?? 0) >= MAX_STT_PER_CHAT) return json({ error: "too many recordings" }, { status: 429 });

  // ----- dilo: say the fixed line again -----
  if (purpose === "dilo") {
    const bytes = await audio.arrayBuffer();
    const mime = audio.type || "application/octet-stream";
    const ext = audioExt(mime);
    const target = String(form.get("target") ?? "").trim().slice(0, 300);
    if (!target) return json({ error: "target is required for dilo" }, { status: 400 });
    const t0 = Date.now();
    let text = "";
    let audioSeconds: number | null = null;
    try {
      ({ text, audioSeconds } = await transcribe({
        key: env.elevenKey,
        audio: new Blob([bytes], { type: mime }),
        filename: `dilo.${ext}`,
        keyterms: [target.split(/\s+/).slice(0, 5).join(" ")],
      }));
    } catch (err) {
      console.error(err);
      return json({ error: "stt_failed", retry: true, detail: String(err).slice(0, 300) }, { status: 502 });
    }
    background(logUsage(db, [{
      conversation_id: session.id,
      turn_id: isUuid(turnId) ? turnId : null,
      provider: "elevenlabs",
      model: "scribe_v2",
      stage: "stt",
      audio_seconds: audioSeconds,
      ms: Date.now() - t0,
    }]));
    if (isSilenceHallucination(text)) return json({ status: "again", text: "" });
    return json({ status: diloCompare(text, target), text });
  }

  // ----- turn: a line for Pancho -----
  const out = await spokenDraft({
    env,
    db,
    userId: who.userId,
    session,
    turnId: turnId as string,
    audio,
    existing: existing as TurnRow | null,
    sttCount: count ?? 0,
  });
  return draftJson(out, turnId as string);
});

/** A line she typed instead of saying: stored as a draft turn like a transcript. */
async function typedTurn(env: Env, userId: string, form: FormData, raw: string) {
  if (String(form.get("purpose") ?? "turn") !== "turn") return json({ error: "typed text is for turns only" }, { status: 400 });
  const turnId = form.get("turn_id");
  if (!isUuid(turnId)) return json({ error: "turn_id must be a uuid" }, { status: 400 });

  const db = serviceClient(env);
  const [session, { data: existing }] = await Promise.all([
    loadSession(db, form.get("session_id"), userId),
    db.from("conversation_turns").select("*").eq("id", turnId).maybeSingle(),
  ]);
  if (!session) return json({ error: "no such session" }, { status: 404 });
  background(recordPause(db, session, form.get("paused_seconds")));
  return draftJson(await typedDraft({ db, session, turnId, raw, existing: existing as TurnRow | null }), turnId);
}

function draftJson(out: DraftOutcome, turnId: string): Response {
  if ("error" in out) return out.error;
  if ("empty" in out) return json({ text: "", turn_id: turnId, status: "empty" });
  return json({ text: out.turn.text, turn_id: out.turn.id, status: out.turn.status });
}
