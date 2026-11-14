-- How far each install got in onboarding, one row per step the first time she
-- reaches it. Most steps come before any account exists, so rows hang on a
-- random id kept on the phone; user_id fills in once there is a session.
-- Nothing about her is here: no answers, only which screen she reached.

create table if not exists public.onboarding_steps (
  id         bigint generated always as identity primary key,
  device_id  uuid not null,
  step       text not null check (step in (
               'welcome', 'name', 'level', 'why', 'try', 'struggle', 'achieve', 'goal',
               'notify', 'building', 'pledge', 'account', 'ready')),
  user_id    uuid default auth.uid() references auth.users (id) on delete cascade,
  platform   text check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  unique (device_id, step)
);

create index if not exists onboarding_steps_time on public.onboarding_steps (created_at);
create index if not exists onboarding_steps_user on public.onboarding_steps (user_id);

alter table public.onboarding_steps enable row level security;

-- Write-only from the app, signed in or not. Only these columns, so nobody
-- can set a date or someone else's user_id.
revoke all on public.onboarding_steps from anon, authenticated;
grant insert (device_id, step, platform) on public.onboarding_steps to anon, authenticated;

drop policy if exists "onboarding_steps: insert" on public.onboarding_steps;
create policy "onboarding_steps: insert" on public.onboarding_steps
  for insert to anon, authenticated
  with check (user_id is not distinct from auth.uid());
