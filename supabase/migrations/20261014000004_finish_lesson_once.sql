-- ---------------------------------------------------------------------------
-- finish_lesson: a round is counted once.
--
-- The app now retries finish_lesson when the call fails (offline, a dropped
-- connection). If the first call did land and only its answer was lost, the
-- retry would count the round twice, and on a comeback day two counts buy
-- back a frozen run. A round whose finished_at is already set returns the
-- current streak and changes nothing.
--
-- Same function as 20261011000002_streak_never_backwards.sql otherwise.
-- ---------------------------------------------------------------------------

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

  -- A round already finished is not counted again: the app retries a call
  -- whose answer never arrived, and a second count would buy back a frozen
  -- run with one round. Answer with how things stand.
  if p_round_id is not null and exists (
    select 1 from public.rounds r where r.id = p_round_id and r.user_id = v_user and r.finished_at is not null
  ) then
    select * into v_row from public.streaks s where s.user_id = v_user;
    if p_lesson_id is not null then
      select lp.passed, lp.attempts into v_passed, v_attempts
      from public.lesson_progress lp where lp.user_id = v_user and lp.lesson_id = p_lesson_id;
    end if;
    return query select coalesce(v_row.current_streak, 0), coalesce(v_row.current_streak, 0),
      coalesce(v_row.recoverable_streak, 0), coalesce(v_passed, true), v_attempts;
    return;
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

  if v_row.last_practice_date > p_local_date then
    -- A day that is already behind her: the streak has moved past it.
    update public.streaks set longest_streak = greatest(longest_streak, v_row.current_streak) where user_id = v_user;
    return query select v_row.current_streak, v_prev, v_row.recoverable_streak, v_passed, v_attempts;
    return;
  end if;

  if v_row.last_practice_date is distinct from p_local_date then
    if v_row.last_practice_date = p_local_date - 1 then
      v_row.current_streak := v_row.current_streak + 1;
      v_row.recoverable_streak := 0;
    else
      v_prev := 0;
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
