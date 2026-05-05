import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  streak: "che:streak",
  settings: "che:settings",
  sessions: "che:sessions",
  prompts: "che:recentPrompts",
  pushSubscription: "che:webPushSubscription",
} as const;

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearAll(): Promise<void> {
  await Promise.all(
    Object.values(StorageKeys).map((k) => AsyncStorage.removeItem(k))
  );
}
