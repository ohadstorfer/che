import { Platform } from 'react-native';
import { enableNativePush, getNativePushStatus } from './native-push';
import { supabase } from './supabase';

// Web Push in the browser and the installed PWA; on iOS and Android the native
// app registers an Expo push token instead (native-push.native.ts). Both land
// in push_subscriptions and the edge function sends to each its own way.
export type PushStatus = 'unsupported' | 'needs_install' | 'denied' | 'enabled' | 'off';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const supported = () =>
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  typeof window !== 'undefined' &&
  'PushManager' in window &&
  'Notification' in window;

// On iOS, web push only works when the page runs as an installed home-screen
// app (standalone display mode).
function iosNeedsInstall(): boolean {
  if (typeof navigator === 'undefined') return false;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone =
    (navigator as { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches;
  return isIos && !standalone;
}

export async function getPushStatus(): Promise<PushStatus> {
  if (Platform.OS !== 'web') return getNativePushStatus();
  if (!supported()) return iosNeedsInstall() ? 'needs_install' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  if (Notification.permission !== 'granted') return 'off';
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'enabled' : 'off';
}

export async function enablePush(userId: string): Promise<PushStatus> {
  if (Platform.OS !== 'web') return enableNativePush(userId);
  if (!supported()) return iosNeedsInstall() ? 'needs_install' : 'unsupported';

  const vapid = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) throw new Error('Falta EXPO_PUBLIC_VAPID_PUBLIC_KEY');

  const reg = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as ArrayBuffer,
    }));

  const json = sub.toJSON();
  if (!json.endpoint || !json.keys) return 'off';
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      kind: 'web',
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw error;
  return 'enabled';
}

// Fire-and-forget notification events sent to the edge function.
export function notifyEvent(
  kind: 'new_words' | 'session_completed' | 'leech',
  extra: object = {},
) {
  supabase.functions.invoke('push', { body: { kind, ...extra } }).catch(() => {});
}
