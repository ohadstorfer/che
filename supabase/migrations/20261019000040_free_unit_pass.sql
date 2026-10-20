-- The free week, for a hard paywall.
--
-- With `hard_paywall` on (app_config), nothing is free on day 0: the paywall
-- after onboarding has no way out, and opening the app again shows it again.
-- From the next day, someone who hasn't bought may take one free pass, once:
-- the first unit of the course and one chat with Pancho, for a week or until
-- she has done both, whichever comes first. Then the paywall again, for good.
-- She takes it with a saved account (Apple or Google), so the pass is hers and
-- the win-back mails have somewhere to go.
--
--   free_passes          one row per account that took the pass
--   free_pass_state()    what the app shows her: off | soon | offer | active | over
--   claim_free_pass()    takes it
--
-- The lessons a free account may read (free_lesson_ids) and the unit chats it
-- may start (lesson_open_to) follow the pass while it is open. Free chats with
-- Pancho are counted by free_chats_allowed (hablar-start).
--
-- With `hard_paywall` off, the free tier is what it was: free_units() units and
-- 3 chats, no pass.

create table if not exists public.free_passes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ends_at    timestamptz not null
);

alter table public.free_passes enable row level security;

drop policy if exists "free_passes: owner reads" on public.free_passes;
create policy "free_passes: owner reads" on public.free_passes
  for select to authenticated using (user_id = auth.uid());
-- No write policies: claim_free_pass() writes.

------------------------------------------------------------
-- Small pieces.
------------------------------------------------------------

-- The free week's size. The app (lib/premium.tsx) agrees.
create or replace function public.free_pass_units() returns int language sql immutable as $$ select 1 $$;
create or replace function public.free_pass_chats() returns int language sql immutable as $$ select 1 $$;
create or replace function public.free_pass_days() returns int language sql immutable as $$ select 7 $$;
-- How long after her account was made the pass may be taken: "the next day".
create or replace function public.free_pass_wait() returns interval language sql immutable as $$ select interval '23 hours' $$;

create or replace function public.hard_paywall_on()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select c.value = 'true'::jsonb from public.app_config c where c.key = 'hard_paywall'), false);
$$;

-- The lessons of the first p_n units, counted the way the app draws the road
-- (course.ts assemble): published sections by ordinal, their published units
-- by ordinal, skipping units with no published lesson.
create or replace function public.first_units_lesson_ids(p_n int)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  with road as (
    select u.id, row_number() over (order by s.ordinal, u.ordinal) as n
    from public.units u
    join public.sections s on s.id = u.section_id
    where u.status = 'published'
      and s.status = 'published'
      and exists (select 1 from public.lessons l where l.unit_id = u.id and l.status = 'published')
  )
  select coalesce(array_agg(l.id), '{}')
  from public.lessons l
  join road r on r.id = l.unit_id
  where r.n <= p_n
    and l.status = 'published';
$$;

create or replace function public.free_pass_open(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.free_passes p where p.user_id = p_user and now() < p.ends_at);
$$;

-- The free lessons for one account: the free tier's, or the pass's.
create or replace function public.free_lesson_ids_for(p_user uuid)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select public.first_units_lesson_ids(
    case
      when not public.hard_paywall_on() then public.free_units()
      when p_user is not null and public.free_pass_open(p_user) then public.free_pass_units()
      else 0
    end
  );
$$;

-- The caller's free lessons (used by the content policies and content_version).
create or replace function public.free_lesson_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$ select public.free_lesson_ids_for(auth.uid()) $$;

