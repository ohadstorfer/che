import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { topicOf } from "./hablar.ts";
import { cleanFeedback, ENGLISH_NOTE, type Feedback, feedbackInput, heardHolds, PERSONA, quotesHold, sessionBlock, turnText, WRAP_UP_NOTE } from "./hablar-prompt.ts";
import { unitWords } from "./hablar-unit.ts";

const cafe = topicOf("scenario", "cafe", "A1")!.scenario!;

Deno.test("a Speaking-tab scenario gives the scene and its phrases as ideas, never its goals", () => {
  const block = sessionBlock({ level: "A1", scenario: cafe, opener: cafe.opener.es });
  assertEquals(cafe.goals.length >= 2, true);
  assertStringIncludes(block, cafe.setting_es);
  assertStringIncludes(block, cafe.role_es);
  assertStringIncludes(block, cafe.key_phrases[0].es);
  assertStringIncludes(block, "not a script");
  for (const g of cafe.goals) assertEquals(block.includes(g.es), false);
  // Per-chat data stays out of the block every chat shares.
  assertEquals(PERSONA.includes(cafe.setting_es), false);
  // A written scenario has no unit words.
  assertEquals(block.includes("Words the learner knows"), false);
});

Deno.test("a scene without goals says nothing about them", () => {
  const block = sessionBlock({ level: "A1", scenario: { ...cafe, goals: [] }, opener: "Hola" });
  assertEquals(block.includes("chance for the learner to practise"), false);
  const unitBlock = sessionBlock({ level: "A1", unit: true, scenario: { ...cafe, goals: [] }, opener: "Hola" });
  assertEquals(unitBlock.includes("chance for the learner to practise"), false);
  assertEquals(sessionBlock({ level: "A1", opener: "Hola" }).includes("chance for the learner to practise"), false);
});

Deno.test("a unit chat adds the unit's words; beginners are kept close to them", () => {
  const unit = { ...cafe, words: ["café", "medialuna", "quiero"] };
  const a1 = sessionBlock({ level: "A1", unit: true, scenario: unit, opener: "Hola" });
  assertStringIncludes(a1, "Words the learner knows from this unit: café, medialuna, quiero.");
  assertStringIncludes(a1, "stay close to them");
  // A unit's goals stay, as ideas.
  for (const g of unit.goals) assertStringIncludes(a1, g.es);
  assertStringIncludes(a1, "not a checklist");
  const b1 = sessionBlock({ level: "B1", unit: true, scenario: { ...unit, band: "B1" }, opener: "Hola" });
  assertStringIncludes(b1, "Prefer these words.");
  assertEquals(b1.includes("stay close to them"), false);
});

Deno.test("the unit's words: its forms, once each, bounded", () => {
  assertEquals(unitWords([{ form: "café", gloss_en: "coffee" }, { form: " café ", gloss_en: null }, { form: "", gloss_en: null }]), ["café"]);
  assertEquals(unitWords(null), []);
  assertEquals(unitWords(Array.from({ length: 60 }, (_, i) => ({ form: `w${i}`, gloss_en: null }))).length, 40);
});

Deno.test("the turn: her line, then only the notes that apply", () => {
  assertEquals(turnText("Hola", ["", ""]), "Hola");
  assertEquals(turnText("I want a coffee", [ENGLISH_NOTE, "", WRAP_UP_NOTE]), `I want a coffee\n\n${ENGLISH_NOTE}\n\n${WRAP_UP_NOTE}`);
});

Deno.test("the feedback is told when the line was English", () => {
  const base = { level: "A1" as const, tomasBefore: null, line: "I want a coffee" };
  assertStringIncludes(feedbackInput({ ...base, english: true }), "The learner said this line in English.");
  assertEquals(feedbackInput(base).includes("in English"), false);
});

Deno.test("the grading gets the hearing without hints only when there is one", () => {
  const base = { level: "A1" as const, tomasBefore: "¿Tenés hermanos?", line: "Sí, tengo dos hermanos" };
  assertStringIncludes(feedbackInput({ ...base, plain: "Sí, tiene dos hermanos" }), 'Heard without hints: "Sí, tiene dos hermanos"');
  assertEquals(feedbackInput(base).includes("without hints"), false);
});

