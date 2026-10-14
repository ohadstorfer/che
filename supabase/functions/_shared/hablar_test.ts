import { assertEquals } from "jsr:@std/assert@1";
import {
  bandOf,
  CLOCK,
  clockOf,
  CONTENT,
  deadlineAt,
  diloCompare,
  effectivePaused,
  elapsedSeconds,
  isSilenceHallucination,
  localDate,
  looksEnglish,
  looksSpanish,
  mergePaused,
  nearestBand,
  nextUserIdx,
  resolveLevel,
  MarkerStripper,
  shouldCloseSoon,
  shouldWrapUp,
  exchangeOf,
  type Hearing,
  hearingHolds,
  unsureWords,
  sttKeyterms,
  topicOf,
  wantsLanguageRetry,
} from "./hablar.ts";

const start = new Date("2026-09-25T12:00:00Z");
const at = (s: number) => new Date(start.getTime() + s * 1000);

Deno.test("elapsed is wall time minus pauses", () => {
  assertEquals(elapsedSeconds(start, 0, at(120)), 120);
  assertEquals(elapsedSeconds(start, 60, at(120)), 60);
});

Deno.test("pauses are capped at 15 minutes and at the wall time itself", () => {
  assertEquals(effectivePaused(5000, 10_000), 900);
  assertEquals(effectivePaused(300, 100), 100);
  assertEquals(effectivePaused(-5, 100), 0);
  assertEquals(effectivePaused(NaN, 100), 0);
  // 20 min of wall time with a huge pause report is still at least 5:00 of chat.
  assertEquals(elapsedSeconds(start, 99_999, at(1200)), 300);
});

Deno.test("deadline moves with the pauses, and beginners get a minute more", () => {
  assertEquals(deadlineAt(start, 0, "B1", at(10)), "2026-09-25T12:03:00.000Z");
  assertEquals(deadlineAt(start, 90, "B2", at(200)), "2026-09-25T12:04:30.000Z");
  assertEquals(deadlineAt(start, 0, "A1", at(10)), "2026-09-25T12:04:00.000Z");
  assertEquals(deadlineAt(start, 90, "A2", at(200)), "2026-09-25T12:05:30.000Z");
});

Deno.test("the clock by level: four minutes for A1/A2, three for B1/B2", () => {
  for (const level of ["A1", "A2"] as const) {
    assertEquals(CLOCK[level], { closeSoon: 170, wrap: 210, stop: 240, closeSoonExchanges: 8 });
  }
  for (const level of ["B1", "B2"] as const) {
    assertEquals(CLOCK[level], { closeSoon: 100, wrap: 150, stop: 180, closeSoonExchanges: 6 });
  }
  // A row with no usable level keeps the clock every chat had before.
  assertEquals(clockOf(null), CLOCK.B1);
  assertEquals(clockOf("C1"), CLOCK.B1);
});

Deno.test("pause reports only grow, and cap", () => {
  assertEquals(mergePaused(30, 20), 30);
  assertEquals(mergePaused(30, "45.7"), 45);
  assertEquals(mergePaused(30, 5000), 900);
  assertEquals(mergePaused(30, undefined), 30);
});

Deno.test("B1/B2: wrap up at 2:30 or after ten exchanges; nudge at 1:40 or six", () => {
  assertEquals(shouldWrapUp(149, 9, "B1"), false);
  assertEquals(shouldWrapUp(150, 1, "B2"), true);
  assertEquals(shouldWrapUp(0, 10, "B1"), true);
  assertEquals(shouldCloseSoon(99, 5, "B1"), false);
  assertEquals(shouldCloseSoon(100, 1, "B2"), true);
  assertEquals(shouldCloseSoon(0, 6, "B1"), true);
});

