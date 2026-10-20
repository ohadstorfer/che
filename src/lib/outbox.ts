import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Her progress, written whether or not the network is there for it.
//
// A round writes as she answers: each answer's log, each word's new schedule,
// the round's own row. Each went up once, and a dropped connection lost it
// without a word — the day was credited at the end and the words she had
// worked on kept their old schedules. Now every such write goes through here:
// tried at once, tried again with a growing wait while it fails for want of a
// network, kept on the phone meanwhile, and picked up again on the next launch
// if the app is closed first. A write the server refuses outright (a bad row,
// someone else's) is dropped, as it would be on any retry.
//
// Order is kept where it matters. A write names what it changes (`key`) and
// what must already be there (`needs`): a word's new schedule waits for the
// row that introduced it, an answer's log waits for the round it belongs to,
// and the end of the round waits for both the round and the day. Writes with
// nothing in common go side by side, as they always did.
// ---------------------------------------------------------------------------

export type Write =
  | { kind: 'insert'; table: string; rows: object | object[]; duplicateOk?: boolean }
  | { kind: 'upsert'; table: string; rows: object | object[]; onConflict: string; returning?: boolean }
  | { kind: 'update'; table: string; values: object; match: Record<string, string> }
  | { kind: 'rpc'; fn: string; args: object };

export interface Order {
  /** What the write changes: later writes with the same key wait for it. */
  key?: string;
  /** Keys whose latest write must have landed first. */
  needs?: string[];
}

/** How a write ended: `ok` once it is on the server, with what it returned. */
export interface Landed {
  ok: boolean;
  data?: unknown;
}

interface Kept extends Order {
  id: string;
  at: number;
  write: Write;
}

interface Entry extends Kept {
  landed: Promise<Landed>;
  /** How the first try went: null when it failed and the write goes on trying. */
  first: Promise<Landed | null>;
}

const STORE_KEY = 'outbox:v1';
/** How long one try may take before it counts as failed. */
const REQUEST_MS = 15_000;
/** The waits between tries, the last repeating. */
const WAITS = [1000, 2000, 4000, 8000, 15_000, 30_000, 60_000];
/** A write still not through after this long is let go. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Writes not yet through, in the order they were sent. */
const live: Entry[] = [];

let wake: () => void = () => {};
let woken = new Promise<void>((resolve) => (wake = resolve));

/** Ends every wait between tries: the app is back in front, or a write just
 *  got through, so the network may well be there again. */
export function wakeOutbox() {
  const go = wake;
  woken = new Promise<void>((resolve) => (wake = resolve));
  go();
}

/** Sends `write`, after whatever `order` says must come first. */
export function send(write: Write, order: Order = {}): Promise<Landed> {
  return enter({ id: newId(), at: Date.now(), write, ...order }).landed;
}

/** Like `send`, but answers after the first try: with how it landed, or null
 *  when it didn't and goes on trying behind the caller. For a caller that
 *  would rather go on without the answer than wait out a dead network. */
export function sendOnce(write: Write, order: Order = {}): Promise<Landed | null> {
  return enter({ id: newId(), at: Date.now(), write, ...order }).first;
}

/** `promise`'s value, or null if it takes longer than `ms`. */
export function within<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => resolve(null),
    );
  });
}

function enter(kept: Kept): Entry {
  const deps = new Set<Entry>();
  for (const key of [kept.key, ...(kept.needs ?? [])]) {
    if (!key) continue;
    for (let i = live.length - 1; i >= 0; i--) {
      if (live[i].key !== key) continue;
      deps.add(live[i]);
      break;
    }
  }
  const entry = { ...kept } as Entry;
  let tried: (first: Landed | null) => void = () => {};
  entry.first = new Promise((resolve) => (tried = resolve));
  entry.landed = run(entry, [...deps], tried);
  live.push(entry);
  save();
  return entry;
}

