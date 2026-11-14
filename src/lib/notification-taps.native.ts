import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { track } from './funnel';

// Every tap on one of our notifications, as `notification_opened` in
// funnel_events (ours, readable next to her account) and in PostHog. Which
// one: the free-week nudge, a team reply, or a practice reminder. A cold start
// from a tap is read from the last response; its id is kept on the phone so
// the same tap isn't counted again on later launches.
//
// Metro picks this file on native and notification-taps.ts on web.

const LAST_KEY = 'posta.last-notification-tap';

type Capture = (event: string, props: Record<string, string | number | boolean | null>) => void;

function kindOf(data: Record<string, unknown>): string {
  if (data.freeUnit === true) return 'free_unit';
  if (typeof data.feedback === 'string') return 'feedback';
  if (typeof data.url === 'string') return 'reminder';
  return 'other';
}

export function listenForNotificationTaps(capture: Capture): () => void {
  const open = async (r: Notifications.NotificationResponse | null) => {
    if (!r) return;
    const id = r.notification.request.identifier;
    try {
      if ((await AsyncStorage.getItem(LAST_KEY)) === id) return;
      await AsyncStorage.setItem(LAST_KEY, id);
    } catch {
      // Storage down: count it anyway.
    }
    const content = r.notification.request.content;
    const props = {
      kind: kindOf((content.data ?? {}) as Record<string, unknown>),
      title: (content.title ?? '').slice(0, 80),
    };
    track('notification_opened', props);
    capture('notification_opened', props);
  };
  const sub = Notifications.addNotificationResponseReceivedListener((r) => void open(r));
  Notifications.getLastNotificationResponseAsync()
    .then((r) => open(r))
    .catch(() => {});
  return () => sub.remove();
}
