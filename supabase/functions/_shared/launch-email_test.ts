import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { firstName, GET_URL, launchEmail, STORE_LINKS } from "./launch-email.ts";

Deno.test("first name: first word, capitalised; empty when blank", () => {
  assertEquals(firstName("  maría josé  "), "María");
  assertEquals(firstName(""), "");
});

Deno.test("the launch mail links both stores and escapes the name", () => {
  const mail = launchEmail("<b>Ana</b> Pérez");
  assertStringIncludes(mail.html, GET_URL);
  assertStringIncludes(mail.html, STORE_LINKS.ios);
  assertStringIncludes(mail.html, STORE_LINKS.android);
  assertStringIncludes(mail.text, STORE_LINKS.android);
  assert(!mail.html.includes("<b>Ana</b>"));
  assertStringIncludes(mail.html, "&lt;b&gt;Ana&lt;/b&gt;, Posta is out");
});

Deno.test("no name still reads well", () => {
  assertStringIncludes(launchEmail("   ").html, ">Posta is out</h1>");
});
