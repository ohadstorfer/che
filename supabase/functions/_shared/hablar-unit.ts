// A unit chat's scene (20260930000002_hablar_unit_chats.sql): the Speaking
// lesson at the end of a unit, where Pancho plays a short scene built on what
// the unit just taught. The scenes aren't authored like the sixteen in
// hablar-content.json: the first learner to open a unit's chat at a level has
// it written from the unit (its can-do title, grammar, words and sentences),
// its opener recorded, and the result kept in unit_scenarios for everyone
// after. It has the shape of a written scenario, so the rest of the chat —
// sessionBlock, hints, feedback — can't tell the difference.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

import { Anthropic, structured } from "./hablar-claude.ts";
import { LEVEL_GRAMMAR } from "./hablar-prompt.ts";
import { type Band, CLAUDE_OPTIONS, type Env, type Scenario, synthesize, TALK_SPEED, tomasVoice } from "./hablar.ts";

/** A Speaking lesson's unit, if the lesson is one. */
export async function speakingUnit(
  db: SupabaseClient,
  lessonId: string,
): Promise<{ id: string; title_en: string; cefr: string } | null> {
  const { data } = await db
    .from("lessons")
    .select("kind, status, units!inner(id, title_en, status, sections!inner(cefr))")
    .eq("id", lessonId)
    .maybeSingle();
  // deno-lint-ignore no-explicit-any
  const row = data as any;
  if (!row || row.kind !== "speak" || row.status !== "published" || row.units?.status !== "published") return null;
  return { id: row.units.id, title_en: row.units.title_en, cefr: row.units.sections?.cefr ?? "A1" };
}

const SCENE_SYSTEM = `You write the scene for a two-minute spoken role-play between a learner of Argentine (rioplatense) Spanish and Pancho, a relaxed porteño in his thirties. The role-play closes a unit of a course: it must let the learner use what that unit just taught — its words, its sentences, its grammar — in an everyday situation in Buenos Aires where people would really say them.

- Pick one concrete situation that fits the unit's can-do goal (ordering at a café, meeting someone at a party, asking for directions…). Pancho plays a person in it (a waiter, a new neighbour, a friend) or himself.
- Everything in Spanish is rioplatense with voseo (vos sos, tenés, querés), never tú or usted, and uses ONLY the grammar the level allows (given in the input) — including the opener.
- setting_es / setting_en: one or two short sentences, spoken to the learner ("Estás en un café de Palermo…" / "You're at a café in Palermo…"): where they are and what they want.
- role_es / role_en: who Pancho is, as a noun phrase ("el mozo del café" / "the waiter at the café").
- goals: two or three small things the learner should manage (order a coffee, ask the price), short, es and en.
- key_phrases: four to six short phrases the learner can say, built from the unit's words, with English.
- opener: Pancho's first line, one or two short sentences that start the scene and end with an easy question the learner can answer with the unit's words.
- keyterms: up to ten Spanish words or names likely to come up (for the speech recogniser).`;

const SCENE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title_es", "setting_es", "setting_en", "role_es", "role_en", "goals", "key_phrases", "opener", "keyterms"],
  properties: {
    title_es: { type: "string" },
    setting_es: { type: "string" },
    setting_en: { type: "string" },
    role_es: { type: "string" },
    role_en: { type: "string" },
    goals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["es", "en"],
        properties: { es: { type: "string" }, en: { type: "string" } },
      },
    },
    key_phrases: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["es", "en"],
        properties: { es: { type: "string" }, en: { type: "string" } },
      },
    },
    opener: {
      type: "object",
      additionalProperties: false,
      required: ["es", "en"],
      properties: { es: { type: "string" }, en: { type: "string" } },
    },
    keyterms: { type: "array", items: { type: "string" } },
  },
};

type Written = {
  title_es: string;
  setting_es: string;
  setting_en: string;
  role_es: string;
  role_en: string;
  goals: { es: string; en: string }[];
  key_phrases: { es: string; en: string }[];
  opener: { es: string; en: string };
  keyterms: string[];
};

/** The unit's scene at a level: kept, or written now (and kept). Null if it couldn't be written. */
export async function unitScenario(
  db: SupabaseClient,
  env: Env,
  unit: { id: string; title_en: string },
  level: Band,
): Promise<Scenario | null> {
  const { data: kept } = await db
    .from("unit_scenarios")
    .select("scenario")
    .eq("unit_id", unit.id)
    .eq("level", level)
    .maybeSingle();
  if (kept?.scenario) return kept.scenario as Scenario;

  const [{ data: unitRow }, { data: forms }, { data: sentences }] = await Promise.all([
    db.from("units").select("title_en, summary_en, grammar_focus").eq("id", unit.id).maybeSingle(),
    db.from("forms").select("form, gloss_en").eq("unit_id", unit.id).eq("status", "published").limit(60),
    db.from("sentences").select("es, en").eq("unit_id", unit.id).eq("status", "published").limit(12),
  ]);
  const input = [
    `Level: ${level}. Grammar allowed: ${LEVEL_GRAMMAR[level]}`,
    `Unit goal (can-do): ${unitRow?.title_en ?? unit.title_en}`,
    unitRow?.summary_en ? `Unit summary: ${unitRow.summary_en}` : "",
    unitRow?.grammar_focus?.length ? `Grammar focus: ${unitRow.grammar_focus.join(", ")}` : "",
    `Words the unit teaches: ${(forms ?? []).map((f) => (f.gloss_en ? `${f.form} (${f.gloss_en})` : f.form)).join(", ")}`,
    `Sentences from the unit:\n${(sentences ?? []).map((s) => `- ${s.es} — ${s.en}`).join("\n")}`,
  ].filter(Boolean).join("\n\n");

  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });
  const { value } = await structured<Written>(client, { system: SCENE_SYSTEM, schema: SCENE_SCHEMA, input, maxTokens: 1500 });
  if (!value?.opener?.es) return null;

  // The opener is recorded once, like the written scenarios' openers, and
  // served from the public audio bucket.
  let audio: string | null = null;
  try {
    const mp3 = await synthesize({
      key: env.elevenKey,
      voiceId: await tomasVoice(db),
      text: value.opener.es,
      speed: TALK_SPEED[level],
    });
    const path = `hablar/units/${unit.id}/${level}-opener.mp3`;
    const { error } = await db.storage.from("audio").upload(path, new Blob([mp3], { type: "audio/mpeg" }), {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (!error) audio = path;
    else console.error("unit opener upload failed", error.message);
  } catch (err) {
    console.error("unit opener tts failed", err);
  }

  const scenario: Scenario = {
    id: unit.id,
    title_es: value.title_es,
    title_en: unit.title_en,
    band: level,
    setting_es: value.setting_es,
    setting_en: value.setting_en,
    role_es: value.role_es,
    role_en: value.role_en,
    goals: value.goals.slice(0, 3).map((g, i) => ({ id: `g${i + 1}`, es: g.es, en: g.en })),
    key_phrases: value.key_phrases.slice(0, 6).map((p) => ({ es: p.es, en: p.en, audio: null })),
    opener: { es: value.opener.es, en: value.opener.en, audio },
    keyterms: value.keyterms.slice(0, 10),
  };
  // Two learners opening the same new scene at once: the first one kept wins.
  const { error } = await db.from("unit_scenarios").insert({ unit_id: unit.id, level, scenario });
  if (error) {
    const { data: first } = await db
      .from("unit_scenarios")
      .select("scenario")
      .eq("unit_id", unit.id)
      .eq("level", level)
      .maybeSingle();
    if (first?.scenario) return first.scenario as Scenario;
  }
  return scenario;
}
