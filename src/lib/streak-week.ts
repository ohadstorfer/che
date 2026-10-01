import { useEffect, useSyncExternalStore } from 'react';

import { weekDates } from './dates';
import { readSnapshot, writeSnapshot } from './snapshot';
import { supabase } from './supabase';
import type { Streak } from './types';

// ---------------------------------------------------------------------------
// Her streak row and this week's finished days — one copy for every tab.
//
// Each tab used to fetch its own on focus, so the chip sat as an empty ghost
// on every tab she opened. Now whoever loads it (Course, alongside the road,
// or any other tab on focus) publishes it here, every header reads it from
// here, and the last copy is kept on the phone so even a cold start opens with
// the count in place. The raw row is kept, not its status: what it means
// depends on today (streak.ts), and a copy from yesterday must be read as such.
// ---------------------------------------------------------------------------

export interface StreakWeek {
  streak: Streak | null;
  /** This week's completed days, as YYYY-MM-DD. */
  weekDone: string[];
}

let current: { userId: string; value: StreakWeek; fresh: boolean } | null = null;
const listeners = new Set<() => void>();
const hydrating = new Map<string, Promise<void>>();

const emit = () => listeners.forEach((l) => l());

export function publishStreakWeek(userId: string, value: StreakWeek) {
  current = { userId, value, fresh: true };
  writeSnapshot('streak-week', userId, value);
  emit();
}

/** The phone's copy, read once per user — only if nothing fresher has landed. */
export function hydrateStreakWeek(userId: string): Promise<void> {
  if (current?.userId === userId) return Promise.resolve();
  let p = hydrating.get(userId);
  if (!p) {
    p = readSnapshot<StreakWeek>('streak-week', userId).then((value) => {
      if (!value || current?.userId === userId) return;
      current = { userId, value, fresh: false };
      emit();
    });
    hydrating.set(userId, p);
  }
  return p;
}

export async function fetchStreakWeek(userId: string): Promise<StreakWeek> {
  const week = weekDates();
  const [streakRes, weekRes] = await Promise.all([
    supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle(),
    // Read off `daily_sessions` rather than derived from the streak: a week
    // with a hole in it still has to show the days on either side of it.
    supabase
      .from('daily_sessions')
      .select('session_date')
      .eq('user_id', userId)
      .gte('session_date', week[0])
      .lte('session_date', week[6])
      .not('completed_at', 'is', null),
  ]);
  const value: StreakWeek = {
    streak: (streakRes.data as Streak) ?? null,
    weekDone: (weekRes.data ?? []).map((r: { session_date: string }) => r.session_date),
  };
  publishStreakWeek(userId, value);
  return value;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The shared copy for her, or null until there is one. */
export function useStreakWeekValue(userId: string | undefined): StreakWeek | null {
  // The static web render has no copy; it hydrates as empty and fills after.
  const snap = useSyncExternalStore(subscribe, () => current, () => null);
  useEffect(() => {
    if (userId) void hydrateStreakWeek(userId);
  }, [userId]);
  return userId && snap?.userId === userId ? snap.value : null;
}