Deno.test("heard: her line, with words only from the hearing without hints", () => {
  const line = "Sí, tengo dos hermanos";
  const plain = "Sí, tiene dos hermanos";
  assertEquals(heardHolds(line, line), true);
  assertEquals(heardHolds("si tengo dos hermanos", line), true); // capitals and marks don't count
  assertEquals(heardHolds("Sí, tiene dos hermanos", line, plain), true);
  // A word neither hearing had, a dropped word, or no second hearing at all: not what was heard.
  assertEquals(heardHolds("Sí, tenemos dos hermanos", line, plain), false);
  assertEquals(heardHolds("Sí, tiene hermanos", line, plain), false);
  assertEquals(heardHolds("Sí, tiene dos hermanos", line), false);
});

const graded = (over: Partial<Feedback>): Feedback => ({
  heard: "Sí, tiene dos hermanos",
  has_error: true,
  verdict: "error",
  severity: "target",
  corrected: "Sí, tengo dos hermanos",
  spans: [{ from: "tiene", to: "tengo" }],
  why_en: "Talking about yourself, *tener* is *tengo*.",
  unnatural: false,
  better: "",
  better_en: "",
  ...over,
});

Deno.test("a form the hints had smoothed is corrected as hers", () => {
  const f = cleanFeedback(graded({}), "Sí, tengo dos hermanos", false, "Sí, tiene dos hermanos");
  assertEquals(f.heard, "Sí, tiene dos hermanos");
  assertEquals(f.verdict, "error");
  assertEquals(f.corrected, "Sí, tengo dos hermanos");
});

Deno.test("a heard line the grader made up shows nothing", () => {
  const f = cleanFeedback(graded({ heard: "Sí, tenemos dos hermanos" }), "Sí, tengo dos hermanos", false, "Sí, tiene dos hermanos");
  assertEquals(f.verdict, "unclear");
  assertEquals(f.has_error, false);
  assertEquals(f.heard, "Sí, tengo dos hermanos");
});

Deno.test("no heard (an older grading), or an English line: the line itself", () => {
  const line = "Yo quiero dos medialuna";
  const old = cleanFeedback(graded({ heard: undefined, corrected: "Yo quiero dos medialunas", spans: [{ from: "medialuna", to: "medialunas" }] }), line);
  assertEquals(old.heard, line);
  assertEquals(old.verdict, "error");
  const en = cleanFeedback(graded({ heard: "Can I pay", has_error: false, verdict: "note", better: "¿Puedo pagar?" }), "Can I pay by card?", true);
  assertEquals(en.heard, "Can I pay by card?");
  assertEquals(en.verdict, "note");
});

const err = (o: Partial<Feedback>): Feedback => graded({ has_error: true, verdict: "error", severity: "target", why_en: "x", ...o });

Deno.test("a fix of a word the recogniser doubted is dropped, and the line is not an error", () => {
  const line = "Sí, tenga hambre";
  const f = cleanFeedback(err({ heard: line, corrected: "Sí, tengo hambre", spans: [{ from: "tenga", to: "tengo" }] }), line, false, undefined, ["tenga"]);
  assertEquals(f.has_error, false);
  assertEquals(f.verdict, "unclear");
  assertEquals(f.corrected, line);
});

Deno.test("an accent-only fix is not an error; a real fix beside it stays", () => {
  const accent = cleanFeedback(err({ heard: "Mira, es lindo", corrected: "Mirá, es lindo", spans: [{ from: "Mira", to: "Mirá" }] }), "Mira, es lindo");
  assertEquals(accent.has_error, false);
  const both = cleanFeedback(
    err({ heard: "Mira, yo tiene dos", corrected: "Mirá, yo tengo dos", spans: [{ from: "Mira", to: "Mirá" }, { from: "tiene", to: "tengo" }] }),
    "Mira, yo tiene dos",
  );
  // Beside a real fix, the accent is part of the correction ("vos te llevás", not "vos te llevas").
  assertEquals(both.has_error, true);
  assertEquals(both.corrected, "Mirá, yo tengo dos");
  const vos = cleanFeedback(
    err({ heard: "¿Tú te llevas bien?", corrected: "¿Vos te llevás bien?", spans: [{ from: "Tú", to: "Vos" }, { from: "llevas", to: "llevás" }] }),
    "¿Tú te llevas bien?",
  );
  assertEquals(vos.corrected, "¿Vos te llevás bien?");
});