Deno.test("A1/A2: wrap up at 3:30 or after ten exchanges; nudge at 2:50 or eight", () => {
  assertEquals(shouldWrapUp(209, 9, "A1"), false);
  assertEquals(shouldWrapUp(210, 1, "A2"), true);
  assertEquals(shouldWrapUp(0, 10, "A1"), true);
  assertEquals(shouldCloseSoon(169, 7, "A1"), false);
  assertEquals(shouldCloseSoon(170, 1, "A2"), true);
  // With time left, a beginner's chat is still nudged to a close at eight exchanges.
  assertEquals(shouldCloseSoon(60, 8, "A1"), true);
  assertEquals(exchangeOf(1), 1);
  assertEquals(exchangeOf(11), 6);
});

Deno.test("level: band of the section, and the override chip", () => {
  assertEquals(bandOf("A2.3"), "A2");
  assertEquals(bandOf("C1.1"), "B2");
  assertEquals(bandOf(null), "A1");
  assertEquals(resolveLevel("B1.2", "mine"), "B1");
  assertEquals(resolveLevel("B1.2", "easier"), "A2");
  assertEquals(resolveLevel("A1.1", "easier"), "A1");
  assertEquals(resolveLevel("B2.2", "harder"), "B2");
  assertEquals(resolveLevel("A1.1", "b1"), "B1");
  assertEquals(resolveLevel("A2.1", "nonsense"), "A2");
});

Deno.test("dilo: ok, one word off, or again — punctuation and case don't matter", () => {
  assertEquals(diloCompare("¿Me traés la cuenta?", "me traés la cuenta"), "ok");
  assertEquals(diloCompare("me traes la cuenta", "¿Me traés la cuenta?"), "almost");
  assertEquals(diloCompare("me traés cuenta", "¿Me traés la cuenta?"), "almost");
  assertEquals(diloCompare("quiero un café", "¿Me traés la cuenta?"), "again");
  assertEquals(diloCompare("", "Hola"), "again");
});

Deno.test("turn numbering: user turns odd, Pancho right after", () => {
  assertEquals(nextUserIdx(0), 1); // after the opener
  assertEquals(nextUserIdx(2), 3); // after Pancho's reply
  assertEquals(nextUserIdx(1), 3); // a reply still in flight keeps 2 free
  assertEquals(nextUserIdx(null), 1);
});

Deno.test("local date follows the time zone", () => {
  const late = new Date("2026-09-26T02:30:00Z");
  assertEquals(localDate("America/Argentina/Buenos_Aires", late), "2026-09-25");
  assertEquals(localDate("UTC", late), "2026-09-26");
  assertEquals(localDate("Not/AZone", late), "2026-09-25");
});

Deno.test("silence hallucinations are dropped", () => {
  assertEquals(isSilenceHallucination("Gracias por ver el video."), true);
  assertEquals(isSilenceHallucination("  "), true);
  assertEquals(isSilenceHallucination("Quiero un alfajor"), false);
  // "Música" alone is the recogniser hearing a jingle; inside a sentence it is hers.
  assertEquals(isSilenceHallucination("[Música]"), true);
  assertEquals(isSilenceHallucination("Me gusta la música"), false);
});

Deno.test("a line in English is told from Spanish by its words", () => {
  for (const line of ["I want a coffee", "Yes", "What?", "I don't know", "Coffee, please", "How do you say that?", "No, I don’t"]) {
    assertEquals(looksEnglish(line), true, line);
  }
  for (const line of ["Quiero un café", "No", "Sí, dale", "Quiero un café con milk", "Un café please", "Okay", "Medialunas", ""]) {
    assertEquals(looksEnglish(line), false, line);
  }
  assertEquals(looksSpanish("Dos medialunas"), true);
  assertEquals(looksSpanish("Una lágrima"), true);
  assertEquals(looksSpanish("Medialunas"), false);
  assertEquals(looksSpanish("Medialunas", ["dos medialunas"]), true);
});

