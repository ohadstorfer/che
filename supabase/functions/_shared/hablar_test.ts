import { assertEquals } from "jsr:@std/assert@1";
import {
  bandOf,
  CONTENT,
  deadlineAt,
  diloCompare,
  effectivePaused,
  elapsedSeconds,
  isSilenceHallucination,
  localDate,
  mergePaused,
  nearestBand,
  nextUserIdx,
  resolveLevel,
  shouldWrapUp,
  sttKeyterms,
  topicOf,
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

Deno.test("deadline moves with the pauses", () => {
  assertEquals(deadlineAt(start, 0, at(10)), "2026-09-25T12:05:00.000Z");
  assertEquals(deadlineAt(start, 90, at(200)), "2026-09-25T12:06:30.000Z");
});

Deno.test("pause reports only grow, and cap", () => {
  assertEquals(mergePaused(30, 20), 30);
  assertEquals(mergePaused(30, "45.7"), 45);
  assertEquals(mergePaused(30, 5000), 900);
  assertEquals(mergePaused(30, undefined), 30);
});

Deno.test("wrap up at 4:30, or when every goal is done", () => {
  assertEquals(shouldWrapUp(269, ["a", "b"], ["a"]), false);
  assertEquals(shouldWrapUp(270, [], []), true);
  assertEquals(shouldWrapUp(60, ["a", "b"], ["b", "a"]), true);
  assertEquals(shouldWrapUp(60, [], []), false);
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
});

Deno.test("content: every scenario resolves at every level, keyterms are bounded", () => {
  for (const s of CONTENT.scenarios) {
    for (const level of ["A1", "A2", "B1", "B2"] as const) {
      const t = topicOf("scenario", s.id, level)!;
      assertEquals(t.goals.length >= 2, true);
      assertEquals(Object.keys(s.versions).includes(t.scenario!.band), true);
      const k = sttKeyterms(t, level);
      assertEquals(k.length <= 50 && k.every((x) => x.length <= 50), true);
    }
  }
  assertEquals(topicOf("scenario", "nope", "A1"), null);
  assertEquals(topicOf("free", null, "A1")!.goals, []);
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
