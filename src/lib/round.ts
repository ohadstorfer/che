import { useCallback, useRef } from 'react';

import type { Note } from './answers';
import { localDateStr } from './dates';
import { type TestAnswer } from './placement';
import { recordShown, DEFAULT_LADDER, glueSeen, type Ladder } from './sentences';
import { type SessionItem, earnedTail, promoteTail } from './session';
import { initialEase, schedule } from './srs';
import { supabase } from './supabase';
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
}

/** A missed form comes back later in the round, at most this many times. */
export const MAX_RETRIES = 2;

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
  /** The round's own row. Logs reference it, so they wait for it to land. */
  const ready = useRef<PromiseLike<unknown>>(Promise.resolve());

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
        ready.current = supabase
          .from('rounds')
          .insert({
            id: roundId.current,
            user_id: userId,
            kind: opts.kind,
            lesson_id: opts.lessonId ?? null,
            local_date: localDateStr(),
            planned_items: opts.queue.filter((i) => graded(i)).length,
            ladder_offset: ladder.current.offset,
          })
          .then(
            () => {},
            () => {},
          );
        supabase
          .from('daily_sessions')
          .upsert(
            { user_id: userId, session_date: localDateStr(), total_cards: opts.queue.length },
            { onConflict: 'user_id,session_date' },
          )
          .then(() => {});
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
      const { data } = await supabase
        .from('form_states')
        .upsert(
          {
            form_id: form.id,
            user_id: userId,
            state: 'learning',
            ease_factor: initialEase(form),
            due_at: new Date().toISOString(),
            introduced_on: localDateStr(),
          },
          { onConflict: 'form_id,user_id' },
        )
        .select()
        .single();
      if (data) liveStates.current.set(form.id, data as FormState);
    },
    [userId],
  );

  const hasState = (formId: string) => liveStates.current.has(formId);

  // Commits SM-2 for a form once nothing else in the queue drills it.
  const commitIfDone = (formId: string) => {
    if (!userId) return;
    if ((pending.current.get(formId) ?? 0) > 0) return;
    const tally = results.current.get(formId);
    const state = liveStates.current.get(formId);
    if (!tally || !state) return;

    const wrongs = tally.wrongs + Math.min(1, tally.promotedWrongs);
    const unscheduled = fillerForms.current.has(formId);
    const log = (rating: Rating, next: Partial<FormState> | null) =>
      !live.current
        ? undefined
        : ready.current.then(() => supabase
        .from('srs_commits')
        .insert({
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
        })
        .then(() => {}));

    // A form SM-2 did not ask for today keeps its schedule when she gets it
    // right: passing a word early says little. Getting it wrong is different —
    // a word she was supposed to hold and couldn't is a lapse, whatever the day.
    if (unscheduled && wrongs === 0) {
      log(2, null);
      return;
    }

    // Flawless is "bien"; "fácil" is reserved for a passed typing exercise. One
    // slip is "difícil"; two or more resets the form. A peek at its meaning
    // caps it at "difícil".
    let rating: Rating = unscheduled ? 0 : wrongs === 0 ? (tally.typed ? 3 : 2) : wrongs === 1 ? 1 : 0;
    if (tally.hinted && rating > 1) rating = 1;

    const next = schedule(state, rating);
    liveStates.current.set(formId, { ...state, ...next });
    log(rating, next);
    if (!live.current) return;
    supabase
      .from('form_states')
      .update({ ...next, updated_at: new Date().toISOString() })
      .eq('id', state.id)
      .then(() => {});
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
        supabase
          .from('daily_sessions')
          .update({ sentence_screens: sentenceScreens.current, sentence_fails: sentenceFails.current })
          .eq('user_id', userId)
          .eq('session_date', localDateStr())
          .then(() => {});
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
        if (rows.length && live.current) ready.current.then(() => supabase.from('review_logs').insert(rows).then(() => {}));
      }

      if (item.placementUnit) {
        testAnswers.current.push({
          unitId: item.placementUnit,
          correct: wrong.size === 0,
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
        } else if (item.mode === 'typing') tally.typed = true;
        if (hinted.has(form.id)) tally.hinted = true;
        results.current.set(form.id, tally);
      }

      const retryItems: QueueItem[] = !allowRetries.current
        ? []
        : [...wrong]
            .map((id) => drilled.find((c) => c.id === id))
            .filter((c): c is Form => !!c)
            .filter((form) => (retries.current.get(form.id) ?? 0) < MAX_RETRIES)
            .map((form) => {
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
          supabase.from('rounds').update({ promoted: promoted.promoted }).eq('id', roundId.current).then(() => {});
        }
      }
      return next;
    },
    [userId, createState],
  );

  /** Records the round, credits the day, and (for a lesson) moves the path. */
  const finish = useCallback(async (): Promise<FinishResult | null> => {
    const { answered, wrong } = firstTries.current;
    if (!live.current) return null;
    await ready.current;
    const { data, error } = await supabase.rpc('finish_lesson', {
      p_local_date: localDateStr(),
      p_lesson_id: lessonRef.current,
      p_score: answered > 0 ? Math.round((100 * (answered - wrong)) / answered) : null,
      p_round_id: roundId.current || null,
      p_answered: answered,
      p_first_try_wrong: wrong,
      p_retries: retriesGranted.current,
    });
    if (error) console.warn('finish_lesson failed', error);
    return ((data as FinishResult[] | null)?.[0] ?? null) as FinishResult | null;
  }, []);

  const score = () => {
    const { answered, wrong } = firstTries.current;
    return answered > 0 ? Math.round((100 * (answered - wrong)) / answered) : null;
  };

  return {
    begin,
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
