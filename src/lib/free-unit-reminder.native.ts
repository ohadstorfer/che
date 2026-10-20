// The day after onboarding, with the hard paywall: the free week opens
// (free-unit.tsx), and a local notification says so — the account is still a
// guest's, with no address or push subscription of its own yet. It never asks
// for permission itself (the reminders screen in onboarding already did), and
// a purchase cancels it.
//
// Metro picks this file on native and free-unit-reminder.ts on web.

import * as Notifications from 'expo-notifications';

const ID = 'posta-free-unit';
/** A day, and a little: the server opens the week 23 hours after the account. */
const AFTER_MS = 24 * 60 * 60 * 1000;

export async function scheduleFreeUnitReminder(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    // Scheduled once: opening the paywall again doesn't push it later.
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    if (pending.some((n) => n.identifier === ID)) return;
    await Notifications.scheduleNotificationAsync({
      identifier: ID,
      content: {
        title: 'Try Posta free for a week',
        body: 'Your first unit and a chat with Pancho. No card needed.',
        data: { freeUnit: true },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + AFTER_MS) },
    });
  } catch {
    // A missed nudge must never get in the way of the paywall.
  }
}

export async function cancelFreeUnitReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => {});
}

let handled: string | null = null;

/** Tapping it (or cold-starting from it) opens the free week, once. */
export function listenForFreeUnitReminder(onOpen: () => void) {
  const open = (r: Notifications.NotificationResponse | null) => {
    if (!r || handled === r.notification.request.identifier) return;
    if ((r.notification.request.content.data as Record<string, unknown> | undefined)?.freeUnit !== true) return;
    handled = r.notification.request.identifier;
    onOpen();
  };
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
  return () => sub.remove();
}