-- hablar-start asks for someone else (service role), so it can't lean on auth.uid().
create or replace function public.lesson_open_to(p_user uuid, p_lesson uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_premium(p_user)
    or exists (select 1 from public.profiles p where p.user_id = p_user and p.role in ('admin', 'reviewer'))
    or p_lesson = any (public.free_lesson_ids_for(p_user));
$$;

-- Chats with Pancho (not a lesson's own chat) a free account may have had in
-- all: 3 in the free tier; with the hard paywall, the pass's one while it is open.
create or replace function public.free_chats_allowed(p_user uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not public.hard_paywall_on() then 3
    when public.free_pass_open(p_user) then public.free_pass_chats()
    else 0
  end;
$$;

------------------------------------------------------------
-- What the app asks.
------------------------------------------------------------

-- off     no pass here: no hard paywall, or she has premium, or she is staff
-- soon    not yet: the pass opens the day after her account was made
-- offer   hers to take
-- active  open: the first unit and one chat
-- over    the week is up, or she has done the unit and had the chat
create or replace function public.free_pass_state()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select u.id, u.created_at, p.started_at, p.ends_at
    from auth.users u
    left join public.free_passes p on p.user_id = u.id
    where u.id = auth.uid()
  ),
  done as (
    select
      not exists (
        select 1 from unnest(public.first_units_lesson_ids(public.free_pass_units())) as l(id)
        where not exists (
          select 1 from public.lesson_progress lp
          where lp.user_id = auth.uid() and lp.lesson_id = l.id and lp.passed is not false
        )
      )
      and (
        select count(*) from public.conversations c where c.user_id = auth.uid() and c.kind <> 'unit'
      ) >= public.free_pass_chats() as finished
  )
  select jsonb_build_object(
    'state',
    case
      when me.id is null then 'off'
      when not public.hard_paywall_on() then 'off'
      when public.is_premium(me.id) then 'off'
      when exists (select 1 from public.profiles pr where pr.user_id = me.id and pr.role in ('admin', 'reviewer')) then 'off'
      when me.started_at is null and now() < me.created_at + public.free_pass_wait() then 'soon'
      when me.started_at is null then 'offer'
      when now() < me.ends_at and not done.finished then 'active'
      else 'over'
    end,
    'available_at', me.created_at + public.free_pass_wait(),
    'ends_at', me.ends_at
  )
  from (select 1) one
  left join me on true
  cross join done;
$$;

-- Takes the pass, once. Only with a saved account (not a guest), and only when
-- free_pass_state() says 'offer'. Answers free_pass_state() after.
create or replace function public.claim_free_pass()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_state text := public.free_pass_state() ->> 'state';
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if exists (select 1 from auth.users u where u.id = auth.uid() and u.is_anonymous) then
    raise exception 'save your account first' using errcode = '42501';
  end if;
  if v_state = 'offer' then
    insert into public.free_passes (user_id, ends_at)
    values (auth.uid(), now() + make_interval(days => public.free_pass_days()))
    on conflict (user_id) do nothing;
  end if;
  return public.free_pass_state();
end;
$$;

revoke all on function public.first_units_lesson_ids(int) from public, anon, authenticated;
revoke all on function public.free_pass_open(uuid) from public, anon, authenticated;
revoke all on function public.free_lesson_ids_for(uuid) from public, anon, authenticated;
revoke all on function public.free_chats_allowed(uuid) from public, anon, authenticated;
grant execute on function public.free_chats_allowed(uuid) to service_role;
revoke all on function public.free_lesson_ids() from public, anon;
grant execute on function public.free_lesson_ids() to authenticated;
revoke all on function public.lesson_open_to(uuid, uuid) from public, anon, authenticated;
grant execute on function public.lesson_open_to(uuid, uuid) to service_role;
revoke all on function public.free_pass_state() from public, anon;
grant execute on function public.free_pass_state() to authenticated;
revoke all on function public.claim_free_pass() from public, anon;
grant execute on function public.claim_free_pass() to authenticated;

-- The funnel counts the free week too (src/lib/funnel.ts).
alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events add constraint funnel_events_event_check check (event in (
  'paywall_shown', 'paywall_closed', 'winback_shown', 'winback_declined',
  'checkout_started', 'checkout_ended', 'restore', 'free_pass_claimed'));
