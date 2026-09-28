import { assertEquals } from "jsr:@std/assert@1";
import { offendingSpanish, offendingWords } from "./rioplatense.ts";

Deno.test("offendingWords scans every word, not just italics", () => {
  assertEquals(offendingWords("¿Tú tienes un coche? Dime."), ["tú", "tienes", "coche", "dime"]);
  assertEquals(offendingSpanish("¿Tú tienes un coche?"), []); // the old helper only reads *italics*
});

Deno.test("Tomás with the accent is the name, not the verb", () => {
  assertEquals(offendingWords("Soy Tomás, ¿y vos?"), []);
  assertEquals(offendingWords("TOMÁS"), []);
  assertEquals(offendingWords("Tomás"), []); // decomposed accent
  assertEquals(offendingWords("¿Tomas mate?"), ["tomas"]);
});

Deno.test("clean rioplatense passes", () => {
  assertEquals(offendingWords("Che, ¿vos tenés auto? Acá todos toman el bondi."), []);
});
