import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function isNative(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}
export function isWeb(): boolean {
  return Platform.OS === "web";
}

export async function ensurePermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export type RegisterResult =
  | { ok: true; token: string; platform: "ios" | "android" | "web" }
  | { ok: false; reason: string };

export async function getExpoPushToken(): Promise<RegisterResult> {
  if (!Device.isDevice && Platform.OS !== "web") {
    return { ok: false, reason: "Las notificaciones requieren un dispositivo real" };
  }
  if (Platform.OS === "web") {
    return { ok: false, reason: "web-no-expo-push" };
  }
  const granted = await ensurePermission();
  if (!granted) return { ok: false, reason: "Permiso denegado" };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Recordatorios",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2E5A88",
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

  try {
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return {
      ok: true,
      token: tokenResp.data,
      platform: Platform.OS === "ios" ? "ios" : "android",
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "no se pudo obtener token",
    };
  }
}

export async function registerPushSubscription(args: {
  userId: string;
  reminderTime: string;
  notificationsEnabled: boolean;
}): Promise<RegisterResult> {
  const tokenRes = await getExpoPushToken();
  if (!tokenRes.ok) return tokenRes;

  const tz = resolveTz();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: args.userId,
      expo_push_token: tokenRes.token,
      platform: tokenRes.platform,
      reminder_time: args.reminderTime,
      timezone: tz,
      notifications_enabled: args.notificationsEnabled,
    },
    { onConflict: "expo_push_token" }
  );
  if (error) return { ok: false, reason: error.message };
  return tokenRes;
}

export async function updateSubscription(args: {
  userId: string;
  reminderTime?: string;
  notificationsEnabled?: boolean;
}): Promise<{ ok: boolean; reason?: string }> {
  const patch: Record<string, unknown> = {};
  if (args.reminderTime !== undefined) patch.reminder_time = args.reminderTime;
  if (args.notificationsEnabled !== undefined) {
    patch.notifications_enabled = args.notificationsEnabled;
  }
  patch.timezone = resolveTz();
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase
    .from("push_subscriptions")
    .update(patch)
    .eq("user_id", args.userId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function disableAllSubscriptions(userId: string): Promise<void> {
  await supabase
    .from("push_subscriptions")
    .update({ notifications_enabled: false })
    .eq("user_id", userId);
}

export async function scheduleLocalWebReminder(time: string): Promise<boolean> {
  if (!isWeb() || typeof window === "undefined") return false;
  if (typeof Notification === "undefined") return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  const handle = (window as unknown as { __cheReminder?: number }).__cheReminder;
  if (handle) window.clearTimeout(handle);
  const next = nextOccurrence(time);
  const ms = next.getTime() - Date.now();
  const id = window.setTimeout(() => {
    new Notification("Che", {
      body: "Hora de practicar tu español 💪",
      icon: "/icon-192.png",
    });
    scheduleLocalWebReminder(time);
  }, ms);
  (window as unknown as { __cheReminder?: number }).__cheReminder = id;
  return true;
}

export function clearLocalWebReminder(): void {
  if (!isWeb() || typeof window === "undefined") return;
  const handle = (window as unknown as { __cheReminder?: number }).__cheReminder;
  if (handle) {
    window.clearTimeout(handle);
    (window as unknown as { __cheReminder?: number }).__cheReminder = undefined;
  }
}

function nextOccurrence(time: string): Date {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 19, Number.isFinite(m) ? m : 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function resolveTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
