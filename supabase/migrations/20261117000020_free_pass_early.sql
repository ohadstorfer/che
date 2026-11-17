-- The free week, the same day, for one case: out of onboarding with the hard
-- paywall, she watched "Learn more", closed the paywall, and said "No thanks"
-- to the one-time offer. Then the free week opens at once instead of the next
-- day (src/app/paywall.tsx calls open_free_pass_now()).
--
-- The app is the one that says she declined, so in theory anyone could call
-- it; all it buys is the same one free week a day sooner.

create table if not exists public.free_pass_early (
  user_id uuid primary key references auth.users (id) on delete cascade,
  opened_at timestamptz not null default now()
);

alter table public.free_pass_early enable row level security;
-- No policies: only the functions below read or write it.

create or replace function public.free_pass_state()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select u.id, u.created_at, p.started_at, p.ends_at,
      exists (select 1 from public.free_pass_early e where e.user_id = u.id) as early
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
      when me.started_at is null and not me.early and now() < me.created_at + public.free_pass_wait() then 'soon'
      when me.started_at is null then 'offer'
      when now() < me.ends_at and not done.finished then 'active'
      else 'over'
    end,
    'available_at', case when me.early then now() else me.created_at + public.free_pass_wait() end,
    'ends_at', me.ends_at
  )
  from (select 1) one
  left join me on true
  cross join done;
$$;

-- Opens the free week now (guests too: she saves her account when she takes it).
-- Answers free_pass_state() after.
create or replace function public.open_free_pass_now()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if public.hard_paywall_on() then
    insert into public.free_pass_early (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  end if;
  return public.free_pass_state();
end;
$$;

revoke all on function public.free_pass_state() from public, anon;
grant execute on function public.free_pass_state() to authenticated;
revoke all on function public.open_free_pass_now() from public, anon;
grant execute on function public.open_free_pass_now() to authenticated;
