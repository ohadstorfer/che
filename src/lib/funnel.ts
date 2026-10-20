import { Platform } from 'react-native';

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
  | 'free_pass_claimed';

const ENABLED = process.env.EXPO_PUBLIC_DEMO !== '1';

export function track(event: FunnelEvent, props: Record<string, string | number | boolean | null> = {}): void {
  if (!ENABLED) return;
  void Promise.resolve(
    supabase.from('funnel_events').insert({ event, props: { ...props, platform: Platform.OS } }),
  ).catch(() => {});
}
