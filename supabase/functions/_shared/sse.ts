// Server-sent events over a POST response (hablar-reply, docs/hablar-hld.md §4.5).
//
// `supabase.functions.invoke` can't stream, so the client fetches the function
// URL itself and parses these frames by hand: `event:` line, one `data:` line
// of JSON, blank line. A client that goes away must not stop the work behind
// the stream, so sending after the reader is gone is a silent no-op.

import { corsHeaders } from "./cors.ts";

/** One SSE frame. The data is always one line of JSON. */
export function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export type SseWriter = {
  response: Response;
  send: (event: string, data: unknown) => void;
  close: () => void;
  /** True once the client has gone or close() ran. */
  readonly closed: boolean;
};

/** An open SSE response and the handle that writes to it. Pings every 10 s so proxies keep it open. */
export function sseStream(pingMs = 10_000): SseWriter {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;
  let ping: ReturnType<typeof setInterval> | undefined;

  const write = (chunk: string) => {
    if (closed || !controller) return;
    try {
      controller.enqueue(encoder.encode(chunk));
    } catch {
      closed = true;
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      if (pingMs > 0) ping = setInterval(() => write(": ping\n\n"), pingMs);
    },
    cancel() {
      closed = true;
      clearInterval(ping);
    },
  });

  return {
    response: new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    }),
    send: (event, data) => write(sseFrame(event, data)),
    close: () => {
      clearInterval(ping);
      if (closed) return;
      closed = true;
      try {
        controller?.close();
      } catch {
        /* already gone */
      }
    },
    get closed() {
      return closed;
    },
  };
}

/** Base64 of bytes, in chunks so a whole mp3 doesn't overflow the call stack. */
export function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}
