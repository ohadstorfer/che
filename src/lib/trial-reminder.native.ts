// The reminder the paywall promises: two days before a free trial turns into
// a charge, a local notification says so. Asking for permission here is the
// one moment it is obviously in her interest.
//
// Metro picks this file on native and trial-reminder.ts on web.

import * as Notifications from 'expo-notifications';

export async function scheduleTrialReminder(trialDays: number): Promise<void> {
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return;
    const at = new Date(Date.now() + Math.max(1, trialDays - 2) * 86400000);
    at.setHours(10, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your free trial ends in 2 days',
        body: 'Keep your plan going, or cancel in Settings before it renews. No hard feelings.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch {
    // A missed reminder must never get in the way of the purchase itself.
  }
}
