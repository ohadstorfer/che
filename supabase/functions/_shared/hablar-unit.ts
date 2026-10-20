// A unit chat's scene (20260930000002_hablar_unit_chats.sql): the Speaking
// lesson at the end of a unit, where Pancho plays a short scene built on what
// the unit just taught. The scenes aren't authored like the sixteen in
// hablar-content.json: the first learner to open a unit's chat at a level has
// it written from the unit (its can-do title, grammar, words and sentences),
// its opener recorded, and the result kept in unit_scenarios for everyone
// after. It has the shape of a written scenario, so the rest of the chat —
// sessionBlock, hints, feedback — can't tell the difference.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

import { Anthropic, SCENE_MODEL, structured } from "./hablar-claude.ts";
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

- The scene practises the unit's can-do goal itself — its topic and its key words — not an easier topic next to it. When the topic is the learner's own life (family, partner, home, job), the usual way in is Pancho telling a little about his own and asking about theirs ("Mi mujer es de Córdoba. ¿Y vos? ¿Tenés marido o mujer?").
- Pick one concrete situation that fits the unit's can-do goal (ordering at a café, meeting someone at a party, asking for directions…). Pancho plays a person in it (a waiter, a new neighbour, a friend) or himself.
- Everything in Spanish is rioplatense with voseo (vos sos, tenés, querés), never tú or usted, and uses ONLY the grammar the level allows (given in the input) — including the opener. The one exception is the unit's own grammar focus: when the unit teaches a structure above the level (si tuviera…, podrías, estará), the learner's key phrases practise it and the opener may use it.
- Say it the way Buenos Aires does: never "¿qué tal?" (say "¿todo bien?", "¿cómo andás?" or "¿qué onda?"); "a la mañana / a la tarde / a la noche", not "por la…"; "acá / allá", not "aquí / allí"; the simple past ("comí", "¿viste?"), never "he comido". "Che" only opens what someone says, calling them ("Che, ¿querés mate?") — never after a greeting or at the end ("Hola, che." is wrong).
- Pancho doesn't know whether the learner is a man or a woman, and the opener is recorded once for everyone: nothing in the opener or the setting may mark the learner's gender ("¿Estás cansado?", "¿Sos nuevo?", "¿Venís solo?", "te veo preocupada", "bienvenido", "vecina", "de chico" are out — ask "¿Mucho laburo?", "¿Es tu primera vez acá?", "¿Venís con alguien?", "¿Qué te pasa?" instead).
- The scene holds together: the opener makes sense said at the very start, and agrees with the setting about who is where, who did what and who hosts whom.
- The scene can happen anywhere — a café, a party, the building's door — and the learner imagines it; but it is played by voice only, with no picture: only Pancho and the learner talk, and nothing can be seen, shown or pointed at. No third person who is "here" to be asked about ("¿Quién es?", "¿Es tu hermano?"), no photo, no "este/esta" for something in view. A unit about people, things or places has the learner tell Pancho about their own (Pancho asks "¿Tenés hermanos?", "¿Cómo se llama tu perro?"), or has Pancho tell about his.
- Pancho knows nothing about the learner's life: not whether they have a partner, children, brothers or a pet, what they do, or where they're from. The scene never takes an answer for granted: goals ask to say what is true for them ("Decir quién es tu familia", not "Decir: Es mi mujer"), and key phrases offer the choices ("Es mi marido." and "Es mi mujer.") and, where the question allows it, a way to say no ("No tengo.").
- English is plain, in words a B1 learner of English knows: no idioms or slang ("what's up", "grab a coffee", "hang out").
- setting_es / setting_en: one or two short sentences, spoken to the learner ("Estás en un café de Palermo…" / "You're at a café in Palermo…"): where they are and what they want. setting_en says the same as setting_es — nothing more, nothing else.
- role_es / role_en: who Pancho is, as a noun phrase ("el mozo del café" / "the waiter at the café").
- goals: two or three small things the learner should manage (order a coffee, ask the price), short, es and en.
- key_phrases: four to six short phrases the learner can say, built from the unit's words, with English. They are the learner's own lines in this scene (Quiero…, ¿Me das…?), never Pancho's.
- opener: Pancho's first line, one or two short sentences that start the scene; its last words are an easy question the learner can answer with the unit's words. Someone who hears only the opener, cold, knows what is being asked and what they could answer.
- keyterms: up to ten Spanish words or names likely to come up (for the speech recogniser).`;

/** Added for a unit of section 1: the scene of someone in their first days. */
const FIRST_STEPS_SCENE = `FIRST STEPS. This learner is a total beginner in their first days: they know ONLY the words listed under "Every word the learner knows". This changes the rules above:
- Every Spanish word in the opener and the key phrases must be on that list. No other word, no verb form that is not there.
- goals: exactly ONE, the smallest thing the unit lets them do (say hello, order one coffee).
- key_phrases: three or four, of one to four words each — every choice the opener's question can have (both "Es mi marido." and "Es mi mujer.", or "Sí." / "No." when the answer is one of those).
- opener: one sentence of at most six words, then a question they can answer with ONE word or with a key phrase (yes/no, or a choice between two things: "¿Café o mate?"). The question alone is enough: never add "¿Sí o no?" to it.
- setting_es is still one short sentence, as simple as the list allows; setting_en carries the meaning.`;

/**
 * The second pair of eyes on a written scene, before anyone plays it: the
 * problems a learner would hit in the chat, or none.
 */
const SCENE_CHECK_SYSTEM = `You review the scene of a spoken role-play before a learner of Argentine (rioplatense) Spanish plays it with Pancho, a porteño. The learner's first language is English. The scene can be set anywhere (a café, a party, a shop) and the learner imagines it, but it is played by voice only: the learner hears Pancho's opener cold, with no picture, then they talk. Every learner who opens this unit gets this same scene and this same recorded opener.

