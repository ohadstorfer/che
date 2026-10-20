import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
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

  // Where she installed from, once, after she is known (see installSource).
  useEffect(() => {
    if (ENABLED && !loading && userId) void sendInstallSource(posthog);
  }, [posthog, userId, loading]);

  return null;
}

const SOURCE_SENT = 'posta.install-source-sent';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

/**
 * Android only: the Play install referrer carries the utm_* of the link she
 * came through (postaspanish.com/get passes them on, see posta-site/get).
 * Sent once per install as `install_source`, and kept on her person as the
 * first touch ($set_once), so every later event can be split by channel.
 * A plain Play search reads utm_source=google-play&utm_medium=organic.
 * iOS gives an app nothing like it: App Store Connect counts those campaigns.
 */
async function sendInstallSource(posthog: ReturnType<typeof usePostHog>) {
  if (Platform.OS !== 'android') return;
  try {
    if (await AsyncStorage.getItem(SOURCE_SENT)) return;
    const raw = await Application.getInstallReferrerAsync();
    const params = new URLSearchParams(raw);
    const tags: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) tags[key] = value.slice(0, 80);
    }
    const first = Object.fromEntries(Object.entries(tags).map(([k, v]) => [`initial_${k}`, v]));
    posthog.capture('install_source', { ...tags, referrer: raw.slice(0, 200), $set_once: first });
    await AsyncStorage.setItem(SOURCE_SENT, '1');
  } catch {
    // No referrer (sideloaded, an emulator without Play): nothing to send, and
    // asked again next launch.
  }
}
