-- Three fixes from the native read of section 1 (docs/course-spec.md Appendix B):
--
--   1. "mal" is "bad", not "not great".
--   2. "che" goes in FRONT, where English puts "hey" — never the "man" on the
--      end. Only a bare greeting may precede it ("Hola, che.").
--   3. "qué tal" is Spain's greeting. It retires; "qué onda" takes its place,
--      and "¿Todo bien?" asks as well as answers.
--
-- The rules that keep these from coming back live in src/lib/course-rules
-- (REGIONAL_PHRASES, chePlacement) and run in course:lint, course:validate,
-- the generator and the admin's editors.

-- 1 ----------------------------------------------------------------- mal
update public.lemmas set gloss_en = 'bad, badly' where id = 'd174396f-ca00-5051-b14e-b7d77da5d9b5';

-- "todo bien" is a question as much as an answer.
update public.lemmas set gloss_note_en = 'also the question: ¿Todo bien?' where id = '85e7fa2a-8e0b-56b1-b4a3-d8d89c721bb3';

-- 3 ------------------------------------------------------------- qué onda
insert into public.lemmas (id, lemma, pos, gloss_en, gloss_note_en, register, is_glue, notes_en, status) values
  ('2f675545-4006-54c5-beaf-ad9fca37001f', 'qué onda', 'phrase', 'what''s up', null, 'informal', false, null, 'published')
on conflict (id) do update set lemma = excluded.lemma, pos = excluded.pos, gloss_en = excluded.gloss_en, gloss_note_en = excluded.gloss_note_en, register = excluded.register, is_glue = excluded.is_glue, notes_en = excluded.notes_en, status = excluded.status;
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, audio_path, voice_id, status) values
  ('e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8', '2f675545-4006-54c5-beaf-ad9fca37001f', 'qué onda', '{}'::jsonb, null, null, 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 11, null, null, 'published')
on conflict (id) do update set lemma_id = excluded.lemma_id, form = excluded.form, features = excluded.features, gloss_en = excluded.gloss_en, gloss_note_en = excluded.gloss_note_en, unit_id = excluded.unit_id, position = excluded.position, audio_path = excluded.audio_path, voice_id = excluded.voice_id, status = excluded.status;

