-- Bound forms: a word the course only ever says inside a longer one
-- (docs/course-spec.md §1.5).
--
-- Unit 4 taught "llamo" as a word, with the English "(my name) is, I'm called".
-- It is not a word. Nineteen sentences in the course contain it and every one
-- says "me llamo"; the parenthesis in that gloss is the "me" the
-- Spanish does not carry, and a card strips the parenthesis back off, so the
-- learner was shown «llamo / name is» and asked whether that was right. There
-- is nothing there to know. Worse, the one idea the unit teaches — the little
-- word changes with the person — was never asked about at all, because "llamo"
-- and "llamás" were two cards with two schedules and no question between them.
--
-- What changes: the chunk becomes the form. "me llamo" and "te llamás" are
-- forms of llamarse like any other, drilled as phrases are — built from tiles,
-- which is the exercise that finally asks about the clitic. The bare forms stay
-- so the dictionary keeps the conjugation and nothing that points at them
-- breaks, and are marked `bound`: never a card, an option, a tile, a distractor
-- or a schedule of their own. `drillable()` in src/lib/course-rules/vocabulary.ts
-- is the one place that decides it, and every exercise producer and linter reads
-- it.
--
-- Section 3's routine unit had ten more of the same, still in draft: levantarse,
-- acostarse, bañarse, juntarse. They are fixed here before they ship. That also
-- settles a collision — "baño" on its own is the bathroom, and the course had
-- two cards for the one string saying different things.
--
-- `npm run course:validate` now fails on any form the course never says alone,
-- so this cannot come back.

begin;

alter table public.forms add column if not exists bound boolean not null default false;

comment on column public.forms.bound is
  'A form that is never said on its own — "llamo", which only ever appears inside "me llamo". It keeps its place in sentences and in the dictionary and is never drilled; the chunk that contains it is a form of its own. docs/course-spec.md §1.5.';

-- The view the app and the admin read forms through. available_forms returns
-- rows of it, so it is dropped around it.
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
  f.bound,
  f.audio_path,
  f.voice_id,
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

