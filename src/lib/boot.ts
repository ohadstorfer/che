import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// The launch — one signal: "the first screen is standing". Until it fires the
// launch splash stays up (components/boot-splash.tsx), so a cold start goes
// splash → finished screen, instead of through a title that turns into a
// pill, a ghost chip and a road that draws itself in pieces. Course fires it
// once its road is placed; the splash also lets go on its own after a few
// seconds, so a slow network never leaves her staring at it.
// ---------------------------------------------------------------------------

let ready = false;
const listeners = new Set<() => void>();

export function markBootReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useBootReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}
