import AsyncStorage from '@react-native-async-storage/async-storage';

import { timed } from './load-timing';

/**
 * Every row of a query, past PostgREST's page size (1,000 rows). The query
 * must order on something unique (an id), or rows can repeat or go missing
 * between pages. The first page goes alone (most queries fit in it); past it,
 * pages are asked for a few at a time rather than one after another, so a
 * 27-page table is 8 round trips, not 27.
 *
 * A query that names itself (`remember`) is not asked that way twice: how many
 * pages it took is kept, on the phone too, and next time they all go at once —
 * and in smaller pages, since a page's wait is mostly its rows (measured: an
 * empty one 265 ms, a full one 750) and pages asked for together wait
 * together. Her word records are thousands of rows a year in, read on the way
 * into every class (docs/class-loading.md). A guess that has gone stale costs
 * an empty page or a second trip, never a row.
 */
const PAGE = 1000;
const IN_FLIGHT = 4;
/** Rows a page of a remembered query, which knows to ask for them all at once. */
const REMEMBERED_PAGE = 500;
/** The most pages a remembered count sends at once. */
const MAX_AT_ONCE = 12;

type Query = () => { range: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }> };

export interface AllOptions {
  /** A name for the query and whose it is — "form_states:<user id>". */
  remember?: string;
  /** Times each page under this name in a development build (load-timing.ts). */
  label?: string;
}

async function page<T>(query: Query, n: number, size: number): Promise<T[]> {
  const { data, error } = await query().range(n * size, n * size + size - 1);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function all<T>(query: Query, { remember, label }: AllOptions = {}) {
  const size = remember ? REMEMBERED_PAGE : PAGE;
  const ask = (n: number) =>
    label ? timed(`${label} p${n}`, page<T>(query, n, size), (rows) => `${rows.length}`) : page<T>(query, n, size);
  const out: T[] = [];
  let wave = remember ? Math.min(MAX_AT_ONCE, pagesLastTime(remember)) : 1;
  for (let next = 0; ; next += wave, wave = IN_FLIGHT) {
    const pages = await Promise.all(Array.from({ length: wave }, (_, k) => ask(next + k)));
    for (const rows of pages) {
      out.push(...rows);
      if (rows.length < size) {
        // The short page is one of them: a full last page is followed by an
        // empty one, which is how the end is known.
        if (remember) keepPages(remember, Math.floor(out.length / size) + 1);
        return out;
      }
    }
  }
}

// --- how many pages a named query took ---------------------------------------

const pagesOf = new Map<string, number>();
/** Bump with REMEMBERED_PAGE: a count is of pages that size. */
const storeKey = (name: string) => `pages:${REMEMBERED_PAGE}:${name}`;

/** What is known now, or one. A load never waits on the phone's storage for
 *  this (it did, once: two seconds on the first class after a launch) — the
 *  count is read ahead of time by `recallPages`, and by the first load for
 *  whichever comes after it. */
function pagesLastTime(name: string): number {
  const known = pagesOf.get(name);
  if (!known) recallPages([name]);
  return known ?? 1;
}

/** Reads the counts kept on the phone into memory — on launch, well before
 *  the class that will want them (prefetch.ts). */
export function recallPages(names: string[]) {
  for (const name of names) {
    if (pagesOf.has(name)) continue;
    Promise.resolve()
      .then(() => AsyncStorage.getItem(storeKey(name)))
      .then((text) => {
        const kept = Number(text);
        if (Number.isInteger(kept) && kept > 0 && !pagesOf.has(name)) pagesOf.set(name, kept);
      })
      // Nothing kept, or nowhere to keep it (node's tests): the first page goes alone.
      .catch(() => {});
  }
}

function keepPages(name: string, pages: number) {
  if (pagesOf.get(name) === pages) return;
  pagesOf.set(name, pages);
  Promise.resolve()
    .then(() => AsyncStorage.setItem(storeKey(name), String(pages)))
    .catch(() => {});
}