Deno.test("an error whose corrected line is her line again is not shown", () => {
  const f = cleanFeedback(err({ heard: "Tengo dos hijo", corrected: "Tengo dos hijo", spans: [] }), "Tengo dos hijo");
  assertEquals(f.has_error, false);
});

Deno.test("went-well quotes must be her words, outside what a correction fixed", () => {
  const lines = [{ heard: "Soy de Canadá", fixed: [] }, { heard: "Quiero dos medialuna", fixed: ["medialuna"] }];
  assertEquals(quotesHold("You said *Soy de Canadá* clearly.", lines), true);
  assertEquals(quotesHold("You ordered *dos medialuna*.", lines), false);
  assertEquals(quotesHold("You said *Soy de Ohio*.", lines), false);
  assertEquals(quotesHold("You kept going without quoting.", lines), true);
  // Part of a corrected stretch is still the mistake.
  assertEquals(quotesHold("You said *El sábado fui*.", [{ heard: "El sábado fui al cine", fixed: ["fui al cine"] }]), false);
});

Deno.test("a heard line without her false starts and fillers still holds", () => {
  assertEquals(heardHolds("Dos café, por favor.", "Dos caf- café, por favor."), true);
  assertEquals(heardHolds("Sí, me gusta mucho.", "Sí, me gus- gusta, eh, mucho."), true);
  // A cut that isn't the start of the next word is a word of hers.
  assertEquals(heardHolds("Quiero café.", "Quiero mate- café."), false);
});

Deno.test("a dropped fix goes back as a whole word, never inside another one", () => {
  const heard = "Hola, quiero el cuenta y un café grandes";
  const f = cleanFeedback(
    err({ heard, corrected: "Hola, quiero la cuenta y un café grande", spans: [{ from: "el", to: "la" }, { from: "grandes", to: "grande" }] }),
    heard, false, undefined, ["el"],
  );
  assertEquals(f.has_error, true);
  assertEquals(f.corrected, "Hola, quiero el cuenta y un café grande");
});

Deno.test("a doubted word the fix keeps doesn't drop the fix", () => {
  const heard = "Yo quiero a ordenar";
  const f = cleanFeedback(err({ heard, corrected: "Yo quiero ordenar", spans: [{ from: "quiero a ordenar", to: "quiero ordenar" }] }), heard, false, undefined, ["quiero"]);
  assertEquals(f.has_error, true);
});

Deno.test("a why written for a dropped fix is not shown with the one left", () => {
  const heard = "Sí, tenga hambre y quiero dos medialuna";
  const f = cleanFeedback(
    err({ heard, corrected: "Sí, tengo hambre y quiero dos medialunas", severity: "meaning", why_en: "With *yo*, *tener* is *tengo*.", spans: [{ from: "tenga", to: "tengo" }, { from: "medialuna", to: "medialunas" }] }),
    heard, false, undefined, ["tenga"],
  );
  assertEquals(f.has_error, true);
  assertEquals(f.why_en, "");
  assertEquals(f.severity, "minor");
  assertEquals(f.corrected, "Sí, tenga hambre y quiero dos medialunas");
});

Deno.test("a clean quote of a line with a false start or a filler holds", () => {
  assertEquals(quotesHold("*Dos café, por favor*", [{ heard: "Dos caf- café, por favor.", fixed: [] }]), true);
  assertEquals(quotesHold("*Sí, me gusta*", [{ heard: "Sí, eh, me gusta", fixed: [] }]), true);
  assertEquals(heardHolds("Café, por favor.", "Café- café, por favor."), true);
});

Deno.test("a first-steps scene with beats gives Pancho the plan; one without says nothing about it", () => {
  const scene = { ...cafe, first_steps: true, words: ["café", "mate"], beats: [{ es: "¿Agua o jugo?", en: "Water or juice?" }, { es: "¿Una medialuna?", en: "A croissant?" }] };
  const block = sessionBlock({ level: "A1", unit: true, scenario: scene, opener: "¿Café o mate?" });
  assertStringIncludes(block, 'A plan for the chat after your opener, one step per exchange: 1. "¿Agua o jugo?" 2. "¿Una medialuna?"');
  const plainBlock = sessionBlock({ level: "A1", unit: true, scenario: { ...scene, beats: undefined }, opener: "¿Café o mate?" });
  assertEquals(plainBlock.includes("A plan for the chat"), false);
});
