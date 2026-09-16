-- ---------------------------------------------------------------------------
-- The unit check — docs/learning-engine-spec.md §3.
--
-- A unit's review lesson (and every checkpoint lesson) is now a mastery check:
-- the path moves past it when she scores 80% on first tries, or on her third
-- attempt whatever the score — a checkpoint of understanding, not a wall.
--
-- It is played through a new slot kind, `recap`: screens over the weakest
-- forms of the unit (or the whole section), never below the gap rung.
--
-- finish_lesson also learns to stamp the round it closes (engine telemetry).
-- ---------------------------------------------------------------------------

alter table public.lesson_progress
  add column attempts  smallint not null default 1,
  add column passed    boolean  not null default true,
  add column passed_by text check (passed_by in ('score', 'attempts', 'placement'));

comment on column public.lesson_progress.passed is
  'False only for a review/checkpoint lesson finished below the pass score. The path treats only passed rows as done.';

alter table public.lesson_slots drop constraint lesson_slots_kind_check;
alter table public.lesson_slots drop constraint lesson_slots_check;
alter table public.lesson_slots
  add column scope text check (scope in ('unit', 'section'));
alter table public.lesson_slots add constraint lesson_slots_kind_check
  check (kind in ('teach', 'drill', 'match', 'tip', 'review', 'recap'));
alter table public.lesson_slots add constraint lesson_slots_check check (
  (kind = 'teach' and form_id is not null) or
  (kind = 'drill' and sentence_id is not null) or
  (kind = 'match') or
  (kind = 'tip' and tip_id is not null) or
  (kind = 'review' and review_count between 1 and 6) or
  (kind = 'recap' and review_count between 1 and 16 and scope is not null)
);

-- The old signature returns three columns; the new one returns five and takes
-- the round. Dropped first so there is never an ambiguous overload.
drop function if exists public.finish_lesson(date, uuid, smallint);

create or replace function public.finish_lesson(
  p_local_date      date,
  p_lesson_id       uuid default null,
  p_score           smallint default null,
  p_round_id        uuid default null,
  p_answered        smallint default null,
  p_first_try_wrong smallint default null,
  p_retries         smallint default null
)
returns table (current_streak int, previous_streak int, recoverable_streak int, passed boolean, attempts smallint)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user uuid := auth.uid();
  v_row public.streaks%rowtype;
  v_prev int;
  v_kind text;
  v_passed boolean := true;
  v_attempts smallint := null;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_lesson_id is not null then
    select coalesce(l.kind, 'lesson') into v_kind from public.lessons l where l.id = p_lesson_id;
    v_kind := coalesce(v_kind, 'lesson');

    insert into public.lesson_progress as lp (user_id, lesson_id, score, attempts, passed, passed_by)
    values (
      v_user, p_lesson_id, p_score, 1,
      v_kind not in ('review', 'checkpoint') or coalesce(p_score, 0) >= 80,
      case when v_kind in ('review', 'checkpoint') and coalesce(p_score, 0) >= 80 then 'score' end
    )
    on conflict (user_id, lesson_id) do update
      set completed_at = now(),
          score = greatest(lp.score, excluded.score),
          attempts = lp.attempts + 1,
          passed = lp.passed
                   or v_kind not in ('review', 'checkpoint')
                   or coalesce(p_score, 0) >= 80
                   or lp.attempts + 1 >= 3,
          passed_by = case
            when lp.passed then lp.passed_by
            when v_kind not in ('review', 'checkpoint') then null
            when coalesce(p_score, 0) >= 80 then 'score'
            when lp.attempts + 1 >= 3 then 'attempts'
          end
    returning lp.passed, lp.attempts into v_passed, v_attempts;
  end if;

  if p_round_id is not null then
    update public.rounds r
    set finished_at = now(),
        score = p_score,
        answered = coalesce(p_answered, r.answered),
        first_try_wrong = coalesce(p_first_try_wrong, r.first_try_wrong),
        retries = coalesce(p_retries, r.retries)
    where r.id = p_round_id and r.user_id = v_user;
  end if;

  insert into public.daily_sessions (user_id, session_date, completed_at)
  values (v_user, p_local_date, now())
  on conflict (user_id, session_date) do update
    set completed_at = coalesce(public.daily_sessions.completed_at, now()),
        completed_cards = public.daily_sessions.total_cards;

  insert into public.streaks (user_id) values (v_user) on conflict (user_id) do nothing;
  select * into v_row from public.streaks where user_id = v_user for update;
  v_prev := v_row.current_streak;

  if v_row.last_practice_date is distinct from p_local_date then
    if v_row.last_practice_date = p_local_date - 1 then
      v_row.current_streak := v_row.current_streak + 1;
      v_row.recoverable_streak := 0;
    else
      v_row.recoverable_streak := case when v_row.last_practice_date is null then 0 else v_row.current_streak end;
      v_row.current_streak := 1;
    end if;
  elsif v_row.recoverable_streak > 0 then
    v_row.current_streak := v_row.recoverable_streak + v_row.current_streak;
    v_row.recoverable_streak := 0;
  end if;
  v_row.longest_streak := greatest(v_row.longest_streak, v_row.current_streak);

  update public.streaks
  set current_streak = v_row.current_streak,
      longest_streak = v_row.longest_streak,
      recoverable_streak = v_row.recoverable_streak,
      last_practice_date = p_local_date
  where user_id = v_user;

  return query select v_row.current_streak, v_prev, v_row.recoverable_streak, v_passed, v_attempts;
end;
$$;

revoke all on function public.finish_lesson(date, uuid, smallint, uuid, smallint, smallint, smallint) from public;
grant execute on function public.finish_lesson(date, uuid, smallint, uuid, smallint, smallint, smallint) to authenticated;

-- Staff: how often each unit's check passes on the first attempt.
create or replace function public.staff_unit_check_rates()
returns table (unit_id uuid, unit_title text, learners bigint, first_attempt_pass numeric, by_attempts bigint)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.title_en,
         count(*),
         round(avg((lp.passed and lp.attempts = 1)::int), 3),
         count(*) filter (where lp.passed_by = 'attempts')
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id and l.kind in ('review', 'checkpoint')
  join public.units u on u.id = l.unit_id
  where public.is_staff() and lp.passed_by is distinct from 'placement'
  group by u.id, u.title_en, u.course_order
  order by u.course_order;
$$;
revoke all on function public.staff_unit_check_rates() from public;
grant execute on function public.staff_unit_check_rates() to authenticated;
