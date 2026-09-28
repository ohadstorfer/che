// ---------------------------------------------------------------------------
// Published content, loaded once per app run.
//
// The course, the lexicon and the sentences only change when content is
// published, yet every lesson and every Home focus used to download them
// again (~30 MB a lesson). Each loader here runs once and its promise is
// shared; a failed load is forgotten so the next call retries. Entries expire
// after a while, so a long-open app still picks up a publish.
// ---------------------------------------------------------------------------

const TTL_MS = 30 * 60 * 1000;
const memo = new Map<string, { at: number; value: Promise<unknown> }>();

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>;
  const value = load();
  memo.set(key, { at: Date.now(), value });
  value.catch(() => {
    if (memo.get(key)?.value === value) memo.delete(key);
  });
  return value;
}

/** Forget everything — after staff edit content, so they see it at once. */
export function clearContentCache() {
  memo.clear();
}
