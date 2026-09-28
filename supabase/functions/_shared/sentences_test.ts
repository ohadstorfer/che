import { assertEquals } from "jsr:@std/assert@1";
import { SentenceSplitter } from "./sentences.ts";

const split = (deltas: string[]) => {
  const s = new SentenceSplitter();
  const out = deltas.flatMap((d) => s.push(d));
  const rest = s.flush();
  return rest ? [...out, rest] : out;
};

Deno.test("splits at . ! ? … followed by a space, keeping ¿ ¡ with their sentence", () => {
  assertEquals(split(["Jaja, re. ¿Vos sos de acá? ¡Qué bueno! Bueno… dale."]), [
    "Jaja, re.",
    "¿Vos sos de acá?",
    "¡Qué bueno!",
    "Bueno…",
    "dale.",
  ]);
});

Deno.test("waits for the space, so a delta can't cut '...' or '?!'", () => {
  const s = new SentenceSplitter();
  assertEquals(s.push("¿En serio?"), []);
  assertEquals(s.push("! Mirá vos."), ["¿En serio?!"]);
  assertEquals(s.push(".. y"), ["Mirá vos..."]);
  assertEquals(s.flush(), "y");
});

Deno.test("sentences arrive as the deltas complete them", () => {
  const s = new SentenceSplitter();
  assertEquals(s.push("Ho"), []);
  assertEquals(s.push("la. Ch"), ["Hola."]);
  assertEquals(s.push("e, ¿todo bien? "), ["Che, ¿todo bien?"]);
  assertEquals(s.flush(), null);
});

Deno.test("abbreviations, initials and decimals don't cut", () => {
  assertEquals(split(["El Sr. Pérez vive en la Av. Corrientes. Leí a J. L. Borges. Sale 3.5 lucas."]), [
    "El Sr. Pérez vive en la Av. Corrientes.",
    "Leí a J. L. Borges.",
    "Sale 3.5 lucas.",
  ]);
});

Deno.test("closing quotes and brackets stay with the sentence", () => {
  assertEquals(split(['Me dijo "¡dale!" y se fue. (Qué tipo.) Bueno.']), [
    'Me dijo "¡dale!"',
    "y se fue.",
    "(Qué tipo.)",
    "Bueno.",
  ]);
});

Deno.test("a run-on is forced out at 200 characters, at a space", () => {
  const long = Array.from({ length: 60 }, (_, i) => `palabra${i}`).join(" ");
  const out = split([long]);
  for (const s of out) assertEquals(s.length <= 200, true);
  assertEquals(out.join(" "), long);
});
