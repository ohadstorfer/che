-- The paywall funnel, kept in our own database instead of PostHog (whose free
-- plan counts every event). The app writes one row per step (src/lib/funnel.ts):
-- paywall shown / closed, the one-time offer shown / declined, a checkout
-- started and how it ended, a restore. Each learner writes only her own rows
-- and reads none; the numbers are read from the dashboard or the SQL editor.
-- Rows go with the account (on delete cascade).

create table if not exists public.funnel_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event      text not null check (event in (
               'paywall_shown', 'paywall_closed', 'winback_shown', 'winback_declined',
               'checkout_started', 'checkout_ended', 'restore')),
  props      jsonb not null default '{}'::jsonb check (pg_column_size(props) < 2048),
  created_at timestamptz not null default now()
);

create index if not exists funnel_events_event_time on public.funnel_events (event, created_at);
create index if not exists funnel_events_user on public.funnel_events (user_id, created_at);

alter table public.funnel_events enable row level security;

drop policy if exists "funnel_events: insert own" on public.funnel_events;
create policy "funnel_events: insert own" on public.funnel_events
  for insert to authenticated
  with check (user_id = auth.uid());
