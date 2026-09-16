-- ---------------------------------------------------------------------------
-- Three sections of ten units, and room for the lesson mix.
--
-- The course is now split into sections the way Duolingo's is, so a unit has
-- two numbers: `ordinal` is its place in its own section — what the path shows
-- ("Section 2, Unit 3") — and `course_order` is its place in the whole course,
-- which is what "the learner has been taught this word by now" is measured on.
-- Before this, the two were the same number and the app compared ordinals; with
-- more than one section that comparison would be wrong.
--
-- Lessons also gain the kinds the units will hold once they exist: practice
-- (no new words), a story, and a listening episode.
-- ---------------------------------------------------------------------------

alter table public.units
  add column course_order smallint not null default 0;

comment on column public.units.course_order is
  'Place in the whole course, across sections. A form is available from its unit''s course_order on.';

-- Existing rows: one section, so the two numbers agree.
update public.units u
set course_order = (select s.ordinal from public.sections s where s.id = u.section_id) * 100 + u.ordinal;

create unique index units_course_order_idx on public.units (course_order);

-- A lesson that teaches nothing new: practice, a story, a listening episode.
alter table public.lessons drop constraint lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check
  check (kind in ('lesson', 'practice', 'story', 'listening', 'review', 'checkpoint'));

-- The lexicon the app reads. `unit_order` is what it filters on; `unit_ordinal`
-- stays for display. The function returns rows of the view, so it goes first.
drop function if exists public.available_forms(smallint, smallint);
drop view if exists public.form_entries;
create view public.form_entries
with (security_invoker = true) as
select
  f.id,
  f.lemma_id,
  l.lemma,
  l.pos,
  f.form,
  coalesce(f.gloss_en, l.gloss_en) as gloss_en,
  f.features,
  f.unit_id,
  u.ordinal as unit_ordinal,
  u.course_order as unit_order,
  u.section_id,
  l.is_glue,
  l.register,
  f.audio_path,
  f.status
from public.forms f
join public.lemmas l on l.id = f.lemma_id
join public.units u on u.id = f.unit_id;

-- Everything published up to a point in the course, for the linter and the
-- admin dashboard.
create or replace function public.available_forms(p_course_order smallint)
returns setof public.form_entries
language sql
stable
as $$
  select * from public.form_entries where unit_order <= p_course_order;
$$;
