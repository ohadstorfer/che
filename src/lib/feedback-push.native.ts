import * as Notifications from 'expo-notifications';

import type { FeedbackPushData } from './feedback-push';

export type { FeedbackPushData } from './feedback-push';

// A reply from the team (or, on an admin's phone, a new message) arrives as a
// push from `feedback-notify` with `data.feedback` set. Arriving while the app
// is open, it refreshes the bubble's dot; tapped, it opens the chat. A cold
// start from the tap is read once from the last response, and never again.

let handled: string | null = null;

const dataOf = (n: Notifications.Notification): FeedbackPushData | null => {
  const d = n.request.content.data as Record<string, unknown> | undefined;
  if (d?.feedback === 'reply') return { feedback: 'reply' };
  if (d?.feedback === 'inbox' && typeof d.user === 'string') return { feedback: 'inbox', user: d.user };
  return null;
};

export function listenForFeedbackPush(on: { opened: (d: FeedbackPushData) => void; received: () => void }) {
  const open = (r: Notifications.NotificationResponse | null) => {
    if (!r || handled === r.notification.request.identifier) return;
    const d = dataOf(r.notification);
    if (!d) return;
    handled = r.notification.request.identifier;
    on.opened(d);
  };
  const received = Notifications.addNotificationReceivedListener((n) => {
    if (dataOf(n)) on.received();
  });
  const response = Notifications.addNotificationResponseReceivedListener(open);
  Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
  return () => {
    received.remove();
    response.remove();
  };
}
