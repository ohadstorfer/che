import * as Application from 'expo-application';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Over-the-air updates, from inside the app.
//
// On its own expo-updates downloads a new update while the app is open and
// only runs it the next time the app starts from cold — so an update shipped
// this morning can take two launches to show, and "I opened it and nothing
// changed" is the normal first experience. This asks at launch instead, and if
// the new update is down while the launch splash is still up, restarts into it
// right there: one launch, and she sees it. One that arrives later is left for
// the next start, as before, rather than restarting the app under her.
// ---------------------------------------------------------------------------

/** How long after the JS starts a fresh update may still restart the app. */
const RESTART_WITHIN_MS = 4000;
const startedAt = Date.now();

let asked = false;

export function applyUpdateOnLaunch() {
  if (asked || __DEV__ || Platform.OS === 'web') return;
  asked = true;
  void (async () => {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled) return;
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return;
    const fetched = await Updates.fetchUpdateAsync();
    if (!fetched.isNew || Date.now() - startedAt > RESTART_WITHIN_MS) return;
    await Updates.reloadAsync();
  })().catch(() => {
    // No network, or a check already under way: the next launch asks again.
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
