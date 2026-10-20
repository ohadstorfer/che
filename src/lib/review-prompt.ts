import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// The store's own "Enjoying Posta?" sheet, asked for at one happy moment: she
// has just passed a unit check and is back on the course with the next unit
// open. Apple and Google cap how often the sheet really shows (and may show
// nothing), so these rules only keep us from spending the asks badly.
// ---------------------------------------------------------------------------

const KEY = 'che.review-asked';
/** Not more often than this, whatever the version. */
const MIN_GAP_MS = 60 * 24 * 60 * 60 * 1000;
/** Not in her first days: she hasn't lived with the app yet. */
const MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000;
/** Lets the course settle in before the sheet slides over it. */
const ASK_DELAY_MS = 800;

interface Asked {
  at: number;
  version: string | null;
}

/**
 * Asks for a store review if it's time: never on the web, not for an account
 * under 3 days old, once per app version and at most every 60 days. Never
 * throws — a review that can't be asked for is simply not asked for.
 */
export async function maybeAskForReview(accountCreatedAt: string | undefined): Promise<void> {
  if (Platform.OS === 'web' || !accountCreatedAt) return;
  try {
    const since = Date.parse(accountCreatedAt);
    if (!Number.isFinite(since) || Date.now() - since < MIN_ACCOUNT_AGE_MS) return;

    const version = Constants.expoConfig?.version ?? null;
    const raw = await AsyncStorage.getItem(KEY);
    const last = raw ? (JSON.parse(raw) as Asked) : null;
    if (last && (last.version === version || Date.now() - last.at < MIN_GAP_MS)) return;

    if (!(await StoreReview.isAvailableAsync())) return;
    // Written first: a sheet the store chose not to show still counts as asked.
    await AsyncStorage.setItem(KEY, JSON.stringify({ at: Date.now(), version } satisfies Asked));
    await new Promise((r) => setTimeout(r, ASK_DELAY_MS));
    await StoreReview.requestReview();
  } catch {
    // Storage or the store said no; there's always the next unit.
  }
}
