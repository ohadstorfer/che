import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/lib/auth';

// A DSN can only send events into the project, never read them, so it ships
// in the app like PostHog's key does.
const SENTRY_DSN =
  'https://9d3ae56571da419ce312c39d1fef5450@o4512284734717952.ingest.us.sentry.io/4512284763881472';

// Same rule as analytics: the browser build is just for testing, and demo
// builds are screenshots, not learners.
const ENABLED = Platform.OS !== 'web' && process.env.EXPO_PUBLIC_DEMO !== '1';

// Called on import, before the first render, so a crash while the root
// layout mounts is still caught.
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: ENABLED,
  environment: __DEV__ ? 'development' : 'production',
  // Crashes and errors only; PostHog already covers screens and replays.
  tracesSampleRate: 0,
  sendDefaultPii: false,
});

/** Wraps the root layout so a render error that reaches the top is reported. */
export const wrapRoot = Sentry.wrap;

/** Ties crash reports to the signed-in learner, by id only. */
export function CrashReportUser() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  useEffect(() => {
    if (!ENABLED || loading) return;
    Sentry.setUser(userId ? { id: userId } : null);
  }, [userId, loading]);

  return null;
}
