import { useCallback, useRef } from 'react';

import type { Note } from './answers';
import { localDateStr } from './dates';
import { learnerChanged } from './learner-ready';
import { type TestAnswer } from './placement';
import { recordShown, DEFAULT_LADDER, glueSeen, type Ladder } from './sentences';
import { type SessionItem, earnedTail, promoteTail } from './session';
import { send, sendOnce, wakeOutbox, within, type Landed } from './outbox';
import { initialEase, schedule } from './srs';
import type { Form, FormState, Rating, Sentence } from './types';

// ---------------------------------------------------------------------------
// Scoring a round — shared by the practice screen and the story screen.
//
// A form is graded once, when the last exercise that drills it is answered, so
// one word seen from three angles still moves its schedule a single,
// well-informed step. Everything that happens is logged against the round
// (learning-engine-spec §1): each answer with its mode, latency and what she
// gave, and each scheduling decision with the state before and after.
// ---------------------------------------------------------------------------

export type QueueItem = SessionItem & { isIntro?: boolean; isRetry?: boolean };

export type RoundKind = 'lesson' | 'practice' | 'free' | 'mistakes' | 'story' | 'placement' | 'unit_check';

/** Forms an item drills — matching and sentences cover their whole group. */
export const formsOf = (item: QueueItem): Form[] => item.group ?? [item.form];

/** Whether an exercise counts towards a form's grade. Introductions — the
 *  plain screen and the sentence that stands in for it — do not, and neither
 *  does a tip, which asks nothing. */
export const graded = (item: QueueItem) =>
  !item.isIntro && item.mode !== 'sentence_intro' && item.mode !== 'tip';

/** What an exercise reports besides which forms were missed. */
export interface AnswerExtra {
  /** What she built or typed — logged when wrong or noted, and reportable. */
  answer?: string;
  /** Right, with a slip worth pointing out. */
  note?: Note;
  /** Forms whose meaning she peeked at in this exercise. */
  hinted?: string[];
  /** A test's credit for a wrong answer that was nearly right (0 to 1). */
  credit?: number;
}

/** A missed form comes back later in the round, at most this many times. */
export const MAX_RETRIES = 2;

/**
 * Re-asks a whole round may add. Each one is a screen past the planned 16, so
 * a shaky lesson tops out near 19 instead of running on to 25.
 */
export const MAX_ROUND_RETRIES = 3;

/**
 * The word a mistake brings back, if any: one per mistake, however many words
 * it got wrong — a tile build can miss four at once — and the exercise's own
 * word first, since that is what it was asking about. None once the round has
 * used its re-asks, or for a word already re-asked `MAX_RETRIES` times. The
 * words passed over still go to SRS as misses.
 */
export function pickRetry(
  item: { form: { id: string } },
  drilled: Form[],
  wrong: Set<string>,
  retriesOf: (formId: string) => number,
  granted: number,
): Form | undefined {
  if (granted >= MAX_ROUND_RETRIES) return undefined;
  const missed = drilled.filter((form) => wrong.has(form.id) && retriesOf(form.id) < MAX_RETRIES);
  return missed.find((form) => form.id === item.form.id) ?? missed[0];
}

/**
 * Whether this exercise made her spell this form out — what earns "fácil", the
 * rating that stretches an interval furthest.
 *
 * Typing a word on its own counts, and so does typing it into a sentence's
 * blank: the sentence hands her the grammar around the word, not the word, and
 * the letters still have to come from her. A typed gap credits every form of
 * its sentence, though, and she only typed one of them — the rest were read,
 * which is not the same thing and does not earn the same rating.
 */
export const typedHere = (item: QueueItem, form: Form) =>
  item.mode === 'typing' || (item.mode === 'sentence_gap_typed' && form.id === item.form.id);

/**
 * A brand-new word gets an intro screen right before its first exercise, so she
 * always meets it before being asked anything about it — unless a sentence
 * exercise is doing the introducing, in which case that is the meeting. A test
 * question never gets one: it is a test.
 */
export function withIntros(items: SessionItem[]): QueueItem[] {
  const out: QueueItem[] = [];
  const introduced = new Set<string>();
  for (const item of items) {
    if (item.introduces) introduced.add(item.introduces.id);
    const isNew = !item.group && item.state === null && item.mode !== 'tip' && !item.placementUnit;
    if (isNew && !introduced.has(item.form.id)) {
      introduced.add(item.form.id);
      out.push({ ...item, isIntro: true });
    }
    out.push(item);
  }
  return out;
}

