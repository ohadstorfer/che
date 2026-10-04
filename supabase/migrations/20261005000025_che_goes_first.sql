-- Tester notes, 2026-10-04.
-- "che" calls someone ("Che, Tomás, ¿querés mate?"); it doesn't close a greeting.
-- The three sentences that ended on it are rewritten in place (same rows, so
-- lessons keep their slots); their old recordings said the old text, so they go.
-- "Hi there." is how the course teaches "buenas", so "Buenas." is accepted for it.

update public.sentences set
  es = 'Che, Sofi, ¿un café?', en = 'Hey, Sofi, a coffee?',
  es_alt = array['Sofi, ¿un café?']::text[], en_alt = array['Hey, Sofi, coffee?', 'Hey, Sofi, want a coffee?']::text[],
  tokens = '[{"form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey","surface":"Che,"},{"form_ids":["e987c76e-fff4-5bb1-8495-2897a6baa97d"],"gloss":"Sofi","surface":"Sofi,"},{"form_ids":["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"],"gloss":"a","surface":"¿un"},{"form_ids":["c7bf2819-57df-5873-99e0-553951291a4f"],"gloss":"coffee","surface":"café?"}]'::jsonb,
  audio_path = null, voice_id = null
where id = 'cb631b53-b406-564e-8043-846a65e211a4' and es = 'Hola, che.';

update public.sentences set
  es = 'Chau, Sofi.', en = 'Bye, Sofi.',
  es_alt = '{}'::text[], en_alt = array['See you, Sofi.']::text[],
  tokens = '[{"form_ids":["16df9c18-3edc-5405-8f9e-b7d5c3ec1103"],"gloss":"bye","surface":"Chau,"},{"form_ids":["e987c76e-fff4-5bb1-8495-2897a6baa97d"],"gloss":"Sofi","surface":"Sofi."}]'::jsonb,
  audio_path = null, voice_id = null
where id = '1200d3ac-b8e0-57f1-b522-e34ab06a3703' and es = 'Chau, che.';

update public.sentences set
  es = 'Hola, Lucía, ¿cómo andás?', en = 'Hi, Lucía, how are you doing?', kind = 'sentence',
  es_alt = '{}'::text[], en_alt = array['Hi, Lucía, how are you?', 'Hi, Lucía, how''s it going?']::text[],
  tokens = '[{"form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi","surface":"Hola,"},{"form_ids":["ef9adde3-0a4b-5455-bfad-0d70b236e93f"],"gloss":"Lucía","surface":"Lucía,"},{"form_ids":["29eded5c-4d3e-5ecb-bc7b-87744378cc64"],"gloss":"how are you doing","surface":"¿cómo andás?"}]'::jsonb
where id = '2cd35c5c-610a-5049-b03c-f29f24f88477' and es = 'Hola, che. ¿Qué onda?';

update public.sentences set es_alt = array['Buenas.', 'Hola.']::text[]
where id = '8991ea2b-d04c-5195-a049-f2be7a9efa55' and es = 'Hola, buenas.';

update public.sentences set es_alt = array['Hola. ¿Qué onda?', 'Hola, ¿qué onda?']::text[]
where id = 'e5e2379e-81c0-5ee6-a781-fd944db3d2db' and es = 'Buenas, ¿qué onda?';

update public.tips set body_md = '**Che** is how people in Buenos Aires get someone''s attention — like "hey": *Che, ¿todo bien?* It comes first, often with a name: *Che, Juan, ¿un mate?* It''s friendly and casual — not for formal moments.'
where id = '8b938cde-ecea-5e1b-bd22-3219656dc110';

update public.units set summary_en = 'Che, ¿todo bien?' where slug = 'hola-che' and summary_en = 'Hola, che';

-- A listening drill needs a recording; the rewritten sentence has none. It was
-- the lesson's last slot, and the lesson keeps its other listening drill.
delete from public.lesson_slots where id = '942105be-53c4-42a2-9585-b0759beb00ca' and mode = 'sentence_listen';
