import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Where supabase-js keeps the session on a phone: the Keychain (iOS) and the
 * Keystore (Android) through expo-secure-store, instead of AsyncStorage, a
 * plain file any backup or rooted phone can read.
 *
 * SecureStore warns past ~2 KB a value and a session with its user is bigger,
 * so a value is cut into chunks. The chunks of a write go under a new
 * generation and a pointer (`<key>.n` = "<gen>:<count>") is flipped to them
 * last, so a write cut short (the app killed mid-refresh) leaves the last
 * whole session readable, never a half-new one.
 *
 * Sessions saved by earlier builds are in AsyncStorage: the first read moves
 * one over and removes the old copy, so nobody is signed out by the update.
 * If the Keychain refuses a write, the value goes to AsyncStorage as before
 * rather than being lost (and a read looks there second).
 */

const CHUNK = 1800;
// Readable after the first unlock since boot, so a token refresh in the
// background still works; never synced to another device.
const OPTS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

const pointerKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, gen: number, i: number) => `${key}.g${gen}.${i}`;

function parsePointer(raw: string | null): { gen: number; count: number } | null {
  const m = raw?.match(/^(\d+):(\d+)$/);
  return m ? { gen: Number(m[1]), count: Number(m[2]) } : null;
}

async function readSecure(key: string): Promise<string | null> {
  const ptr = parsePointer(await SecureStore.getItemAsync(pointerKey(key), OPTS));
  if (!ptr) return null;
  const parts = await Promise.all(
    Array.from({ length: ptr.count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, ptr.gen, i), OPTS)),
  );
  if (parts.some((p) => p == null)) return null;
  return parts.join('');
}

async function removeGen(key: string, gen: number, count: number) {
  await Promise.all(
    Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, gen, i), OPTS).catch(() => {})),
  );
}

async function writeSecure(key: string, value: string) {
  const old = parsePointer(await SecureStore.getItemAsync(pointerKey(key), OPTS));
  const gen = old ? (old.gen + 1) % 2 : 0;
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK) parts.push(value.slice(i, i + CHUNK));
  for (let i = 0; i < parts.length; i++) await SecureStore.setItemAsync(chunkKey(key, gen, i), parts[i], OPTS);
  await SecureStore.setItemAsync(pointerKey(key), `${gen}:${parts.length}`, OPTS);
  if (old) await removeGen(key, old.gen, old.count);
}

async function removeSecure(key: string) {
  const old = parsePointer(await SecureStore.getItemAsync(pointerKey(key), OPTS));
  await SecureStore.deleteItemAsync(pointerKey(key), OPTS);
  if (old) await removeGen(key, old.gen, old.count);
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await readSecure(key);
      if (value != null) return value;
    } catch (e) {
      console.warn('secure-session: read failed', e);
    }
    // An earlier build's session (or a write the Keychain refused): moved over.
    const legacy = await AsyncStorage.getItem(key);
    if (legacy != null) {
      try {
        await writeSecure(key, legacy);
        await AsyncStorage.removeItem(key);
      } catch (e) {
        console.warn('secure-session: move failed', e);
      }
    }
    return legacy;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await writeSecure(key, value);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('secure-session: write failed, kept in AsyncStorage', e);
      await removeSecure(key).catch(() => {});
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    await removeSecure(key).catch((e) => console.warn('secure-session: remove failed', e));
    await AsyncStorage.removeItem(key);
  },
};
