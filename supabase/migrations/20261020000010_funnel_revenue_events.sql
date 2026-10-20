-- The money end of the funnel: what the stores say happened to a
-- subscription (trial, first payment, renewal, cancellation, expiry, refund,
-- billing trouble, win-back), written to funnel_events by verify-purchase and
-- the two store notification functions (functions/_shared/revenue.ts), next to
-- the paywall steps the app writes. The same rows go to PostHog.
--
-- The same charge can be heard twice (the app and the store's notification,
-- a notification sent again), so a server row carries a dedupe_key and the
-- table keeps one row per key. The app's rows have none.

alter table public.funnel_events add column if not exists dedupe_key text;
alter table public.funnel_events drop constraint if exists funnel_events_dedupe_key_key;
alter table public.funnel_events add constraint funnel_events_dedupe_key_key unique (dedupe_key);

alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events add constraint funnel_events_event_check check (event in (
  -- the app (src/lib/funnel.ts)
  'paywall_shown', 'paywall_closed', 'winback_shown', 'winback_declined',
  'checkout_started', 'checkout_ended', 'restore', 'free_pass_claimed',
  -- the stores (functions/_shared/revenue.ts), service role only
  'trial_started', 'first_payment', 'subscription_resubscribed', 'subscription_renewed',
  'subscription_cancelled', 'subscription_uncancelled', 'billing_issue',
  'subscription_expired', 'subscription_refunded', 'winback_redeemed'));

-- The app writes only its own steps: a learner can't write herself a payment.
drop policy if exists "funnel_events: insert own" on public.funnel_events;
create policy "funnel_events: insert own" on public.funnel_events
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and dedupe_key is null
    and event not in (
      'trial_started', 'first_payment', 'subscription_resubscribed', 'subscription_renewed',
      'subscription_cancelled', 'subscription_uncancelled', 'billing_issue',
      'subscription_expired', 'subscription_refunded', 'winback_redeemed')
  );
