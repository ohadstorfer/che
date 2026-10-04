-- ---------------------------------------------------------------------------
-- New lessons behind a learner count as done, whatever added them.
--
-- The nine units of 20261005000003 went into the middle of the road with no
-- progress for anyone already past them, so the first of them became every
-- such learner's next step. And the classes of 20261005000017 measured "past
-- it" from the first lesson she hasn't finished — which those units had just
-- pulled back to unit 9 — so none of them was credited either.
--
-- credit_fresh_lessons says it once: a fresh lesson is done for a learner if
-- it sits before the first of the course's own lessons she hasn't finished,
-- the fresh ones themselves left out of that count (and the classes and hidden
-- stories, which never held the line). Anything that publishes lessons into
-- the road calls it with their ids.
-- ---------------------------------------------------------------------------

create or replace function public.credit_fresh_lessons(p_lesson_ids uuid[])
returns integer
language sql
set search_path = public
as $$
  with road as (
    select l.id, l.kind, row_number() over (order by s.ordinal, u.ordinal, l.ordinal) as pos
    from public.lessons l
    join public.units u on u.id = l.unit_id and u.status = 'published'
    join public.sections s on s.id = u.section_id and s.status = 'published'
    where l.status = 'published'
  ),
  learners as (select distinct user_id from public.lesson_progress),
  frontier as (
    select lr.user_id, (
      select min(r.pos) from road r
      where r.kind not in ('speak', 'slang', 'culture', 'story')
        and r.id <> all (p_lesson_ids)
        and not exists (select 1 from public.lesson_progress p where p.user_id = lr.user_id and p.lesson_id = r.id)
    ) as pos
    from learners lr
  ),
  credited as (
    insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
    select f.user_id, r.id, null::smallint, 0::smallint, true, 'placement'
    from frontier f
    join road r on r.id = any (p_lesson_ids) and (f.pos is null or r.pos < f.pos)
    on conflict (user_id, lesson_id) do nothing
    returning 1
  )
  select count(*)::integer from credited;
$$;

comment on function public.credit_fresh_lessons(uuid[]) is
  'Marks the given newly published lessons as done for every learner already past them on the road. For migrations; not callable by clients.';

revoke all on function public.credit_fresh_lessons(uuid[]) from public, anon, authenticated;

-- The nine units, and every class on the road: whichever of them sits behind
-- a learner and has no progress of hers is one a migration put there.
select public.credit_fresh_lessons(array(
  select l.id
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where l.status = 'published'
    and (
      u.slug in ('no-entiendo', 'treinta-y-cuatro', 'cuanto-cuesta', 'adonde-vas', 'hoy-y-manana', 'este-y-ese', 'la-campera-nueva', 'estoy-llegando', 'que-decis')
      or l.kind in ('speak', 'slang', 'culture', 'story')
    )
));
