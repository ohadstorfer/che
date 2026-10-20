import { usePathname } from 'expo-router';
import { PostHogMaskView, PostHogProvider, usePostHog } from 'posthog-react-native';
import { type ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/lib/auth';

// PostHog's project token is write-only — it can send events, never read
// them — so it ships in the app like the web snippet would.
const POSTHOG_KEY = 'phc_pzgRizNBQFYqGpGNfPWmmyNvUk8q4tpmUH36erQszE65';
const POSTHOG_HOST = 'https://us.i.posthog.com';

// Native only: replay needs the iOS/Android plugin, and the browser build is
// just for testing. Demo builds are screenshots, not learners.
const ENABLED = Platform.OS !== 'web' && process.env.EXPO_PUBLIC_DEMO !== '1';

/**
 * Session replay, screen views and JS errors. Lessons aren't masked: what she
 * types is her Spanish, which is the point of watching. Sign-in goes through
 * Apple and Google, so no password is ever typed into the app; her account and
 * the paywall are blanked out with HiddenFromReplay.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider
      apiKey={POSTHOG_KEY}
      // expo-router hides the NavigationContainer, so screens are sent by hand below.
      autocapture={{ captureScreens: false, captureTouches: true }}
      options={{
        host: POSTHOG_HOST,
        disabled: !ENABLED,
        enableSessionReplay: ENABLED,
        sessionReplayConfig: {
          maskAllTextInputs: false,
          maskAllImages: false,
          captureLog: true,
          captureNetworkTelemetry: true,
        },
        // Uncaught JS errors as $exception events (PostHog Error tracking), so
        // they sit next to the replay. Only sent while "exception autocapture"
        // is on in the project's settings. Promise rejections stay with Sentry
        // (lib/sentry.ts): Hermes keeps one rejection tracker, and the last to
        // register would take them away from Sentry.
        errorTracking: ENABLED ? { autocapture: { uncaughtExceptions: true, unhandledRejections: false } } : undefined,
      }}>
      {children}
    </PostHogProvider>
  );
}

/** A whole screen recorded as a blank box in replays: her account, what she pays. */
export function HiddenFromReplay({ children }: { children: ReactNode }) {
  return <PostHogMaskView style={{ flex: 1 }}>{children}</PostHogMaskView>;
}

/** Ties recordings to the signed-in learner (by id only) and names each screen. */
export function AnalyticsTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  // Not while her session is still being read, or every launch would start
  // a fresh anonymous person before she's recognised.
  useEffect(() => {
    if (!ENABLED || loading) return;
    if (userId) posthog.identify(userId);
    else posthog.reset();
  }, [posthog, userId, loading]);

  useEffect(() => {
    if (ENABLED) posthog.screen(pathname);
  }, [posthog, pathname]);

  return null;
}
