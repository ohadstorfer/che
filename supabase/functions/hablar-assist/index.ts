// Edge function: POST /functions/v1/hablar-assist
// The 💡 hint and the 🔤 translation in the Hablar chat (docs/hablar-hld.md §4.7).
//
// Body: { session_id, kind: 'hint'|'translate', turn_id?, paused_seconds? }.
// hint → { starter, full, full_en, hints_left }: one structured call; the
// client reveals the three parts in levels. At most 3 per chat, counted on the
// session, and the turn it was asked for is noted so two in a row make Pancho
// simplify.
// translate → { en, cached }: the English of one of Pancho's lines, kept on the
// turn row so a second tap is free. Openers already carry theirs.

import { json, preflight } from "../_shared/cors.ts";
import {
  CLAUDE_OPTIONS,
  background,
  caller,
  claudeUsage,
  hablarEnv,
  isUuid,
  loadSession,
  logUsage,
  MAX_HINTS,
  nextUserIdx,
  recordPause,
  serviceClient,
  topicOf,
} from "../_shared/hablar.ts";
import { HINT_SCHEMA, HINT_SYSTEM, TRANSLATE_SCHEMA, TRANSLATE_SYSTEM } from "../_shared/hablar-prompt.ts";
import { Anthropic, MODEL, structured } from "../_shared/hablar-claude.ts";
import { offendingWords } from "../_shared/rioplatense.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const env = hablarEnv();
  if (!env) return json({ error: "function is not configured" }, { status: 500 });
  const who = await caller(req, env);
  if (!who) return json({ error: "not authenticated" }, { status: 401 });

  let body: { session_id?: string; kind?: string; turn_id?: string; paused_seconds?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }
  const db = serviceClient(env);
  const session = await loadSession(db, body.session_id, who.userId);
  if (!session) return json({ error: "no such session" }, { status: 404 });
  await recordPause(db, session, body.paused_seconds);
  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });

  // ----- translate -----
  if (body.kind === "translate") {
    if (!isUuid(body.turn_id)) return json({ error: "turn_id must be a uuid" }, { status: 400 });
    const { data: turn } = await db
      .from("conversation_turns")
      .select("id, conversation_id, role, text, text_en")
      .eq("id", body.turn_id)
      .maybeSingle();
    if (!turn || turn.conversation_id !== session.id || turn.role !== "tomas") {
      return json({ error: "no such turn" }, { status: 404 });
    }
    if (turn.text_en) return json({ en: turn.text_en, cached: true });
    try {
      const { value, usage, ms } = await structured<{ en: string }>(client, {
        system: TRANSLATE_SYSTEM,
        schema: TRANSLATE_SCHEMA as unknown as Record<string, unknown>,
        input: turn.text,
        maxTokens: 1000,
      });
      background(logUsage(db, [claudeUsage({ conversation_id: session.id, turn_id: turn.id, model: MODEL, stage: "translate", ms }, usage)]));
      const en = value?.en?.trim();
      if (!en) return json({ error: "no translation", retry: true }, { status: 502 });
      await db.from("conversation_turns").update({ text_en: en }).eq("id", turn.id);
      return json({ en, cached: false });
    } catch (err) {
      console.error("translate failed", err);
      return json({ error: "no translation", retry: true }, { status: 502 });
    }
  }

  if (body.kind !== "hint") return json({ error: "kind must be hint or translate" }, { status: 400 });

  // ----- hint -----
  if (session.ended_at) return json({ error: "ended" }, { status: 409 });
  if (session.hints_used >= MAX_HINTS) return json({ error: "hint_limit", hints_left: 0 }, { status: 429 });

  const { data: rows } = await db
    .from("conversation_turns")
    .select("idx, role, status, text")
    .eq("conversation_id", session.id)
    .not("idx", "is", null)
    .order("idx", { ascending: false })
    .limit(6);
  const recent = (rows ?? []).filter((t) => t.role === "tomas" || t.status === "final").reverse();
  const forIdx = nextUserIdx(rows?.[0]?.idx ?? 0);

  // Count it first, conditionally, so two taps can't both get the third hint.
  const { data: counted } = await db
    .from("conversations")
    .update({
      hints_used: session.hints_used + 1,
      hint_turns: [...new Set([...session.hint_turns, forIdx])],
    })
    .eq("id", session.id)
    .eq("hints_used", session.hints_used)
    .select("hints_used")
    .maybeSingle();
  if (!counted) return json({ error: "hint_limit", hints_left: 0 }, { status: 429 });

  const topic = topicOf(session.kind, session.topic_id, session.level);
  const open = (topic?.goals ?? []).filter((g) => !session.goals_done.includes(g.id));
  const input = [
    `Level: ${session.level}`,
    topic?.scenario ? `Scene: ${topic.scenario.setting_es} Pancho is ${topic.scenario.role_es}.` : "",
    topic?.culture ? `Topic: ${topic.culture.id}` : "",
    open.length ? `Open goals: ${open.map((g) => g.es).join("; ")}` : "",
    "Conversation so far:",
    ...recent.map((t) => `${t.role === "tomas" ? "Pancho" : "Learner"}: ${t.text}`),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { value, usage, ms } = await structured<{ starter: string; full: string; full_en: string }>(client, {
      system: HINT_SYSTEM,
      schema: HINT_SCHEMA as unknown as Record<string, unknown>,
      input,
      maxTokens: 1000,
    });
    background(logUsage(db, [claudeUsage({ conversation_id: session.id, model: MODEL, stage: "hint", ms }, usage)]));
    if (!value?.full) throw new Error("empty hint");
    if (offendingWords(value.full).length) console.warn("hint not rioplatense", offendingWords(value.full));
    return json({ starter: value.starter, full: value.full, full_en: value.full_en, hints_left: MAX_HINTS - counted.hints_used });
  } catch (err) {
    console.error("hint failed", err);
    // Not her fault: give the hint back.
    await db.from("conversations").update({ hints_used: session.hints_used }).eq("id", session.id);
    return json({ error: "no hint", retry: true }, { status: 502 });
  }
});
