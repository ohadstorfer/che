import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Snapshots — the last thing a screen showed her, kept on the phone so a cold
// start can paint it at once and refresh it quietly behind. Small, per user,
// and never the truth: whatever reads one still loads the real thing after.
// (Published content is kept by content-cache.ts; this is her own state.)
// ---------------------------------------------------------------------------

/** Bump when a snapshot's shape changes, so old ones are passed over. */
const FORMAT = 1;

const keyOf = (name: string, userId: string) => `snapshot:${FORMAT}:${name}:${userId}`;

export async function readSnapshot<T>(name: string, userId: string): Promise<T | null> {
  try {
    const text = await AsyncStorage.getItem(keyOf(name, userId));
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

export function writeSnapshot(name: string, userId: string, value: unknown) {
  AsyncStorage.setItem(keyOf(name, userId), JSON.stringify(value)).catch(() => {});
}
