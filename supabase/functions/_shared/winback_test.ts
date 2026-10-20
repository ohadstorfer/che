import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { buildMail, dueStep, greeting, localHour, STEPS, unsubscribeToken, validToken } from "./winback.ts";

const DAY = 24 * 60 * 60 * 1000;
const saved = new Date("2026-10-01T12:00:00Z");
// 15:00 UTC is midday in Buenos Aires, inside the sending hours.
const at = (days: number, utcHour = 15) => new Date(Date.UTC(2026, 9, 1 + days, utcHour));
const BA = "America/Argentina/Buenos_Aires";

Deno.test("nothing before day 1", () => {
  assertEquals(dueStep(saved, new Date(saved.getTime() + 0.9 * DAY), "UTC", []), null);
});

Deno.test("each step on its day", () => {
  for (const s of STEPS) assertEquals(dueStep(saved, at(s), BA, []), s);
});

Deno.test("a step goes once", () => {
  assertEquals(dueStep(saved, at(1), BA, [1]), null);
  assertEquals(dueStep(saved, at(3), BA, [1]), 3);
  assertEquals(dueStep(saved, at(4), BA, [1, 3]), null);
});

Deno.test("a missed step is dropped, not sent late", () => {
  // Day 1's mail never went (say the cron was down); on day 3 only day 3's is due.
  assertEquals(dueStep(saved, at(3), BA, []), 3);
  // Past the grace, nothing until the next step.
  assertEquals(dueStep(saved, at(5.5), BA, [1]), null);
  assertEquals(dueStep(saved, at(20), BA, [1, 3]), null);
  assertEquals(dueStep(saved, at(30), BA, [1, 3]), 30);
  assertEquals(dueStep(saved, at(33), BA, []), null);
});

Deno.test("no day-30 offer for someone who has had a subscription", () => {
  assertEquals(dueStep(saved, at(30), BA, [1, 3, 7], true), null);
  // The earlier mails still go.
  assertEquals(dueStep(saved, at(7), BA, [1, 3], true), 7);
});

Deno.test("only in the learner's daytime", () => {
  // 03:00 UTC is midnight in Buenos Aires.
  assertEquals(dueStep(saved, at(2, 3), BA, []), null);
  // ...but 12:00 in Tokyo.
  assertEquals(dueStep(saved, at(2, 3), "Asia/Tokyo", []), 1);
  assertEquals(localHour(at(1, 13), BA), 10);
  assertEquals(localHour(at(1, 23), BA), 20);
  assertEquals(dueStep(saved, at(1, 23), BA, []), null);
});

Deno.test("a bad time zone falls back to UTC", () => {
  assertEquals(localHour(at(1, 15), "Not/AZone"), 15);
  assertEquals(dueStep(saved, at(1, 15), "Not/AZone", []), 1);
});

Deno.test("unsubscribe tokens are per user and need the secret", async () => {
  const a = "6a0b2c1d-0000-4000-8000-000000000001";
  const b = "6a0b2c1d-0000-4000-8000-000000000002";
  const t = await unsubscribeToken(a, "s3cret");
  assertEquals(t.length, 24);
  assert(/^[A-Za-z0-9_-]+$/.test(t));
  assert(await validToken(a, t, "s3cret"));
  assert(!(await validToken(b, t, "s3cret")));
  assert(!(await validToken(a, t, "other")));
  assert(!(await validToken(a, t.slice(1), "s3cret")));
});

Deno.test("greeting uses a first name, or nothing", () => {
  assertEquals(greeting("ohad storfer"), "Ohad, ");
  assertEquals(greeting(null), "");
  assertEquals(greeting("   "), "");
  assertEquals(greeting("someone@privaterelay.appleid.com"), "");
});

Deno.test("every mail has its link, unsubscribe and no raw html from the name", () => {
  const unsub = "https://postaspanish.com/unsubscribe/?u=x&t=y";
  for (const s of STEPS) {
    const m = buildMail(s, { name: "Ana", unsubscribeUrl: unsub });
    assert(m.subject.length > 10 && m.subject.length < 60, m.subject);
    assertStringIncludes(m.html, unsub.replaceAll("&", "&amp;"));
    assertStringIncludes(m.text, unsub);
    assertStringIncludes(m.html, "Ana, ");
    assertStringIncludes(m.html, "https://postaspanish.com/open/?to=");
  }
  assertStringIncludes(buildMail(30, { name: null, unsubscribeUrl: unsub }).html, "/open/?to=offer");
  assertStringIncludes(buildMail(3, { name: null, unsubscribeUrl: unsub }).html, "/open/?to=hablar");
  // No name: the title still starts with a capital.
  assertStringIncludes(buildMail(1, { name: null, unsubscribeUrl: unsub }).text, "Your plan is ready.");
  const evil = buildMail(1, { name: "<b>x", unsubscribeUrl: unsub });
  assert(!evil.html.includes("<b>x"));
});
