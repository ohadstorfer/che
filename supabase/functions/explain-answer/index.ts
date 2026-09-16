// Edge function: POST /functions/v1/explain-answer
// "Why?" under a wrong answer (docs/learning-engine-spec.md §6.3).
//
// Body: { sentence_id | form_id, mode, answer }. Everything else — the accepted
// answers, the words she missed, the unit's grammar and tips — is loaded here,
// so the client can't steer the prompt. One explanation per (exercise, answer)
// is cached in `explanations` and shared by every learner who makes the same
// mistake; generating a new one is limited per learner per day.
//
// The Spanish the model quotes is checked against the course's tuteo and
// regional denylists; an explanation that fails falls back to a plain diff.

import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

import { json, preflight } from "../_shared/cors.ts";
import { offendingSpanish } from "../_shared/rioplatense.ts";

// Short, bounded explanations: Sonnet at low effort is plenty.
const MODEL = "claude-sonnet-5";
const DAILY_LIMIT = 30;

const SYSTEM = `You explain one mistake to a learner of Argentine (rioplatense) Spanish whose first language is English.

Rules:
- English, at most 60 words, no greeting, no praise, no lists.
- Explain the one difference that matters between what they wrote and the accepted answer: the grammar point, the word, or the form — using the unit's grammar and tips when they apply.
- Argentine Spanish uses vos: sos, tenés, querés, mirá. Never mention or use tú forms or vosotros.
- Put every Spanish word or phrase you quote in *asterisks*.
- If their answer is actually also correct Spanish for the prompt, say so plainly in one sentence.`;

type Row = Record<string, unknown>;

const answerKey = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

async function sha256(text: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!url || !serviceRole || !anon || !apiKey) return json({ error: "function is not configured" }, { status: 500 });

  // Who is asking: the caller's own token, checked by Supabase.
  const authed = createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: who } = await authed.auth.getUser();
  if (!who?.user) return json({ error: "not authenticated" }, { status: 401 });
  const userId = who.user.id;

  let body: { sentence_id?: string | null; form_id?: string | null; mode?: string; answer?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }
  const answer = String(body.answer ?? "").trim().slice(0, 200);
  const mode = String(body.mode ?? "");
  if (!answer || !mode || (!body.sentence_id && !body.form_id)) {
    return json({ error: "sentence_id or form_id, mode and answer are required" }, { status: 400 });
  }

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const key = await sha256(`${body.sentence_id ?? ""}|${body.form_id ?? ""}|${mode}|${answerKey(answer)}`);

  const { data: cached } = await db.from("explanations").select("body_md, flagged, served").eq("key", key).maybeSingle();
  if (cached && !cached.flagged) {
    await db.from("explanations").update({ served: (cached.served ?? 0) + 1 }).eq("key", key);
    return json({ explanation: cached.body_md, cached: true });
  }

  // The rate limit counts generated explanations only.
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await db.from("explain_usage").select("count").eq("user_id", userId).eq("day", today).maybeSingle();
  if ((usage?.count ?? 0) >= DAILY_LIMIT) return json({ explanation: null, limited: true });

  // What the exercise was.
  let expected: string[] = [];
  let prompt = "";
  let unitId: string | null = null;
  let words: Row[] = [];
  if (body.sentence_id) {
    const { data: s } = await db.from("sentences").select("*").eq("id", body.sentence_id).maybeSingle();
    if (!s || s.status !== "published") return json({ error: "no such sentence" }, { status: 404 });
    expected = mode === "sentence_listen" ? [s.es] : [s.es, ...(s.es_alt ?? [])];
    prompt = mode === "sentence_listen" ? `Audio of: ${s.es}` : `English: ${s.en}`;
    unitId = s.unit_id;
    const ids = [...new Set((s.tokens ?? []).flatMap((t: { form_ids: string[] }) => t.form_ids))];
    const { data: forms } = await db.from("form_entries").select("form, lemma, pos, gloss_en, features").in("id", ids);
    words = forms ?? [];
  } else {
    const { data: f } = await db.from("form_entries").select("*").eq("id", body.form_id).maybeSingle();
    if (!f || f.status !== "published") return json({ error: "no such form" }, { status: 404 });
    expected = [f.form, ...(f.alt ?? [])];
    prompt = `English: ${f.gloss_en}`;
    unitId = f.unit_id;
    words = [{ form: f.form, lemma: f.lemma, pos: f.pos, gloss_en: f.gloss_en, features: f.features }];
  }
  const [{ data: unit }, { data: tips }] = await Promise.all([
    db.from("units").select("title_en, grammar_focus").eq("id", unitId).maybeSingle(),
    db.from("tips").select("title_en, body_md").eq("unit_id", unitId).eq("status", "published"),
  ]);

  const context = [
    `Exercise: ${mode}`,
    prompt,
    `Accepted answers: ${expected.map((e) => `"${e}"`).join(" | ")}`,
    `Learner wrote: "${answer}"`,
    `Words in the exercise: ${words.map((w) => `${w.form} (${w.lemma}, ${w.pos}, "${w.gloss_en}", ${JSON.stringify(w.features)})`).join("; ")}`,
    unit ? `Unit: ${unit.title_en}; grammar: ${(unit.grammar_focus ?? []).join(", ")}` : "",
    (tips ?? []).length ? `Unit tips:\n${(tips ?? []).map((t) => `- ${t.title_en}: ${t.body_md}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const fallback = `The answer is *${expected[0]}*. You wrote *${answer}*.`;
  let text = "";
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      // deno-lint-ignore no-explicit-any
      ...({ output_config: { effort: "low" } } as any),
      system: SYSTEM,
      messages: [{ role: "user", content: context }],
    });
    if (response.stop_reason !== "refusal") {
      text = response.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("")
        .trim();
    }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ explanation: fallback, degraded: "rate_limited" });
    if (err instanceof Anthropic.APIError) {
      console.error("anthropic error", err.status, err.message);
      return json({ explanation: fallback, degraded: "api_error" });
    }
    throw err;
  }

  const bad = offendingSpanish(text);
  if (!text || bad.length || text.split(/\s+/).length > 90) {
    if (bad.length) console.warn("explanation rejected by the rioplatense check", bad);
    return json({ explanation: fallback, degraded: "checked" });
  }

  await Promise.all([
    db.from("explanations").upsert({ key, body_md: text, model: MODEL, served: 1, flagged: false }),
    db.from("explain_usage").upsert({ user_id: userId, day: today, count: (usage?.count ?? 0) + 1 }),
  ]);
  return json({ explanation: text });
});
