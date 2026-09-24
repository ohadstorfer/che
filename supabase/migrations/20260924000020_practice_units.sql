-- Practice units (docs/course/roadmap.md §Practice): a unit that teaches no
-- words of its own and drills earlier ones. `review_form_ids` lists them; an
-- ordinary unit leaves it empty. The pipeline writes the unit's sentences for
-- these forms, and its lessons are all practice.
alter table public.units add column if not exists review_form_ids uuid[] not null default '{}';
