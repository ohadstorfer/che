import type { StreakState } from "@/types/exercise";

export const emptyStreak: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
};

export function todayLocalISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  const ms = db.getTime() - da.getTime();
  return Math.round(ms / 86_400_000);
}

export function recordSessionCompletion(
  prev: StreakState,
  now = new Date()
): { state: StreakState; isFirstToday: boolean; bumped: boolean } {
  const today = todayLocalISO(now);

  if (prev.lastPracticeDate === today) {
    return { state: prev, isFirstToday: false, bumped: false };
  }

  let nextStreak = 1;
  if (prev.lastPracticeDate) {
    const diff = daysBetween(prev.lastPracticeDate, today);
    nextStreak = diff === 1 ? prev.currentStreak + 1 : 1;
  }

  const state: StreakState = {
    currentStreak: nextStreak,
    longestStreak: Math.max(prev.longestStreak, nextStreak),
    lastPracticeDate: today,
  };
  return { state, isFirstToday: true, bumped: nextStreak > prev.currentStreak };
}

export function reconcileStreak(
  prev: StreakState,
  now = new Date()
): StreakState {
  if (!prev.lastPracticeDate) return prev;
  const diff = daysBetween(prev.lastPracticeDate, todayLocalISO(now));
  if (diff > 1) {
    return { ...prev, currentStreak: 0 };
  }
  return prev;
}
