import { localDateStr } from '@/lib/dates';
import type { Streak } from '@/lib/types';

// ---------------------------------------------------------------------------
// What the streak row means today.
//
// The row itself is written lazily — nothing touches it on the day she skips —
// so its meaning depends on how old `last_practice_date` is:
//
//   alive       practised today or yesterday; the count is simply true.
//   frozen      the run outlived its last practice day. The row still holds
//               the old count (nothing has reset it yet), which is exactly the
//               number the header shows struck through.
//   recovering  she came back and finished a round: the old run sits banked
//               in `recoverable_streak` until midnight, and one more round buys
//               it back (finish_lesson in the course schema migration).
//   none        nothing to say — no run, and no run to mourn.
// ---------------------------------------------------------------------------
export type StreakStatus =
  | { kind: 'none' }
  | { kind: 'alive'; days: number }
  | { kind: 'frozen'; lost: number }
  | { kind: 'recovering'; lost: number; days: number };

export function streakStatus(streak: Streak | null, today = localDateStr()): StreakStatus {
  if (!streak || !streak.last_practice_date) return { kind: 'none' };
  const last = streak.last_practice_date;

  if (last === today) {
    // `?? 0` so a row from before the course schema degrades to 'alive'.
    const banked = streak.recoverable_streak ?? 0;
    return banked > 0
      ? { kind: 'recovering', lost: banked, days: streak.current_streak }
      : { kind: 'alive', days: streak.current_streak };
  }
  if (last === dayBefore(today)) return { kind: 'alive', days: streak.current_streak };
  return streak.current_streak > 0 ? { kind: 'frozen', lost: streak.current_streak } : { kind: 'none' };
}

/** The local date one calendar day before a YYYY-MM-DD date. */
function dayBefore(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d - 1));
}
