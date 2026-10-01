-- ---------------------------------------------------------------------------
-- Fix for 20260930000001_unit_extras.sql. It marked a unit's new classes done
-- for anyone with progress anywhere further down the road, but a learner can
-- have progress past where she stands (a unit tested into, an older road), so
-- classes ahead of her were stamped done and the path skipped them. A new
-- class stays done only if it sits before the first lesson she had not
-- finished when the classes were added; the rest are hers to play.
--
-- The rows it wrote are the ones stamped 'placement', without a score, in the
-- second that migration ran.
-- ---------------------------------------------------------------------------

with road as (
  select l.id, l.kind, row_number() over (order by s.ordinal, u.ordinal, l.ordinal) as pos
  from public.lessons l
  join public.units u on u.id = l.unit_id and u.status = 'published'
  join public.sections s on s.id = u.section_id and s.status = 'published'
  where l.status = 'published'
),
backfilled as (
  select lp.user_id, lp.lesson_id, r.pos
  from public.lesson_progress lp join road r on r.id = lp.lesson_id
  where r.kind in ('speak', 'slang', 'culture') and lp.passed_by = 'placement' and lp.score is null
    and lp.completed_at >= '2026-09-30 09:17:35+00' and lp.completed_at < '2026-09-30 09:17:36+00'
),
frontier as (
  select b.user_id, (
    select min(r.pos) from road r
    where r.kind not in ('speak', 'slang', 'culture')
      and not exists (select 1 from public.lesson_progress p where p.user_id = b.user_id and p.lesson_id = r.id and p.completed_at < '2026-09-30 09:17:35+00')
  ) as pos
  from (select distinct user_id from backfilled) b
)
delete from public.lesson_progress lp
using backfilled b, frontier f
where lp.user_id = b.user_id
  and lp.lesson_id = b.lesson_id
  and f.user_id = b.user_id
  and b.pos > f.pos; -- none left to finish: she keeps them all