-- The sentences that replace the retired ones, tokens and accepted answers as
-- the content build computes them.
insert into public.sentences (id, unit_id, es, en, en_alt, es_alt, tokens, target_form_id, kind, difficulty, source, attribution, audio_path, voice_id, status) values
  ('cb8eb19b-55c9-5f3f-85b2-972b15989756', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', '¿Qué onda?', 'What''s up?', '{}'::text[], '{}'::text[], '[{"surface":"¿Qué onda?","form_ids":["e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8"],"gloss":"what''s up"}]'::jsonb, 'e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8', 'word', 1, 'human', null, null, null, 'published'),
  ('67f2fe05-e10e-52dd-a100-1bed48240311', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 'Hola, ¿qué onda?', 'Hi, what''s up?', '{}'::text[], '{}'::text[], '[{"surface":"Hola,","form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi"},{"surface":"¿qué onda?","form_ids":["e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8"],"gloss":"what''s up"}]'::jsonb, 'e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8', 'sentence', 1, 'human', null, null, null, 'published'),
  ('2cd35c5c-610a-5049-b03c-f29f24f88477', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 'Hola, che. ¿Qué onda?', 'Hi there. What''s up?', '{}'::text[], array['Hola. ¿qué onda?']::text[], '[{"surface":"Hola,","form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi"},{"surface":"che.","form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"]},{"surface":"¿Qué onda?","form_ids":["e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8"],"gloss":"what''s up"}]'::jsonb, '6273f090-0e32-5a87-b927-58303502ea3b', 'dialogue', 1, 'human', null, null, null, 'published'),
  ('2d03a391-e99b-5cce-bf78-022955e656da', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 'Sí, bien.', 'Yes, fine.', '{}'::text[], '{}'::text[], '[{"surface":"Sí,","form_ids":["191fd126-be91-54fb-8848-9f3aa180ca5d"],"gloss":"yes"},{"surface":"bien.","form_ids":["840881cd-bdb9-5631-9fa8-5c191bbb9a92"],"gloss":"fine"}]'::jsonb, '840881cd-bdb9-5631-9fa8-5c191bbb9a92', 'sentence', 1, 'human', null, null, null, 'published'),
  ('545e4d39-0cc9-53ca-a60c-15bd1414db16', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 'Che, ¿bien o mal?', 'Hey, good or bad?', '{}'::text[], array['¿Bien o mal?']::text[], '[{"surface":"Che,","form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey"},{"surface":"¿bien","form_ids":["840881cd-bdb9-5631-9fa8-5c191bbb9a92"],"gloss":"good"},{"surface":"o","form_ids":["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"],"gloss":"or"},{"surface":"mal?","form_ids":["7a86d9e6-cbda-5898-b35b-384407438914"],"gloss":"bad"}]'::jsonb, '7a86d9e6-cbda-5898-b35b-384407438914', 'sentence', 1, 'human', null, null, null, 'published'),
  ('98a27fa8-c15e-580c-8c66-801cda6b3a5d', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 'Che, ¿todo bien?', 'Hey, all good?', '{}'::text[], array['¿Todo bien?']::text[], '[{"surface":"Che,","form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey"},{"surface":"¿todo bien?","form_ids":["d108cd6e-fae2-5ab6-bfeb-054b01041ee6"],"gloss":"all good"}]'::jsonb, 'd108cd6e-fae2-5ab6-bfeb-054b01041ee6', 'sentence', 1, 'human', null, null, null, 'published')
on conflict (id) do update set unit_id = excluded.unit_id, es = excluded.es, en = excluded.en, en_alt = excluded.en_alt, es_alt = excluded.es_alt, tokens = excluded.tokens, target_form_id = excluded.target_form_id, kind = excluded.kind, difficulty = excluded.difficulty, source = excluded.source, attribution = excluded.attribution, audio_path = excluded.audio_path, voice_id = excluded.voice_id, status = excluded.status;

-- Lessons, stories and the unit's key phrases follow the swap; the lesson
-- design in the database is left as it is.
-- ¿Qué tal?  →  ¿Qué onda?
update public.lesson_slots set sentence_id = 'cb8eb19b-55c9-5f3f-85b2-972b15989756' where sentence_id = '46cabb7e-ce14-58f5-8051-8fff7ab05c76';
update public.story_lines  set sentence_id = 'cb8eb19b-55c9-5f3f-85b2-972b15989756' where sentence_id = '46cabb7e-ce14-58f5-8051-8fff7ab05c76';
update public.unit_phrases set sentence_id = 'cb8eb19b-55c9-5f3f-85b2-972b15989756' where sentence_id = '46cabb7e-ce14-58f5-8051-8fff7ab05c76';
-- Hola, ¿qué tal?  →  Hola, ¿qué onda?
update public.lesson_slots set sentence_id = '67f2fe05-e10e-52dd-a100-1bed48240311' where sentence_id = 'dceaca61-60b4-5bec-8d6c-3b213260d739';
update public.story_lines  set sentence_id = '67f2fe05-e10e-52dd-a100-1bed48240311' where sentence_id = 'dceaca61-60b4-5bec-8d6c-3b213260d739';
update public.unit_phrases set sentence_id = '67f2fe05-e10e-52dd-a100-1bed48240311' where sentence_id = 'dceaca61-60b4-5bec-8d6c-3b213260d739';
-- Hola, che. ¿Qué tal?  →  Hola, che. ¿Qué onda?
update public.lesson_slots set sentence_id = '2cd35c5c-610a-5049-b03c-f29f24f88477' where sentence_id = 'b9f297da-4c6b-5b25-9f8d-755f5a5f8f5e';
update public.story_lines  set sentence_id = '2cd35c5c-610a-5049-b03c-f29f24f88477' where sentence_id = 'b9f297da-4c6b-5b25-9f8d-755f5a5f8f5e';
update public.unit_phrases set sentence_id = '2cd35c5c-610a-5049-b03c-f29f24f88477' where sentence_id = 'b9f297da-4c6b-5b25-9f8d-755f5a5f8f5e';
-- Bien, che.  →  Sí, bien.
update public.lesson_slots set sentence_id = '2d03a391-e99b-5cce-bf78-022955e656da' where sentence_id = '3e21464d-fdbf-5521-9886-581c8cb336c2';
update public.story_lines  set sentence_id = '2d03a391-e99b-5cce-bf78-022955e656da' where sentence_id = '3e21464d-fdbf-5521-9886-581c8cb336c2';
update public.unit_phrases set sentence_id = '2d03a391-e99b-5cce-bf78-022955e656da' where sentence_id = '3e21464d-fdbf-5521-9886-581c8cb336c2';
-- Mal, che.  →  Che, ¿bien o mal?
update public.lesson_slots set sentence_id = '545e4d39-0cc9-53ca-a60c-15bd1414db16' where sentence_id = 'a9c3cb1f-b601-5f47-8b9f-70d603afb8e7';
update public.story_lines  set sentence_id = '545e4d39-0cc9-53ca-a60c-15bd1414db16' where sentence_id = 'a9c3cb1f-b601-5f47-8b9f-70d603afb8e7';
update public.unit_phrases set sentence_id = '545e4d39-0cc9-53ca-a60c-15bd1414db16' where sentence_id = 'a9c3cb1f-b601-5f47-8b9f-70d603afb8e7';
-- Bueno, chau, che.  →  Bueno, chau.
update public.lesson_slots set sentence_id = '9f6c924d-0a4e-5329-923c-69d11fc1b5f4' where sentence_id = '56148f3a-9f02-5fb6-9f08-40dcdfcf8530';
update public.story_lines  set sentence_id = '9f6c924d-0a4e-5329-923c-69d11fc1b5f4' where sentence_id = '56148f3a-9f02-5fb6-9f08-40dcdfcf8530';
update public.unit_phrases set sentence_id = '9f6c924d-0a4e-5329-923c-69d11fc1b5f4' where sentence_id = '56148f3a-9f02-5fb6-9f08-40dcdfcf8530';

-- A slot that taught "qué tal" teaches "qué onda".
update public.lesson_slots set form_id = 'e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8' where form_id = '5843c164-0b5c-5ff7-b794-8a82954c3444';

-- Out of the course. Retired, not deleted: a learner's record still points here.
update public.sentences set status = 'retired' where id in ('46cabb7e-ce14-58f5-8051-8fff7ab05c76', 'dceaca61-60b4-5bec-8d6c-3b213260d739', 'b9f297da-4c6b-5b25-9f8d-755f5a5f8f5e', '3e21464d-fdbf-5521-9886-581c8cb336c2', 'a9c3cb1f-b601-5f47-8b9f-70d603afb8e7', '56148f3a-9f02-5fb6-9f08-40dcdfcf8530');
update public.forms  set status = 'retired' where id = '5843c164-0b5c-5ff7-b794-8a82954c3444';
update public.lemmas set status = 'retired' where id = '0ed284c9-c5ed-5978-b32a-3a749deb769e';

-- Unit 10 asked "¿Qué tal tus viejos?". A porteño asks with "todo bien".
-- The recording goes with the words; course:tts records them again.
insert into public.sentences (id, unit_id, es, en, en_alt, es_alt, tokens, target_form_id, kind, difficulty, source, attribution, audio_path, voice_id, status) values
  ('be3165a2-5c9c-5eb6-afb9-5f04ff56751d', 'f1fa7454-72a3-546d-8f72-4aab149bbbbe', '¿Y tus abuelos, todo bien?', 'And your grandparents, all good?', '{}'::text[], '{}'::text[], '[{"surface":"¿Y","form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"and"},{"surface":"tus","form_ids":["b944557e-853c-5039-9d8d-1aeedbc21830"],"gloss":"your"},{"surface":"abuelos,","form_ids":["be95e7d1-b26a-5725-bd27-d956108e5436"],"gloss":"grandparents"},{"surface":"todo bien?","form_ids":["d108cd6e-fae2-5ab6-bfeb-054b01041ee6"],"gloss":"all good"}]'::jsonb, 'be95e7d1-b26a-5725-bd27-d956108e5436', 'sentence', 1, 'ai', null, null, null, 'published'),
  ('de7d7760-9573-5c90-99a5-430481eef523', 'f1fa7454-72a3-546d-8f72-4aab149bbbbe', '¿Y tus viejos, todo bien?', 'And your parents, all good?', '{}'::text[], '{}'::text[], '[{"surface":"¿Y","form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"and"},{"surface":"tus","form_ids":["b944557e-853c-5039-9d8d-1aeedbc21830"],"gloss":"your"},{"surface":"viejos,","form_ids":["9cbb7c25-eedc-5549-a9c9-a6bff2ef0690"],"gloss":"parents"},{"surface":"todo bien?","form_ids":["d108cd6e-fae2-5ab6-bfeb-054b01041ee6"],"gloss":"all good"}]'::jsonb, '9cbb7c25-eedc-5549-a9c9-a6bff2ef0690', 'sentence', 1, 'ai', null, null, null, 'published')
on conflict (id) do update set unit_id = excluded.unit_id, es = excluded.es, en = excluded.en, en_alt = excluded.en_alt, es_alt = excluded.es_alt, tokens = excluded.tokens, target_form_id = excluded.target_form_id, kind = excluded.kind, difficulty = excluded.difficulty, source = excluded.source, attribution = excluded.attribution, audio_path = excluded.audio_path, voice_id = excluded.voice_id, status = excluded.status;

-- Accepted answers the generator wrote with "che" on the end. An answer is a
-- sentence a learner may write, so it is held to the same rule.
-- Che, ¿cómo te llamás?: dropped "¿Cómo te llamás, che?"
update public.sentences set es_alt = array['¿Cómo te llamás?']::text[] where id = '893ac8f5-0a38-5687-b293-dcf319ed6646';
-- Che, ¿cómo te llamás? Yo soy Sofi.: dropped "¿Cómo te llamás, che? Yo soy Sofi.", "¿Cómo te llamás, che? Soy Sofi."
update public.sentences set es_alt = array['Che, ¿cómo te llamás? soy Sofi.', '¿Cómo te llamás? yo soy Sofi.', '¿Cómo te llamás? soy Sofi.']::text[] where id = '587ea39b-4144-5b30-a836-5fddc675ca04';
-- Che, ¿cuántos años tenés?: dropped "¿Cuántos años tenés, che?"
update public.sentences set es_alt = array['Che, ¿cuántas años tenés?', '¿Cuántos años tenés?', '¿Cuántas años tenés?']::text[] where id = '31b7cf97-988d-5a10-abce-19ce755f76dd';
-- Che, ¿tenés agua?: dropped "¿Tenés agua, che?"
update public.sentences set es_alt = array['Che, ¿vos tenés agua?', '¿Tenés agua?', '¿Vos tenés agua?']::text[] where id = 'b5c7db7a-e1e0-5e18-b265-6993970c5a92';

-- Five words rather than four: the band, not the sentence, was the thing that
-- was a shade off.
update public.sentences set difficulty = 2
where id in ('be3165a2-5c9c-5eb6-afb9-5f04ff56751d', 'de7d7760-9573-5c90-99a5-430481eef523');

-- The tip a learner reads said "hey" or "mate", which is the English tag. It
-- now says where `che` goes.
update public.tips set body_md = '**Che** is how people in Buenos Aires get someone''s attention — like "hey". It goes in front, where "hey" goes: *Che, ¿todo bien?* Only a greeting comes before it — *Hola, che.* It is never the English "man" on the end. It''s friendly, never rude.' where id = '8b938cde-ecea-5e1b-bd22-3219656dc110';
