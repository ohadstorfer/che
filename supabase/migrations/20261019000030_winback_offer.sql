-- The day-30 win-back offer, decided here instead of by the link in the mail.
--
-- The mail's button only opens the app. The app asks winback_offer() whether
-- this account may have the 40% first year now, and shows the offer only when
-- it may: the day-30 mail went to her in the last 7 days, and she has no live
-- premium. A forwarded mail opens nothing for anyone else.
--
-- Whoever has had a store subscription (a free trial counts) gets no day-30
-- mail at all: Apple gives one introductory price per subscription group, and
-- the free week already was hers, so the app could never show her the 40%.
-- winback_candidates() says so (`tried`), and winback.ts leaves the day-30
-- mail out for her.

-- The return type changes, so the function is made again.
drop function if exists public.winback_candidates();

create function public.winback_candidates()
returns table (
  user_id   uuid,
  email     text,
  name      text,
  saved_at  timestamptz,
  timezone  text,
  sent      smallint[],
  tried     boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    coalesce(nullif(u.email, ''), i.email),
    p.display_name,
    i.saved_at,
    coalesce(ps.timezone, p.timezone, 'UTC'),
    coalesce((select array_agg(w.step order by w.step) from public.winback_emails w where w.user_id = u.id), '{}'),
    exists (select 1 from public.entitlements e where e.user_id = u.id and e.store in ('APP_STORE', 'PLAY_STORE'))
  from auth.users u
  join lateral (
    select min(ai.created_at) as saved_at, min(nullif(ai.email, '')) as email
    from auth.identities ai
    where ai.user_id = u.id and ai.provider in ('apple', 'google')
  ) i on i.saved_at is not null
  left join public.profiles p on p.user_id = u.id
  left join lateral (
    select s.timezone from public.push_subscriptions s
    where s.user_id = u.id
    order by s.updated_at desc
    limit 1
  ) ps on true
  where not u.is_anonymous
    and u.deleted_at is null
    and coalesce(nullif(u.email, ''), i.email) is not null
    and i.saved_at > now() - interval '33 days'
    and not public.is_premium(u.id)
    and not exists (select 1 from public.email_optouts o where o.user_id = u.id)
    and not exists (select 1 from public.winback_emails w where w.user_id = u.id and w.step = 30);
$$;

revoke all on function public.winback_candidates() from public, anon, authenticated;
grant execute on function public.winback_candidates() to service_role;

-- May she have the 40% now, and until when. Her own answer only (auth.uid()).
-- The 7 days match OFFER_DAYS in functions/_shared/winback.ts (the mail says so).
create or replace function public.winback_offer()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'eligible', coalesce(w.until > now(), false) and not public.is_premium(auth.uid()),
    'until', w.until
  )
  from (select 1) one
  left join lateral (
    select sent_at + interval '7 days' as until
    from public.winback_emails
    where user_id = auth.uid() and step = 30
  ) w on true;
$$;

revoke all on function public.winback_offer() from public, anon;
grant execute on function public.winback_offer() to authenticated;
