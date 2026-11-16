import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// The welcome tour (components/welcome-tour.tsx): shown once, right after her
// first purchase, over the tabs. The paywall queues it; the tabs layout plays
// it the next time it is on screen, so a lesson opened straight after buying
// finishes first. Seen once, it never comes back by itself — only the admin
// replay (posta://admin/welcome-tour) starts it again.
// ---------------------------------------------------------------------------

const SEEN_KEY = 'posta.welcome-tour-seen';
const PENDING_KEY = 'posta.welcome-tour-pending';

/** Where the tab bar sits on screen, in window coordinates (components/tab-bar.tsx). */
export interface TabBarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Inner padding of the bar: the tabs share the width inside it. */
  pad: number;
  count: number;
}

let active = false;
/** A preview from the paywall's "Learn more": where to go back to, or null. */
let previewReturn: string | null = null;
let bar: TabBarRect | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** After a purchase: the tour waits for the tabs, unless she has seen it. */
export async function queueWelcomeTour(): Promise<void> {
  const seen = (await AsyncStorage.getItem(SEEN_KEY).catch(() => null)) === '1';
  if (seen) return;
  await AsyncStorage.setItem(PENDING_KEY, '1').catch(() => {});
  active = true;
  emit();
}

/** Staff replay: start it now, seen or not. */
export function startWelcomeTour(): void {
  active = true;
  emit();
}

/** From the paywall's "Learn more", before she has bought: the same tour
 *  over the real tabs (the hard-paywall gate steps aside while it plays), and
 *  finishing it goes back to `back`. It doesn't count as seen. */
export function startTourPreview(back: string): void {
  previewReturn = back;
  active = true;
  emit();
}

/** The paywall to go back to while a preview plays; null for the real tour. */
export function useTourPreview(): string | null {
  return useSyncExternalStore(subscribe, () => (active ? previewReturn : null));
}

const previewing = () => active && previewReturn != null;

/**
 * Whether a tab draws its default screen, reading nothing: while the "Learn
 * more" preview plays, Course stands on the first lesson, Speaking has Pancho
 * calling, and nothing of hers is fetched. A tab first opened by the preview
 * keeps it until it is next focused, so it doesn't start loading as the tour
 * fades out and the tabs are dismissed under it.
 */
export function useTabPreview(): boolean {
  const on = useSyncExternalStore(subscribe, previewing);
  const [born, setBorn] = useState(on);
  useFocusEffect(
    useCallback(() => {
      if (!previewing()) setBorn(false);
    }, []),
  );
  return on || born;
}

/** Finished or skipped: seen for good. A preview just ends. */
export function finishWelcomeTour(): void {
  active = false;
  if (previewReturn) {
    previewReturn = null;
    emit();
    return;
  }
  emit();
  void AsyncStorage.multiSet([
    [SEEN_KEY, '1'],
    [PENDING_KEY, '0'],
  ]).catch(() => {});
}

/** Whether the tour should be playing. A tour queued before the app was
 *  closed picks up again the next time the tabs mount. */
export function useWelcomeTourActive(): boolean {
  useEffect(() => {
    void AsyncStorage.getItem(PENDING_KEY)
      .then((v) => {
        if (v === '1' && !active) {
          active = true;
          emit();
        }
      })
      .catch(() => {});
  }, []);
  return useSyncExternalStore(subscribe, () => active);
}

/** Whether the tour is on screen right now, without picking up a queued one
 *  (the feedback bubble steps aside while it plays). */
export function useWelcomeTourOn(): boolean {
  return useSyncExternalStore(subscribe, () => active);
}

export function reportTabBar(rect: TabBarRect): void {
  if (bar && bar.x === rect.x && bar.y === rect.y && bar.width === rect.width && bar.height === rect.height) return;
  bar = rect;
  emit();
}

export function useTabBarRect(): TabBarRect | null {
  return useSyncExternalStore(subscribe, () => bar);
}
