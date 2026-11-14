-- Creators: influencers who bring learners with their own code, and are paid
-- for the ones who pay.
--
--   creators            one row per creator: her code, what she is paid, the
--                       secret link to her own numbers (dashboard_token)
--   creator_referrals   who came with which code, once per account (first wins)
--   creator_payouts     what was sent to her, written by hand when paid
--   creator_commissions every commission, read from funnel_events
--
-- A creator's code is also a row in promo_codes (product annual, Play offer
-- `code-creator30`: the first month free), so "Have a code?" on the paywall
-- opens it like any code, and redeem-code notes the referral. The onboarding
-- asks for it too (claim_creator_code), before anything is bought.
--
-- What she earns, once per learner, after a 14-day hold with no refund:
--   annual   the first annual payment (after the free month)   payout_annual
--   monthly  the second monthly payment (one is too easy)      payout_monthly
-- Sandbox / test purchases never count. A refund in the hold voids it; one
-- after it was earned is hers to keep (stated in the creator agreement).

create table if not exists public.creators (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique check (code = upper(code) and code ~ '^[A-Z0-9]{3,20}$'),
  name            text not null,
  handle          text,
  platform        text,
  email           text,
  country         text,
  status          text not null default 'active' check (status in ('active', 'paused', 'ended')),
  payout_annual   numeric(8, 2) not null default 10,
  payout_monthly  numeric(8, 2) not null default 3,
  payout_currency text not null default 'USD',
  payout_method   text,          -- "PayPal x@y.com", "Wise …"
  dashboard_token uuid not null unique default gen_random_uuid(),
  notes           text,
  created_at      timestamptz not null default now()
);

create table if not exists public.creator_referrals (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  creator_id uuid not null references public.creators (id) on delete cascade,
  source     text not null check (source in ('onboarding', 'paywall', 'link')),
  created_at timestamptz not null default now()
);
create index if not exists creator_referrals_creator on public.creator_referrals (creator_id, created_at);

create table if not exists public.creator_payouts (
  id         bigint generated always as identity primary key,
  creator_id uuid not null references public.creators (id) on delete cascade,
  amount     numeric(10, 2) not null check (amount > 0),
  currency   text not null default 'USD',
  paid_at    timestamptz not null default now(),
  method     text,
  reference  text,
  note       text
);
create index if not exists creator_payouts_creator on public.creator_payouts (creator_id, paid_at);

alter table public.creators enable row level security;
alter table public.creator_referrals enable row level security;
alter table public.creator_payouts enable row level security;
revoke all on public.creators, public.creator_referrals, public.creator_payouts from anon, authenticated;
-- No policies: only the functions below and the service role touch them.

------------------------------------------------------------
-- Commissions.
------------------------------------------------------------

-- How long a payment waits before it is hers.
create or replace function public.creator_hold() returns interval language sql immutable as $$ select interval '14 days' $$;

-- One row per referred learner who has paid enough to earn one.
-- status: pending (in the hold) | earned | refunded (refunded in the hold)
create or replace view public.creator_commissions
with (security_invoker = true) as
with pays as (
  select
    f.user_id,
    f.created_at as paid_at,
    f.props ->> 'product_id' as product_id,
    row_number() over (partition by f.user_id order by f.created_at, f.id) as n,
    first_value(f.props ->> 'product_id') over (partition by f.user_id order by f.created_at, f.id) as first_product,
    min(f.created_at) over (partition by f.user_id) as first_paid_at,
    r.created_at as referred_at
  from public.funnel_events f
  join public.creator_referrals r on r.user_id = f.user_id
  where f.event in ('first_payment', 'subscription_resubscribed', 'subscription_renewed')
    and coalesce((f.props ->> 'sandbox')::boolean, false) = false
),
earning as (
  -- annual first: its first payment; monthly first: its second payment.
  -- Someone who was already paying before she gave the code earns nothing.
  select p.user_id, p.paid_at, p.product_id,
         case when p.first_product like 'posta_premium_annual%' then 'annual' else 'monthly' end as plan
  from pays p
  where p.first_paid_at >= p.referred_at
    and ((p.first_product like 'posta_premium_annual%' and p.n = 1)
      or (p.first_product not like 'posta_premium_annual%' and p.n = 2))
)
select
  r.creator_id,
  e.user_id,
  e.plan,
  e.paid_at,
  e.paid_at + public.creator_hold() as earned_at,
  case when e.plan = 'annual' then c.payout_annual else c.payout_monthly end as amount,
  c.payout_currency as currency,
  case
    when exists (
      select 1 from public.funnel_events x
      where x.user_id = e.user_id and x.event = 'subscription_refunded'
        and x.created_at >= e.paid_at and x.created_at < e.paid_at + public.creator_hold()
    ) then 'refunded'
    when now() < e.paid_at + public.creator_hold() then 'pending'
    else 'earned'
  end as status
from earning e
join public.creator_referrals r on r.user_id = e.user_id
join public.creators c on c.id = r.creator_id;

revoke all on public.creator_commissions from anon, authenticated;

