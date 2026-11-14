// Web: no notifications to tap. See notification-taps.native.ts.
export function listenForNotificationTaps(_capture: (event: string, props: Record<string, string | number | boolean | null>) => void): () => void {
  return () => {};
}
