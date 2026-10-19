import { usePathname } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
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
 * Session replay and screen views. Nothing is masked: what she types is her
 * Spanish, which is the point of watching. Sign-in goes through Apple and
 * Google, so no password or email is ever typed into the app.
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
      }}>
      {children}
    </PostHogProvider>
  );
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
