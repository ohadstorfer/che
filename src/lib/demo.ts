// ---------------------------------------------------------------------------
// Demo backend
//
// The UI was lifted from a working app with its own Supabase schema (cards,
// card_states, lessons, daily_sessions…). Che's database does not have those
// tables, and building them is the next step, not this one — so every screen
// reads from the fixtures below instead, through a stand-in client that speaks
// just enough of supabase-js to answer the queries the screens actually make.
//
// To go live: flip DEMO to false in lib/supabase.ts. Nothing else refers to
// this file, so it deletes cleanly once the real schema exists.
//
// NOTE ON FIELD NAMES: a card's fields are still `hebrew` / `translit` /
// `spanish` — the shape this UI was written against. The content below is
// Argentine, so the screens read correctly, but the columns are misnamed for
// Che and want renaming as part of the schema work. `translit` in particular
// has no Spanish analogue and needs a decision: drop it, or repurpose it as a
// pronunciation or literal-meaning line.
// ---------------------------------------------------------------------------

import type { Session } from '@supabase/supabase-js';

const STUDENT = 'demo-student-0000-0000-0000-000000000000';

/** Days back from today, as YYYY-MM-DD in local time. */
function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Hours back from now, as an ISO timestamp. */
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

const CARDS = [
  { hebrew: 'che', translit: 'che', spanish: 'hey / mate (getting someone’s attention)' },
  { hebrew: 'boludo', translit: 'bo-lu-do', spanish: 'dude (affectionate among friends)' },
  { hebrew: 'quilombo', translit: 'ki-lom-bo', spanish: 'a mess, chaos' },
  { hebrew: 'laburo', translit: 'la-bu-ro', spanish: 'work, job' },
  { hebrew: 'posta', translit: 'pos-ta', spanish: 'for real, the truth' },
  { hebrew: 'copado', translit: 'co-pa-do', spanish: 'cool, great' },
  { hebrew: 'mango', translit: 'man-go', spanish: 'a peso, money' },
  { hebrew: 'bondi', translit: 'bon-di', spanish: 'the bus' },
  { hebrew: 'pibe', translit: 'pi-be', spanish: 'kid, young guy' },
  { hebrew: 'ni en pedo', translit: 'ni en pe-do', spanish: 'no way, not a chance' },
  { hebrew: 'dale', translit: 'da-le', spanish: 'go on / ok then' },
  { hebrew: 're', translit: 're', spanish: 'very (re copado = very cool)' },
].map((c, i) => ({
  id: `card-${i + 1}`,
  ...c,
  english: null,
  audio_path: null,
  created_by: STUDENT,
  created_at: hoursAgo(500 - i * 10),
}));

// Eight words already met: four of them due for review now, four scheduled
// ahead. That gives the home screen a non-zero "due" count and practice a
// real queue, while leaving four words still unseen so "new" is non-zero too.
const CARD_STATES = CARDS.slice(0, 8).map((c, i) => ({
  id: `state-${i + 1}`,
  card_id: c.id,
  user_id: STUDENT,
  state: i < 4 ? 'review' : 'learning',
  ease_factor: 2.5,
  interval_days: i < 4 ? 4 : 1,
  repetitions: i < 4 ? 3 : 1,
  lapses: 0,
  due_at: i < 4 ? hoursAgo(5) : new Date(Date.now() + 86_400_000).toISOString(),
  introduced_on: day(10 - i),
}));

// Seven finished classes → seven coins behind the current step on the path,
// which is enough for the road to curve and for two figures to appear.
const LESSONS = Array.from({ length: 7 }, (_, i) => ({
  id: `lesson-${i + 1}`,
  user_id: STUDENT,
  completed_at: `${day(7 - i)}T18:00:00.000Z`,
}));

// A five-day run ending yesterday, with today still open: the week strip shows
// filled days behind an empty ring, and the streak chip reads "alive".
const DAILY_SESSIONS = [1, 2, 3, 4, 5].map((d) => ({
  user_id: STUDENT,
  session_date: day(d),
  completed_at: `${day(d)}T18:00:00.000Z`,
}));

export const tables: Record<string, Record<string, unknown>[]> = {
  profiles: [
    {
      id: STUDENT,
      role: 'student',
      display_name: 'Ohad',
      timezone: 'America/Argentina/Buenos_Aires',
    },
  ],
  streaks: [
    {
      user_id: STUDENT,
      current_streak: 5,
      longest_streak: 9,
      last_completed_date: day(1),
      recoverable_streak: 0,
    },
  ],
  cards: CARDS,
  card_states: CARD_STATES,
  lessons: LESSONS,
  daily_sessions: DAILY_SESSIONS,
  review_logs: [{ user_id: STUDENT, reviewed_at: hoursAgo(20) }],
  // Empty on purpose: generated sentences are a content pipeline, not UI. With
  // none, practice builds its queue out of cards alone, which still exercises
  // every exercise frame the path leads into.
  sentences: [],
  sentence_states: [],
  push_subscriptions: [],
};

