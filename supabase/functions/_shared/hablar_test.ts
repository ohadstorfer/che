import { assertEquals } from "jsr:@std/assert@1";
import {
  bandOf,
  CHATS_PER_DAY,
  CLOCK,
  clockOf,
  CLOSE_SOON_BEFORE_CAP,
  CONTENT,
  deadlineAt,
  diloCompare,
  effectivePaused,
  elapsedSeconds,
  GRACE_SECONDS,
  isSilenceHallucination,
  LATE_SECONDS,
  localDate,
  looksEnglish,
  looksSpanish,
  mergePaused,
  nearestBand,
  nextUserIdx,
  pastLastLine,
  resolveLevel,
  MarkerStripper,
  soundsLikeGoodbye,
  shouldCloseSoon,
  shouldWrapUp,
  exchangeOf,
  type Hearing,
  hearingHolds,
  smoothedLine,
  unsureWords,
  sttKeyterms,
  TAB_MESSAGES,
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

Deno.test("deadline moves with the pauses: the backstop is ten minutes at every level", () => {
  assertEquals(deadlineAt(start, 0, "B1", at(10)), "2026-09-25T12:10:00.000Z");
  assertEquals(deadlineAt(start, 90, "B2", at(200)), "2026-09-25T12:11:30.000Z");
  assertEquals(deadlineAt(start, 0, "A1", at(10)), "2026-09-25T12:10:00.000Z");
});

Deno.test("the clock is a backstop, the same at every level", () => {
  assertEquals(CLOCK, { closeSoon: 480, wrap: 540, stop: 600 });
  for (const level of ["A1", "A2", "B1", "B2", null, "C1"]) assertEquals(clockOf(level), CLOCK);
});

Deno.test("pause reports only grow, and cap", () => {
  assertEquals(mergePaused(30, 20), 30);
  assertEquals(mergePaused(30, "45.7"), 45);
  assertEquals(mergePaused(30, 5000), 900);
  assertEquals(mergePaused(30, undefined), 30);
});

Deno.test("every chat: eight lines, the nudge two before the last", () => {
  assertEquals(TAB_MESSAGES, 8);
  assertEquals(CLOSE_SOON_BEFORE_CAP, 2);
  assertEquals(shouldCloseSoon(0, 5), false);
  assertEquals(shouldCloseSoon(0, 6), true);
  assertEquals(shouldWrapUp(0, 7), false);
  assertEquals(shouldWrapUp(0, 8), true);
  // The backstop still closes a chat left running.
  assertEquals(shouldCloseSoon(480, 1), true);
  assertEquals(shouldWrapUp(540, 2), true);
  assertEquals(exchangeOf(1), 1);
  assertEquals(exchangeOf(11), 6);
});

Deno.test("a line recorded in the grace period may come in a little late", () => {
  const chat = (elapsed: number) => ({
    level: "B1",
    started_at: new Date(Date.now() - elapsed * 1000).toISOString(),
    paused_seconds: 0,
  });
  const bound = CLOCK.stop + GRACE_SECONDS + LATE_SECONDS;
  assertEquals(pastLastLine(chat(CLOCK.stop + GRACE_SECONDS + 10)), false);
  assertEquals(pastLastLine(chat(bound - 5)), false);
  assertEquals(pastLastLine(chat(bound + 5)), true);
  assertEquals(pastLastLine({ ...chat(bound + 5), unlimited: true }), false);
});

Deno.test("the day: three chats, Course and Speaking together", () => {
  assertEquals(CHATS_PER_DAY, 3);
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
  // A name in a key phrase is a model, not what she'll say: it isn't boosted.
  const intro = { ...scene, keyterms: [], words: [], key_phrases: [{ es: "Me llamo Sam, ¿y vos?", en: "", audio: null }] };
  assertEquals(sttKeyterms(topicOf("unit", "u", "A1", intro), "A1"), ["llamo"]);
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

Deno.test("a goodbye without the marker: the last sentence takes leave and asks nothing", () => {
  // Said by Haiku in the 2026-10-20 simulations, with no [FIN].
  assertEquals(soundsLikeGoodbye("Dale, la próxima me contás más de la señora del pan. ¡Chau, nos vemos!"), true);
  assertEquals(soundsLikeGoodbye("¡Qué bueno que estás tranquila! Bueno, ¡gracias por charlar conmigo! Chau, ¡hasta luego!"), true);
  assertEquals(soundsLikeGoodbye("Bueno, me tengo que ir. ¡Un gusto! Nos vemos."), true);
  // Still talking: a question, or a goodbye that isn't the last sentence.
  assertEquals(soundsLikeGoodbye("¿Chau? ¿Ya te vas?"), false);
  assertEquals(soundsLikeGoodbye("Nos vemos el sábado, entonces. ¿A qué hora te paso a buscar?"), false);
  assertEquals(soundsLikeGoodbye("Chau, nos vemos. Che, antes de irte, ¿querés un café?"), false);
  assertEquals(soundsLikeGoodbye("¡Qué lindo, te trae pan! ¿Y de qué hablan?"), false);
  assertEquals(soundsLikeGoodbye(""), false);
});

Deno.test("a goodbye opens the last sentence; a leave-taking word only mentioned is not one", () => {
  assertEquals(soundsLikeGoodbye("¡Bueno, chau!"), true);
  assertEquals(soundsLikeGoodbye("Me encantó. Dale, nos vemos."), true);
  assertEquals(soundsLikeGoodbye("¡Gracias! Chau, hasta luego."), true);
  assertEquals(soundsLikeGoodbye("Gracias por charlar, ¡chau!"), true);
  assertEquals(soundsLikeGoodbye("Bueno, nos vemos el sábado."), true);
  assertEquals(soundsLikeGoodbye("Un gusto. Hasta la próxima, Ana."), true);
  // Mentioned, not said: the chat goes on.
  assertEquals(soundsLikeGoodbye("Para irte, decís chau."), false);
  assertEquals(soundsLikeGoodbye("Muy bien. Acá decimos chau, no adiós."), false);
  assertEquals(soundsLikeGoodbye("Cuando te vas, decís «nos vemos» o «hasta luego»."), false);
  assertEquals(soundsLikeGoodbye("Claro. Chau es lo que decís cuando te vas."), false);
  assertEquals(soundsLikeGoodbye("“Chau” se dice todo el tiempo."), false);
  assertEquals(soundsLikeGoodbye("Gracias por decir chau, Ana."), false);
});

/** A hearing with its words as written (accents, capitals), as Scribe gives them. */
const written = (line: string, lp: number | Record<string, number> = -0.05): Hearing => {
  const raws = line.split(/\s+/).map((r) => r.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);
  const bare = (r: string) => r.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return { text: line, audioSeconds: 1, words: raws.map((raw) => ({ w: bare(raw), raw, lp: typeof lp === "number" ? lp : lp[raw] ?? -0.05 })) };
};

Deno.test("the line for grading: her own form where a keyterm took its place", () => {
  const kt = ["tenés", "hermanos"];
  assertEquals(smoothedLine(written("Sí, tengo dos hermanos."), written("Sí, tiene dos hermanos."), ["tengo", ...kt]), "Sí, tiene dos hermanos.");
  // ¿Tú tienes…? heard as Pancho's vos.
  assertEquals(smoothedLine(written("¿Y vos tenés hermanos?"), written("¿Y tú tienes hermanos?"), ["vos", ...kt]), "¿Y tú tienes hermanos?");
});

Deno.test("the line for grading: nothing where the hints can't be why", () => {
  const kt = ["tenés", "hermanos", "medialunas", "mate"];
  // Same hearing either way.
  assertEquals(smoothedLine(written("Sí, tengo dos."), written("Sí, tengo dos."), kt), undefined);
  // No second hearing.
  assertEquals(smoothedLine(written("Sí, tengo dos."), null, kt), undefined);
  // The hinted word is no keyterm: the hearings just differ (unsure's job).
  assertEquals(smoothedLine(written("Ayer fui al cine."), written("Ayer voy al cine."), kt), undefined);
  // A final s alone.
  assertEquals(smoothedLine(written("Dos medialunas."), written("Dos medialuna."), kt), undefined);
  // Two words for one: not a form of the same word.
  assertEquals(smoothedLine(written("Con medialunas."), written("Con media lunas."), kt), undefined);
  // Scribe wasn't sure of the other word.
  assertEquals(smoothedLine(written("Mate, por favor."), written("Bate, por favor.", { Bate: -0.9 }), kt), undefined);
});

Deno.test("the line for grading never drops a word it can't place", () => {
  const h: Hearing = { text: "Si tengo dos", audioSeconds: 1, words: [{ w: "si", raw: "Sí", lp: -0.05 }, { w: "tengo", raw: "tengo", lp: -0.05 }, { w: "dos", raw: "dos", lp: -0.05 }] };
  assertEquals(smoothedLine(h, written("Sí, tiene dos"), ["tengo"]), "Sí tiene dos");
});
