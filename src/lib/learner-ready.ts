// ---------------------------------------------------------------------------
// Her data, read ahead of the class that will want it (docs/class-loading.md).
//
// The road reads everything the class she is on needs while she is still
// looking at it (prefetch.ts), and holds it here. The class takes it instead
// of reading it all again — which is what made the first class of a launch
// the slowest, and what sent her records down twice.
//
// What is held is the truth as of a moment ago, so it is only handed over
// while that is as good as now: once, for a short while, and not after
// anything of hers was written from this phone.
// ---------------------------------------------------------------------------

/** How long what was read stays as good as reading it again. Nothing on this
 *  phone changes it in that time without `learnerChanged`; another device of
 *  hers could, as it could a second before any class opens. */
const FRESH_MS = 2 * 60 * 1000;

let held: { key: string; at: number; value: Promise<unknown> } | null = null;
/** A read ahead is being set up: finding which class she is on, off the phone. */
let coming: Promise<unknown> | null = null;
/** A class has already gone and read for itself. */
let asked = false;

/**
 * Says a read ahead is about to be held, once `setup` has found what to read.
 * A class opened in that gap — a tap the moment the road appears — waits for
 * it rather than starting a read of its own beside it. `setup` holds the read
 * (holdLearner) before it resolves, unless `learnerAsked` says not to bother.
 */
export function learnerComing(setup: Promise<unknown>) {
  const mine = setup.catch(() => {});
  coming = mine;
  void mine.then(() => {
    if (coming === mine) coming = null;
  });
}

/** Whether a class has read for itself already — it has paid for everything a
 *  read ahead would save, so one started now would only be a second read. */
export const learnerAsked = () => asked;

/** Keeps `value` — a read already under way — for whoever asks for `key`. */
export function holdLearner(key: string, value: Promise<unknown>) {
  const mine = { key, at: Date.now(), value };
  held = mine;
  // A read that failed is nothing to hand over.
  value.catch(() => {
    if (held === mine) held = null;
  });
}

/** What is held for `key`, if it is still good — and it is the taker's from
 *  here on: a round writes on what it holds. Null otherwise, and then the
 *  caller reads for itself. Throws if the read that was held fails. */
export async function takeLearner<T>(key: string): Promise<T | null> {
  if (coming) await coming;
  const mine = held;
  if (mine && mine.key === key) {
    held = null;
    if (Date.now() - mine.at < FRESH_MS) return (await mine.value) as T;
  }
  asked = true;
  return null;
}

/** Something of hers was written: what is held is from before it. */
export function learnerChanged() {
  held = null;
}