-- Every creator's totals, for the CRM (service role / SQL editor).
create or replace function public.creator_summary(p_creator uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with refs as (select user_id, created_at from public.creator_referrals where creator_id = p_creator),
  trials as (
    select distinct f.user_id from public.funnel_events f join refs r using (user_id)
    where f.event = 'trial_started' and coalesce((f.props ->> 'sandbox')::boolean, false) = false
  ),
  com as (select * from public.creator_commissions where creator_id = p_creator),
  paid as (select coalesce(sum(amount), 0) as total from public.creator_payouts where creator_id = p_creator)
  select jsonb_build_object(
    'signups', (select count(*) from refs),
    'signups_30d', (select count(*) from refs where created_at > now() - interval '30 days'),
    'trials', (select count(*) from trials),
    'paying', (select count(*) from com where status <> 'refunded'),
    'annual', (select count(*) from com where status <> 'refunded' and plan = 'annual'),
    'monthly', (select count(*) from com where status <> 'refunded' and plan = 'monthly'),
    'pending', (select coalesce(sum(amount), 0) from com where status = 'pending'),
    'earned', (select coalesce(sum(amount), 0) from com where status = 'earned'),
    'paid_out', (select total from paid),
    'owed', (select coalesce(sum(amount), 0) from com where status = 'earned') - (select total from paid),
    'months', coalesce((
      select jsonb_agg(m order by m ->> 'month' desc) from (
        select jsonb_build_object(
          'month', to_char(d.month, 'YYYY-MM'),
          'signups', (select count(*) from refs where date_trunc('month', created_at) = d.month),
          'paying', (select count(*) from com where status <> 'refunded' and date_trunc('month', paid_at) = d.month),
          'earned', (select coalesce(sum(amount), 0) from com where status <> 'refunded' and date_trunc('month', paid_at) = d.month)
        ) as m
        from (
          select generate_series(
            date_trunc('month', coalesce((select min(created_at) from refs), now())),
            date_trunc('month', now()), interval '1 month') as month
        ) d
      ) months
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.creator_summary(uuid) from public, anon, authenticated;
grant execute on function public.creator_summary(uuid) to service_role;

-- A creator's own page (postaspanish.com/creator/?t=…): her numbers, by her
-- secret token. Nothing about any learner, only counts and money.
create or replace function public.creator_dashboard(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'name', c.name,
    'code', c.code,
    'status', c.status,
    'payout_annual', c.payout_annual,
    'payout_monthly', c.payout_monthly,
    'currency', c.payout_currency,
    'hold_days', extract(day from public.creator_hold())::int,
    'payouts', coalesce((
      select jsonb_agg(jsonb_build_object('amount', p.amount, 'currency', p.currency, 'paid_at', p.paid_at) order by p.paid_at desc)
      from public.creator_payouts p where p.creator_id = c.id
    ), '[]'::jsonb),
    'updated_at', now()
  ) || public.creator_summary(c.id)
  from public.creators c
  where c.dashboard_token = p_token;
$$;

revoke all on function public.creator_dashboard(uuid) from public;
grant execute on function public.creator_dashboard(uuid) to anon, authenticated;

------------------------------------------------------------
-- What the app asks.
------------------------------------------------------------

-- Is this an active creator's code? Her name if so (onboarding, before any
-- account exists). Codes are public: they are said out loud in videos.
create or replace function public.creator_code_name(p_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select c.name from public.creators c
  where c.code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and c.status = 'active';
$$;

revoke all on function public.creator_code_name(text) from public;
grant execute on function public.creator_code_name(text) to anon, authenticated;

-- Notes that the caller came with this code. The first code an account gives
-- is the one that counts; giving it again (or another) changes nothing.
-- Answers the creator's name, or null for no such code.
create or replace function public.claim_creator_code(p_code text, p_source text default 'onboarding')
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_creator public.creators;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  select * into v_creator from public.creators c
  where c.code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and c.status = 'active';
  if v_creator.id is null then
    return null;
  end if;
  insert into public.creator_referrals (user_id, creator_id, source)
  values (auth.uid(), v_creator.id, case when p_source in ('onboarding', 'paywall', 'link') then p_source else 'onboarding' end)
  on conflict (user_id) do nothing;
  return v_creator.name;
end;
$$;

revoke all on function public.claim_creator_code(text, text) from public, anon;
grant execute on function public.claim_creator_code(text, text) to authenticated;

------------------------------------------------------------
-- Adding a creator (SQL editor / CLI): her row and her code's promo row.
--   select public.add_creator('MARTI', 'Martina', '@marti.habla', 'tiktok');
------------------------------------------------------------
create or replace function public.add_creator(
  p_code text, p_name text, p_handle text default null, p_platform text default null
)
returns public.creators
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text := upper(regexp_replace(p_code, '\s', '', 'g'));
  v_row public.creators;
begin
  insert into public.promo_codes (code, product_id, google_offer_tag, note)
  values (v_code, 'posta_premium_annual', 'code-creator30', 'Creator code: first month free on the annual plan')
  on conflict (code) do nothing;
  insert into public.creators (code, name, handle, platform)
  values (v_code, p_name, p_handle, p_platform)
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.add_creator(text, text, text, text) from public, anon, authenticated;
grant execute on function public.add_creator(text, text, text, text) to service_role;
