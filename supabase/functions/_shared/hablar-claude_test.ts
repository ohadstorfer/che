import { assertEquals } from "jsr:@std/assert@1";
import { sameWords } from "./hablar-claude.ts";

Deno.test("same words: accents, capitals and punctuation don't count", () => {
  assertEquals(sameWords("Hola, ¿cómo andas?", "hola como andás"), true);
  assertEquals(sameWords("¿Tú tienes la cuenta?", "¿Vos tenés la cuenta?"), false);
  assertEquals(sameWords("Yo quiero ordenar la comida", "Quiero pedir la comida."), false);
});
