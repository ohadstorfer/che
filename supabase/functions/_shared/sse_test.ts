import { assertEquals } from "jsr:@std/assert@1";
import { sseFrame, sseStream, toBase64 } from "./sse.ts";

Deno.test("a frame is event, one data line of JSON, blank line", () => {
  assertEquals(sseFrame("text", { seq: 0, delta: "Jaja,\nre" }), 'event: text\ndata: {"seq":0,"delta":"Jaja,\\nre"}\n\n');
});

Deno.test("the stream carries frames in order and closes", async () => {
  const sse = sseStream(0);
  sse.send("text", { seq: 0, delta: "Hola" });
  sse.send("done", { ended: false });
  sse.close();
  sse.send("text", { seq: 1, delta: "ignored" }); // after close: a no-op
  assertEquals(sse.response.headers.get("content-type"), "text/event-stream; charset=utf-8");
  assertEquals(
    await sse.response.text(),
    'event: text\ndata: {"seq":0,"delta":"Hola"}\n\nevent: done\ndata: {"ended":false}\n\n',
  );
});

Deno.test("sending after the client went away doesn't throw", async () => {
  const sse = sseStream(0);
  await sse.response.body!.cancel();
  sse.send("audio", { seq: 0 });
  assertEquals(sse.closed, true);
});

Deno.test("toBase64 handles more than one chunk", () => {
  const bytes = new Uint8Array(70_000).map((_, i) => i % 256);
  const back = Uint8Array.from(atob(toBase64(bytes)), (c) => c.charCodeAt(0));
  assertEquals(back, bytes);
});
