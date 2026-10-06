-- Two small things the fixed unit shape needs (scripts/course/lib/template.mjs).

-- A slang lesson closes on a review of the slang she has met so far: a recap
-- whose scope is 'slang' (src/lib/lesson.ts recapItems). An app that doesn't
-- know the scope yet reads it as the section's recap.
alter table public.lesson_slots drop constraint if exists lesson_slots_scope_check;
alter table public.lesson_slots add constraint lesson_slots_scope_check check (scope in ('unit', 'section', 'slang'));

-- The free tier was the course's first two units. The second one was split in
-- two (20261006000001), so the same lessons are now three units. The app's
-- FREE_UNITS agrees.
create or replace function public.free_units()
returns int
language sql
immutable
as $$ select 3 $$;
