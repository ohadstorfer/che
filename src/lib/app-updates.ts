import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { CRITICAL_INDEX } from '@/lib/ota-critical';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Over-the-air updates, from inside the app.
//
// On its own expo-updates downloads a new update while the app is open and
// only runs it the next time the app starts from cold — so an update shipped
// this morning can take two launches to show. This asks at launch instead.
//
// Two kinds of launch:
//
//  · Must wait — the first launch of a fresh install (she would otherwise meet
//    whatever onboarding the store build carried, months old from a mirror),
//    or an OTA marked critical (lib/ota-critical.ts). If an update is
//    available she waits for it on the splash, which stays up with a small
//    "Updating…" (components/updating-screen.tsx, Deel's way), and the app
//    restarts into it. At 25 s it goes on by itself, and the update lands on
//    the next launch.
//
//  · Everyone else — if the new update is down while the splash is still up,
//    restart into it right there; one that arrives later waits for the next
//    start, rather than restarting the app under her.
//
// No native config is involved (app.json is untouched), so the runtime
// fingerprint, and with it OTA delivery to the live builds, stays the same.
// ---------------------------------------------------------------------------

/** How long after the JS starts a fresh update may still restart the app. */
const RESTART_WITHIN_MS = 4000;
/** The must-wait cap: past this she goes on with the code she has. */
const WAIT_CAP_MS = 25000;
/** How long the server's critical number may take before we stop asking. */
const CRITICAL_ASK_MS = 3000;
const LAUNCHED_KEY = 'posta.ota.launched';

const startedAt = Date.now();

// --- the waiting state, for the splash and the updating screen ------------------

/**
 * idle     nothing to wait for (or not decided yet, on an ordinary launch)
 * checking a must-wait launch is asking whether there is an update
 * waiting  there is one and it is downloading: the splash stays, with "Updating…"
 */
export type UpdatePhase = 'idle' | 'checking' | 'waiting';
let phase: UpdatePhase = 'idle';
const listeners = new Set<() => void>();
function setPhase(next: UpdatePhase) {
  if (phase === next) return;
  phase = next;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useUpdatePhase = () => useSyncExternalStore(subscribe, () => phase, () => phase);

// --- deciding ---------------------------------------------------------------------

const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T) =>
  Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

async function firstLaunch(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(LAUNCHED_KEY)) === null;
  } catch {
    return false;
  }
}
const markLaunched = () => AsyncStorage.setItem(LAUNCHED_KEY, '1').catch(() => {});

/** The server's critical number is above the one this code was built with. */
async function criticalPending(): Promise<boolean> {
  const ask = (async () => {
    const { data } = await supabase.from('app_config').select('value').eq('key', 'ota_critical').maybeSingle();
    const n = typeof data?.value === 'number' ? data.value : Number(data?.value);
    return Number.isFinite(n) && n > CRITICAL_INDEX;
  })().catch(() => false);
  return withTimeout(ask, CRITICAL_ASK_MS, false);
}

// --- the launch ---------------------------------------------------------------------

let asked = false;

export function applyUpdateOnLaunch() {
  if (asked || __DEV__ || Platform.OS === 'web') return;
  asked = true;
  void (async () => {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled) return;

    // A fresh install holds the splash while we ask; a critical update is
    // only known once the server answers, so it can't hold the splash's start.
    const first = await firstLaunch();
    if (first) setPhase('checking');
    const critical = criticalPending().then((c) => {
      if (c) setPhase(phase === 'idle' ? 'checking' : phase);
      return c;
    });

    const check = await Updates.checkForUpdateAsync();
    const mustWait = first || (await critical);
    if (!check.isAvailable) {
      // Already on the newest: nothing to wait for, now or on later launches.
      await markLaunched();
      setPhase('idle');
      return;
    }

    if (!mustWait) {
      const fetched = await Updates.fetchUpdateAsync();
      if (!fetched.isNew || Date.now() - startedAt > RESTART_WITHIN_MS) return;
      await Updates.reloadAsync();
      return;
    }

    setPhase('waiting');
    const fetched = await withTimeout(
      Updates.fetchUpdateAsync().catch(() => null),
      WAIT_CAP_MS,
      null,
    );
    // The cap passed: she goes on, and the download (still running) is there
    // for the next launch.
    if (phase !== 'waiting' || !fetched?.isNew) {
      setPhase('idle');
      return;
    }
    await markLaunched();
    await Updates.reloadAsync();
  })().catch(() => {
    // No network, or a check already under way: go on; the next launch asks again.
    setPhase('idle');
  });
}

/**
 * What she is running, for the account screen: the store build and, when one
 * is running, the update on top of it — "1.0.0 (8) · update Oct 24, 3f9a2c1d".
 * The one way to tell, from the phone itself, whether an update has arrived.
 */
export async function versionLabel(): Promise<string> {
  const build = `${Application.nativeApplicationVersion ?? '?'} (${Application.nativeBuildVersion ?? '?'})`;
  if (Platform.OS === 'web') return build;
  try {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled || Updates.isEmbeddedLaunch || !Updates.updateId) return `${build} · built in`;
    const when = Updates.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '';
    return `${build} · update ${when}, ${Updates.updateId.slice(0, 8)}`;
  } catch {
    return build;
  }
}
