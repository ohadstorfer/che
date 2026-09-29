-- Premium, enforced by the database. Until now only the app hid the lessons
-- past the free tier; anyone could read their slots straight from the API.
-- A lesson is its slots, so the lock goes there: a free account reads the
-- slots of the first free_units() units of the road, premium and staff read
-- everything. Units, lessons and tips stay readable — the road still draws
-- the whole course, locked steps and all.

-- Units of the course open without paying. The app's FREE_UNITS agrees.
create or replace function public.free_units()
returns int
language sql
immutable
as $$ select 2 $$;

-- Premium for the caller. is_premium(uuid) stays closed to clients (it would
-- tell anyone about anyone); this one only answers about yourself.
create or replace function public.has_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select public.is_premium(auth.uid()) $$;

revoke all on function public.has_premium() from public, anon;
grant execute on function public.has_premium() to authenticated;

-- The lessons of the free units, counted the way the app draws the road
-- (course.ts assemble): published sections by ordinal, their published units
-- by ordinal, skipping units with no published lesson.
create or replace function public.free_lesson_ids()
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
  where r.n <= public.free_units()
    and l.status = 'published';
$$;

revoke all on function public.free_lesson_ids() from public, anon;
grant execute on function public.free_lesson_ids() to authenticated;

-- Uncorrelated subqueries, so each check runs once per statement (see
-- 20260927300001_rls_initplan.sql), not once per slot.
alter policy "lesson_slots: read with lesson" on public.lesson_slots
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_id and (l.status = 'published' or (select public.is_staff()))
    )
    and (
      (select public.is_staff())
      or (select public.has_premium())
      or lesson_id in (select unnest(public.free_lesson_ids()))
    )
  );