interface Tally {
  attempts: number;
  /** Misses outside the adaptive tail. */
  wrongs: number;
  /** Misses on promoted exercises: together they count as at most one. */
  promotedWrongs: number;
  typed: boolean;
  hinted: boolean;
}

export interface BeginOptions {
  kind: RoundKind;
  lessonId?: string | null;
  queue: QueueItem[];
  scheduledFormIds: string[];
  sentences: Sentence[];
  ladder?: Ladder;
  /** Re-ask missed forms later in the round. Off for tests and stories. */
  retries?: boolean;
  /** Play without recording anything — the dashboard's lesson preview. */
  dryRun?: boolean;
  /** How many forms distractors come from — too few for a multiple choice
   *  makes a re-ask a true/false instead. */
  deckSize?: number;
}

export interface FinishResult {
  current_streak: number;
  previous_streak: number;
  recoverable_streak: number;
  passed: boolean;
  attempts: number | null;
}

/** How the end of a round went. `saved` false: the server couldn't be
 *  reached in time — the round is kept on the phone and goes up on its own
 *  (outbox.ts), and asking again waits for that same write. */
export interface FinishOutcome {
  result: FinishResult | null;
  saved: boolean;
}

/** How long a new word's row is waited for before the round goes on with its
 *  own copy (the row goes up behind it). */
const CREATE_WAIT_MS = 4000;
/** How long the end of a round is waited for before she is told it isn't
 *  saved yet. */
const FINISH_WAIT_MS = 15_000;

/** What writes to the same row share, so they land in the order made. */
export const roundKey = (id: string) => `round:${id}`;
const dayKey = (date: string) => `day:${date}`;
const formKey = (formId: string) => `form:${formId}`;

