-- Billing without a middleman. Until now RevenueCat stood between the stores
-- and `entitlements`; from here the app's purchases are checked with Apple and
-- Google directly (functions/verify-purchase) and the stores report changes
-- themselves (functions/apple-notifications, functions/google-notifications).
--
-- The stores name a purchase, not a person, so each row remembers which
-- purchase it holds: Apple's originalTransactionId, Google's purchase token.
-- `store_signed_at` is when the store last said so; an older word never
-- overwrites a newer one (a transaction signed before a refund cannot undo
-- the refund). `store` is APP_STORE, PLAY_STORE or TESTER, as before.

alter table public.entitlements
  add column if not exists store_ref text,
  add column if not exists store_signed_at timestamptz;

-- One store purchase opens one account at a time.
create unique index if not exists entitlements_store_ref
  on public.entitlements (store, store_ref)
  where store_ref is not null;

comment on table public.entitlements is
  'Premium, as the server knows it. One row per user, written only by the edge functions (verify-purchase, apple-notifications, google-notifications, tester-premium).';

-- Switches the app reads at launch, so they can be flipped without an app
-- update. `hard_paywall` true closes the free tier: a free account sees the
-- paywall and nothing else. (It lived in RevenueCat's offering metadata.)
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

drop policy if exists "app_config: anyone reads" on public.app_config;
create policy "app_config: anyone reads" on public.app_config
  for select using (true);
-- No write policy: changed from the dashboard.

insert into public.app_config (key, value)
values ('hard_paywall', 'false'::jsonb)
on conflict (key) do nothing;
