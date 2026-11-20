import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// The admin is previewing a learner's screen (the paywall, the onboarding)
// from the admin dashboard. While this is on, AdminExit draws an X over every
// screen outside /admin that goes straight back to the dashboard, even where
// the learner has no way out (the hard paywall). In memory only: an app
// restart ends it.
// ---------------------------------------------------------------------------

let previewing = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function startAdminPreview() {
  previewing = true;
  emit();
}

export function endAdminPreview() {
  previewing = false;
  emit();
}

export function useAdminPreview(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => previewing,
  );
}
