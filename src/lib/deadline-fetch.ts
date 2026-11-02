/** How long a request may go without any answer. A connection that stalls
 *  without closing would otherwise hang the request — and whatever waits on
 *  it, retries included — until the phone gives up on its own. Once the
 *  server has answered, a slow download is left to finish: slow is not dead. */
const NO_ANSWER_MS = 20_000;
/** A safety net for an answer that started and then stopped coming. */
const ANSWERED_MS = 3 * 60_000;
/** A read is asked again sooner, since asking twice changes nothing. Measured
 *  2026-11-02: replies stuck for 12–19 s on some connections while others went
 *  through at once, and the server had answered each in milliseconds. A class
 *  is more than ten reads, so one stuck read was a failed class. The last try
 *  waits as long as any request, so a read that is merely slow still lands. */
const READ_TRIES_MS = [6000, 6000, NO_ANSWER_MS];

const isRead = (target: string, init?: RequestInit) => {
  const method = (init?.method ?? 'GET').toUpperCase();
  return target.includes('/rest/v1/') && (method === 'GET' || method === 'HEAD');
};

function attempt(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  patience: number,
  send: typeof fetch,
): Promise<Response> {
  const own = new AbortController();
  const outer = init?.signal;
  if (outer?.aborted) own.abort();
  else outer?.addEventListener('abort', () => own.abort(), { once: true });
  const silent = setTimeout(() => own.abort(), patience);
  return send(input, { ...init, signal: own.signal }).then(
    (res) => {
      clearTimeout(silent);
      setTimeout(() => own.abort(), ANSWERED_MS);
      return res;
    },
    (e) => {
      clearTimeout(silent);
      throw e;
    },
  );
}

/** The app's fetch: every request has a deadline, and a read gets more than one try. */
export async function withDeadline(input: RequestInfo | URL, init?: RequestInit, send: typeof fetch = fetch): Promise<Response> {
  const target = typeof input === 'string' ? input : String((input as { url?: string }).url ?? input);
  // Uploads and edge functions (a chat's summary is written by Claude) can
  // rightly take longer; they keep their own pace.
  if (target.includes('/functions/v1/') || target.includes('/storage/v1/')) return send(input, init);
  // Writes go once: one that reached the server must not happen twice.
  const tries = isRead(target, init) ? READ_TRIES_MS : [NO_ANSWER_MS];
  for (let n = 0; ; n++) {
    try {
      return await attempt(input, init, tries[n], send);
    } catch (e) {
      if (n === tries.length - 1 || init?.signal?.aborted) throw e;
    }
  }
}
