// On the web a feedback push is shown and opened by the service worker
// (public/sw.js); there is nothing to listen for here. The phones listen in
// feedback-push.native.ts.

export type FeedbackPushData = { feedback: 'reply' } | { feedback: 'inbox'; user: string };

export function listenForFeedbackPush(_on: { opened: (d: FeedbackPushData) => void; received: () => void }) {
  return () => {};
}