async function run(entry: Entry, deps: Entry[], tried: (first: Landed | null) => void): Promise<Landed> {
  // A write that came first and was dropped is no reason to hold this one.
  await Promise.all(deps.map((d) => d.landed));
  let out: Landed;
  for (let tries = 0; ; tries++) {
    if (Date.now() - entry.at > MAX_AGE_MS) {
      out = { ok: false };
      tried(out);
      break;
    }
    const got = await attempt(entry.write);
    if (tries === 0) tried(got === 'again' ? null : got);
    if (got !== 'again') {
      out = got;
      break;
    }
    const wait = WAITS[Math.min(tries, WAITS.length - 1)];
    await Promise.race([new Promise((r) => setTimeout(r, wait)), woken]);
  }
  const at = live.indexOf(entry);
  if (at >= 0) live.splice(at, 1);
  save();
  if (out.ok) wakeOutbox();
  return out;
}

type Answer = { data: unknown; error: { code?: string; message?: string } | null; status?: number };
type Request = PromiseLike<Answer> & { abortSignal?: (signal: AbortSignal) => PromiseLike<Answer> };

function request(w: Write): Request {
  switch (w.kind) {
    case 'insert':
      return supabase.from(w.table).insert(w.rows);
    case 'upsert': {
      const q = supabase.from(w.table).upsert(w.rows, { onConflict: w.onConflict });
      return w.returning ? q.select().single() : q;
    }
    case 'update': {
      let q = supabase.from(w.table).update(w.values);
      for (const [column, value] of Object.entries(w.match)) q = q.eq(column, value);
      return q;
    }
    case 'rpc':
      return supabase.rpc(w.fn, w.args);
  }
}

/** No answer at all, the server busy or a sign-in that needs refreshing: worth
 *  another try. Anything else the server said no to will say no again. */
const worthAgain = (status: number | undefined, code: string | undefined) =>
  !status || !code || status === 401 || status === 408 || status === 429 || status >= 500;

async function attempt(w: Write): Promise<Landed | 'again'> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REQUEST_MS);
  try {
    const q = request(w);
    // The demo backend has no abortSignal; its answers never hang.
    const { data, error, status } = await (q.abortSignal ? q.abortSignal(abort.signal) : q);
    if (!error) return { ok: true, data };
    // Sent before, and it got there: only the answer was lost.
    if (w.kind === 'insert' && w.duplicateOk && error.code === '23505') return { ok: true };
    if (worthAgain(status, error.code)) return 'again';
    console.warn(`[outbox] ${w.kind === 'rpc' ? w.fn : w.table} refused`, error);
    return { ok: false };
  } catch {
    return 'again';
  } finally {
    clearTimeout(timer);
  }
}

// --- kept on the phone ---------------------------------------------------------

/** Nothing is written over the phone's copy until it has been read back:
 *  until then it holds writes this launch hasn't taken up yet. */
let loaded = false;
let saving: ReturnType<typeof setTimeout> | null = null;

function save() {
  if (!loaded || saving) return;
  saving = setTimeout(() => {
    saving = null;
    const kept: Kept[] = live.map(({ id, at, write, key, needs }) => ({ id, at, write, key, needs }));
    void (kept.length ? AsyncStorage.setItem(STORE_KEY, JSON.stringify(kept)) : AsyncStorage.removeItem(STORE_KEY)).catch(
      () => {},
    );
  }, 250);
}

/** Takes up the writes a closed app left on the phone. Once per launch, when
 *  she is signed in — they are hers, and only her session can send them. */
export function resumeOutbox() {
  if (loaded) return;
  loaded = true;
  void AsyncStorage.getItem(STORE_KEY)
    .then((text) => {
      const kept = text ? (JSON.parse(text) as Kept[]) : [];
      const here = new Set(live.map((e) => e.id));
      // Ahead of anything this launch has sent: they were sent first.
      const mine = live.splice(0, live.length);
      for (const k of kept) if (k?.id && k.write && !here.has(k.id)) enter(k);
      live.push(...mine);
    })
    .catch(() => {})
    .finally(save);
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