export function useRound(userId: string | undefined) {
  const roundId = useRef<string>('');
  const kind = useRef<RoundKind>('practice');
  const lessonRef = useRef<string | null>(null);
  const ladder = useRef<Ladder>(DEFAULT_LADDER);
  const allowRetries = useRef(true);
  const sentencesRef = useRef<Sentence[]>([]);
  const deckSize = useRef(0);
  /** False in a preview: nothing is written anywhere. */
  const live = useRef(true);

  const pending = useRef(new Map<string, number>());
  const results = useRef(new Map<string, Tally>());
  const liveStates = useRef(new Map<string, FormState>());
  const retries = useRef(new Map<string, number>());
  const retriesGranted = useRef(0);
  const fillerForms = useRef(new Set<string>());
  const sentenceScreens = useRef(0);
  const sentenceFails = useRef(0);
  /** First-attempt answers and how many went wrong — the round's score. */
  const firstTries = useRef({ answered: 0, wrong: 0 });
  const firstResults = useRef<boolean[]>([]);
  const promotedCount = useRef(0);
  const tailDone = useRef(false);
  const testAnswers = useRef<TestAnswer[]>([]);
  const missedForms = useRef(new Map<string, Form>());
  const shownAt = useRef(Date.now());
  /** The day the round counts on, fixed when it begins. */
  const day = useRef('');
  /** The round's end, once asked for: asking again waits for the same write. */
  const ending = useRef<Promise<Landed> | null>(null);

  const countPending = (items: QueueItem[]) => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (!graded(item)) continue;
      for (const form of formsOf(item)) map.set(form.id, (map.get(form.id) ?? 0) + 1);
    }
    return map;
  };

  const begin = useCallback(
    (opts: BeginOptions) => {
      if (!userId) return;
      roundId.current = randomId();
      kind.current = opts.kind;
      lessonRef.current = opts.lessonId ?? null;
      ladder.current = opts.ladder ?? DEFAULT_LADDER;
      allowRetries.current = opts.retries ?? true;
      sentencesRef.current = opts.sentences;
      deckSize.current = opts.deckSize ?? 4;
      live.current = !opts.dryRun;

      liveStates.current = new Map();
      for (const it of opts.queue) {
        if (it.state) liveStates.current.set(it.form.id, it.state);
        for (const s of it.groupStates ?? []) liveStates.current.set(s.form_id, s);
      }
      pending.current = countPending(opts.queue);
      results.current = new Map();
      retries.current = new Map();
      retriesGranted.current = 0;
      sentenceScreens.current = 0;
      sentenceFails.current = 0;
      firstTries.current = { answered: 0, wrong: 0 };
      firstResults.current = [];
      promotedCount.current = 0;
      tailDone.current = false;
      testAnswers.current = [];
      missedForms.current = new Map();
      shownAt.current = Date.now();
      day.current = localDateStr();
      ending.current = null;

      // Filler is what the round padded itself with, plus every word a sentence
      // carries that SM-2 didn't ask for today: drilled and logged, schedule
      // untouched.
      const scheduled = new Set(opts.scheduledFormIds);
      fillerForms.current = new Set([
        ...opts.queue.filter((it) => it.filler).map((it) => it.form.id),
        ...opts.queue
          .filter((it) => it.sentence)
          .flatMap((it) => formsOf(it).filter((c) => !scheduled.has(c.id)).map((c) => c.id)),
      ]);

      if (opts.queue.length > 0 && live.current) {
        // From here her records move with every answer.
        learnerChanged();
        // Logs reference the round's row, and finish_lesson counts a round
        // once only by it, so it is sent until it lands.
        void send(
          {
            kind: 'insert',
            table: 'rounds',
            rows: {
              id: roundId.current,
              user_id: userId,
              kind: opts.kind,
              lesson_id: opts.lessonId ?? null,
              local_date: day.current,
              planned_items: opts.queue.filter((i) => graded(i)).length,
              ladder_offset: ladder.current.offset,
            },
            duplicateOk: true,
          },
          { key: roundKey(roundId.current) },
        );
        void send(
          {
            kind: 'upsert',
            table: 'daily_sessions',
            rows: { user_id: userId, session_date: day.current, total_cards: opts.queue.length },
            onConflict: 'user_id,session_date',
          },
          { key: dayKey(day.current) },
        );
      }
    },
    [userId],
  );

  /** Call when a new exercise comes on screen, for its latency. */
  const shown = useCallback(() => {
    shownAt.current = Date.now();
  }, []);

  // A word she has just met gets its SRS state, so the exercises that follow
  // have something to grade.
  const createState = useCallback(
    async (form: Form) => {
      if (!userId) return;
      if (!live.current) {
        liveStates.current.set(form.id, {
          id: `preview-${form.id}`,
          form_id: form.id,
          user_id: userId,
          state: 'learning',
          ease_factor: initialEase(form),
          interval_days: 0,
          repetitions: 0,
          lapses: 0,
          due_at: new Date().toISOString(),
          introduced_on: localDateStr(),
        });
        return;
      }
      const now = new Date().toISOString();
      const fresh = {
        form_id: form.id,
        user_id: userId,
        state: 'learning' as const,
        ease_factor: initialEase(form),
        due_at: now,
        introduced_on: localDateStr(),
      };
      // The row as the server keeps it, when it answers in time. Otherwise
      // (no network, or a slow one) the round goes on with the same row as a
      // new one would be, and the write goes up behind it — her answers on
      // the word wait for it.
      const landed = await within(
        sendOnce(
          { kind: 'upsert', table: 'form_states', rows: fresh, onConflict: 'form_id,user_id', returning: true },
          { key: formKey(form.id) },
        ),
        CREATE_WAIT_MS,
      );
      const row = landed?.ok ? (landed.data as FormState | null) : null;
      // `updated_at` as the server would stamp it: a word's days count from it.
      const local: FormState & { updated_at: string } = {
        ...fresh,
        id: `local-${form.id}`,
        interval_days: 0,
        repetitions: 0,
        lapses: 0,
        updated_at: now,
      };
      liveStates.current.set(form.id, row ?? local);
    },
    [userId],
  );

  const hasState = (formId: string) => liveStates.current.has(formId);

  /** Items that join the round after it began — the next stage of an adaptive
   *  test. They are filler, like every test question: logged, never scheduled. */
  const extend = useCallback((items: QueueItem[]) => {
    for (const it of items) {
      if (it.state) liveStates.current.set(it.form.id, it.state);
      for (const s of it.groupStates ?? []) liveStates.current.set(s.form_id, s);
      for (const form of formsOf(it)) fillerForms.current.add(form.id);
    }
  }, []);

  // Commits SM-2 for a form once nothing else in the queue drills it.
  const commitIfDone = (formId: string) => {
    if (!userId) return;
    if ((pending.current.get(formId) ?? 0) > 0) return;
    const tally = results.current.get(formId);
    const state = liveStates.current.get(formId);
    if (!tally || !state) return;

    const wrongs = tally.wrongs + Math.min(1, tally.promotedWrongs);
    const unscheduled = fillerForms.current.has(formId);
    const log = (rating: Rating, next: Partial<FormState> | null) => {
      if (!live.current) return;
      void send(
        {
          kind: 'insert',
          table: 'srs_commits',
          rows: {
            user_id: userId,
            form_id: formId,
            round_id: roundId.current || null,
            seen: tally.attempts,
            wrong: wrongs,
            rating,
            scheduled: !unscheduled,
            elapsed_days: elapsedDays(state),
            prev_interval: state.interval_days,
            prev_ease: state.ease_factor,
            prev_due_at: state.due_at,
            prev_state: state.state,
            next_interval: next?.interval_days ?? state.interval_days,
            next_ease: next?.ease_factor ?? state.ease_factor,
            next_due_at: next?.due_at ?? state.due_at,
            next_state: next?.state ?? state.state,
          },
        },
        { needs: [roundKey(roundId.current)] },
      );
    };

    // A form SM-2 did not ask for today keeps its schedule when she gets it
    // right: passing a word early says little. Getting it wrong is different —
    // a word she was supposed to hold and couldn't is a lapse, whatever the day.
    if (unscheduled && wrongs === 0) {
      log(2, null);
      return;
    }

    // Flawless is "bien"; "fácil" is for a word she spelt out herself. One
    // slip is "difícil"; two or more resets the form. A peek at its meaning
    // caps it at "difícil".
    let rating: Rating = unscheduled ? 0 : wrongs === 0 ? (tally.typed ? 3 : 2) : wrongs === 1 ? 1 : 0;
    if (tally.hinted && rating > 1) rating = 1;

    const next = schedule(state, rating);
    liveStates.current.set(formId, { ...state, ...next });
    log(rating, next);
    if (!live.current) return;
    // By word, not by the row's id: a word met with no connection has no id
    // from the server yet.
    void send(
      {
        kind: 'update',
        table: 'form_states',
        values: { ...next, updated_at: new Date().toISOString() },
        match: { user_id: userId, form_id: formId },
      },
      { key: formKey(formId) },
    );
  };

  /**
   * Every exercise reports here. Returns the queue to continue with: the same
   * one, possibly with re-asks appended and its tail promoted.
   */
  const answer = useCallback(
    async (
      item: QueueItem,
      index: number,
      queue: QueueItem[],
      wrongFormIds: string[],
      extra: AnswerExtra = {},
    ): Promise<QueueItem[]> => {
      if (!userId) return queue;
      if (item.mode === 'tip') return queue;
      if (item.introduces && !liveStates.current.has(item.introduces.id)) {
        await createState(item.introduces);
      }
      const latency = Math.max(0, Date.now() - shownAt.current);

      if (item.sentence && live.current) {
        const passed = wrongFormIds.length === 0;
        recordShown(userId, item.sentence, passed);
        sentenceScreens.current += 1;
        if (!passed) sentenceFails.current += 1;
        void send(
          {
            kind: 'update',
            table: 'daily_sessions',
            values: { sentence_screens: sentenceScreens.current, sentence_fails: sentenceFails.current },
            match: { user_id: userId, session_date: day.current },
          },
          { key: dayKey(day.current) },
        );
      }

      const drilled = formsOf(item);
      const wrong = new Set(wrongFormIds);
      const hinted = new Set(extra.hinted ?? []);
      const noted = !!extra.note;

      {
        const rows = drilled.map((form) => ({
          user_id: userId,
          form_id: form.id,
          rating: wrong.has(form.id) ? 0 : 2,
          mode: item.mode,
          round_id: roundId.current || null,
          item_index: index,
          sentence_id: item.sentence?.id ?? null,
          direction: item.direction,
          correct: !wrong.has(form.id),
          is_retry: !!item.isRetry,
          promoted: !!item.promoted,
          hinted: hinted.has(form.id),
          note: extra.note ?? null,
          latency_ms: latency,
          answer: wrong.size > 0 || noted ? (extra.answer ?? null) : null,
        }));
        if (rows.length && live.current) {
          void send({ kind: 'insert', table: 'review_logs', rows }, { needs: [roundKey(roundId.current)] });
        }
      }

      if (item.placementUnit) {
        testAnswers.current.push({
          unitId: item.placementUnit,
          correct: wrong.size === 0,
          credit: wrong.size === 0 ? 1 : (extra.credit ?? 0),
          formIds: drilled.map((f) => f.id),
        });
      }

      if (!graded(item)) return queue;

      if (!item.isRetry) {
        firstTries.current.answered += 1;
        if (wrong.size > 0) firstTries.current.wrong += 1;
        firstResults.current.push(wrong.size === 0);
      }

      for (const form of drilled) {
        pending.current.set(form.id, Math.max((pending.current.get(form.id) ?? 1) - 1, 0));
        const tally = results.current.get(form.id) ?? {
          attempts: 0,
          wrongs: 0,
          promotedWrongs: 0,
          typed: false,
          hinted: false,
        };
        tally.attempts += 1;
        if (wrong.has(form.id)) {
          if (item.promoted) tally.promotedWrongs += 1;
          else tally.wrongs += 1;
          missedForms.current.set(form.id, form);
        } else if (typedHere(item, form)) tally.typed = true;
        if (hinted.has(form.id)) tally.hinted = true;
        results.current.set(form.id, tally);
      }

      const retry = allowRetries.current
        ? pickRetry(item, drilled, wrong, (id) => retries.current.get(id) ?? 0, retriesGranted.current)
        : undefined;
      const retryItems: QueueItem[] = !retry
        ? []
        : [retry].map((form) => {
              retries.current.set(form.id, (retries.current.get(form.id) ?? 0) + 1);
              retriesGranted.current += 1;
              return {
                form,
                state: liveStates.current.get(form.id) ?? null,
                mode: (deckSize.current >= 4 ? 'multiple_choice' : 'true_false') as QueueItem['mode'],
                direction: 'es_to_en' as const,
                isRetry: true,
              };
            });
      for (const retry of retryItems) {
        pending.current.set(retry.form.id, (pending.current.get(retry.form.id) ?? 0) + 1);
      }
      for (const form of drilled) commitIfDone(form.id);

      let next = retryItems.length ? [...queue, ...retryItems] : queue;

      // The adaptive tail: a clean start makes the rest of the round harder.
      if (!tailDone.current && earnedTail(firstResults.current, ladder.current) && kind.current !== 'placement') {
        tailDone.current = true;
        const promoted = promoteTail(next, index + 1, glueSeen(sentencesRef.current), ladder.current);
        next = promoted.queue;
        promotedCount.current = promoted.promoted;
        if (promoted.promoted > 0 && live.current) {
          void send(
            { kind: 'update', table: 'rounds', values: { promoted: promoted.promoted }, match: { id: roundId.current } },
            { key: roundKey(roundId.current) },
          );
        }
      }
      return next;
    },
    [userId, createState],
  );

  /** Records the round, credits the day, and (for a lesson) moves the path. */
  const finish = useCallback(async (): Promise<FinishOutcome> => {
    if (!live.current) return { result: null, saved: true };
    // The round's score is one of the things a class is built from.
    learnerChanged();
    if (!ending.current) {
      const { answered, wrong } = firstTries.current;
      const args = {
        // Fixed once: a retry after midnight still counts on the day she finished.
        p_local_date: localDateStr(),
        p_lesson_id: lessonRef.current,
        p_score: answered > 0 ? Math.round((100 * (answered - wrong)) / answered) : null,
        p_round_id: roundId.current || null,
        p_answered: answered,
        p_first_try_wrong: wrong,
        p_retries: retriesGranted.current,
      };
      // A dropped connection would lose the day without a word, so it is sent
      // until it lands. Only after the round's row has: finish_lesson counts a
      // round once by that row, so a call that landed and lost its answer
      // can't count twice (and buy back a frozen run on its own).
      ending.current = send(
        { kind: 'rpc', fn: 'finish_lesson', args },
        { needs: [roundKey(roundId.current), dayKey(day.current)] },
      );
    } else wakeOutbox();
    const landed = await within(ending.current, FINISH_WAIT_MS);
    if (!landed) return { result: null, saved: false };
    // Refused outright: asking again sends it anew.
    if (!landed.ok) {
      ending.current = null;
      return { result: null, saved: false };
    }
    return { result: ((landed.data as FinishResult[] | null)?.[0] ?? null) as FinishResult | null, saved: true };
  }, []);

  const score = () => {
    const { answered, wrong } = firstTries.current;
    return answered > 0 ? Math.round((100 * (answered - wrong)) / answered) : null;
  };

  return {
    begin,
    extend,
    shown,
    createState,
    hasState,
    answer,
    finish,
    score,
    roundId,
    testAnswers,
    missedForms,
  };
}

function elapsedDays(state: FormState): number | null {
  const last = (state as FormState & { updated_at?: string }).updated_at;
  if (!last) return null;
  return Math.max(0, (Date.now() - new Date(last).getTime()) / 86_400_000);
}

function randomId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const s = Array.from({ length: 32 }, hex).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-8${s.slice(17, 20)}-${s.slice(20)}`;
}
