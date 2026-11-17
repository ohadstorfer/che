-- "Learn more" on the paywall (src/app/paywall.tsx) is counted too: the hard
-- paywall's way out after onboarding depends on it.
alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events add constraint funnel_events_event_check check (event in (
  'paywall_shown', 'paywall_closed', 'winback_shown', 'winback_declined', 'checkout_started',
  'checkout_ended', 'restore', 'free_pass_claimed', 'trial_started', 'first_payment',
  'subscription_resubscribed', 'subscription_renewed', 'subscription_cancelled',
  'subscription_uncancelled', 'billing_issue', 'subscription_expired', 'subscription_refunded',
  'winback_redeemed', 'notification_opened', 'paywall_learn_more'));
