import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { abTag } from './ab';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// The paywall funnel, one row per step in our own `funnel_events` table
// (PostHog's free plan counts every event; these stay ours and free).
//
// Fire and forget: a step lost to a dropped connection is a gap in a count,
// never a reason to slow the paywall down. Demo builds are screenshots, not
// learners, so they write nothing. The server fills in who and when.
// ---------------------------------------------------------------------------

export type FunnelEvent =
  | 'paywall_shown'
  | 'paywall_closed'
  | 'winback_shown'
  | 'winback_declined'
  | 'checkout_started'
  | 'checkout_ended'
  | 'restore'
  | 'paywall_learn_more'
  | 'free_pass_claimed'
  | 'notification_opened';

const ENABLED = process.env.EXPO_PUBLIC_DEMO !== '1';

export function track(event: FunnelEvent, props: Record<string, string | number | boolean | null> = {}): void {
  if (!ENABLED) return;
  void Promise.resolve(
    supabase.from('funnel_events').insert({ event, props: { ...props, platform: Platform.OS, ab: abTag() } }),
  ).catch(() => {});
}

// ---------------------------------------------------------------------------
// How far she got in onboarding, in `onboarding_steps`. Most steps come before
// she has an account, so they hang on a random id kept on the phone. The table
// keeps the first time per step, and going back and forth sends nothing new.
// ---------------------------------------------------------------------------

export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'level'
  | 'why'
  | 'try'
  | 'struggle'
  | 'achieve'
  | 'goal'
  | 'notify'
  | 'code'
  | 'building'
  | 'pledge'
  | 'account'
  | 'ready'
  | 'intro'
  | 'class'
  | 'streak'
  | 'offer';

const DEVICE_KEY = 'posta.onboarding-device';
const sentSteps = new Set<OnboardingStep>();
let device: Promise<string> | null = null;

export const deviceId = () =>
  (device ??= (async () => {
    const saved = await AsyncStorage.getItem(DEVICE_KEY);
    if (saved) return saved;
    const made = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_KEY, made);
    return made;
  })());

export function trackStep(step: OnboardingStep): void {
  if (!ENABLED || sentSteps.has(step)) return;
  sentSteps.add(step);
  void deviceId()
    .then((device_id) => supabase.from('onboarding_steps').insert({ device_id, step, platform: Platform.OS }))
    .catch(() => {});
}

/**
 * Her onboarding answers on her account (auth user metadata, `onboarding`),
 * once the guest exists, so they can be read next to her funnel and progress
 * instead of living only on the phone. The Apple/Google sign-in path already
 * writes the same key.
 */
export function keepAnswers(answers: object): void {
  if (!ENABLED) return;
  void Promise.resolve(supabase.auth.updateUser({ data: { onboarding: answers } })).catch(() => {});
}