Play it in your head as a real learner would — a man, then a woman; someone with a partner, then someone single; someone with brothers, then an only child — and list every problem they would hit. Check:
1. The opener makes sense as the very first thing said in a call, on its own: a learner hearing only it knows what is being asked and has an easy answer. "Hola, soy Pancho. ¿Quién es?" fails: nobody else is there.
2. Nothing assumes someone or something can be seen, shown or pointed at, or that a third person is there.
3. Nothing takes the learner's life for granted: gender (cansado/cansada, vecino/vecina, bienvenido), partner, children, family, pets, job, origin. Goals and key phrases fit every learner: they offer the choices and, where it makes sense, a way to say no.
4. Setting, role, opener, goals and key phrases agree with each other, and setting_en says what setting_es says.
5. The Spanish is rioplatense with voseo — no tú, no usted, no vosotros — in Argentine words, as people in Buenos Aires really say it, and uses only the grammar the level allows — except the unit's own grammar focus, which the key phrases should practise even when it is above the level. "Che" only opens what someone says.
6. Key phrases are the learner's own lines, not Pancho's. Goals are things the learner does in the chat.
7. The scene practises the unit's can-do goal and its key words, not an easier topic next to it.
8. The English is right and plain.
9. If the input gives "Every word the learner knows", every Spanish word of the opener and the key phrases is on that list (names aside), and the opener's question is not padded with "¿Sí o no?".

