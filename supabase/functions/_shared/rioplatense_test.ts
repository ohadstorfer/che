import { assertEquals } from "jsr:@std/assert@1";
import { offendingSpanish, offendingWords } from "./rioplatense.ts";

Deno.test("offendingWords scans every word, not just italics", () => {
  assertEquals(offendingWords("¿Tú tienes un móvil? Dime."), ["tú", "tienes", "móvil", "dime"]);
  assertEquals(offendingSpanish("¿Tú tienes un móvil?"), []); // the old helper only reads *italics*
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

Deno.test("the classic tú questions are caught", () => {
  assertEquals(offendingWords("¿Cómo te llamas?"), ["llamas"]);
  assertEquals(offendingWords("¿Necesitas algo? ¿Conoces el barrio?"), ["necesitas", "conoces"]);
  assertEquals(offendingWords("¿Cómo te llamás? ¿Necesitás algo?"), []);
});

Deno.test("Argentine words that Spain uses for something else pass", () => {
  assertEquals(offendingWords("Tengo la camiseta de Boca."), []);
  assertEquals(offendingWords("Le dio una piña. Eso es un curro."), []);
  assertEquals(offendingWords("Viajamos en coche cama a Bariloche."), []);
});

Deno.test("an explanation may quote the learner's own tú form, and only that", () => {
  const text = "In Argentina it is *tenés*, not *tienes*.";
  assertEquals(offendingSpanish(text), ["tienes"]);
  assertEquals(offendingSpanish(text, "¿Tienes hambre?"), []);
  assertEquals(offendingSpanish("Say *quieres* here.", "¿Tienes hambre?"), ["quieres"]);
});
