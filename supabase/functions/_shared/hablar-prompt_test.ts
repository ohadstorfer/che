import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { topicOf } from "./hablar.ts";
import { ENGLISH_NOTE, feedbackInput, PERSONA, sessionBlock, turnText, WRAP_UP_NOTE } from "./hablar-prompt.ts";
import { unitWords } from "./hablar-unit.ts";

const cafe = topicOf("scenario", "cafe", "A1")!.scenario!;

Deno.test("a scenario chat tells Pancho the scene's goals, in the per-chat block", () => {
  const block = sessionBlock({ level: "A1", scenario: cafe, opener: cafe.opener.es });
  assertEquals(cafe.goals.length >= 2, true);
  for (const g of cafe.goals) assertStringIncludes(block, g.es);
  assertStringIncludes(block, "Never read these out");
  // Per-chat data stays out of the block every chat shares.
  assertEquals(PERSONA.includes(cafe.goals[0].es), false);
  // A written scenario has no unit words.
  assertEquals(block.includes("Words the learner knows"), false);
});

Deno.test("a scene without goals says nothing about them", () => {
  const block = sessionBlock({ level: "A1", scenario: { ...cafe, goals: [] }, opener: "Hola" });
  assertEquals(block.includes("should get to do"), false);
  assertEquals(sessionBlock({ level: "A1", opener: "Hola" }).includes("should get to do"), false);
});

Deno.test("a unit chat adds the unit's words; beginners are kept close to them", () => {
  const unit = { ...cafe, words: ["café", "medialuna", "quiero"] };
  const a1 = sessionBlock({ level: "A1", scenario: unit, opener: "Hola" });
  assertStringIncludes(a1, "Words the learner knows from this unit: café, medialuna, quiero.");
  assertStringIncludes(a1, "stay close to them");
  for (const g of unit.goals) assertStringIncludes(a1, g.es);
  const b1 = sessionBlock({ level: "B1", scenario: { ...unit, band: "B1" }, opener: "Hola" });
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