-- New forms: me llamo, te llamás, me levanto, te levantás, se levanta, nos levantamos, me acuesto, te acostás, se acuesta, me baño, te bañás, nos juntamos
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('c9d318dc-a83c-552b-8392-45726b3c00fe', '52b2d91a-7deb-56b4-9e8e-111888ca8335', 'me llamo', '{"person":1,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'my name is', null, 'd35a777a-0a33-5ede-8fb9-39d0107d41f6', 3, false, null, null, 'published'),
  ('4f173e8a-138d-5e78-ac11-53284731caa7', '52b2d91a-7deb-56b4-9e8e-111888ca8335', 'te llamás', '{"person":2,"number":"sg","tense":"pres","mood":"ind","voseo":true,"clitic":true}'::jsonb, 'your name is', null, 'd35a777a-0a33-5ede-8fb9-39d0107d41f6', 4, false, null, null, 'published'),
  ('66c87f87-7220-54ba-ae85-b1cf34cc38c3', 'b8809084-2009-56cb-9664-3f482fcdae1e', 'me levanto', '{"person":1,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'I get up', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 2, false, null, null, 'draft'),
  ('9f0971b6-277a-51fa-82b3-e73e30df141b', 'b8809084-2009-56cb-9664-3f482fcdae1e', 'te levantás', '{"person":2,"number":"sg","tense":"pres","mood":"ind","voseo":true,"clitic":true}'::jsonb, 'you get up', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 3, false, null, null, 'draft'),
  ('760eea97-4e6c-53a9-9281-74c4219f739c', 'b8809084-2009-56cb-9664-3f482fcdae1e', 'se levanta', '{"person":3,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'he gets up, she gets up', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 4, false, null, null, 'draft'),
  ('3313381b-d51b-5e4b-9817-85d74d0335c8', 'b8809084-2009-56cb-9664-3f482fcdae1e', 'nos levantamos', '{"person":1,"number":"pl","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'we get up', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 5, false, null, null, 'draft'),
  ('f7509368-ee33-592d-ac70-eed8d502e037', '6cfbf35c-fb8d-5ff3-bf54-66d8cc5e7e70', 'me acuesto', '{"person":1,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'I go to bed', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 10, false, null, null, 'draft'),
  ('991188ae-a056-55a0-8a9e-6d761455d745', '6cfbf35c-fb8d-5ff3-bf54-66d8cc5e7e70', 'te acostás', '{"person":2,"number":"sg","tense":"pres","mood":"ind","voseo":true,"clitic":true}'::jsonb, 'you go to bed', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 11, false, null, null, 'draft'),
  ('439ba985-7c7c-5554-ad06-5b6a5b847b3a', '6cfbf35c-fb8d-5ff3-bf54-66d8cc5e7e70', 'se acuesta', '{"person":3,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'he goes to bed, she goes to bed', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 12, false, null, null, 'draft'),
  ('1712d004-9a3f-5321-928d-c00832b6b07b', '0b4ad584-b976-5a08-838e-f4514703496d', 'me baño', '{"person":1,"number":"sg","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'I shower', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 16, false, null, null, 'draft'),
  ('61563d84-d7a3-573a-bcf8-37c1a8dc345b', '0b4ad584-b976-5a08-838e-f4514703496d', 'te bañás', '{"person":2,"number":"sg","tense":"pres","mood":"ind","voseo":true,"clitic":true}'::jsonb, 'you shower', null, '441e2e5b-f704-511a-9e55-ef9613425ce8', 17, false, null, null, 'draft'),
  ('3a88754b-296a-56e1-ad0b-5ae8ab3a3736', 'e86733e8-6eb2-5432-b0f8-e613cf83cb1c', 'nos juntamos', '{"person":1,"number":"pl","tense":"pres","mood":"ind","clitic":true}'::jsonb, 'we get together', null, '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', 10, false, null, null, 'draft')
on conflict (id) do update set position = excluded.position, features = excluded.features, gloss_en = excluded.gloss_en, bound = excluded.bound;

-- Everything after them in its unit moves down to make room.
update public.forms set position = 5 where id = 'dba200c4-cad2-5945-b978-2f4b6b067c85';  -- llamo
update public.forms set position = 6 where id = '07eef1c0-c5a0-5a72-aa80-d263eac024b1';  -- llamás
update public.forms set position = 7 where id = 'af3a59da-b961-5310-80f6-95b5b4c531bd';  -- cómo
update public.forms set position = 8 where id = 'bab9ff2f-3c80-557a-8a52-c8d02efd2e85';  -- mucho gusto
update public.forms set position = 6 where id = 'dc013b91-5cc8-5e47-968e-97d94a1ea077';  -- levanto
update public.forms set position = 7 where id = 'fd8a3a9e-a1b2-52fd-800a-3da63aa8ce2e';  -- levantás
update public.forms set position = 8 where id = '5c37bc4a-a8a4-526b-9ef3-c14faa5a6f9c';  -- levanta
update public.forms set position = 9 where id = '1a4d96c1-340c-5096-a7cb-eaa54f63bcd7';  -- levantamos
update public.forms set position = 13 where id = 'd4d682d8-0232-5a7e-9844-ddb22d7e0007';  -- acuesto
update public.forms set position = 14 where id = 'bf400955-1ef2-5f06-9170-4504cf718a6d';  -- acostás
update public.forms set position = 15 where id = '66aee40a-62ac-5f3c-9519-24085d8a888a';  -- acuesta
update public.forms set position = 18 where id = '3be01419-1ee3-542a-a0c2-1729ff910131';  -- baño
update public.forms set position = 19 where id = '956352e2-b61e-53a2-b913-16f3f43ffa46';  -- bañás
update public.forms set position = 20 where id = '5df13f06-ff9e-5779-a2ec-cf097ea70535';  -- desayuno
update public.forms set position = 21 where id = 'f53cde60-88bb-5982-bdc7-7aeafb27bac7';  -- desayunás
update public.forms set position = 22 where id = '7e4d390a-7de3-5251-ab7c-547aa5bf012a';  -- almuerzo
update public.forms set position = 23 where id = 'f78c47d0-1b8e-5561-a054-f631a23277ed';  -- almorzás
update public.forms set position = 24 where id = '7354bc6c-e0b7-5a6b-a1a5-569397b54807';  -- ceno
update public.forms set position = 25 where id = 'dd03b871-0d53-59a9-999f-98be1ae78b11';  -- cenás
update public.forms set position = 26 where id = 'f077196b-0352-5000-81bc-14197658412b';  -- antes
update public.forms set position = 27 where id = 'acbd1c31-36cb-55e9-a5bf-ff19787a5774';  -- después
update public.forms set position = 28 where id = '8524ff5e-96f8-5471-96de-0b19c475d606';  -- finde
update public.forms set position = 29 where id = '1c7a79a0-5954-5457-97a4-b2d92325405f';  -- sábados
update public.forms set position = 30 where id = '23f5f8f3-3593-593d-acc5-3d85a8c84a47';  -- domingos
update public.forms set position = 31 where id = '24c78870-e8d1-5181-beb0-828446f88ead';  -- todos
update public.forms set position = 32 where id = 'bd34335e-9f91-5757-8764-2d48a54876b9';  -- todas
update public.forms set position = 11 where id = '8551cddf-9d8d-5bd3-8ad1-7469b1d5bdd5';  -- juntamos
update public.forms set position = 12 where id = '9e449a90-61c6-5625-90f3-aff66e884be8';  -- mirar
update public.forms set position = 13 where id = 'b337ff6f-1f0a-5728-b891-44851a8b0085';  -- jugar
update public.forms set position = 14 where id = '01d895e6-d37b-5095-afa6-2c1a2d210768';  -- juego
update public.forms set position = 15 where id = 'a043beaa-cff1-53eb-abd9-887cc31edcda';  -- jugás
update public.forms set position = 16 where id = '13928e97-3b6e-5bbb-a56d-8d9ef9c0b28c';  -- bailar
update public.forms set position = 17 where id = '3a42de21-f6b4-5ed7-8f76-07eaf2ed0c44';  -- bailo
update public.forms set position = 18 where id = 'e84c83f8-e947-5469-bb7e-eef2275af774';  -- cocinar
update public.forms set position = 19 where id = 'd17d6c3d-ae3d-5517-b0c0-21aff3bc00cd';  -- cocino
update public.forms set position = 20 where id = 'c99e46b3-0c6d-5edb-b7d1-b526adb0b151';  -- leer
update public.forms set position = 21 where id = '283fc0bf-1537-5afe-8c46-bef1e58979be';  -- hacer
update public.forms set position = 22 where id = '6d5ea47f-ee75-5e7a-a15f-9b500dfb922a';  -- serie
update public.forms set position = 23 where id = 'b8cb6676-0f52-5fa5-afb9-b26945af4247';  -- película
update public.forms set position = 24 where id = '0d7d2982-d23b-5af2-ac97-ce7d035e6b76';  -- música

-- The bare forms stay, and stop being drilled: llamo, llamás, levanto, levantás, levanta, levantamos, acuesto, acostás, acuesta, baño, bañás, juntamos
update public.forms set bound = true, gloss_en = null where id in (
  'dba200c4-cad2-5945-b978-2f4b6b067c85',
  '07eef1c0-c5a0-5a72-aa80-d263eac024b1',
  'dc013b91-5cc8-5e47-968e-97d94a1ea077',
  'fd8a3a9e-a1b2-52fd-800a-3da63aa8ce2e',
  '5c37bc4a-a8a4-526b-9ef3-c14faa5a6f9c',
  '1a4d96c1-340c-5096-a7cb-eaa54f63bcd7',
  'd4d682d8-0232-5a7e-9844-ddb22d7e0007',
  'bf400955-1ef2-5f06-9170-4504cf718a6d',
  '66aee40a-62ac-5f3c-9519-24085d8a888a',
  '3be01419-1ee3-542a-a0c2-1729ff910131',
  '956352e2-b61e-53a2-b913-16f3f43ffa46',
  '8551cddf-9d8d-5bd3-8ad1-7469b1d5bdd5'
);

-- The 10 live sentences that say it, re-tokenized so the chunk is one
-- token: what she taps, what a gap blanks, and what the lesson counts as
-- drilled. The merged token keeps no gloss — "npm run course:gloss" aligns
-- it again, and a gloss is only ever stored when it is whole words of the
-- English. 30 retired sentences are left as they are.
update public.sentences set tokens = '[{"surface":"¿Te llamás","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]},{"surface":"Juan?","form_ids":["a0c76088-db09-545c-9b35-a28ec314414d"],"gloss":"Juan"}]'::jsonb, target_form_id = '4f173e8a-138d-5e78-ac11-53284731caa7'
 where id = '202c33d6-e8da-51c0-b0f1-cfee17e4e021' and es = '¿Te llamás Juan?';  -- ¿Te llamás Juan?
update public.sentences set tokens = '[{"surface":"Hola,","form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi"},{"surface":"¿cómo","form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"gloss":"what''s"},{"surface":"te llamás?","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]}]'::jsonb, target_form_id = 'af3a59da-b961-5310-80f6-95b5b4c531bd'
 where id = '2e0f62a4-ab28-5bc1-b4df-7cdeb530ac3c' and es = 'Hola, ¿cómo te llamás?';  -- Hola, ¿cómo te llamás?
update public.sentences set tokens = '[{"surface":"Che,","form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey"},{"surface":"¿cómo","form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"gloss":"what''s"},{"surface":"te llamás?","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]},{"surface":"Yo","form_ids":["0bfd7395-526c-589d-8619-1794b0f8fc11"]},{"surface":"soy","form_ids":["7bad7209-3158-537f-98a7-d94d162d56e9"],"gloss":"I''m"},{"surface":"Sofi.","form_ids":["e987c76e-fff4-5bb1-8495-2897a6baa97d"],"gloss":"Sofi"}]'::jsonb, target_form_id = 'af3a59da-b961-5310-80f6-95b5b4c531bd'
 where id = '587ea39b-4144-5b30-a836-5fddc675ca04' and es = 'Che, ¿cómo te llamás? Yo soy Sofi.';  -- Che, ¿cómo te llamás? Yo soy Sofi.
update public.sentences set tokens = '[{"surface":"No","form_ids":["0de01ef6-29bb-557a-a7e2-f6c1110d951b"],"gloss":"isn''t"},{"surface":"me llamo","form_ids":["c9d318dc-a83c-552b-8392-45726b3c00fe"]},{"surface":"Martín,","form_ids":["4b3d9c85-07c4-572b-9723-8de6a728af94"],"gloss":"Martín"},{"surface":"soy","form_ids":["7bad7209-3158-537f-98a7-d94d162d56e9"],"gloss":"I''m"},{"surface":"Juan.","form_ids":["a0c76088-db09-545c-9b35-a28ec314414d"],"gloss":"Juan"}]'::jsonb, target_form_id = 'c9d318dc-a83c-552b-8392-45726b3c00fe'
 where id = '6903b97c-bddd-5c6c-b64e-e421948d4149' and es = 'No me llamo Martín, soy Juan.';  -- No me llamo Martín, soy Juan.
update public.sentences set tokens = '[{"surface":"Hola,","form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi"},{"surface":"me llamo","form_ids":["c9d318dc-a83c-552b-8392-45726b3c00fe"]},{"surface":"Martín.","form_ids":["4b3d9c85-07c4-572b-9723-8de6a728af94"],"gloss":"Martín"}]'::jsonb, target_form_id = 'c9d318dc-a83c-552b-8392-45726b3c00fe'
 where id = '714661be-c472-57e4-8f02-7755d6fda68d' and es = 'Hola, me llamo Martín.';  -- Hola, me llamo Martín.
update public.sentences set tokens = '[{"surface":"¿Cómo","form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"gloss":"what''s"},{"surface":"te llamás?","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]}]'::jsonb, target_form_id = '4f173e8a-138d-5e78-ac11-53284731caa7'
 where id = '74fbf6c5-e78d-51bd-8f2a-e5069561a909' and es = '¿Cómo te llamás?';  -- ¿Cómo te llamás?
update public.sentences set tokens = '[{"surface":"Hola,","form_ids":["6273f090-0e32-5a87-b927-58303502ea3b"],"gloss":"hi"},{"surface":"me llamo","form_ids":["c9d318dc-a83c-552b-8392-45726b3c00fe"]},{"surface":"Sofi.","form_ids":["e987c76e-fff4-5bb1-8495-2897a6baa97d"],"gloss":"Sofi"},{"surface":"¿Y","form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"and"},{"surface":"vos?","form_ids":["97dde827-60cb-586f-ab2a-0b18dd4f9cfb"],"gloss":"you"}]'::jsonb, target_form_id = 'c9d318dc-a83c-552b-8392-45726b3c00fe'
 where id = '88538d11-ae6b-5e9d-bfd0-9f650dca7be9' and es = 'Hola, me llamo Sofi. ¿Y vos?';  -- Hola, me llamo Sofi. ¿Y vos?
update public.sentences set tokens = '[{"surface":"Che,","form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey"},{"surface":"¿cómo","form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"gloss":"what''s"},{"surface":"te llamás?","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]}]'::jsonb, target_form_id = '4f173e8a-138d-5e78-ac11-53284731caa7'
 where id = '893ac8f5-0a38-5687-b293-dcf319ed6646' and es = 'Che, ¿cómo te llamás?';  -- Che, ¿cómo te llamás?
update public.sentences set tokens = '[{"surface":"Bueno,","form_ids":["770fb250-ae00-510b-8a63-ea9277702843"],"gloss":"OK"},{"surface":"¿y","form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"and"},{"surface":"vos","form_ids":["97dde827-60cb-586f-ab2a-0b18dd4f9cfb"]},{"surface":"cómo","form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"gloss":"what''s"},{"surface":"te llamás?","form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"]}]'::jsonb, target_form_id = '4f173e8a-138d-5e78-ac11-53284731caa7'
 where id = '9fe817dd-d994-5bee-8897-46ab634b08ae' and es = 'Bueno, ¿y vos cómo te llamás?';  -- Bueno, ¿y vos cómo te llamás?
update public.sentences set tokens = '[{"surface":"Me llamo","form_ids":["c9d318dc-a83c-552b-8392-45726b3c00fe"]},{"surface":"Juan.","form_ids":["a0c76088-db09-545c-9b35-a28ec314414d"],"gloss":"Juan"}]'::jsonb, target_form_id = 'c9d318dc-a83c-552b-8392-45726b3c00fe'
 where id = 'ff273da4-f0af-5cc4-a092-aa0e1d7511c3' and es = 'Me llamo Juan.';  -- Me llamo Juan.

-- The two teach slots in unit 4 lesson 1 now teach the chunk.
update public.lesson_slots set form_id = '4f173e8a-138d-5e78-ac11-53284731caa7'
 where lesson_id = '4ae51956-00c8-5757-ac80-5650f19501cd' and ordinal = 5 and form_id = '07eef1c0-c5a0-5a72-aa80-d263eac024b1';  -- teach "llamás" → "te llamás"
update public.lesson_slots set form_id = 'c9d318dc-a83c-552b-8392-45726b3c00fe'
 where lesson_id = '4ae51956-00c8-5757-ac80-5650f19501cd' and ordinal = 2 and form_id = 'dba200c4-cad2-5945-b978-2f4b6b067c85';  -- teach "llamo" → "me llamo"

commit;
