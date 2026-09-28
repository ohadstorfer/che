-- Premium, as the server knows it. RevenueCat's webhook (functions/
-- revenuecat-webhook) keeps one row per user; the app reads its own row so a
-- subscription bought on a phone also opens the web app, and edge functions
-- (hablar-start) check it before spending money on a free account.

create table if not exists public.entitlements (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  active      boolean not null default false,
  product_id  text,
  store       text,
  period_type text,          -- TRIAL | INTRO | NORMAL
  expires_at  timestamptz,   -- null: never (lifetime)
  last_event  text,
  updated_at  timestamptz not null default now()
);

alter table public.entitlements enable row level security;

drop policy if exists "entitlements: owner reads" on public.entitlements;
create policy "entitlements: owner reads" on public.entitlements
  for select using (auth.uid() = user_id);
-- No insert/update policy: only the service role (the webhook) writes.

create or replace function public.is_premium(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = p_user
      and active
      and (expires_at is null or expires_at > now())
  );
$$;

revoke all on function public.is_premium(uuid) from public, anon, authenticated;
