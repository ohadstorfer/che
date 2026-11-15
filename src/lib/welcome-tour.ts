import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

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

/** Finished or skipped: seen for good. */
export function finishWelcomeTour(): void {
  active = false;
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

export function reportTabBar(rect: TabBarRect): void {
  if (bar && bar.x === rect.x && bar.y === rect.y && bar.width === rect.width && bar.height === rect.height) return;
  bar = rect;
  emit();
}

export function useTabBarRect(): TabBarRect | null {
  return useSyncExternalStore(subscribe, () => bar);
}
