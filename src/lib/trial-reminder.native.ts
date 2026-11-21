// The reminder the paywall promises: two days before a free trial turns into
// a charge, a local notification says so. Asking for permission here is the
// one moment it is obviously in her interest.
//
// Metro picks this file on native and trial-reminder.ts on web.

import * as Notifications from 'expo-notifications';

/** One reminder per phone: scheduling it again replaces it, never doubles it. */
const ID = 'posta-trial-end';
const TITLE = 'Your free trial ends in 2 days';

/** `trialEnd`: when the store turns the trial into a charge (billing-shared trialEnd).
 *  `ask: false` (the launch's catch-up, premium.tsx) never opens the permission prompt. */
export async function scheduleTrialReminder(trialEnd: Date, { ask = true } = {}): Promise<void> {
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && ask) ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return;
    // Two days before the charge, at 10 in the morning; a trial too short for
    // that gets it the next morning instead.
    const at = new Date(trialEnd.getTime() - 2 * 86400000);
    at.setHours(10, 0, 0, 0);
    if (at.getTime() <= Date.now()) {
      at.setTime(Date.now() + 86400000);
      at.setHours(10, 0, 0, 0);
    }
    await Notifications.scheduleNotificationAsync({
      identifier: ID,
      content: {
        title: TITLE,
        body: 'Keep your plan going, or cancel in Settings before it renews. No hard feelings.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch {
    // A missed reminder must never get in the way of the purchase itself.
  }
}

/** Whether the reminder is already waiting on this phone. */
export async function trialReminderScheduled(): Promise<boolean> {
  const pending = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  // Before it had an id (up to 2026-11-20) it is known by its title.
  return pending.some((n) => n.identifier === ID || n.content.title === TITLE);
}
