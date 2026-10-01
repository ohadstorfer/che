import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { localKey, mergeEntries, pushSide, syncSide } from './side-progress';

// ---------------------------------------------------------------------------
// Argentine pack scores: the best and last share she got right on the first
// try, kept on the device and on her account (lib/side-progress.ts).
// ---------------------------------------------------------------------------

export interface PackScore {
  /** Percent right on the first try, the best she has done. */
  best: number;
  last: number;
  plays: number;
  /** When she last finished it (ms since epoch) — what "Keep going" follows. */
  at?: number;
}

/** A best score this high marks a pack mastered. */
export const MASTERED = 90;

const KEY = 'argentine:scores';

async function readLocal(key: string): Promise<Record<string, PackScore>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, PackScore>) : {};
  } catch {
    return {};
  }
}

async function readScores(): Promise<Record<string, PackScore>> {
  const key = await localKey(KEY);
  const local = await readLocal(key);
  const merged = await syncSide('pack', local).catch(() => null);
  if (!merged) return local;
  // Re-read so a round finished while the server answered isn't dropped.
  const all = mergeEntries(merged, await readLocal(key));
  try {
    await AsyncStorage.setItem(key, JSON.stringify(all));
  } catch {
    // Still shown this time; the next session syncs again.
  }
  return all;
}

/** Records a finished play and returns the pack's updated score. */
export async function savePackScore(slug: string, score: number): Promise<PackScore> {
  const all = await readScores();
  const had = all[slug];
  const next = { best: Math.max(had?.best ?? 0, score), last: score, plays: (had?.plays ?? 0) + 1, at: Date.now() };
  all[slug] = next;
  try {
    await AsyncStorage.setItem(await localKey(KEY), JSON.stringify(all));
  } catch {
    // A score is a convenience; the practice itself already happened.
  }
  pushSide('pack', slug, next);
  return next;
}

/** The last read, so the Words tab opens on it instead of on empty bars. */
let lastScores: Record<string, PackScore> | null = null;

/** Reads (and syncs) pack scores ahead of the tab opening. */
export function prefetchPackScores(): Promise<void> {
  return readScores().then((s) => {
    lastScores = s;
  });
}

/** Every pack's score, re-read whenever the screen comes back into focus. */
export function usePackScores() {
  const [scores, setScores] = useState<Record<string, PackScore>>(() => lastScores ?? {});
  useFocusEffect(
    useCallback(() => {
      void readScores().then((s) => {
        lastScores = s;
        setScores(s);
      });
    }, []),
  );
  return scores;
}

// ---------------------------------------------------------------------------
// Whether the 18+ packs show. Off until she turns it on, and remembered.
// ---------------------------------------------------------------------------

const ADULT_KEY = 'argentine:adult';

export function useShowAdult(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(ADULT_KEY)
        .then((v) => setOn(v === '1'))
        .catch(() => {});
    }, []),
  );
  const set = useCallback((next: boolean) => {
    setOn(next);
    AsyncStorage.setItem(ADULT_KEY, next ? '1' : '0').catch(() => {});
  }, []);
  return [on, set];
}
