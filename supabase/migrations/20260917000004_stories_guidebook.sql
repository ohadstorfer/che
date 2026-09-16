-- ---------------------------------------------------------------------------
-- Stories and the unit guidebook — docs/learning-engine-spec.md §8, §9.
--
-- A story is a lesson of kind 'story' made of ordered lines. Each line is an
-- ordinary sentence (kind 'dialogue'), so tokens, linters, accepted answers
-- and audio all apply unchanged; some lines carry a question.
--
-- A unit's guidebook is its tips plus up to five key phrases — sentences of
-- the unit, so they have audio and a translation already.
-- ---------------------------------------------------------------------------

create table public.story_lines (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons on delete cascade,
  ordinal     smallint not null,
  speaker     text not null,
  sentence_id uuid not null references public.sentences,
  -- null, or {"type":"meaning"} | {"type":"gap","form":"<form id>"} | {"type":"build"}
  --        | {"type":"choice","prompt_en":"…","options_en":["…"],"correct":<index>}
  question    jsonb,
  unique (lesson_id, ordinal),
  check (question is null or question->>'type' in ('meaning', 'gap', 'build', 'choice'))
);
create index story_lines_lesson_idx on public.story_lines (lesson_id);

create table public.unit_phrases (
  unit_id     uuid not null references public.units on delete cascade,
  ordinal     smallint not null check (ordinal between 1 and 5),
  sentence_id uuid not null references public.sentences,
  primary key (unit_id, ordinal)
);

alter table public.story_lines  enable row level security;
alter table public.unit_phrases enable row level security;

create policy "story_lines: read with lesson" on public.story_lines for select to authenticated
  using (exists (
    select 1 from public.lessons l
    where l.id = lesson_id and (l.status = 'published' or public.is_staff())
  ));
create policy "story_lines: staff insert" on public.story_lines for insert to authenticated
  with check (public.is_staff());
create policy "story_lines: staff update" on public.story_lines for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "story_lines: staff delete" on public.story_lines for delete to authenticated
  using (public.is_staff());

create policy "unit_phrases: read with unit" on public.unit_phrases for select to authenticated
  using (exists (
    select 1 from public.units u
    where u.id = unit_id and (u.status = 'published' or public.is_staff())
  ));
create policy "unit_phrases: staff insert" on public.unit_phrases for insert to authenticated
  with check (public.is_staff());
create policy "unit_phrases: staff update" on public.unit_phrases for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "unit_phrases: staff delete" on public.unit_phrases for delete to authenticated
  using (public.is_staff());