Deno.test("a second pass without the forced language only for a transcript with nothing Spanish in it", () => {
  assertEquals(wantsLanguageRetry(""), true);
  assertEquals(wantsLanguageRetry("Gracias por ver el video."), true);
  assertEquals(wantsLanguageRetry("Guan cofi"), true);
  assertEquals(wantsLanguageRetry("Quiero un café con leche"), false);
  assertEquals(wantsLanguageRetry("No"), false);
  assertEquals(wantsLanguageRetry("Medialunas", ["medialunas"]), false);
  // Already English as it came back: marked, not heard again.
  assertEquals(wantsLanguageRetry("I want a coffee"), false);
});

Deno.test("content: every scenario resolves at every level, keyterms are bounded", () => {
  for (const s of CONTENT.scenarios) {
    for (const level of ["A1", "A2", "B1", "B2"] as const) {
      const t = topicOf("scenario", s.id, level)!;
      assertEquals(t.goals.length >= 2, true);
      assertEquals(Object.keys(s.versions).includes(t.scenario!.band), true);
      const k = sttKeyterms(t, level);
      assertEquals(k.length <= 100 && k.every((x) => x.length <= 50), true);
    }
  }
  assertEquals(topicOf("scenario", "nope", "A1"), null);
  assertEquals(topicOf("free", null, "A1")!.goals, []);
});

Deno.test("a unit chat plays the scene it kept, and nothing without one", () => {
  const kept = { ...topicOf("scenario", "cafe", "A1")!.scenario!, id: "unit-id" };
  const t = topicOf("unit", "unit-id", "A1", kept)!;
  assertEquals(t.scenario, kept);
  assertEquals(t.goals, kept.goals);
  assertEquals(topicOf("unit", "unit-id", "A1", null), null);
  assertEquals(topicOf("unit", "unit-id", "A1"), null);
});

Deno.test("a level with no version gets the nearest one, the easier on a tie", () => {
  assertEquals(nearestBand(["A1", "A2", "B1", "B2"], "B1"), "B1");
  assertEquals(nearestBand(["B1"], "A1"), "B1");
  assertEquals(nearestBand(["A1", "B1"], "A2"), "A1");
  assertEquals(nearestBand(["B2"], "A2"), "B2");
  assertEquals(nearestBand([], "A2"), null);
  assertEquals(topicOf("scenario", "cafe", "B2")!.scenario!.goals[0].id, "complain");
  assertEquals(topicOf("scenario", "entrevista", "A1")!.scenario!.band, "B2");
});

Deno.test("end marker: stripped across deltas, text kept otherwise", () => {
  const run = (deltas: string[]) => {
    const m = new MarkerStripper("[FIN]");
    const out = deltas.map((d) => m.push(d)).join("") + m.flush();
    return { out, found: m.found };
  };
  assertEquals(run(["Chau, ¡nos vemos! [F", "IN]"]), { out: "Chau, ¡nos vemos! ", found: true });
  assertEquals(run(["Chau [FIN]", " extra"]), { out: "Chau ", found: true });
  assertEquals(run(["Hola [", "casa] bien"]), { out: "Hola [casa] bien", found: false });
  assertEquals(run(["Termina en [F"]), { out: "Termina en [F", found: false });
});

Deno.test("keyterms: what Pancho just asked first, the scene's words after, never an everyday word", () => {
  const scene = {
    ...topicOf("scenario", "cafe", "A1")!.scenario!,
    keyterms: ["hola", "cómo", "te", "llamás", "me llamo", "por favor"],
    key_phrases: [{ es: "Quiero un café.", en: "I want a coffee.", audio: null }],
    words: ["medialuna", "Mate", "una", "y", "tostada"],
  };
  const k = sttKeyterms(topicOf("unit", "u", "A1", scene), "A1", "¡Dale! Café. ¿Con medialuna o tostada?");
  assertEquals(k, ["dale", "café", "medialuna", "tostada", "quiero", "llamás", "me llamo", "por favor", "Mate"]);
  // A free chat has only his line to go by.
  assertEquals(sttKeyterms(topicOf("free", null, "B1"), "B1", "¿Y qué hacés los fines de semana?"), ["hacés", "fines", "semana"]);
  assertEquals(sttKeyterms(topicOf("free", null, "B1"), "B1"), []);
});

