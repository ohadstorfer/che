import { Platform } from 'react-native';
import { enableNativePush, getNativePushStatus } from './native-push';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Reminders.
//
// The sending side already lives in Supabase and doesn't care what the app
// looks like: a pg_cron job calls the `send-reminder` edge function every 15
// minutes, and from 08:00 local it nudges every device of a learner who hasn't
// finished a round today — until `streaks.last_practice_date` becomes today,
// which `finish_lesson` writes. So this file has one job: get a device onto
// `push_subscriptions` in the shape that function reads.
//
// One row per device, one channel per row (a check constraint enforces it):
//   web     web_push_endpoint + web_push_p256dh + web_push_auth
//   native  expo_push_token
// ---------------------------------------------------------------------------

export type PushStatus = 'unsupported' | 'needs_install' | 'denied' | 'enabled' | 'off';

/** What `send-reminder` gates on is the fixed 08:00 start; the column is still
 *  required, and it's what the partner sync writes. */
export const REMINDER_TIME = '08:00';

export const deviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

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

/**
 * Enabled means all three: the browser allows notifications, it holds a push
 * subscription, and the server has that subscription switched on. Any one
 * missing and the reminders don't arrive — so any one missing reads as off,
 * and tapping the prompt again repairs whichever it was.
 */
export async function getPushStatus(): Promise<PushStatus> {
  if (Platform.OS !== 'web') return getNativePushStatus();
  if (!supported()) return iosNeedsInstall() ? 'needs_install' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  if (Notification.permission !== 'granted') return 'off';
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return 'off';
  const { data } = await supabase
    .from('push_subscriptions')
    .select('notifications_enabled')
    .eq('web_push_endpoint', sub.endpoint)
    .maybeSingle();
  return data?.notifications_enabled ? 'enabled' : 'off';
}

/** The server's VAPID public key — served by the `vapid-public` function, so
 *  the key lives in one place and rotating it needs no app release. */
async function vapidPublicKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ publicKey: string }>('vapid-public', {
    method: 'GET',
  });
  if (error || !data?.publicKey) throw new Error('No se pudo obtener la clave de notificaciones.');
  return data.publicKey;
}

export async function enablePush(userId: string): Promise<PushStatus> {
  if (Platform.OS !== 'web') return enableNativePush(userId);
  if (!supported()) return iosNeedsInstall() ? 'needs_install' : 'unsupported';

  // Asked first, inside the tap: Safari only shows the permission sheet for a
  // request that comes straight from a user gesture.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(await vapidPublicKey()) as unknown as ArrayBuffer,
    }));

  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'off';

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      platform: 'web',
      expo_push_token: null,
      web_push_endpoint: json.endpoint,
      web_push_p256dh: json.keys.p256dh,
      web_push_auth: json.keys.auth,
      reminder_time: REMINDER_TIME,
      timezone: deviceTimezone(),
      notifications_enabled: true,
    },
    { onConflict: 'web_push_endpoint' },
  );
  if (error) throw error;
  return 'enabled';
}

// ---------------------------------------------------------------------------
// Partner reminders — two linked accounts can switch on each other's
// reminders (partner_links + sync_partner_reminder). The link itself is set up
// in the database; the app only offers it once your own reminders are on.
// ---------------------------------------------------------------------------

export async function getPartnerId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('partner_links')
    .select('partner_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { partner_id: string }).partner_id;
}

/** Switches on the partner's reminders on every device they've registered.
 *  Returns how many devices that was — 0 means they haven't enabled any yet. */
export async function enablePartnerReminders(): Promise<number> {
  const { data, error } = await supabase.rpc('sync_partner_reminder', {
    p_reminder_time: REMINDER_TIME,
    p_enabled: true,
  });
  if (error) throw error;
  return (data as number | null) ?? 0;
}
