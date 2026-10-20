// PostHog from the edge functions: the store's word about money (revenue.ts)
// and the errors of the functions that spend or take it (reportError).
//
// Server-side capture, the HTTP /batch/ endpoint, as the person the app
// identifies (her Supabase user id, src/lib/analytics.tsx). The project key is
// the app's own: write-only, it can send events and never read them.
// POSTHOG_KEY / POSTHOG_HOST override it; POSTHOG_KEY=off sends nothing.
//
// Fire and forget, always: a short timeout, every failure swallowed, and the
// request kept alive past the response with EdgeRuntime.waitUntil. PostHog
// being down never slows or breaks a payment, a notification or a chat.

const DEFAULT_KEY = "phc_pzgRizNBQFYqGpGNfPWmmyNvUk8q4tpmUH36erQszE65";
const DEFAULT_HOST = "https://us.i.posthog.com";
const TIMEOUT_MS = 2500;
/** Marks what the server sent, so it can be told apart from the app's events. */
const LIB = "posta-edge";

export type Props = Record<string, unknown>;

export interface CaptureEvent {
  event: string;
  distinctId: string;
  properties?: Props;
  /** When it happened (ISO); default now. */
  timestamp?: string;
  /** PostHog keeps one event per (uuid, distinct id, event, timestamp): the same
   *  uuid sent twice is counted once. Default random. */
  uuid?: string;
}

const env = (name: string) => (typeof Deno === "undefined" ? undefined : Deno.env.get(name));

/** Keeps the work alive after the response is sent (Supabase's edge runtime). */
function keepAlive(work: Promise<unknown>) {
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(work);
}

/** Sends events; resolves when done or given up on, never rejects. */
export function capture(events: CaptureEvent[]): Promise<void> {
  const key = env("POSTHOG_KEY") || DEFAULT_KEY;
  if (!events.length || !key || key === "off") return Promise.resolve();
  const host = (env("POSTHOG_HOST") || DEFAULT_HOST).replace(/\/+$/, "");
  const batch = events.map((e) => ({
    event: e.event,
    distinct_id: e.distinctId,
    timestamp: e.timestamp ?? new Date().toISOString(),
    uuid: e.uuid ?? crypto.randomUUID(),
    properties: { $lib: LIB, ...e.properties },
  }));
  const work = fetch(`${host}/batch/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, batch }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
    .then((res) => {
      if (!res.ok) console.error("posthog capture refused", res.status);
      return res.body?.cancel();
    })
    .catch((err) => console.error("posthog capture failed", (err as Error).message));
  keepAlive(work);
  return work;
}

/** A UUID that is always the same for the same key (SHA-256, shaped as v5),
 *  so an event sent twice is one event in PostHog. */
export async function stableUuid(key: string): Promise<string> {
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))).slice(0, 16);
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]{10,}|\beyJ[A-Za-z0-9._~+/=-]{10,}/g;

/** What may leave: no addresses, no tokens, not too long. */
export const scrub = (s: string, max = 500) => s.replace(EMAIL, "<email>").replace(BEARER, "<token>").slice(0, max);

/** V8 stack lines → PostHog's raw frames (newest last, as PostHog wants). */
function frames(stack: string | undefined) {
  const out: { platform: string; filename: string; function: string; lineno?: number; colno?: number; in_app: boolean }[] = [];
  for (const line of (stack ?? "").split("\n").slice(1, 30)) {
    const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line);
    if (!m) continue;
    const filename = m[2];
    out.push({
      platform: "node:javascript",
      filename,
      function: m[1] ?? "<anonymous>",
      lineno: Number(m[3]),
      colno: Number(m[4]),
      in_app: !/node_modules|deno\.land|jsr\.io|esm\.sh|ext:/.test(filename),
    });
  }
  return out.reverse();
}

/** Ids, counts, codes: what reportError's context may carry. */
export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

/**
 * An error in an edge function, to PostHog as an `$exception` (Error tracking
 * groups them into issues). `context` is ids only: user_id, session_id, a
 * stage — never what she said or wrote, never an address. Fire and forget.
 */
export function reportError(fn: string, err: unknown, context: ErrorContext = {}): Promise<void> {
  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : JSON.stringify(err ?? null));
  const userId = typeof context.user_id === "string" ? context.user_id : null;
  const clean: Props = {};
  for (const [k, v] of Object.entries(context)) if (v !== undefined) clean[k] = typeof v === "string" ? scrub(v, 200) : v;
  return capture([{
    event: "$exception",
    distinctId: userId ?? `edge:${fn}`,
    properties: {
      ...clean,
      function: fn,
      $exception_level: "error",
      $exception_list: [{
        type: e.name || "Error",
        value: scrub(e.message || String(e)),
        mechanism: { handled: true, synthetic: false, type: "generic" },
        stacktrace: { type: "raw", frames: frames(e.stack) },
      }],
      // No person is made for a function's own errors.
      ...(userId ? {} : { $process_person_profile: false }),
    },
  }]);
}

/**
 * Deno.serve's handler, with anything it throws reported and answered 500
 * instead of lost. The errors it catches on its own, it reports itself.
 */
export function reported(fn: string, handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err) {
      console.error(`${fn} failed`, err);
      reportError(fn, err, { stage: "unhandled" });
      return new Response(JSON.stringify({ error: "internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
