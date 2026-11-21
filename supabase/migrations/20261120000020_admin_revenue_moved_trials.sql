-- admin_revenue (20261120000010), two fixes:
-- * A trial moved to another account by Restore (old row TRANSFER) counted as
--   ended and unpaid; it now follows the purchase to the new account.
-- * trials_by_store: the Active trials tile showed subscribers + trials per store.

create or replace function public.admin_revenue(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  fx jsonb;
  since timestamptz;
  result jsonb;
begin
  if not exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin') then
    raise exception 'admins only' using errcode = '42501';
  end if;
  p_days := greatest(1, least(coalesce(p_days, 30), 365));
  since := date_trunc('day', now()) - make_interval(days => p_days - 1);
  select value into fx from public.app_config where key = 'usd_rates';
  fx := coalesce(fx, '{"USD": 1}'::jsonb);

  with ev as (
    select f.user_id, f.event, f.created_at as at, f.props,
           f.props->>'product_id' as product_id,
           f.props->>'store' as store,
           upper(f.props->>'currency') as cur,
           coalesce(nullif(f.props->>'revenue', '')::numeric, nullif(f.props->>'price', '')::numeric) as amount
    from public.funnel_events f
    where f.dedupe_key is not null
      and coalesce(f.props->>'sandbox', 'false') <> 'true'
  ),
  evu as (
    select ev.*, ev.amount * (fx->>ev.cur)::numeric as usd,
           ev.event in ('first_payment', 'subscription_resubscribed', 'subscription_renewed') as paid
    from ev
  ),
  -- Who holds Premium from a store right now.
  subs as (
    select e.user_id, e.store, e.product_id, e.period_type, e.expires_at,
           case when e.product_id = 'posta_premium_monthly' then 'monthly' else 'yearly' end as plan,
           e.period_type = 'TRIAL' as trial
    from public.entitlements e
    where e.active and not e.sandbox
      and e.store in ('APP_STORE', 'PLAY_STORE')
      and (e.expires_at is null or e.expires_at > now())
  ),
  -- Each paying sub's monthly value: her last charge, else the list price.
  sub_mrr as (
    select s.*,
           coalesce(
             (select case when s.plan = 'monthly' then p.usd else p.usd / 12 end
              from evu p where p.user_id = s.user_id and p.paid and p.usd > 0
              order by p.at desc limit 1),
             case when s.plan = 'monthly' then 12.99 else 89.99 / 12 end) as mrr
    from subs s where not s.trial
  ),
  days as (
    select d::date as day from generate_series(since, date_trunc('day', now()), interval '1 day') d
  ),
  daily as (
    select d.day,
           coalesce(sum(e.usd) filter (where e.paid), 0) as revenue,
           coalesce(sum(e.usd) filter (where e.event = 'subscription_refunded'), 0) as refunds,
           count(*) filter (where e.event = 'trial_started') as trials,
           count(*) filter (where e.event = 'first_payment') as new_payers,
           count(*) filter (where e.event = 'subscription_renewed') as renewals,
           count(*) filter (where e.event = 'subscription_cancelled') as cancellations
    from days d left join evu e on e.at::date = d.day
    group by d.day order by d.day
  ),
  win as (select * from evu where at >= since),
  -- Trials started in the window: how many paid after, how many still run.
  -- A Restore from another account moves the purchase there: the old row is
  -- left inactive with last_event TRANSFER, same product and expiry as the
  -- new one. Follow it, or a moved trial reads as ended and unpaid.
  moved as (
    select o.user_id as from_user, n.user_id as to_user
    from public.entitlements o
    join public.entitlements n
      on n.user_id <> o.user_id and n.store = o.store and n.product_id = o.product_id
     and n.expires_at = o.expires_at and n.last_event <> 'TRANSFER'
    where o.last_event = 'TRANSFER'
  ),
  trials_done as (
    select t.user_id, t.at,
           exists (select 1 from evu p where p.event = 'first_payment' and p.at >= t.at
                   and (p.user_id = t.user_id or p.user_id in (select to_user from moved where from_user = t.user_id))) as converted,
           exists (select 1 from subs s where s.trial
                   and (s.user_id = t.user_id or s.user_id in (select to_user from moved where from_user = t.user_id))) as running
    from win t
    where t.event = 'trial_started'
  ),
  -- Staff and testers browse the paywall too; leave them out.
  staff as (
    select user_id from public.profiles where role in ('reviewer', 'admin')
    union select user_id from public.entitlements where store = 'TESTER' or sandbox
  )
  select jsonb_build_object(
    'days', p_days,
    'generated_at', now(),
    'mrr', (select coalesce(round(sum(mrr), 2), 0) from sub_mrr),
    'active_subs', (select count(*) from subs where not trial),
    'active_trials', (select count(*) from subs where trial),
    -- Still in, but auto-renew is off: her latest word on it was a cancel.
    'cancelling', (select count(*) from subs s where (
        select c.event from evu c
        where c.user_id = s.user_id and c.event in ('subscription_cancelled', 'subscription_uncancelled', 'first_payment', 'subscription_resubscribed', 'trial_started')
        order by c.at desc limit 1) = 'subscription_cancelled'),
    'by_plan', (select coalesce(jsonb_object_agg(plan, n), '{}') from (select plan, count(*) n from subs where not trial group by plan) x),
    'by_store', (select coalesce(jsonb_object_agg(store, n), '{}') from (select store, count(*) n from subs group by store) x),
    'trials_by_store', (select coalesce(jsonb_object_agg(store, n), '{}') from (select store, count(*) n from subs where trial group by store) x),
    'revenue', (select coalesce(round(sum(usd) filter (where paid), 2), 0) from win),
    'refunds', (select coalesce(round(sum(usd) filter (where event = 'subscription_refunded'), 2), 0) from win),
    'revenue_all_time', (select coalesce(round(sum(usd) filter (where paid), 2), 0) from evu),
    'counts', (select jsonb_build_object(
        'trial_started', count(*) filter (where event = 'trial_started'),
        'first_payment', count(*) filter (where event = 'first_payment'),
        'from_trial', count(*) filter (where event = 'first_payment' and props->>'from_trial' = 'true'),
        'resubscribed', count(*) filter (where event = 'subscription_resubscribed'),
        'renewed', count(*) filter (where event = 'subscription_renewed'),
        'cancelled', count(*) filter (where event = 'subscription_cancelled'),
        'uncancelled', count(*) filter (where event = 'subscription_uncancelled'),
        'billing_issue', count(*) filter (where event = 'billing_issue'),
        'expired', count(*) filter (where event = 'subscription_expired'),
        'refunded', count(*) filter (where event = 'subscription_refunded'),
        'winback', count(*) filter (where event = 'winback_redeemed')) from win),
    'trial_conversion', (select jsonb_build_object('started', count(*), 'converted', count(*) filter (where converted),
        'running', count(*) filter (where running and not converted)) from trials_done),
    'paywall', (select jsonb_build_object(
        'shown', count(distinct user_id) filter (where event = 'paywall_shown'),
        'checkout', count(distinct user_id) filter (where event = 'checkout_started'))
      from public.funnel_events
      where created_at >= since and dedupe_key is null and user_id not in (select user_id from staff)),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object(
        'day', day, 'revenue', round(revenue, 2), 'refunds', round(refunds, 2), 'trials', trials,
        'new_payers', new_payers, 'renewals', renewals, 'cancellations', cancellations) order by day), '[]') from daily),
    'unconverted', (select coalesce(jsonb_agg(distinct cur), '[]') from evu where amount > 0 and usd is null),
    'recent', (select coalesce(jsonb_agg(r order by r.at desc), '[]') from (
        select e.at, e.event, e.store, e.product_id, e.amount, e.cur as currency, round(e.usd, 2) as usd,
               coalesce(e.props->>'from_trial', 'false') = 'true' as from_trial,
               coalesce(u.email, left(e.user_id::text, 8)) as who
        from evu e left join auth.users u on u.id = e.user_id
        order by e.at desc limit 40) r)
  ) into result;
  return result;
end;
$$;

revoke all on function public.admin_revenue(int) from public, anon;
grant execute on function public.admin_revenue(int) to authenticated;

comment on function public.admin_revenue(int) is
  'Revenue dashboard numbers for the last p_days, in USD (app_config.usd_rates). Admins only; sandbox and testers left out.';
