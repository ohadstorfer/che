import { assertEquals } from "jsr:@std/assert@1";
import { earlyVerdict, sameWords } from "./hablar-claude.ts";

const line = "Yo es de Canadá";

Deno.test("no verdict before has_error is written", () => {
  assertEquals(earlyVerdict('{"has_err', line), null);
});

Deno.test("a line with no error is settled once its verdict is written", () => {
  assertEquals(earlyVerdict('{"has_error": false, "ver', line), null);
  assertEquals(earlyVerdict('{"has_error": false, "verdict": "correct", "sev', line), {
    has_error: false,
    verdict: "correct",
    corrected: line,
  });
  assertEquals(earlyVerdict('{"has_error":false,"verdict":"note"', line), { has_error: false, verdict: "note", corrected: line });
  assertEquals(earlyVerdict('{"has_error":false,"verdict":"unclear"', line), {
    has_error: false,
    verdict: "unclear",
    corrected: line,
  });
});

Deno.test("an error waits for the corrected line to close", () => {
  assertEquals(earlyVerdict('{"has_error":true,"severity":"target","corrected":"Yo soy de', line), null);
  assertEquals(
    earlyVerdict('{"has_error":true,"severity":"target","corrected":"Yo soy de Canadá","sp', line),
    { has_error: true, verdict: "error", corrected: "Yo soy de Canadá" },
  );
});

Deno.test("escaped quotes inside the corrected line don't end it early", () => {
  assertEquals(earlyVerdict('{"has_error":true,"corrected":"Dijo \\"che\\" y', line), null);
  assertEquals(
    earlyVerdict('{"has_error":true,"corrected":"Dijo \\"che\\" y se fue"', line),
    { has_error: true, verdict: "error", corrected: 'Dijo "che" y se fue' },
  );
});

Deno.test("field order doesn't matter", () => {
  assertEquals(
    earlyVerdict('{"corrected":"Yo soy de Canadá","has_error":true', line),
    { has_error: true, verdict: "error", corrected: "Yo soy de Canadá" },
  );
});

Deno.test("same words: accents, capitals and punctuation don't count", () => {
  assertEquals(sameWords("Hola, ¿cómo andas?", "hola como andás"), true);
  assertEquals(sameWords("¿Tú tienes la cuenta?", "¿Vos tenés la cuenta?"), false);
  assertEquals(sameWords("Yo quiero ordenar la comida", "Quiero pedir la comida."), false);
});
