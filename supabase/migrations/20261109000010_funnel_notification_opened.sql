-- Taps on our notifications (free-week nudge, team reply, practice reminder)
-- land in funnel_events as 'notification_opened' (src/lib/notification-taps).
alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events add constraint funnel_events_event_check check (event in (
  'paywall_shown', 'paywall_closed', 'winback_shown', 'winback_declined', 'checkout_started',
  'checkout_ended', 'restore', 'free_pass_claimed', 'trial_started', 'first_payment',
  'subscription_resubscribed', 'subscription_renewed', 'subscription_cancelled',
  'subscription_uncancelled', 'billing_issue', 'subscription_expired', 'subscription_refunded',
  'winback_redeemed', 'notification_opened'));
