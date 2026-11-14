import { assertEquals } from "jsr:@std/assert@1";
import { guideForComment, guideUrl } from "./free-guides.ts";

Deno.test("keywords match whole words, any case, accents and emoji", () => {
  assertEquals(guideForComment("GUIDE")?.guide, "slang");
  assertEquals(guideForComment("guide 🙏🙏")?.guide, "slang");
  assertEquals(guideForComment("Guía!!")?.guide, "slang");
  assertEquals(guideForComment("vos")?.guide, "vos");
  assertEquals(guideForComment("I want to LEARN please")?.guide, "learn");
  assertEquals(guideForComment("vos please")?.guide, "vos");
  assertEquals(guideForComment("#slang")?.guide, "slang");
});

Deno.test("no keyword, no guide", () => {
  assertEquals(guideForComment("vosotros es de España"), null);
  assertEquals(guideForComment("vos sos un capo, posta"), null);
  assertEquals(guideForComment("I want to learn this so bad"), null);
  assertEquals(guideForComment("guided tours are great"), null);
  assertEquals(guideForComment("jajaja 😂"), null);
  assertEquals(guideForComment(""), null);
});

Deno.test("link carries the source", () => {
  assertEquals(guideUrl("vos", "ig-dm"), "https://postaspanish.com/free/vos?src=ig-dm");
});