/** A session shaped like the real one, so nothing has to log in to see the UI. */
export const demoSession = {
  access_token: 'demo',
  refresh_token: 'demo',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: STUDENT,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@che.app',
    app_metadata: {},
    user_metadata: {},
    created_at: hoursAgo(5000),
  },
} as unknown as Session;

// --- the stand-in client ---------------------------------------------------

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

function get(row: Row, column: string): unknown {
  return row[column];
}

/**
 * A query builder that collects filters and resolves to `{ data, error }` when
 * awaited — the same handful of methods the screens chain, and no more. Rows
 * are returned as copies so a screen can never mutate the fixtures.
 */
class Query implements PromiseLike<{ data: unknown; error: null; count: number }> {
  private filters: Filter[] = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private cap: number | null = null;
  private mode: 'many' | 'maybeSingle' | 'single' = 'many';
  private headOnly = false;

  constructor(private readonly table: string) {}

  select(_columns?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.head) this.headOnly = true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((r) => get(r, column) === value);
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push((r) => get(r, column) !== value);
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push((r) => (get(r, column) ?? null) === value);
    return this;
  }

  /** Only `.not(col, 'is', null)` is used, so that is all this honours. */
  not(column: string, _op: string, value: unknown) {
    this.filters.push((r) => (get(r, column) ?? null) !== value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((r) => values.includes(get(r, column)));
    return this;
  }

  gte(column: string, value: string | number) {
    this.filters.push((r) => (get(r, column) as string | number) >= value);
    return this;
  }

  lte(column: string, value: string | number) {
    this.filters.push((r) => (get(r, column) as string | number) <= value);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.sort = { column, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this.cap = n;
    return this;
  }

  maybeSingle() {
    this.mode = 'maybeSingle';
    return this;
  }

  single() {
    this.mode = 'single';
    return this;
  }

  private rows(): Row[] {
    let rows = (tables[this.table] ?? []).filter((r) => this.filters.every((f) => f(r)));
    if (this.sort) {
      const { column, ascending } = this.sort;
      rows = [...rows].sort((a, b) => {
        const x = get(a, column) as string | number;
        const y = get(b, column) as string | number;
        if (x === y) return 0;
        return (x > y ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.cap != null) rows = rows.slice(0, this.cap);
    return rows.map((r) => ({ ...r }));
  }

  then<R1 = { data: unknown; error: null; count: number }, R2 = never>(
    onfulfilled?: ((v: { data: unknown; error: null; count: number }) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    const rows = this.rows();
    const data =
      this.headOnly ? null : this.mode === 'many' ? rows : (rows[0] ?? null);
    return Promise.resolve({ data, error: null, count: rows.length }).then(
      onfulfilled,
      onrejected,
    );
  }
}

/** Writes are accepted and dropped: the fixtures are read-only by design. */
function writeNoop(table: string, rows?: Row | Row[]) {
  const result = Promise.resolve({ data: rows ?? null, error: null, count: 0 });
  const chain = {
    eq: () => chain,
    in: () => chain,
    select: () => chain,
    maybeSingle: () => result,
    single: () => result,
    then: result.then.bind(result),
  };
  if (__DEV__) console.log(`[demo] write to "${table}" ignored — fixtures are read-only`);
  return chain as unknown as ReturnType<typeof Promise.resolve> & typeof chain;
}

export const demoClient = {
  from(table: string) {
    return {
      select: (columns?: string, opts?: { count?: string; head?: boolean }) =>
        new Query(table).select(columns, opts),
      insert: (rows: Row | Row[]) => writeNoop(table, rows),
      update: (rows: Row) => writeNoop(table, rows),
      upsert: (rows: Row | Row[]) => writeNoop(table, rows),
      delete: () => writeNoop(table),
    };
  },

  /**
   * The two RPCs the finish screen calls. `finish_daily_session` reports the
   * streak one higher than the fixture, so completing a class in the demo
   * animates the celebration rather than landing on a flat number.
   */
  rpc(name: string, _args?: Record<string, unknown>) {
    const streak = (tables.streaks[0]?.current_streak as number) ?? 0;
    const data =
      name === 'finish_daily_session'
        ? [{ current_streak: streak + 1 }]
        : name === 'recover_streak'
          ? []
          : [];
    return Promise.resolve({ data, error: null });
  },

  auth: {
    getSession: async () => ({ data: { session: demoSession }, error: null }),
    signInWithPassword: async () => ({
      data: { session: demoSession, user: demoSession.user },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },

  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },

  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
};
