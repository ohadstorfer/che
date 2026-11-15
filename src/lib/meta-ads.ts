// ---------------------------------------------------------------------------
// Meta (Facebook + Instagram) app events, so paid ads can be measured and
// optimized for installs → trial → subscription. See docs/meta-ads-funnel.md.
//
// NOT WIRED YET. This file needs a native store build before anything imports
// it: `react-native-fbsdk-next` is a native module (no Expo Go, no OTA). Steps,
// all in docs/meta-ads-funnel.md § "SDK":
//   1. npx expo install react-native-fbsdk-next
//   2. app.json plugin entry (appID, clientToken, displayName, scheme)
//   3. call metaAds.start() once at launch, and the three log calls below
//   4. new EAS build for Play (and App Store), never an OTA from this change
//
// Fire and forget, like funnel.ts: an ad signal lost is a gap in a count,
// never a reason to slow onboarding or the paywall. Demo builds send nothing.
// ---------------------------------------------------------------------------

import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';

const ENABLED = process.env.EXPO_PUBLIC_DEMO !== '1';

let started = false;

function safely(fn: () => void): void {
  if (!ENABLED || !started) return;
  try {
    fn();
  } catch {
    // The SDK never gets to break the app.
  }
}

export const metaAds = {
  /**
   * Once, at launch. Auto-init is off in app.json, so nothing reaches Meta
   * before this runs; the SDK then logs installs and app opens by itself
   * (and reads the Play install referrer for ad attribution).
   */
  start(): void {
    if (!ENABLED || started) return;
    try {
      Settings.initializeSDK();
      started = true;
    } catch {
      // No SDK in this build: stay silent.
    }
  },

  /** She made her account (onboarding `account` step done). */
  registered(method: 'apple' | 'google' | 'email'): void {
    safely(() => AppEventsLogger.logEvent('fb_mobile_complete_registration', { fb_registration_method: method }));
  },

  /**
   * A store free trial started (paywall `buy` with trialDays). Value is what
   * the plan will cost when the trial ends, so Meta can weigh it.
   */
  trialStarted(plan: { id: string; price: number; currency: string }): void {
    safely(() =>
      AppEventsLogger.logEvent('StartTrial', plan.price, {
        fb_order_id: plan.id,
        fb_currency: plan.currency,
      }),
    );
  },

  /** She paid now (no trial, or an intro price). */
  subscribed(plan: { id: string; price: number; currency: string }): void {
    safely(() =>
      AppEventsLogger.logEvent('Subscribe', plan.price, {
        fb_order_id: plan.id,
        fb_currency: plan.currency,
      }),
    );
  },
};
