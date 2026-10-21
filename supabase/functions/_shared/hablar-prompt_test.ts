import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { topicOf } from "./hablar.ts";
import { cleanFeedback, ENGLISH_NOTE, type Feedback, feedbackInput, heardHolds, PERSONA, sessionBlock, turnText, WRAP_UP_NOTE } from "./hablar-prompt.ts";
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
