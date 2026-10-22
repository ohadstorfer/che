-- New words for units that already exist (scripts/course/add-words.mjs, from
-- nono.yaml): 0 for the units' lessons, 1 for their slang lessons.
-- Adds only: a row already there is left as it is.
-- As drafts: the scripts write their sentences against them; the app sees them
-- when they are published, with the lessons that teach them.

insert into public.lemmas (id, lemma, pos, gloss_en, gloss_note_en, register, is_glue, notes_en, status) values
  ('326dc173-1b3a-5187-bc56-b8fa427d0dcc', 'nono', 'noun', 'grandpa', 'What many Argentines call their grandparents (from Italian): "mi nona", "los nonos".', 'informal', false, null, 'draft')
on conflict do nothing;

insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, status) values
  ('acecf461-d4cf-56bd-bacf-129fd5c4c605', '326dc173-1b3a-5187-bc56-b8fa427d0dcc', 'nono', '{"gender":"m","number":"sg"}'::jsonb, 'grandpa', null, '9a649d54-c14a-56da-8701-c4783ad9a159', 17, false, 'draft'),
  ('d07a0965-8604-5920-9359-b51ed635e0c7', '326dc173-1b3a-5187-bc56-b8fa427d0dcc', 'nona', '{"gender":"f","number":"sg"}'::jsonb, 'grandma', null, '9a649d54-c14a-56da-8701-c4783ad9a159', 18, false, 'draft')
on conflict do nothing;
