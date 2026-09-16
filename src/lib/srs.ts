import { addDays, addMinutes } from './dates';
import type { FormState, Rating } from './types';

const DAY_MS = 86_400_000;

// SM-2 (Anki-flavored). Ratings: 0 otra vez, 1 difícil, 2 bien, 3 fácil.
// Nothing asks her to rate herself — practice.tsx derives the rating from a
// round's answers (flawless → bien; a passed typing exercise → fácil; one
// slip → difícil; two → otra vez).
//  - "Otra vez" resets repetitions, counts a lapse, and comes back in 10 min.
//  - First successful review → 1 day (4 days on "fácil"), second → 6 days,
//    then interval × ease factor. "Difícil" grows 1.2× and lowers ease;
//    "fácil" adds a 1.3× bonus and raises ease.
//  - A card answered before it falls due grows from the days that actually
//    passed, never shrinks, and can't raise its ease: passing a word two days
//    after seeing it says little about holding it for a month. Scoring early
//    rounds as full on-time passes compounded ×3 a time and sent words she'd
//    known for three weeks out to 2027.
//  - Intervals get a little fuzz, so words learned the same day drift apart
//    instead of falling due together forever.
export function schedule(
  state: Pick<FormState, 'state' | 'ease_factor' | 'interval_days' | 'repetitions' | 'lapses'> & {
    due_at?: string | null;
  },
  rating: Rating,
  now = new Date(),
) {
  let { ease_factor: ef, interval_days: interval, repetitions: reps, lapses } = state;

  if (rating === 0) {
    if (state.state === 'review') lapses += 1;
    ef = Math.max(1.3, ef - 0.2);
    return {
      state: 'learning' as const,
      ease_factor: ef,
      interval_days: 0,
      repetitions: 0,
      lapses,
      due_at: addMinutes(now, 10).toISOString(),
    };
  }

  const early = elapsedIfEarly(state, now);
  if (rating === 1) ef = Math.max(1.3, ef - 0.15);
  if (rating === 3 && early === null) ef = ef + 0.15;

  if (reps === 0) {
    interval = rating === 3 ? 4 : 1;
  } else if (reps === 1) {
    interval = rating === 1 ? 4 : rating === 3 ? 8 : 6;
  } else {
    const factor = rating === 1 ? 1.2 : rating === 3 ? ef * 1.3 : ef;
    interval =
      early === null
        ? Math.max(interval + 1, Math.round(interval * factor))
        : Math.max(interval, Math.round(early * factor));
  }
  interval = fuzz(interval);

  return {
    state: 'review' as const,
    ease_factor: ef,
    interval_days: interval,
    repetitions: reps + 1,
    lapses,
    due_at: addDays(now, interval).toISOString(),
  };
}

/** Days since the card was last scheduled, when it is answered before it falls
 *  due; null when it is on time (or still in learning). */
function elapsedIfEarly(
  state: { state: FormState['state']; interval_days: number; due_at?: string | null },
  now: Date,
): number | null {
  if (state.state !== 'review' || !state.due_at || state.interval_days < 1) return null;
  const due = new Date(state.due_at).getTime();
  if (now.getTime() >= due) return null;
  const last = due - state.interval_days * DAY_MS;
  return Math.max((now.getTime() - last) / DAY_MS, 0);
}

/** Anki-style fuzz: ±15% under a week, ±10% under three weeks, ±5% beyond, and
 *  at least a day either way. Short learning steps are left exact. */
function fuzz(days: number): number {
  if (days < 3) return days;
  const pct = days < 7 ? 0.15 : days < 21 ? 0.1 : 0.05;
  const spread = Math.max(1, Math.round(days * pct));
  return days + Math.floor(Math.random() * (2 * spread + 1)) - spread;
}

/** Whether new forms start with a morphology-based ease (learning-engine-spec
 *  §11.1). Off until the offline evaluation can say whether it helps. */
export const EASE_PRIOR = process.env.EXPO_PUBLIC_EASE_PRIOR === '1';

/**
 * The ease a new form starts with. Half-life regression on Duolingo's data
 * found gerunds, participles and irregular forms decay faster than the rest,
 * so with the prior on they start a little lower and grow more slowly.
 */
export function initialEase(
  form: { features?: { verb_form?: string; mood?: string; irregular?: boolean } },
  prior = EASE_PRIOR,
): number {
  if (!prior) return 2.5;
  const f = form.features ?? {};
  return f.verb_form === 'ger' || f.mood === 'imp' || f.irregular ? 2.3 : 2.5;
}
