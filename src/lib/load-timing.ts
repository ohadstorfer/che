// ---------------------------------------------------------------------------
// Where the time goes when a class opens (docs/class-loading.md).
//
// A development build prints one line per class, with every step of the load
// and how long it took:
//
//   [class] open 2140 ms — version 40 · states 310 (1840 rows) · … · meanings 390
//
// Steps that run side by side each show their own time, so they don't add up
// to the total. A release build does none of this.
// ---------------------------------------------------------------------------

const ON = typeof __DEV__ !== 'undefined' && __DEV__;

interface Opening {
  label: string;
  at: number;
  parts: string[];
}

let current: Opening | null = null;

const now = () => globalThis.performance?.now() ?? Date.now();

/** Begins a record; whatever is timed from here on lands in it. */
export function timingStart(label: string) {
  if (!ON) return;
  current = { label, at: now(), parts: [] };
}

/** A step: a promise already under way, or a piece of work to run now. `note`
 *  says something of what came back — how many rows, where from. */
export function timed<T>(name: string, work: Promise<T>, note?: (value: T) => string): Promise<T>;
export function timed<T>(name: string, work: () => T, note?: (value: T) => string): T;
export function timed<T>(name: string, work: Promise<T> | (() => T), note?: (value: T) => string): Promise<T> | T {
  if (!ON) return typeof work === 'function' ? work() : work;
  // The record the step began in: one that outlives it belongs to another class.
  const record = current;
  const from = now();
  const done = (value: T) => {
    const said = note ? ` (${note(value)})` : '';
    record?.parts.push(`${name} ${Math.round(now() - from)}${said}`);
    return value;
  };
  if (typeof work === 'function') return done(work());
  return work.then(done);
}

/** Prints the record and closes it. A second call does nothing. */
export function timingEnd() {
  if (!ON || !current) return;
  const { label, at, parts } = current;
  current = null;
  console.log(`[${label}] open ${Math.round(now() - at)} ms — ${parts.join(' · ')}`);
}
