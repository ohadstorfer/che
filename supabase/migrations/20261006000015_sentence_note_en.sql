-- A sentence's own aside, shown in the feedback bar once she has answered:
-- why the written Spanish has a word the English never asked for ("No, de
-- nada": the "No," waves the thanks away). Like forms.gloss_note_en, one level
-- up. Null for most sentences: where two answers are simply both right, there
-- is nothing to explain.
alter table public.sentences add column if not exists note_en text;

comment on column public.sentences.note_en is
  'One or two plain-English sentences about the Spanish as written, shown after she answers (right another way, or wrong). Null when there is nothing to say.';