const heard = (line: string, lp: number | number[] = -0.05): Hearing => {
  const words = line.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) ?? [];
  return { text: line, audioSeconds: 1, words: words.map((w, i) => ({ w, raw: w, lp: Array.isArray(lp) ? lp[i] : lp })) };
};

Deno.test("a hinted hearing holds when the plain one agrees, or differs only in small things", () => {
  const kt = ["mate", "café", "medialuna", "tostada", "chau"];
  assertEquals(hearingHolds(heard("Mate, por favor"), null, kt), true);
  assertEquals(hearingHolds(heard("Con medialuna"), heard("Con media luna."), kt), true);
  assertEquals(hearingHolds(heard("Después el café, por favor"), heard("Después del café, por favor"), kt), true);
  assertEquals(hearingHolds(heard("No, yo soy Lio"), heard("No, yo soy Leo"), kt), true);
  assertEquals(hearingHolds(heard("Aquí. Eh, mil pesos"), heard("Aquí. $1.000 pesos"), kt), true);
  // A thinking sound written one time and not the other.
  assertEquals(hearingHolds(heard("Sí, medialuna, eh, joya"), heard("Sí, medialuna, joya"), kt), true);
});

Deno.test("a keyterm holds where the plain hearing sounded alike or was guessing", () => {
  const kt = ["mate", "café", "medialuna", "tostada", "castellano"];
  assertEquals(hearingHolds(heard("Mate, por favor"), heard("Bate, por favor"), kt), true);
  assertEquals(hearingHolds(heard("Sí, entiendo castellano"), heard("Sí, entiendo que se cano", [-0.1, -0.1, -0.9, -1.8, -1.2]), kt), true);
  assertEquals(hearingHolds(heard("Café, por favor, y una tostada"), heard("Pe por favor, eh, una tostada", [-0.8, -0.1, -0.1, -0.1, -0.1, -0.1]), kt), true);
});

Deno.test("a hinted hearing does not hold when the hints may have put a word she never said", () => {
  const kt = ["mate", "café", "medialuna", "tostada", "chau"];
  // Sure of "sí" without the hints, "café" with them: which was it?
  assertEquals(hearingHolds(heard("Café, por favor"), heard("Sí, por favor"), kt), false);
  assertEquals(hearingHolds(heard("Chau"), heard("No"), kt), false);
  // Nothing heard without the hints, a word or two with them.
  assertEquals(hearingHolds(heard("Chau"), heard(""), kt), false);
  assertEquals(hearingHolds(heard("Quiero un café con leche"), heard(""), kt), true);
  // A long word Scribe itself doubted, whatever the other hearing says.
  assertEquals(hearingHolds(heard("Soy un gemero", [-0.1, -0.2, -1.2]), heard("Soy un gemero", [-0.1, -0.2, -1.3]), kt), false);
  assertEquals(hearingHolds(heard("Ponme de alguna, por favor", [-0.3, -0.2, -0.95, -0.1, -0.1]), null, kt), false);
  // Silence is not doubt: it has its own answer.
  assertEquals(hearingHolds(heard(""), heard(""), kt), true);
});

Deno.test("unsure words: the ones Scribe guessed at, and the ones the plain hearing heard otherwise", () => {
  assertEquals(unsureWords(heard("Pablo francés", [-0.7, -0.1]), heard("Pablo francés", [-0.6, -0.1])), ["pablo"]);
  assertEquals(unsureWords(heard("Mate, por favor"), heard("Bate, por favor")), ["mate"]);
  assertEquals(unsureWords(heard("Quiero café, por favor"), heard("Quiero café, por favor")), []);
  assertEquals(unsureWords(heard("Quiero café"), null), []);
  // Thinking sounds are never the question.
  assertEquals(unsureWords(heard("Eh, quiero café", [-1.5, -0.1, -0.1]), null), []);
});
