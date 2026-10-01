-- ---------------------------------------------------------------------------
-- Hablar: a chat about a unit, played as that unit's Speaking lesson on the
-- road (20260930000001_unit_extras.sql).
--
-- A unit chat is not the day's chat: it takes no part in the one-a-day limit
-- or the free tier's three chats. What opens it is the lesson, so a free
-- account talks in the free units and premium everywhere (lesson_open_to).
--
-- Its scene is written for the unit the first time anyone opens it, from the
-- unit's title, summary, grammar and words, and kept in unit_scenarios for
-- everyone after. The conversation keeps its own copy, so a scene written
-- again later never changes a chat already had.
-- ---------------------------------------------------------------------------

alter table public.conversations drop constraint conversations_kind_check;
alter table public.conversations add constraint conversations_kind_check
  check (kind in ('scenario', 'culture', 'free', 'unit'));

alter table public.conversations
  add column lesson_id uuid references public.lessons on delete set null,
  add column scenario jsonb;

comment on column public.conversations.lesson_id is
  'A unit chat: the Speaking lesson on the road it plays. Finishing the chat finishes the lesson.';
comment on column public.conversations.scenario is
  'A unit chat: the scene it ran, copied from unit_scenarios when it started.';

drop index public.conversations_one_per_day;
create unique index conversations_one_per_day
  on public.conversations (user_id, local_date) where not unlimited and kind <> 'unit';

create table public.unit_scenarios (
  unit_id    uuid not null references public.units on delete cascade,
  level      text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  scenario   jsonb not null,
  created_at timestamptz not null default now(),
  primary key (unit_id, level)
);
alter table public.unit_scenarios enable row level security;
revoke all on public.unit_scenarios from anon, authenticated;

comment on table public.unit_scenarios is
  'The scene of a unit chat, per level, written once by hablar-start. Service role only.';

-- Whether a learner may open a lesson: premium, staff, or one of the free units.
-- For the functions, which act as the service role and ask about her.
create or replace function public.lesson_open_to(p_user uuid, p_lesson uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_premium(p_user)
    or exists (select 1 from public.profiles p where p.user_id = p_user and p.role in ('admin', 'reviewer'))
    or p_lesson = any (public.free_lesson_ids());
$$;

revoke all on function public.lesson_open_to(uuid, uuid) from public, anon, authenticated;
grant execute on function public.lesson_open_to(uuid, uuid) to service_role;
