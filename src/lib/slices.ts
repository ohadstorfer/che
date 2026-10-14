/**
 * Work over a long list, a few milliseconds at a time, with the screen let
 * back in between. For getting things ready behind a screen she is using
 * (prefetch.ts): a second of work in one piece is a second her taps wait.
 */
const BUDGET_MS = 8;

/** Someone is now waiting on the work — a class opened before it was done.
 *  From here it runs straight through: she is looking at a loading screen,
 *  and the pauses would only make it longer. */
let hurried = false;
export function hurrySlices() {
  hurried = true;
}

export async function inSlices<T>(items: readonly T[], work: (item: T) => void) {
  let from = Date.now();
  for (const item of items) {
    work(item);
    if (hurried || Date.now() - from < BUDGET_MS) continue;
    await new Promise((next) => setTimeout(next, 0));
    from = Date.now();
  }
}
