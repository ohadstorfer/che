// ---------------------------------------------------------------------------
// Demo backend
//
// The app runs against this until the course is in the database: the full
// section-1 outline plus hand-written content for units 1–2 (built into
// demo-course.json by `npm run course:demo`), and a learner who has finished
// unit 1 and is standing on unit 2's first lesson, with a few unit-1 words due
// — so the path, a lesson, its review slot and the Practice button all have
// something real to show.
//
// The stand-in client speaks just enough of supabase-js for the queries the
// app makes, and it keeps what the app writes for as long as the page is open:
// finishing a lesson really moves the path on and really moves the streak. A
// reload starts over.
//
// Opt in with EXPO_PUBLIC_DEMO=1 (see lib/supabase.ts). Nothing else imports this file.
// ---------------------------------------------------------------------------

import type { Session } from '@supabase/supabase-js';

import course from './demo-course.json';

type Row = Record<string, unknown>;

const STUDENT = 'd0000000-0000-4000-8000-000000000001';

/** Days back from today, as YYYY-MM-DD in local time. */
function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

function uuid(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const s = Array.from({ length: 32 }, hex).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-8${s.slice(17, 20)}-${s.slice(20)}`;
}

// --- the learner -----------------------------------------------------------

function learner() {
  const unit1 = course.units.find((u) => u.ordinal === 1)!;
  const unit1Lessons = course.lessons.filter((l) => l.unit_id === unit1.id);
  const words = course.form_entries.filter((f) => f.unit_id === unit1.id && !f.is_glue && f.pos !== 'propn');

  // Met over the last week and a half; four of them due right now — enough for
  // the review slot at the top of unit 2 to have something to pull, and for the
  // Practice button to wear a badge. The rest are spread out so the words list
  // shows every strength.
  const form_states = words.map((f, i) => {
    const due = i % 5 === 0;
    const interval = [1, 3, 6, 12, 25][i % 5];
    return {
      id: uuid(),
      form_id: f.id,
      user_id: STUDENT,
      state: interval > 3 ? 'review' : 'learning',
      ease_factor: 2.5,
      interval_days: interval,
      repetitions: Math.min(4, 1 + (i % 4)),
      lapses: 0,
      due_at: due ? hoursFromNow(-3) : hoursFromNow(24 * (1 + (i % 6))),
      introduced_on: day(10 - Math.floor(i / 3)),
    };
  });

  // Unit 1's sentences she has seen: passed once or twice, so the ladder gives
  // them different rungs when they come back.
  const unit1Sentences = course.sentences.filter((s) => s.unit_id === unit1.id);
  const sentence_states = unit1Sentences.map((s, i) => ({
    sentence_id: s.id,
    user_id: STUDENT,
    shown_count: 1 + (i % 3),
    correct_count: i % 3,
    last_shown_at: `${day(4 + (i % 4))}T19:00:00.000Z`,
  }));

  return {
    profiles: [
      {
        user_id: STUDENT,
        display_name: 'Ohad',
        // EXPO_PUBLIC_DEMO_ROLE=admin opens the dashboard on the fixtures.
        role: process.env.EXPO_PUBLIC_DEMO_ROLE === 'admin' ? 'admin' : 'student',
        timezone: 'America/Argentina/Buenos_Aires',
        placed_through: 0,
      },
    ],
    // A five-day run ending yesterday: today is still open, so finishing a
    // lesson grows it to six and the celebration plays.
    streaks: [
      { user_id: STUDENT, current_streak: 5, longest_streak: 9, last_practice_date: day(1), recoverable_streak: 0 },
    ],
    daily_sessions: [1, 2, 3, 4, 5].map((d) => ({
      user_id: STUDENT,
      session_date: day(d),
      total_cards: 12,
      completed_cards: 12,
      sentence_screens: 3,
      sentence_fails: 0,
      completed_at: `${day(d)}T19:30:00.000Z`,
    })),
    lesson_progress: unit1Lessons.map((l, i) => ({
      user_id: STUDENT,
      lesson_id: l.id,
      completed_at: `${day(5 - i)}T19:30:00.000Z`,
      score: 80 + (i % 3) * 5,
      attempts: 1,
      passed: true,
      passed_by: l.kind === 'review' ? 'score' : null,
    })),
    // Her last rounds, for the ladder offset: steady, so the defaults hold.
    rounds: [1, 2, 3, 4].map((d) => ({
      id: uuid(),
      user_id: STUDENT,
      kind: 'lesson',
      lesson_id: null,
      local_date: day(d),
      started_at: `${day(d)}T19:10:00.000Z`,
      finished_at: `${day(d)}T19:30:00.000Z`,
      planned_items: 14,
      answered: 14,
      first_try_wrong: 2,
      retries: 2,
      score: 86,
      ladder_offset: 0,
      promoted: 0,
    })),
    srs_commits: [] as Row[],
    answer_reports: [] as Row[],
    content_reviews: [] as Row[],
    content_revisions: [] as Row[],
    form_states,
    sentence_states,
    review_logs: [] as Row[],
    push_subscriptions: [] as Row[],
  };
}

const tables: Record<string, Row[]> = {
  ...(course as unknown as Record<string, Row[]>),
  ...learner(),
};
// The dashboard reads forms and lemmas as tables; the fixtures only carry the
// view, which has every column those pages look at.
tables.forms = tables.form_entries;
tables.lemmas = [];

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
    created_at: hoursFromNow(-5000),
  },
} as unknown as Session;

// --- queries ---------------------------------------------------------------

type Filter = (row: Row) => boolean;
type Result = { data: unknown; error: null; count: number };

/** Filters shared by reads and by the writes that target existing rows. */
class Filters {
  protected filters: Filter[] = [];

  eq(column: string, value: unknown) {
    this.filters.push((r) => r[column] === value);
    return this;
  }
  neq(column: string, value: unknown) {
    this.filters.push((r) => r[column] !== value);
    return this;
  }
  is(column: string, value: unknown) {
    this.filters.push((r) => (r[column] ?? null) === value);
    return this;
  }
  /** Only `.not(col, 'is', null)` is used, so that is all this honours. */
  not(column: string, _op: string, value: unknown) {
    this.filters.push((r) => (r[column] ?? null) !== value);
    return this;
  }
  in(column: string, values: unknown[]) {
    this.filters.push((r) => values.includes(r[column]));
    return this;
  }
  gte(column: string, value: string | number) {
    this.filters.push((r) => (r[column] as string | number) >= value);
    return this;
  }
  lte(column: string, value: string | number) {
    this.filters.push((r) => (r[column] as string | number) <= value);
    return this;
  }

  protected matches(row: Row) {
    return this.filters.every((f) => f(row));
  }
}

class Query extends Filters implements PromiseLike<Result> {
  private sort: { column: string; ascending: boolean } | null = null;
  private cap: number | null = null;
  private mode: 'many' | 'one' = 'many';
  private headOnly = false;

  constructor(private readonly table: string) {
    super();
  }

  select(_columns?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.head) this.headOnly = true;
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
    this.mode = 'one';
    return this;
  }
  single() {
    this.mode = 'one';
    return this;
  }

  then<R1 = Result, R2 = never>(
    onfulfilled?: ((v: Result) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    let rows = (tables[this.table] ?? []).filter((r) => this.matches(r));
    if (this.sort) {
      const { column, ascending } = this.sort;
      rows = [...rows].sort((a, b) => {
        const x = a[column] as string | number;
        const y = b[column] as string | number;
        return x === y ? 0 : (x > y ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.cap != null) rows = rows.slice(0, this.cap);
    // Copies, so nothing on screen can reach in and edit the store.
    const copies = rows.map((r) => structuredCloneSafe(r));
    const data = this.headOnly ? null : this.mode === 'one' ? (copies[0] ?? null) : copies;
    return Promise.resolve({ data, error: null, count: rows.length }).then(onfulfilled, onrejected);
  }
}

const structuredCloneSafe = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** The columns that identify a row when an upsert names none. */
const KEYS: Record<string, string[]> = {
  form_states: ['form_id', 'user_id'],
  sentence_states: ['sentence_id', 'user_id'],
  daily_sessions: ['user_id', 'session_date'],
  lesson_progress: ['user_id', 'lesson_id'],
  profiles: ['user_id'],
  streaks: ['user_id'],
};

/** Tables whose rows carry a generated `id`. */
const HAS_ID = new Set(['form_states', 'review_logs', 'push_subscriptions', 'answer_reports', 'srs_commits', 'lesson_slots', 'content_reviews', 'content_revisions']);

/**
 * Column defaults, as the migration declares them. The app inserts partial
 * rows and relies on Postgres to fill the rest — a new form state arrives with
 * no ease or interval — so the stand-in has to do the same, or SM-2 schedules
 * from undefined.
 */
const DEFAULTS: Record<string, () => Row> = {
  form_states: () => ({
    state: 'new',
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    lapses: 0,
    due_at: null,
    introduced_on: day(0),
    updated_at: new Date().toISOString(),
  }),
  sentence_states: () => ({ shown_count: 0, correct_count: 0, last_shown_at: null }),
  daily_sessions: () => ({ total_cards: 0, completed_cards: 0, sentence_screens: 0, sentence_fails: 0, completed_at: null }),
  review_logs: () => ({ reviewed_at: new Date().toISOString() }),
  lesson_progress: () => ({ completed_at: new Date().toISOString(), score: null, attempts: 1, passed: true, passed_by: null }),
  srs_commits: () => ({ created_at: new Date().toISOString() }),
  content_reviews: () => ({ created_at: new Date().toISOString() }),
  content_revisions: () => ({ created_at: new Date().toISOString() }),
  answer_reports: () => ({ status: 'open', created_at: new Date().toISOString() }),
  rounds: () => ({ started_at: new Date().toISOString(), finished_at: null, answered: 0, first_try_wrong: 0, retries: 0, score: null, promoted: 0 }),
};

class Mutation extends Filters implements PromiseLike<Result> {
  private wantsRows = false;
  private one = false;

  constructor(
    private readonly table: string,
    private readonly op: 'insert' | 'upsert' | 'update' | 'delete',
    private readonly payload?: Row | Row[],
    private readonly onConflict?: string,
  ) {
    super();
  }

  select() {
    this.wantsRows = true;
    return this;
  }
  single() {
    this.one = true;
    return this;
  }
  maybeSingle() {
    this.one = true;
    return this;
  }

  private run(): Row[] {
    const store = (tables[this.table] ??= []);
    const incoming = Array.isArray(this.payload) ? this.payload : this.payload ? [this.payload] : [];
    const touched: Row[] = [];

    if (this.op === 'insert' || this.op === 'upsert') {
      const keys = this.onConflict?.split(',').map((k) => k.trim()) ?? KEYS[this.table] ?? ['id'];
      for (const row of incoming) {
        const existing =
          this.op === 'upsert' ? store.find((r) => keys.every((k) => r[k] === row[k])) : undefined;
        if (existing) {
          Object.assign(existing, row);
          touched.push(existing);
        } else {
          const fresh = {
            ...(HAS_ID.has(this.table) && !row.id ? { id: uuid() } : {}),
            ...DEFAULTS[this.table]?.(),
            ...row,
          };
          store.push(fresh);
          touched.push(fresh);
        }
      }
    } else if (this.op === 'update') {
      for (const r of store) {
        if (this.matches(r)) {
          Object.assign(r, this.payload);
          touched.push(r);
        }
      }
    } else {
      tables[this.table] = store.filter((r) => !this.matches(r));
    }
    return touched;
  }

  then<R1 = Result, R2 = never>(
    onfulfilled?: ((v: Result) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    const rows = this.run().map((r) => structuredCloneSafe(r));
    const data = !this.wantsRows ? null : this.one ? (rows[0] ?? null) : rows;
    return Promise.resolve({ data, error: null, count: rows.length }).then(onfulfilled, onrejected);
  }
}

// --- rpc -------------------------------------------------------------------

/** finish_lesson, as the migrations write it (see their comments for the rules). */
function finishLesson(args: {
  p_local_date: string;
  p_lesson_id?: string | null;
  p_score?: number | null;
  p_round_id?: string | null;
  p_answered?: number | null;
  p_first_try_wrong?: number | null;
  p_retries?: number | null;
}) {
  const today = args.p_local_date;
  let passed = true;
  let attempts: number | null = null;
  if (args.p_lesson_id) {
    const lesson = (tables.lessons ?? []).find((l) => l.id === args.p_lesson_id);
    const check = lesson?.kind === 'review' || lesson?.kind === 'checkpoint';
    const score = args.p_score ?? 0;
    const progress = tables.lesson_progress;
    const had = progress.find((r) => r.lesson_id === args.p_lesson_id && r.user_id === STUDENT);
    if (had) {
      const tries = Number(had.attempts ?? 1) + 1;
      const nowPassed = !!had.passed || !check || score >= 80 || tries >= 3;
      Object.assign(had, {
        completed_at: new Date().toISOString(),
        score: Math.max(Number(had.score ?? 0), score),
        attempts: tries,
        passed_by: had.passed ? had.passed_by : !check ? null : score >= 80 ? 'score' : tries >= 3 ? 'attempts' : null,
        passed: nowPassed,
      });
      passed = nowPassed;
      attempts = tries;
    } else {
      passed = !check || score >= 80;
      attempts = 1;
      progress.push({
        user_id: STUDENT,
        lesson_id: args.p_lesson_id,
        completed_at: new Date().toISOString(),
        score: args.p_score ?? null,
        attempts: 1,
        passed,
        passed_by: check && passed ? 'score' : null,
      });
    }
  }
  if (args.p_round_id) {
    const round = (tables.rounds ?? []).find((r) => r.id === args.p_round_id);
    if (round) {
      Object.assign(round, {
        finished_at: new Date().toISOString(),
        score: args.p_score ?? null,
        answered: args.p_answered ?? round.answered,
        first_try_wrong: args.p_first_try_wrong ?? round.first_try_wrong,
        retries: args.p_retries ?? round.retries,
      });
    }
  }

  const days = tables.daily_sessions;
  const session = days.find((r) => r.user_id === STUDENT && r.session_date === today);
  if (session) session.completed_at ??= new Date().toISOString();
  else days.push({ user_id: STUDENT, session_date: today, total_cards: 0, completed_cards: 0, sentence_screens: 0, sentence_fails: 0, completed_at: new Date().toISOString() });

  const streak = tables.streaks.find((r) => r.user_id === STUDENT) as {
    current_streak: number;
    longest_streak: number;
    last_practice_date: string | null;
    recoverable_streak: number;
  };
  const previous = streak.current_streak;
  const yesterday = (() => {
    const [y, m, d] = today.split('-').map(Number);
    const t = new Date(y, m - 1, d - 1);
    return `${t.getFullYear()}-${`${t.getMonth() + 1}`.padStart(2, '0')}-${`${t.getDate()}`.padStart(2, '0')}`;
  })();

  if (streak.last_practice_date !== today) {
    if (streak.last_practice_date === yesterday) {
      streak.current_streak += 1;
      streak.recoverable_streak = 0;
    } else {
      streak.recoverable_streak = streak.last_practice_date ? streak.current_streak : 0;
      streak.current_streak = 1;
    }
  } else if (streak.recoverable_streak > 0) {
    streak.current_streak += streak.recoverable_streak;
    streak.recoverable_streak = 0;
  }
  streak.longest_streak = Math.max(streak.longest_streak, streak.current_streak);
  streak.last_practice_date = today;

  return [
    {
      current_streak: streak.current_streak,
      previous_streak: previous,
      recoverable_streak: streak.recoverable_streak,
      passed,
      attempts,
    },
  ];
}

/** apply_placement, as the migration writes it. */
function applyPlacement(args: {
  p_round_id?: string | null;
  p_through_order: number;
  p_passed_form_ids?: string[];
  p_failed_form_ids?: string[];
}) {
  const through = args.p_through_order;
  const unitOrder = new Map((tables.units ?? []).map((u) => [u.id as string, Number(u.course_order)]));
  let skipped = 0;
  for (const l of tables.lessons ?? []) {
    if ((unitOrder.get(l.unit_id as string) ?? Infinity) >= through) continue;
    if (tables.lesson_progress.some((p) => p.lesson_id === l.id && p.user_id === STUDENT)) continue;
    tables.lesson_progress.push({
      user_id: STUDENT,
      lesson_id: l.id,
      completed_at: new Date().toISOString(),
      score: null,
      attempts: 0,
      passed: true,
      passed_by: 'placement',
    });
    skipped += 1;
  }
  const passed = new Set(args.p_passed_form_ids ?? []);
  const failed = new Set(args.p_failed_form_ids ?? []);
  const spread = (id: string, from: number, span: number) =>
    from + ([...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % span);
  let scheduled = 0;
  for (const f of tables.form_entries ?? []) {
    if (f.is_glue || f.pos === 'propn' || Number(f.unit_order) >= through) continue;
    if (tables.form_states.some((st) => st.form_id === f.id && st.user_id === STUDENT)) continue;
    const id = f.id as string;
    const miss = failed.has(id);
    const days = miss ? 0 : passed.has(id) ? spread(id, 3, 8) : spread(id, 1, 7);
    tables.form_states.push({
      id: uuid(),
      form_id: id,
      user_id: STUDENT,
      state: miss ? 'learning' : 'review',
      ease_factor: 2.5,
      interval_days: miss ? 0 : passed.has(id) ? 7 : 3,
      repetitions: 1,
      lapses: 0,
      due_at: hoursFromNow(24 * days),
      introduced_on: day(0),
      updated_at: new Date().toISOString(),
    });
    scheduled += 1;
  }
  const profile = tables.profiles.find((p) => p.user_id === STUDENT);
  if (profile) profile.placed_through = Math.max(Number(profile.placed_through ?? 0), through - 1);
  return [{ lessons_skipped: skipped, forms_scheduled: scheduled }];
}

// --- the client ------------------------------------------------------------

export const demoClient = {
  from(table: string) {
    return {
      select: (columns?: string, opts?: { count?: string; head?: boolean }) => new Query(table).select(columns, opts),
      insert: (rows: Row | Row[]) => new Mutation(table, 'insert', rows),
      upsert: (rows: Row | Row[], opts?: { onConflict?: string }) => new Mutation(table, 'upsert', rows, opts?.onConflict),
      update: (patch: Row) => new Mutation(table, 'update', patch),
      delete: () => new Mutation(table, 'delete'),
    };
  },

  rpc(name: string, args: Record<string, unknown> = {}) {
    if (name === 'finish_lesson') {
      return Promise.resolve({ data: finishLesson(args as Parameters<typeof finishLesson>[0]), error: null });
    }
    if (name === 'staff_open_reports') {
      const groups = new Map<string, Row & { reports: number }>();
      for (const r of (tables.answer_reports ?? []).filter((x) => x.status === 'open')) {
        const k = `${r.sentence_id ?? ''}|${r.form_id ?? ''}|${r.answer_key}`;
        const g = groups.get(k) ?? { sentence_id: r.sentence_id ?? null, form_id: r.form_id ?? null, answer_key: r.answer_key, answer: r.answer, reports: 0, first_at: r.created_at };
        g.reports += 1;
        groups.set(k, g);
      }
      return Promise.resolve({ data: [...groups.values()].sort((a, b) => b.reports - a.reports), error: null });
    }
    if (name.startsWith('staff_')) return Promise.resolve({ data: [], error: null });
    if (name === 'apply_placement') {
      return Promise.resolve({ data: applyPlacement(args as Parameters<typeof applyPlacement>[0]), error: null });
    }
    return Promise.resolve({ data: null, error: { message: `demo: no rpc "${name}"` } });
  },

  auth: {
    getSession: async () => ({ data: { session: demoSession }, error: null }),
    signInWithPassword: async () => ({ data: { session: demoSession, user: demoSession.user }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },

  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },

  functions: {
    // "Why?" with no model behind it: the difference between her answer and the
    // sentence, said plainly — enough to see the panel work.
    invoke: async (name: string, opts?: { body?: Record<string, unknown> }) => {
      if (name !== 'explain-answer') return { data: null, error: null };
      const body = opts?.body ?? {};
      const sentence = (tables.sentences ?? []).find((x) => x.id === body.sentence_id);
      const form = (tables.form_entries ?? []).find((x) => x.id === body.form_id);
      const expected = (sentence?.es ?? form?.form ?? '') as string;
      return {
        data: {
          explanation: `The answer is *${expected}*. You wrote *${String(body.answer ?? '')}*. (Demo — the real explanation comes from the course model.)`,
        },
        error: null,
      };
    },
  },
};
