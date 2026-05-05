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

export async function ensureSubscribed(args: {
  userId: string;
  reminderTime: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (isWeb()) {
    return await subscribeWebPush({
      userId: args.userId,
      reminderTime: args.reminderTime,
      notificationsEnabled: true,
    });
  }
  const res = await registerPushSubscription({
    userId: args.userId,
    reminderTime: args.reminderTime,
    notificationsEnabled: true,
  });
  if (res.ok) return { ok: true };
  return { ok: false, reason: res.reason };
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("notifications_enabled", true)
    .limit(1);
  if (!data || data.length === 0) return false;
  if (isWeb() && typeof Notification !== "undefined") {
    return Notification.permission === "granted";
  }
  return true;
}

export type WebPushResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function subscribeWebPush(args: {
  userId: string;
  reminderTime: string;
  notificationsEnabled: boolean;
}): Promise<WebPushResult> {
  if (!isWeb() || typeof window === "undefined") {
    return { ok: false, reason: "no-web" };
  }
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "Tu navegador no soporta notificaciones push" };
  }
  if (isIos() && !isStandalone()) {
    return {
      ok: false,
      reason: "Agregá la app a tu pantalla de inicio (Compartir → Agregar a inicio) y volvé a intentar.",
    };
  }

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "Permiso denegado" };

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const { data: keyData, error: keyErr } = await supabase.functions.invoke<{ publicKey: string }>(
    "vapid-public",
    { method: "GET" },
  );
  if (keyErr || !keyData?.publicKey) {
    return { ok: false, reason: "no se pudo obtener VAPID public key" };
  }
  const publicKey = keyData.publicKey;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, reason: "subscription incompleta" };
  }

  const tz = resolveTz();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: args.userId,
      expo_push_token: null,
      platform: "web",
      web_push_endpoint: json.endpoint,
      web_push_p256dh: json.keys.p256dh,
      web_push_auth: json.keys.auth,
      reminder_time: args.reminderTime,
      timezone: tz,
      notifications_enabled: args.notificationsEnabled,
    },
    { onConflict: "web_push_endpoint" },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function unsubscribeWebPush(userId: string): Promise<void> {
  await supabase
    .from("push_subscriptions")
    .update({ notifications_enabled: false })
    .eq("user_id", userId)
    .not("web_push_endpoint", "is", null);
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  }
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navAny = window.navigator as unknown as { standalone?: boolean };
  return (
    navAny.standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function resolveTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
