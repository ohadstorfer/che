-- ---------------------------------------------------------------------------
-- Placement and jump-ahead — docs/learning-engine-spec.md §7.
--
-- A placement test (onboarding) or a "Jump here" test (a later section or unit
-- on the path) that she passes skips the lessons before a unit. The skipped
-- words are not assumed learned forever: they get states due over the next
-- week, so review slots and practice check them gradually. Words she got right
-- in the test wait longer; words she missed are due now.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists placed_through smallint not null default 0;

comment on column public.profiles.placed_through is
  'course_order of the last unit she skipped by a placement or jump test. Glue up to here is unlocked and sentences start at the gap rung.';

create or replace function public.apply_placement(
  p_round_id        uuid,
  p_through_order   smallint,
  p_passed_form_ids uuid[] default '{}',
  p_failed_form_ids uuid[] default '{}'
)
returns table (lessons_skipped int, forms_scheduled int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_lessons int;
  v_forms int;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_through_order < 1 then
    return query select 0, 0;
    return;
  end if;

  insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
  select v_user, l.id, null, 0, true, 'placement'
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.course_order < p_through_order and l.status = 'published' and u.status = 'published'
  on conflict (user_id, lesson_id) do nothing;
  get diagnostics v_lessons = row_count;

  -- Spread by a hash of the form so a skipped section doesn't all fall due on
  -- one day. Existing states are hers already and stay as they are.
  insert into public.form_states (form_id, user_id, state, ease_factor, interval_days, repetitions, lapses, due_at)
  select f.id, v_user,
         case when f.id = any(p_failed_form_ids) then 'learning' else 'review' end,
         2.5,
         case when f.id = any(p_failed_form_ids) then 0
              when f.id = any(p_passed_form_ids) then 7
              else 3 end,
         1,
         0,
         case when f.id = any(p_failed_form_ids) then now()
              when f.id = any(p_passed_form_ids) then now() + make_interval(days => 3 + abs(hashtext(f.id::text)) % 8)
              else now() + make_interval(days => 1 + abs(hashtext(f.id::text)) % 7) end
  from public.forms f
  join public.lemmas lm on lm.id = f.lemma_id
  join public.units u on u.id = f.unit_id
  where u.course_order < p_through_order
    and f.status = 'published'
    and not lm.is_glue and lm.pos <> 'propn'
  on conflict (form_id, user_id) do nothing;
  get diagnostics v_forms = row_count;

  update public.profiles
  set placed_through = greatest(placed_through, p_through_order - 1)
  where user_id = v_user;

  if p_round_id is not null then
    update public.rounds set finished_at = coalesce(finished_at, now())
    where id = p_round_id and user_id = v_user;
  end if;

  return query select v_lessons, v_forms;
end;
$$;

revoke all on function public.apply_placement(uuid, smallint, uuid[], uuid[]) from public;
grant execute on function public.apply_placement(uuid, smallint, uuid[], uuid[]) to authenticated;
