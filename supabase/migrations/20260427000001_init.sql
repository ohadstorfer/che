-- Che — initial schema
-- Identity model: anonymous Supabase Auth (auth.uid()).
-- All user-owned tables key off auth.users(id) and are gated by RLS.

create extension if not exists "pgcrypto";

------------------------------------------------------------
-- profiles
------------------------------------------------------------
create table public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: owner upsert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

------------------------------------------------------------
-- streaks (1 row per user)
------------------------------------------------------------
create table public.streaks (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  current_streak     int  not null default 0,
  longest_streak     int  not null default 0,
  last_practice_date date,
  updated_at         timestamptz not null default now()
);

alter table public.streaks enable row level security;

create policy "streaks: owner read"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "streaks: owner write"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "streaks: owner update"
  on public.streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

------------------------------------------------------------
-- sessions (cached generated exercise sets)
------------------------------------------------------------
create table public.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  topic        text,
  prompt       text not null,
  data         jsonb not null,
  last_correct int,
  last_total   int,
  created_at   timestamptz not null default now()
);

create index sessions_user_idx on public.sessions(user_id, created_at desc);

alter table public.sessions enable row level security;

create policy "sessions: owner read"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions: owner write"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions: owner update"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions: owner delete"
  on public.sessions for delete
  using (auth.uid() = user_id);

------------------------------------------------------------
-- push_subscriptions (one row per Expo push token per user)
------------------------------------------------------------
create table public.push_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  expo_push_token        text not null unique,
  platform               text not null check (platform in ('ios', 'android', 'web')),
  reminder_time          text not null default '19:00' check (reminder_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  timezone               text not null default 'UTC',
  notifications_enabled  boolean not null default true,
  last_sent_date         date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index push_subs_user_idx on public.push_subscriptions(user_id);
create index push_subs_enabled_idx on public.push_subscriptions(notifications_enabled) where notifications_enabled = true;

alter table public.push_subscriptions enable row level security;

create policy "push: owner read"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push: owner write"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push: owner update"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push: owner delete"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

------------------------------------------------------------
-- updated_at trigger helper
------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger streaks_set_updated_at
  before update on public.streaks
  for each row execute function public.set_updated_at();

create trigger push_subs_set_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

------------------------------------------------------------
-- bump_streak: idempotent per local day
-- The client passes its local "today" so we don't have to know the user's tz on the server.
-- Returns the new streak row.
------------------------------------------------------------
create or replace function public.bump_streak(p_today date)
returns public.streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.streaks;
  diff int;
  next_streak int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into row from public.streaks where user_id = uid;

  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak, last_practice_date)
    values (uid, 1, 1, p_today)
    returning * into row;
    return row;
  end if;

  if row.last_practice_date = p_today then
    return row;
  end if;

  diff := (p_today - row.last_practice_date);
  if row.last_practice_date is null then
    next_streak := 1;
  elsif diff = 1 then
    next_streak := row.current_streak + 1;
  else
    next_streak := 1;
  end if;

  update public.streaks
  set current_streak = next_streak,
      longest_streak = greatest(longest_streak, next_streak),
      last_practice_date = p_today
  where user_id = uid
  returning * into row;

  return row;
end;
$$;

revoke all on function public.bump_streak(date) from public;
grant execute on function public.bump_streak(date) to authenticated;