problems: one short sentence per real problem, naming the field and what is wrong, with the fix when it is obvious. Only what a learner would actually hit or be misled by in the chat counts. Not problems: keyterms, the title, a scene set in a place rather than on the phone, wording you would merely prefer, a goal you would phrase differently. An empty list when the scene is fine — most well-written scenes have no problems.`;

const SCENE_CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["problems"],
  properties: { problems: { type: "array", items: { type: "string" } } },
};

/** Rewrites a scene gets after its check, at most. */
const SCENE_REWRITES = 2;

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

export type Written = {
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

const UNIT_WORDS = 40;
/** Section 1 teaches about three hundred forms: all of them fit. */
const FIRST_STEPS_WORDS = 400;

type Form = { form: string; gloss_en: string | null };
const unitForms = (db: SupabaseClient, unitId: string) =>
  db.from("forms").select("form, gloss_en").eq("unit_id", unitId).eq("status", "published").limit(60);
/** The forms a unit taught, as the short list Pancho is asked to stay near (sessionBlock). */
export const unitWords = (forms: Form[] | null | undefined) =>
  [...new Set((forms ?? []).map((f) => f.form.trim()).filter(Boolean))].slice(0, UNIT_WORDS);

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
  if (kept?.scenario) {
    const scene = kept.scenario as Scenario;
    // A scene kept before it carried the unit's words: read them now.
    return scene.words ? scene : { ...scene, words: unitWords((await unitForms(db, unit.id)).data) };
  }
  const written = await writeUnitScene(db, env, unit, level);
  return written && await keepUnitScene(db, env, unit, level, written);
}

type SceneInput = { input: string; firstSteps: boolean; words: string[] };

/** What the scene is written from: the unit, its level and, in section 1, every word she knows. */
export async function unitSceneInput(
  db: SupabaseClient,
  unit: { id: string; title_en: string },
  level: Band,
): Promise<SceneInput> {
  const [{ data: unitRow }, { data: forms }, { data: sentences }] = await Promise.all([
    db.from("units").select("title_en, summary_en, grammar_focus, course_order, sections!inner(ordinal)").eq("id", unit.id).maybeSingle(),
    unitForms(db, unit.id),
    db.from("sentences").select("es, en").eq("unit_id", unit.id).eq("status", "published").limit(12),
  ]);
  // In section 1 she has a few dozen words in all: the scene is written with
  // every one of them in hand, and with nothing else.
  // deno-lint-ignore no-explicit-any
  const firstSteps = (unitRow as any)?.sections?.ordinal === 1;
  let known: string[] = [];
  if (firstSteps) {
    const { data: upTo } = await db
      .from("forms")
      .select("form, units!inner(course_order, status)")
      .eq("status", "published")
      .eq("units.status", "published")
      .lte("units.course_order", unitRow?.course_order ?? 0)
      .limit(FIRST_STEPS_WORDS);
    known = [...new Set((upTo ?? []).map((f) => f.form.trim()).filter(Boolean))];
  }
  const input = [
    firstSteps ? FIRST_STEPS_SCENE : "",
    firstSteps ? `Every word the learner knows: ${known.join(", ")}` : "",
    `Level: ${level}. Grammar allowed: ${LEVEL_GRAMMAR[level]}`,
    `Unit goal (can-do): ${unitRow?.title_en ?? unit.title_en}`,
    unitRow?.summary_en ? `Unit summary: ${unitRow.summary_en}` : "",
    unitRow?.grammar_focus?.length ? `Grammar focus: ${unitRow.grammar_focus.join(", ")}` : "",
    `Words the unit teaches: ${(forms ?? []).map((f) => (f.gloss_en ? `${f.form} (${f.gloss_en})` : f.form)).join(", ")}`,
    `Sentences from the unit:\n${(sentences ?? []).map((s) => `- ${s.es} — ${s.en}`).join("\n")}`,
  ].filter(Boolean).join("\n\n");
  return { input, firstSteps, words: firstSteps ? known : unitWords(forms) };
}

/** The scene as the writer and the checker see it: only what the learner and Pancho get. */
const sceneText = (s: Written) =>
  JSON.stringify({
    title_es: s.title_es,
    setting_es: s.setting_es,
    setting_en: s.setting_en,
    role_es: s.role_es,
    role_en: s.role_en,
    goals: s.goals.map((g) => ({ es: g.es, en: g.en })),
    key_phrases: s.key_phrases.map((p) => ({ es: p.es, en: p.en })),
    opener: { es: s.opener.es, en: s.opener.en },
    keyterms: s.keyterms,
  }, null, 2);

/** The problems a learner would hit in this scene; empty when it is fine, null if the check failed. */
export async function checkUnitScene(
  client: InstanceType<typeof Anthropic>,
  { input }: SceneInput,
  scene: Written,
): Promise<string[] | null> {
  const { value } = await structured<{ problems: string[] }>(client, {
    system: SCENE_CHECK_SYSTEM,
    schema: SCENE_CHECK_SCHEMA,
    input: `What the scene was written from:\n\n${input}\n\nThe scene:\n${sceneText(scene)}`,
    maxTokens: 8000,
    model: SCENE_MODEL,
    effort: "medium",
  });
  return value ? value.problems.filter((p) => p.trim()) : null;
}

/**
 * The unit's scene at a level, written now from the unit and checked: text
 * only, its opener not recorded yet (audio null) and nothing kept. Null if it
 * couldn't be written.
 */
export async function writeUnitScene(
  db: SupabaseClient,
  env: Env,
  unit: { id: string; title_en: string },
  level: Band,
): Promise<Scenario | null> {
  const from = await unitSceneInput(db, unit, level);
  const client = new Anthropic({ apiKey: env.anthropicKey, ...CLAUDE_OPTIONS });

  // Written, checked, and written again with the check's problems in hand —
  // at most SCENE_REWRITES times. A scene still not clean after that is used
  // anyway (better a chat than none) and logged.
  let value: Written | null = null;
  let problems: string[] = [];
  for (let attempt = 0; attempt <= SCENE_REWRITES; attempt++) {
    const redo: string = value && problems.length
      ? `\n\nA reviewer played your last draft and found these problems:\n${problems.map((p) => `- ${p}`).join("\n")}\n\nYour last draft:\n${sceneText(value)}\n\nWrite the scene again, fixing every problem.`
      : "";
    const written: { value: Written | null; usage: unknown; ms: number } = await structured<Written>(client, {
      system: SCENE_SYSTEM,
      schema: SCENE_SCHEMA,
      input: from.input + redo,
      maxTokens: 8000,
      model: SCENE_MODEL,
      // A learner may be waiting on it (hablar-start): the writing is quick,
      // the check takes its time.
      effort: "low",
    });
    const draft = written.value;
    if (!draft?.opener?.es) {
      console.error("unit scene not written", { unit: unit.id, level, attempt, usage: written.usage, ms: written.ms });
      if (value) break;
      return null;
    }
    value = draft;
    const found = await checkUnitScene(client, from, draft);
    if (found === null) break;
    problems = found;
    if (!problems.length) break;
  }
  if (!value) return null;
  if (problems.length) console.error("unit scene kept with problems", { unit: unit.id, level, problems });

  return {
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
    opener: { es: value.opener.es, en: value.opener.en, audio: null },
    keyterms: value.keyterms.slice(0, 10),
    words: from.words,
    ...(from.firstSteps ? { first_steps: true } : {}),
  };
}

/**
 * Records a written scene's opener and keeps the scene for everyone after.
 * Two learners opening the same new scene at once: the first one kept wins —
 * unless `replace`, which puts a rewritten scene in place of the kept one
 * (chats already started keep their own copy).
 */
export async function keepUnitScene(
  db: SupabaseClient,
  env: Env,
  unit: { id: string },
  level: Band,
  written: Scenario,
  replace = false,
): Promise<Scenario> {
  // The opener is recorded once, like the written scenarios' openers, and
  // served from the public audio bucket.
  let audio: string | null = null;
  try {
    const mp3 = await synthesize({
      key: env.elevenKey,
      voiceId: await tomasVoice(db),
      text: written.opener.es,
      speed: TALK_SPEED[level],
    });
    // Named by its words: a rewritten opener gets a new file, never one a
    // cache still holds the old recording under.
    const words = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(written.opener.es));
    const tag = [...new Uint8Array(words)].slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
    const path = `hablar/units/${unit.id}/${level}-opener-${tag}.mp3`;
    const { error } = await db.storage.from("audio").upload(path, new Blob([mp3], { type: "audio/mpeg" }), {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (!error) audio = path;
    else console.error("unit opener upload failed", error.message);
  } catch (err) {
    console.error("unit opener tts failed", err);
  }

  const scenario: Scenario = { ...written, opener: { ...written.opener, audio } };
  if (replace) {
    const { error } = await db.from("unit_scenarios").upsert({ unit_id: unit.id, level, scenario }, { onConflict: "unit_id,level" });
    if (error) throw new Error(`unit scene not replaced: ${error.message}`);
    return scenario;
  }
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
