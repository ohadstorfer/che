-- A gloss does two jobs at once, and they pull in opposite directions.
--
-- "mate (the drink)" teaches an English speaker what mate is; that is the
-- point of the parenthetical. But the same string is also the answer tile in
-- a matching exercise, the option in a multiple choice, the target of a word
-- build — and there it gives the answer away: the tile contains the Spanish
-- word it is supposed to be matched to.
--
-- So the note moves out of the gloss. `gloss_en` becomes the short label that
-- answer-facing screens show, and `gloss_note_en` carries the explanation for
-- the screens that teach or reveal.
--
-- Not every parenthetical is a note. "you (informal)" vs "you (plural)" and
-- "likes (one thing)" vs "likes (several things)" disambiguate two glosses
-- that would otherwise be identical — stripping those would make the two
-- words unanswerable against each other. Those stay in `gloss_en`; only the
-- encyclopedic asides move.

alter table public.lemmas add column if not exists gloss_note_en text;
alter table public.forms  add column if not exists gloss_note_en text;

comment on column public.lemmas.gloss_note_en is
  'Encyclopedic aside shown when teaching or revealing the word, never on an answer tile: "the drink" for mate. Grammatical disambiguators belong in gloss_en.';
comment on column public.forms.gloss_note_en is
  'Overrides the lemma''s note when the form needs its own.';

-- form_entries resolves the note the same way it resolves the gloss.
-- available_forms returns rows of the view, so it is dropped around it.
drop function if exists public.available_forms(smallint);
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
  coalesce(f.gloss_note_en, l.gloss_note_en) as gloss_note_en,
  f.features,
  f.unit_id,
  u.ordinal as unit_ordinal,
  u.course_order as unit_order,
  u.section_id,
  l.is_glue,
  l.register,
  f.audio_path,
  f.status,
  f.alt
from public.forms f
join public.lemmas l on l.id = f.lemma_id
join public.units u on u.id = f.unit_id;

create or replace function public.available_forms(p_course_order smallint)
returns setof public.form_entries
language sql
stable
as $$
  select * from public.form_entries where unit_order <= p_course_order;
$$;
