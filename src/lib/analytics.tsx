import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { usePathname } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { PostHogMaskView, PostHogProvider, usePostHog } from 'posthog-react-native';
import { type ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/lib/auth';
import { listenForNotificationTaps } from '@/lib/notification-taps';

// PostHog's project token is write-only — it can send events, never read
// them — so it ships in the app like the web snippet would.
const POSTHOG_KEY = 'phc_pzgRizNBQFYqGpGNfPWmmyNvUk8q4tpmUH36erQszE65';
const POSTHOG_HOST = 'https://us.i.posthog.com';

// Native only: replay needs the iOS/Android plugin, and the browser build is
// just for testing. Demo builds are screenshots, not learners. Dev builds
// (the simulator on Metro) are the founder testing, so they send nothing.
const ENABLED = Platform.OS !== 'web' && process.env.EXPO_PUBLIC_DEMO !== '1' && !__DEV__;

// The founder's own use isn't tracked at all: no replay, no events. Once he
// signs in on a phone it stays that way, signed out too. Read synchronously
// because PostHog only looks at enableSessionReplay and defaultOptIn at setup,
// and flags loading later can start a recording that was merely stopped.
const NOT_RECORDED_EMAIL = 'ohad.storfer@gmail.com';
const NOT_RECORDED_KEY = 'posta.not-recorded';

function notRecordedHere() {
  try {
    return SecureStore.getItem(NOT_RECORDED_KEY) === '1';
  } catch {
    return false;
  }
}

const NOT_RECORDED = notRecordedHere();
const REPLAY = ENABLED && !NOT_RECORDED;

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
        defaultOptIn: !NOT_RECORDED,
        enableSessionReplay: REPLAY,
        sessionReplayConfig: {
          maskAllTextInputs: false,
          maskAllImages: false,
          // Off on Android: there it is the whole device logcat (captureLogcat),
          // and on a chatty phone (MIUI) that is a lot of strings kept in the
          // Java heap. 2026-11-17 a Redmi ran out of its 256 MB a minute into
          // the first class, and that session's replay never arrived. iOS
          // keeps its console logs next to the replay.
          captureLog: Platform.OS !== 'android',
          captureNetworkTelemetry: true,
          // Android screenshots at half width and height: a quarter of the
          // pixels to encode, hold and upload per frame, still readable.
          screenshotScale: 0.5,
          // Android uploads replay on the same thread that queues it, so on a
          // slow connection new frames wait in memory: one every 2 s there,
          // half the backlog. iOS keeps the default 1 s.
          ...(Platform.OS === 'android' ? { throttleDelayMs: 2000 } : null),
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
  const email = session?.user.email;

  const isFounder = NOT_RECORDED || email === NOT_RECORDED_EMAIL;

  // The launch that finds out it's him: stop and opt out now, and never start
  // here again. Opted out, PostHog sends no events and starts no replay.
  useEffect(() => {
    if (!ENABLED || !isFounder) return;
    void posthog.stopSessionRecording();
    void posthog.optOut();
    void SecureStore.setItemAsync(NOT_RECORDED_KEY, '1').catch(() => {});
  }, [posthog, isFounder]);

  // Not while her session is still being read, or every launch would start
  // a fresh anonymous person before she's recognised. Never for him: reset()
  // would wipe PostHog's stored opt-out.
  useEffect(() => {
    if (!ENABLED || loading || isFounder) return;
    if (userId) posthog.identify(userId);
    else posthog.reset();
  }, [posthog, userId, loading, isFounder]);

  useEffect(() => {
    if (ENABLED && !isFounder) posthog.screen(pathname);
  }, [posthog, pathname, isFounder]);

  // Taps on our notifications, once she is known (the funnel row needs her id).
  useEffect(() => {
    if (!ENABLED || loading || !userId) return;
    return listenForNotificationTaps((event, props) => posthog.capture(event, props));
  }, [posthog, userId, loading]);

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
