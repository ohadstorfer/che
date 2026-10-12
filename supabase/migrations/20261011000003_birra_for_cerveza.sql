-- "Cerveza" becomes "birra", 2026-10-11 (owner's call).
-- The course taught `cerveza` in otro-cafe (1.2) and kept `birra` for the
-- lunfardo unit ese-chabon (12.17), but between friends in Buenos Aires beer is
-- birra from the first day. So `birra` moves to otro-cafe, in cerveza's place,
-- as an informal word (like che, dale, pibe: every unit allows informal), and
-- `cerveza` is retired as a course word. Its plural `birras` stays in
-- ese-chabon.
--
-- The 72 published sentences that said cerveza say birra: same ids, so
-- lesson slots and what each learner has seen of them carry over. What they
-- said before stays an accepted answer (es_alt), as "cerveza" already is for
-- the word on its own (form_answers), so nobody is marked wrong for the word
-- on the menu. Their clips said cerveza: audio_path is cleared and
-- `npm run course:tts-all` records them again. Retired sentences are left as
-- they were. A sentence edited since (its text no longer matches) is left alone.

-- The word.
update public.lemmas set register = 'informal',
  gloss_note_en = 'The everyday word for beer in Argentina; ''cerveza'' is the one on menus and labels.'
  where id = '36122bc8-d909-50a7-a0f2-8c50987faf02' and register = 'lunfardo' and gloss_note_en is null; -- birra
update public.forms set unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', position = 4
  where id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3' and unit_id = 'e0efacaf-93a3-521c-850d-fda4909c6796'; -- birra: ese-chabon → otro-cafe
update public.forms set status = 'retired' where id = '91bd2b71-037c-5d70-b5cc-597cdeda4b0a' and status = 'published'; -- cerveza
update public.lemmas set status = 'retired' where id = '6ec5f34c-2446-5d0f-9ade-5bcb6ac3a3aa' and status = 'published'; -- cerveza

-- Whoever learned cerveza knows birra just as well: her progress moves with it.
update public.form_states s set form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3'
  where s.form_id = '91bd2b71-037c-5d70-b5cc-597cdeda4b0a'
    and not exists (select 1 from public.form_states b where b.form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3' and b.user_id = s.user_id);

-- ese-chabon no longer introduces it: its card goes and the slots after it
-- close up. otro-cafe's card for cerveza becomes birra's.
create temporary table birra_card on commit drop as
  select s.lesson_id, s.ordinal from public.lesson_slots s join public.lessons l on l.id = s.lesson_id
   where s.kind = 'teach' and s.form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3' and l.unit_id = 'e0efacaf-93a3-521c-850d-fda4909c6796';
delete from public.lesson_slots s using birra_card c where s.lesson_id = c.lesson_id and s.ordinal = c.ordinal;
update public.lesson_slots s set ordinal = s.ordinal + 1000 from birra_card c where s.lesson_id = c.lesson_id and s.ordinal > c.ordinal;
update public.lesson_slots s set ordinal = s.ordinal - 1001 from birra_card c where s.lesson_id = c.lesson_id and s.ordinal > 1000;
update public.lessons set updated_at = now()
  where id in (select lesson_id from birra_card)
     or id in (select lesson_id from public.lesson_slots where form_id = '91bd2b71-037c-5d70-b5cc-597cdeda4b0a');
update public.lesson_slots set form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3' where form_id = '91bd2b71-037c-5d70-b5cc-597cdeda4b0a';
update public.units set review_form_ids = array_replace(review_form_ids, '91bd2b71-037c-5d70-b5cc-597cdeda4b0a'::uuid, '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3'::uuid)
  where review_form_ids @> array['91bd2b71-037c-5d70-b5cc-597cdeda4b0a']::uuid[] and not review_form_ids @> array['7e75eb16-4a4b-5b22-86e9-96b79d81ceb3']::uuid[]; -- practica-hola

-- Tips.
update public.tips set body_md = replace(body_md, '*Otra cerveza.*', '*Otra birra.*')
  where id = 'e9493171-429d-5166-8af8-a23846e6f240' and body_md like '%*Otra cerveza.*%'; -- otro-cafe: Otro, never un otro
update public.tips set body_md = replace(body_md, '| la cerveza |', '| la birra |')
  where id = '13190909-f9e0-5348-a2f8-e59ef679aba5' and body_md like '%| la cerveza |%'; -- esta-cerrado: Things have a state too
update public.tips set body_md = replace(body_md, 'is a **groso**; a **birra** is a beer.', 'is a **groso**.')
  where id = 'c3c9a208-0a25-593c-a6a9-959dfc978b81' and body_md like '%; a **birra** is a beer.'; -- ese-chabon: Chabón, mina

-- Sentences.
update public.sentences set es = '—¿Birra o agua? —Birra, gracias.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['—¿Cerveza o agua? —Cerveza, gracias.']::text[],
  tokens = '[{"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "—¿Birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["876e8095-f2c5-5c38-866e-9ac138d52b87"], "gloss": "water", "surface": "agua?"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "—Birra,"}, {"form_ids": ["9c78c990-e652-5b9f-a449-4cdda2a3937b"], "gloss": "thanks", "surface": "gracias."}]'::jsonb,
  audio_path = null
where id = '5ed6a3ea-b60f-52eb-855b-230693a8ca86' and status = 'published' and es = '—¿Cerveza o agua? —Cerveza, gracias.'; -- otro-cafe
update public.sentences set es = '—¿Una birra o un jugo? —Una birra, gracias.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['—¿Una cerveza o un jugo? —Una cerveza, gracias.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["6c053054-70c4-56ce-9300-fe4fa796b45a"], "gloss": "juice", "surface": "jugo?"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["9c78c990-e652-5b9f-a449-4cdda2a3937b"], "gloss": "thanks", "surface": "gracias."}]'::jsonb,
  audio_path = null
where id = '70e1fc4c-1307-5b27-b4f2-72b5d830cc16' and status = 'published' and es = '—¿Una cerveza o un jugo? —Una cerveza, gracias.'; -- otro-cafe
update public.sentences set es = '¿Otra birra?',
  es_alt = array['¿Otra cerveza?']::text[],
  tokens = '[{"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "¿Otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = 'c5c0f8f9-eaa8-5eab-b4bf-1db5d596cdd2' and status = 'published' and es = '¿Otra cerveza?'; -- otro-cafe
update public.sentences set es = '¿Una birra?', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['¿Una cerveza?']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '7d1e67fb-397f-5c7d-aca3-fb5119ce4890' and status = 'published' and es = '¿Una cerveza?'; -- otro-cafe
update public.sentences set es = 'Otra birra, por favor.',
  es_alt = array['Por favor, otra birra.', 'Otra cerveza, por favor.', 'Por favor, otra cerveza.']::text[],
  tokens = '[{"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "Otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = '4cbeb977-9509-52a8-847c-ab39efed7a87' and status = 'published' and es = 'Otra cerveza, por favor.'; -- otro-cafe
update public.sentences set es = 'Una birra, por favor.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['Por favor, una birra.', 'Una cerveza, por favor.', 'Por favor, una cerveza.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'e1958b44-e881-51dd-b3eb-89e4e95c5839' and status = 'published' and es = 'Una cerveza, por favor.'; -- otro-cafe
update public.sentences set es = 'Una birra, una gaseosa y un agua, por favor.',
  es_alt = array['Una cerveza, una gaseosa y un agua, por favor.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["9444aa7b-bfae-5c03-b9d3-9718e9f19435"], "gloss": "soda", "surface": "gaseosa"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["876e8095-f2c5-5c38-866e-9ac138d52b87"], "gloss": "water", "surface": "agua,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = '08c8a548-3fcd-509e-81c6-063b9c0c2d37' and status = 'published' and es = 'Una cerveza, una gaseosa y un agua, por favor.'; -- otro-cafe
update public.sentences set es = '—¿Comida? —Una pizza y una birra, por favor.',
  es_alt = array['—¿Comida? —Una pizza y una cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["41e0dac1-e480-59a8-a68e-a08fc6d2423b"], "gloss": "food", "surface": "—¿Comida?"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—Una"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = '94752a3e-4524-5c1d-b497-1c01d8ec192a' and status = 'published' and es = '—¿Comida? —Una pizza y una cerveza, por favor.'; -- una-pizza-y-un-helado
update public.sentences set es = 'Un sándwich y otra birra, por favor.',
  es_alt = array['Un sándwich y otra cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "Un"}, {"form_ids": ["e22d6ca8-f902-5e5c-b803-a8b6f9a8dd78"], "gloss": "sandwich", "surface": "sándwich"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = '49da022b-8f80-53bb-abcd-fe82df434d78' and status = 'published' and es = 'Un sándwich y otra cerveza, por favor.'; -- una-pizza-y-un-helado
update public.sentences set es = 'Una pizza, una birra y un agua, por favor.',
  es_alt = array['Por favor, una pizza, una birra y un agua.', 'Una pizza, una cerveza y un agua, por favor.', 'Por favor, una pizza, una cerveza y un agua.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["876e8095-f2c5-5c38-866e-9ac138d52b87"], "gloss": "water", "surface": "agua,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'faf3677f-a14b-5d1a-aa82-3c60eeddf822' and status = 'published' and es = 'Una pizza, una cerveza y un agua, por favor.'; -- una-pizza-y-un-helado
update public.sentences set es = '—¿Una birra? —Bueno, dale.',
  es_alt = array['—¿Una cerveza? —Bueno, dale.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["770fb250-ae00-510b-8a63-ea9277702843"], "gloss": "well", "surface": "—Bueno,"}, {"form_ids": ["1ba6168d-09bd-509b-bbc8-765e8806ba16"], "gloss": "OK", "surface": "dale."}]'::jsonb,
  audio_path = null
where id = 'ac2cf255-f388-51c6-a0a1-ed796b1965d3' and status = 'published' and es = '—¿Una cerveza? —Bueno, dale.'; -- soy-sofi
update public.sentences set es = '—¿Una birra? —No, gracias.',
  es_alt = array['—¿Una cerveza? —No, gracias.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "no", "surface": "—No,"}, {"form_ids": ["9c78c990-e652-5b9f-a449-4cdda2a3937b"], "gloss": "thanks", "surface": "gracias."}]'::jsonb,
  audio_path = null
where id = '2149cc59-4308-581a-be24-172a7eac6700' and status = 'published' and es = '—¿Una cerveza? —No, gracias.'; -- soy-sofi
update public.sentences set es = '—Che, ¿otra birra? —Sí, dale.',
  es_alt = array['—Che, ¿otra cerveza? —Sí, dale.']::text[],
  tokens = '[{"form_ids": ["91232a84-b055-5e03-8ed2-651c79f5b376"], "gloss": "hey", "surface": "—Che,"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "¿otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["191fd126-be91-54fb-8848-9f3aa180ca5d"], "gloss": "yes", "surface": "—Sí,"}, {"form_ids": ["1ba6168d-09bd-509b-bbc8-765e8806ba16"], "gloss": "sure", "surface": "dale."}]'::jsonb,
  audio_path = null
where id = '812c164a-5f81-5aa4-b71f-c284ba73bb4d' and status = 'published' and es = '—Che, ¿otra cerveza? —Sí, dale.'; -- soy-sofi
update public.sentences set es = 'Buenas, Diego, ¿pizza y birra?',
  es_alt = array['Buenas, Diego, ¿birra y pizza?', 'Buenas, Diego, ¿pizza y cerveza?', 'Buenas, Diego, ¿cerveza y pizza?']::text[],
  tokens = '[{"form_ids": ["ab1c4d38-0522-52b9-a6b3-0270887f4ec5"], "gloss": "hi there", "surface": "Buenas,"}, {"form_ids": ["fec44cf4-d1bd-584c-a4b4-a705207d77e4"], "gloss": "Diego", "surface": "Diego,"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "¿pizza"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '269e3dbf-775a-53c0-b3ec-6399a9953dea' and status = 'published' and es = 'Buenas, Diego, ¿pizza y cerveza?'; -- buen-dia
update public.sentences set es = 'Buenas noches, Santi, bienvenido, ¿una birra o una gaseosa?',
  es_alt = array['Buenas noches, Santi, bienvenido, ¿una gaseosa o una birra?', 'Buenas noches, bienvenido, Santi, ¿una birra o una gaseosa?', 'Buenas noches, bienvenido, Santi, ¿una gaseosa o una birra?', 'Buenas noches, Santi, bienvenido, ¿una cerveza o una gaseosa?', 'Buenas noches, Santi, bienvenido, ¿una gaseosa o una cerveza?', 'Buenas noches, bienvenido, Santi, ¿una cerveza o una gaseosa?', 'Buenas noches, bienvenido, Santi, ¿una gaseosa o una cerveza?']::text[],
  tokens = '[{"form_ids": ["85121988-342b-59a0-a665-0a238fee3548"], "gloss": "good evening", "surface": "Buenas noches,"}, {"form_ids": ["15434277-addc-5782-9d76-432820ba64a2"], "gloss": "Santi", "surface": "Santi,"}, {"form_ids": ["1eda61b2-b546-58b6-b8b1-e61e8886dcd1"], "gloss": "welcome", "surface": "bienvenido,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "¿una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["9444aa7b-bfae-5c03-b9d3-9718e9f19435"], "gloss": "soda", "surface": "gaseosa?"}]'::jsonb,
  audio_path = null
where id = '0d18c27f-9b6f-50b2-9c9b-42848b81c826' and status = 'published' and es = 'Buenas noches, Santi, bienvenido, ¿una cerveza o una gaseosa?'; -- sos-turista
update public.sentences set es = 'Che, disculpá, ¿una birra, por favor?',
  es_alt = array['Disculpá, ¿una birra, por favor?', 'Che, disculpá, ¿una cerveza, por favor?', 'Disculpá, ¿una cerveza, por favor?']::text[],
  tokens = '[{"form_ids": ["91232a84-b055-5e03-8ed2-651c79f5b376"], "gloss": "hey", "surface": "Che,"}, {"form_ids": ["dbf59afc-7a1f-5d87-b1d2-f5160b6df0b4"], "gloss": "excuse me", "surface": "disculpá,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "¿una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor?"}]'::jsonb,
  audio_path = null
where id = 'f67f61f6-4b52-58e7-aec6-0de9ac613957' and status = 'published' and es = 'Che, disculpá, ¿una cerveza, por favor?'; -- sos-turista
update public.sentences set es = '—¿Una birra? —¡Dale!', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['—¿Una cerveza? —¡Dale!']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "—¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["1ba6168d-09bd-509b-bbc8-765e8806ba16"], "gloss": "sure", "surface": "—¡Dale!"}]'::jsonb,
  audio_path = null
where id = '47f72668-69ab-5914-a915-f80e5b26326a' and status = 'published' and es = '—¿Una cerveza? —¡Dale!'; -- practica-hola
update public.sentences set es = '—Che, ¿otra birra? —No, gracias.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['—Che, ¿otra cerveza? —No, gracias.']::text[],
  tokens = '[{"form_ids": ["91232a84-b055-5e03-8ed2-651c79f5b376"], "gloss": "hey", "surface": "—Che,"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "¿otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "no", "surface": "—No,"}, {"form_ids": ["9c78c990-e652-5b9f-a449-4cdda2a3937b"], "gloss": "thanks", "surface": "gracias."}]'::jsonb,
  audio_path = null
where id = '0dddc2d1-2c9e-5223-a659-e38863840894' and status = 'published' and es = '—Che, ¿otra cerveza? —No, gracias.'; -- practica-hola
update public.sentences set es = '¿Birra o gaseosa?', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['¿Gaseosa o birra?', '¿Cerveza o gaseosa?', '¿Gaseosa o cerveza?']::text[],
  tokens = '[{"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "¿Birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["9444aa7b-bfae-5c03-b9d3-9718e9f19435"], "gloss": "soda", "surface": "gaseosa?"}]'::jsonb,
  audio_path = null
where id = 'd1e4532f-5bf9-5e79-8d92-80b481914da6' and status = 'published' and es = '¿Cerveza o gaseosa?'; -- practica-hola
update public.sentences set es = 'Buenas noches, una birra y un sándwich, por favor.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['Buenas noches, un sándwich y una birra, por favor.', 'Buenas noches, una cerveza y un sándwich, por favor.', 'Buenas noches, un sándwich y una cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["85121988-342b-59a0-a665-0a238fee3548"], "gloss": "good evening", "surface": "Buenas noches,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["e22d6ca8-f902-5e5c-b803-a8b6f9a8dd78"], "gloss": "sandwich", "surface": "sándwich,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'f18df566-7b08-559f-8702-9afa4c907a48' and status = 'published' and es = 'Buenas noches, una cerveza y un sándwich, por favor.'; -- practica-hola
update public.sentences set es = 'Bueno, dale, otra birra y una pizza.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['Bueno, dale, una pizza y otra birra.', 'Bueno, dale, otra cerveza y una pizza.', 'Bueno, dale, una pizza y otra cerveza.']::text[],
  tokens = '[{"form_ids": ["770fb250-ae00-510b-8a63-ea9277702843"], "gloss": "OK", "surface": "Bueno,"}, {"form_ids": ["1ba6168d-09bd-509b-bbc8-765e8806ba16"], "gloss": "fine", "surface": "dale,"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza."}]'::jsonb,
  audio_path = null
where id = 'dcd0d7f3-03e7-5889-9cd3-a32cc03ea428' and status = 'published' and es = 'Bueno, dale, otra cerveza y una pizza.'; -- practica-hola
update public.sentences set es = 'Mati, ¿birra o agua?', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['Mati, ¿agua o birra?', '¿Birra o agua, Mati?', '¿Agua o birra, Mati?', 'Mati, ¿cerveza o agua?', 'Mati, ¿agua o cerveza?', '¿Cerveza o agua, Mati?', '¿Agua o cerveza, Mati?']::text[],
  tokens = '[{"form_ids": ["140266d1-06f6-5ce4-9be6-eab3dbdbc772"], "gloss": "Mati", "surface": "Mati,"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "¿birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["876e8095-f2c5-5c38-866e-9ac138d52b87"], "gloss": "water", "surface": "agua?"}]'::jsonb,
  audio_path = null
where id = '5ccd5010-5a05-517c-baac-e26759414ea3' and status = 'published' and es = 'Mati, ¿cerveza o agua?'; -- practica-hola
update public.sentences set es = 'Una birra y una pizza, por favor.', target_form_id = '7e75eb16-4a4b-5b22-86e9-96b79d81ceb3',
  es_alt = array['Una pizza y una birra, por favor.', 'Una cerveza y una pizza, por favor.', 'Una pizza y una cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'e0f768a5-ba86-53c6-aea5-e55adaaf0652' and status = 'published' and es = 'Una cerveza y una pizza, por favor.'; -- practica-hola
update public.sentences set es = '¿Es una birra alemana?',
  es_alt = array['¿Es una cerveza alemana?']::text[],
  tokens = '[{"form_ids": ["b20bba62-c9b9-5803-9cdf-93d9b550a550"], "gloss": "is it", "surface": "¿Es"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["d97e5e60-8795-5679-a864-6db1fdd309b3"], "gloss": "German", "surface": "alemana?"}]'::jsonb,
  audio_path = null
where id = '810976bb-8315-53ef-ab1e-67839b87c70b' and status = 'published' and es = '¿Es una cerveza alemana?'; -- de-todos-lados
update public.sentences set es = 'Che, primo, ¿una birra?',
  es_alt = array['Primo, ¿una birra?', 'Che, primo, ¿una cerveza?', 'Primo, ¿una cerveza?']::text[],
  tokens = '[{"form_ids": ["91232a84-b055-5e03-8ed2-651c79f5b376"], "gloss": "hey", "surface": "Che,"}, {"form_ids": ["966b005e-fd9c-5ec6-a809-0c3a11e6d02e"], "gloss": "cousin", "surface": "primo,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "¿una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '2b254052-2e55-5dce-9d96-504e8e70e0d1' and status = 'published' and es = 'Che, primo, ¿una cerveza?'; -- tios-y-primos
update public.sentences set es = 'Che, tengo sed. ¿Una birra?',
  es_alt = array['Che, yo tengo sed. ¿Una birra?', 'Tengo sed. ¿Una birra?', 'Yo tengo sed. ¿Una birra?', 'Che, tengo sed. ¿Una cerveza?', 'Che, yo tengo sed. ¿Una cerveza?', 'Tengo sed. ¿Una cerveza?', 'Yo tengo sed. ¿Una cerveza?']::text[],
  tokens = '[{"form_ids": ["91232a84-b055-5e03-8ed2-651c79f5b376"], "gloss": "hey", "surface": "Che,"}, {"form_ids": ["45351906-c07b-5098-9f2a-7d11006355c4"], "gloss": "I''m", "surface": "tengo"}, {"form_ids": ["969a6eb2-3c9e-5505-987b-2ba4ba2d38fa"], "gloss": "thirsty", "surface": "sed."}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "¿Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '0c398159-29c4-5b6d-bae1-5daaf331971e' and status = 'published' and es = 'Che, tengo sed. ¿Una cerveza?'; -- tengo-hambre
update public.sentences set es = '¿Botellas de birra? No, gracias.',
  es_alt = array['¿Botellas de cerveza? No, gracias.']::text[],
  tokens = '[{"form_ids": ["8b3d2028-6a9f-50fb-b01f-df4c81e60ad2"], "gloss": "bottles", "surface": "¿Botellas"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "gloss": "of", "surface": "de"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "no", "surface": "No,"}, {"form_ids": ["9c78c990-e652-5b9f-a449-4cdda2a3937b"], "gloss": "thanks", "surface": "gracias."}]'::jsonb,
  audio_path = null
where id = '28d44a3a-922e-5d76-b458-7284a9d2435a' and status = 'published' and es = '¿Botellas de cerveza? No, gracias.'; -- alfajores-y-chicles
update public.sentences set es = 'Cuatro botellas de birra, por favor.',
  es_alt = array['Cuatro botellas de cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["6c376868-60dd-5e1b-ac91-65e3e46e4eed"], "gloss": "four", "surface": "Cuatro"}, {"form_ids": ["8b3d2028-6a9f-50fb-b01f-df4c81e60ad2"], "gloss": "bottles", "surface": "botellas"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "gloss": "of", "surface": "de"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'eb4aaf8e-caf4-5d56-a358-2b44e13acc8b' and status = 'published' and es = 'Cuatro botellas de cerveza, por favor.'; -- alfajores-y-chicles
update public.sentences set es = 'Una botella de birra y una pizza, por favor.',
  es_alt = array['Una pizza y una botella de birra, por favor.', 'Una botella de cerveza y una pizza, por favor.', 'Una pizza y una botella de cerveza, por favor.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["4fd283a4-63e4-576e-8058-1026547c6bed"], "gloss": "bottle", "surface": "botella"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "gloss": "of", "surface": "de"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = '4475d8cd-896a-51ca-b224-f51756059de8' and status = 'published' and es = 'Una botella de cerveza y una pizza, por favor.'; -- alfajores-y-chicles
update public.sentences set es = '¿Seis mil una birra? ¡Qué cara!',
  es_alt = array['¿Una birra seis mil? ¡Qué cara!', '¿Seis mil una cerveza? ¡Qué cara!', '¿Una cerveza seis mil? ¡Qué cara!']::text[],
  tokens = '[{"form_ids": ["f43f47cf-21b2-54ea-aa31-055ea1b7a3fe"], "gloss": "six", "surface": "¿Seis"}, {"form_ids": ["37de6b1f-c666-5468-8cc4-d124d6bbc437"], "gloss": "thousand", "surface": "mil"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["f562cddd-d50a-5293-83c4-35764a00a7cf"], "gloss": "how", "surface": "¡Qué"}, {"form_ids": ["0892c8d7-092b-5d08-9a4b-ba59ce75f08b"], "gloss": "expensive", "surface": "cara!"}]'::jsonb,
  audio_path = null
where id = 'f62b98b2-06e9-5509-9153-23ae268fdbe0' and status = 'published' and es = '¿Seis mil una cerveza? ¡Qué cara!'; -- cuanto-cuesta
update public.sentences set es = 'La birra está ahí.',
  es_alt = array['Ahí está la birra.', 'La cerveza está ahí.', 'Ahí está la cerveza.']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["73a9f7ae-e3e3-5a91-ab0c-a4e945ace577"], "gloss": "is", "surface": "está"}, {"form_ids": ["fb179075-4e0c-5555-8fcf-9050b5a1c0d3"], "gloss": "there", "surface": "ahí."}]'::jsonb,
  audio_path = null
where id = '751733a3-93b9-530e-9e6b-570241e12cbc' and status = 'published' and es = 'La cerveza está ahí.'; -- donde-esta
update public.sentences set es = 'Las empanadas, allá; la birra, acá.',
  es_alt = array['Las empanadas, allá; la cerveza, acá.']::text[],
  tokens = '[{"form_ids": ["5993dd9e-babf-5641-bdc9-b8205f708a64"], "gloss": "the", "surface": "Las"}, {"form_ids": ["eb6c2e93-d17a-598c-a2fd-48df3b6b3525"], "gloss": "empanadas", "surface": "empanadas,"}, {"form_ids": ["c4c54e18-c4a5-5031-9e0b-deda0f14e889"], "gloss": "over there", "surface": "allá;"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["e29831ef-42b2-51ea-8e38-e365e3311ab1"], "gloss": "here", "surface": "acá."}]'::jsonb,
  audio_path = null
where id = '0d8c106d-04c3-5962-867a-541ff55a124f' and status = 'published' and es = 'Las empanadas, allá; la cerveza, acá.'; -- donde-esta
update public.sentences set es = 'La birra es mía.',
  es_alt = array['La cerveza es mía.']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["b20bba62-c9b9-5803-9cdf-93d9b550a550"], "gloss": "is", "surface": "es"}, {"form_ids": ["6a79cbd9-4c4a-5d60-a404-03b1d76a3f9b"], "gloss": "mine", "surface": "mía."}]'::jsonb,
  audio_path = null
where id = '7b7014b4-2bee-523d-88cd-d8a85bc46ffa' and status = 'published' and es = 'La cerveza es mía.'; -- esta-arriba
update public.sentences set es = '¿La birra del bar es buena?',
  es_alt = array['¿Es buena la birra del bar?', '¿La cerveza del bar es buena?', '¿Es buena la cerveza del bar?']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "¿La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["74e2a507-6e97-590f-8ec7-c33934590ffe"], "gloss": "at the", "surface": "del"}, {"form_ids": ["ceaecb8e-77b8-5fb5-8f3d-638c2e24fc53"], "gloss": "bar", "surface": "bar"}, {"form_ids": ["b20bba62-c9b9-5803-9cdf-93d9b550a550"], "gloss": "is", "surface": "es"}, {"form_ids": ["18d35451-6a07-5b36-a307-eb1148588098"], "gloss": "good", "surface": "buena?"}]'::jsonb,
  audio_path = null
where id = '3ce9f0af-1f7a-5864-bc83-ad1f0f5bf3cd' and status = 'published' and es = '¿La cerveza del bar es buena?'; -- hay-una-plaza
update public.sentences set es = 'La birra de acá es mala.',
  es_alt = array['Acá la birra es mala.', 'La birra acá es mala.', 'Es mala la birra de acá.', 'La cerveza de acá es mala.', 'Acá la cerveza es mala.', 'La cerveza acá es mala.', 'Es mala la cerveza de acá.']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["e29831ef-42b2-51ea-8e38-e365e3311ab1"], "gloss": "here", "surface": "acá"}, {"form_ids": ["b20bba62-c9b9-5803-9cdf-93d9b550a550"], "gloss": "is", "surface": "es"}, {"form_ids": ["1af9aebe-bae2-5b69-b3e7-6ecb7a49d64b"], "gloss": "bad", "surface": "mala."}]'::jsonb,
  audio_path = null
where id = '80d38d88-8e28-5071-a769-28267a18ed3b' and status = 'published' and es = 'La cerveza de acá es mala.'; -- hay-una-plaza
update public.sentences set es = 'La birra de acá está buena.',
  es_alt = array['La cerveza de acá está buena.']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["e29831ef-42b2-51ea-8e38-e365e3311ab1"], "gloss": "here", "surface": "acá"}, {"form_ids": ["69b2adb6-f0e5-5ed6-98c9-753066767556"], "gloss": "is good", "surface": "está buena."}]'::jsonb,
  audio_path = null
where id = 'b3fe8ea9-eec4-5266-85b3-1cce2d8c5abe' and status = 'published' and es = 'La cerveza de acá está buena.'; -- hay-una-plaza
update public.sentences set es = 'Perdón, la botella de birra está rota.',
  es_alt = array['Perdón, la botella de cerveza está rota.']::text[],
  tokens = '[{"form_ids": ["ea877a4b-8d12-5412-bf29-ac16c36bf180"], "gloss": "sorry", "surface": "Perdón,"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "la"}, {"form_ids": ["4fd283a4-63e4-576e-8058-1026547c6bed"], "gloss": "bottle", "surface": "botella"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["73a9f7ae-e3e3-5a91-ab0c-a4e945ace577"], "gloss": "is", "surface": "está"}, {"form_ids": ["2bd2d665-c2d4-5c08-9cf7-f97f6f9d86c4"], "gloss": "broken", "surface": "rota."}]'::jsonb,
  audio_path = null
where id = '8142535b-f4ec-5c7c-a52d-22d9e2fdd383' and status = 'published' and es = 'Perdón, la botella de cerveza está rota.'; -- estas-listo
update public.sentences set es = '¿Tomamos una birra en el bar?',
  es_alt = array['¿Tomamos una cerveza en el bar?']::text[],
  tokens = '[{"form_ids": ["219b8eef-f50a-59b0-aa1c-8d9157b14dc8"], "gloss": "should we have", "surface": "¿Tomamos"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["1ed2393d-a340-50b3-8c63-de2c49b7d78e"], "gloss": "at", "surface": "en"}, {"form_ids": ["56918598-34c4-5168-8557-335face04c15"], "gloss": "the", "surface": "el"}, {"form_ids": ["ceaecb8e-77b8-5fb5-8f3d-638c2e24fc53"], "gloss": "bar", "surface": "bar?"}]'::jsonb,
  audio_path = null
where id = 'a9d2f362-3225-5f37-9b7b-6f13674b0a4c' and status = 'published' and es = '¿Tomamos una cerveza en el bar?'; -- estudio-a-la-noche
update public.sentences set es = '¿Tomás birra o gaseosa?',
  es_alt = array['¿Vos tomás birra o gaseosa?', '¿Tomás gaseosa o birra?', '¿Vos tomás gaseosa o birra?', '¿Tomás cerveza o gaseosa?', '¿Vos tomás cerveza o gaseosa?', '¿Tomás gaseosa o cerveza?', '¿Vos tomás gaseosa o cerveza?']::text[],
  tokens = '[{"form_ids": ["6a2b3dbe-f84a-5f18-9311-d53d92c10a7e"], "gloss": "do you drink", "surface": "¿Tomás"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"], "gloss": "or", "surface": "o"}, {"form_ids": ["9444aa7b-bfae-5c03-b9d3-9718e9f19435"], "gloss": "soda", "surface": "gaseosa?"}]'::jsonb,
  audio_path = null
where id = '050d2716-ee0d-5c26-b6d4-5e9e623595e5' and status = 'published' and es = '¿Tomás cerveza o gaseosa?'; -- estudio-a-la-noche
update public.sentences set es = 'Siempre tomamos una birra en el bar de la esquina.',
  es_alt = array['Siempre tomamos una cerveza en el bar de la esquina.']::text[],
  tokens = '[{"form_ids": ["ddfed08b-8234-57ca-987c-e967f62b1621"], "gloss": "always", "surface": "Siempre"}, {"form_ids": ["219b8eef-f50a-59b0-aa1c-8d9157b14dc8"], "gloss": "we have", "surface": "tomamos"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["1ed2393d-a340-50b3-8c63-de2c49b7d78e"], "gloss": "at", "surface": "en"}, {"form_ids": ["56918598-34c4-5168-8557-335face04c15"], "gloss": "the", "surface": "el"}, {"form_ids": ["ceaecb8e-77b8-5fb5-8f3d-638c2e24fc53"], "gloss": "bar", "surface": "bar"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["e4598e5b-f82b-54ca-ac13-3a9c8c46cfb8"], "gloss": "corner", "surface": "esquina."}]'::jsonb,
  audio_path = null
where id = 'cb03f502-eb9b-54c1-85d2-7d207f26fe0b' and status = 'published' and es = 'Siempre tomamos una cerveza en el bar de la esquina.'; -- siempre-camino
update public.sentences set es = '—Me gusta la pizza con birra. —A mí también.',
  es_alt = array['—Me gusta la pizza con cerveza. —A mí también.']::text[],
  tokens = '[{"form_ids": ["be20724b-3be1-5bcc-801e-f13718511443"], "gloss": "I", "surface": "—Me"}, {"form_ids": ["a9c6c7d1-19f3-5575-a1a9-c5ae429bc59a"], "gloss": "like", "surface": "gusta"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["7b4f83d2-056b-50a1-a705-c50086486426"], "gloss": "pizza", "surface": "pizza"}, {"form_ids": ["d3f4bb24-5409-579d-b92f-11bdcaeecc9b"], "gloss": "with", "surface": "con"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}, {"form_ids": ["9b34b74f-9415-5c26-a0d9-14505256a7a2"], "gloss": "me too", "surface": "—A mí también."}]'::jsonb,
  audio_path = null
where id = 'b073a4c6-3899-50e8-ad4e-d1d56ef59080' and status = 'published' and es = '—Me gusta la pizza con cerveza. —A mí también.'; -- mate-y-facturas
update public.sentences set es = '¿Te gusta la birra amarga?',
  es_alt = array['¿Te gusta la cerveza amarga?']::text[],
  tokens = '[{"form_ids": ["4b91dc24-7e24-55ea-aea0-9f5e2f9deb6c"], "gloss": "you", "surface": "¿Te"}, {"form_ids": ["a9c6c7d1-19f3-5575-a1a9-c5ae429bc59a"], "gloss": "do you like", "surface": "gusta"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["19a48983-4252-5f8a-a29a-97693e429179"], "gloss": "bitter", "surface": "amarga?"}]'::jsonb,
  audio_path = null
where id = '10a53f67-463f-57cb-a4d3-77ed1e1a9b88' and status = 'published' and es = '¿Te gusta la cerveza amarga?'; -- mate-y-facturas
update public.sentences set es = 'A Mati no le gusta nada la birra.',
  es_alt = array['A Mati la birra no le gusta nada.', 'La birra no le gusta nada a Mati.', 'A Mati no le gusta nada la cerveza.', 'A Mati la cerveza no le gusta nada.', 'La cerveza no le gusta nada a Mati.']::text[],
  tokens = '[{"form_ids": ["8f951310-6c70-5801-9504-b9eccf75e5f3"], "surface": "A"}, {"form_ids": ["140266d1-06f6-5ce4-9be6-eab3dbdbc772"], "gloss": "Mati", "surface": "Mati"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "doesn''t", "surface": "no"}, {"form_ids": ["041f747b-9c35-590a-82cf-8d3824613669"], "surface": "le"}, {"form_ids": ["a9c6c7d1-19f3-5575-a1a9-c5ae429bc59a"], "gloss": "like", "surface": "gusta"}, {"form_ids": ["90a8ed8b-6d03-5a5e-aa65-9b196d9e8f8d"], "gloss": "at all", "surface": "nada"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '8500c395-3c7d-57e4-b831-9485b66b540c' and status = 'published' and es = 'A Mati no le gusta nada la cerveza.'; -- mate-y-facturas
update public.sentences set es = 'A Santi no le gusta la birra amarga.',
  es_alt = array['A Santi la birra amarga no le gusta.', 'A Santi no le gusta la cerveza amarga.', 'A Santi la cerveza amarga no le gusta.']::text[],
  tokens = '[{"form_ids": ["8f951310-6c70-5801-9504-b9eccf75e5f3"], "surface": "A"}, {"form_ids": ["15434277-addc-5782-9d76-432820ba64a2"], "gloss": "Santi", "surface": "Santi"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "doesn''t", "surface": "no"}, {"form_ids": ["041f747b-9c35-590a-82cf-8d3824613669"], "surface": "le"}, {"form_ids": ["a9c6c7d1-19f3-5575-a1a9-c5ae429bc59a"], "gloss": "like", "surface": "gusta"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["19a48983-4252-5f8a-a29a-97693e429179"], "gloss": "bitter", "surface": "amarga."}]'::jsonb,
  audio_path = null
where id = 'fd804172-76c5-55de-8a78-2fd4144f780e' and status = 'published' and es = 'A Santi no le gusta la cerveza amarga.'; -- mate-y-facturas
update public.sentences set es = '¿Me traés otra birra para mi amigo?',
  es_alt = array['¿Vos me traés otra birra para mi amigo?', '¿Me traés otra cerveza para mi amigo?', '¿Vos me traés otra cerveza para mi amigo?']::text[],
  tokens = '[{"form_ids": ["be20724b-3be1-5bcc-801e-f13718511443"], "gloss": "me", "surface": "¿Me"}, {"form_ids": ["a36f920c-5d24-542c-86a6-dc6320c1c6ed"], "gloss": "can you bring", "surface": "traés"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["257e30bf-916e-5772-840c-48bc957cf4d0"], "gloss": "for", "surface": "para"}, {"form_ids": ["b2985319-56f8-5558-8c7a-11dd1ff42858"], "gloss": "my", "surface": "mi"}, {"form_ids": ["3c1485a4-ebbd-5426-a476-86614b85169d"], "gloss": "friend", "surface": "amigo?"}]'::jsonb,
  audio_path = null
where id = 'de930c64-8a7f-5324-a01e-621c3d1ba471' and status = 'published' and es = '¿Me traés otra cerveza para mi amigo?'; -- me-traes-un-cafe
update public.sentences set es = 'Mozo, otra birra, por favor.',
  es_alt = array['Mozo, por favor, otra birra.', 'Otra birra, mozo, por favor.', 'Mozo, otra cerveza, por favor.', 'Mozo, por favor, otra cerveza.', 'Otra cerveza, mozo, por favor.']::text[],
  tokens = '[{"form_ids": ["db9b301b-564b-5bc8-b620-a1ae1f65ce25"], "gloss": "waiter", "surface": "Mozo,"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'd0d2c82f-fd36-5bc7-a112-7ccf85a2d4e9' and status = 'published' and es = 'Mozo, otra cerveza, por favor.'; -- me-traes-un-cafe
update public.sentences set es = 'Para mí, una birra fría.',
  es_alt = array['Una birra fría para mí.', 'Para mí, una cerveza fría.', 'Una cerveza fría para mí.']::text[],
  tokens = '[{"form_ids": ["257e30bf-916e-5772-840c-48bc957cf4d0"], "gloss": "for", "surface": "Para"}, {"form_ids": ["043468b4-c929-5e1d-b664-d1156cbd2874"], "gloss": "me", "surface": "mí,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["91c4a6a0-62af-505e-a964-de29194779b1"], "gloss": "cold", "surface": "fría."}]'::jsonb,
  audio_path = null
where id = 'f542f3bb-13b9-5c63-b60f-192e659113f2' and status = 'published' and es = 'Para mí, una cerveza fría.'; -- me-traes-un-cafe
update public.sentences set es = 'Diego quiere otra birra y yo también.',
  es_alt = array['Diego quiere otra cerveza y yo también.']::text[],
  tokens = '[{"form_ids": ["fec44cf4-d1bd-584c-a4b4-a705207d77e4"], "gloss": "Diego", "surface": "Diego"}, {"form_ids": ["df7f3f9b-4a1e-54d3-bcad-c490d5543246"], "gloss": "wants", "surface": "quiere"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["0bfd7395-526c-589d-8619-1794b0f8fc11"], "gloss": "I", "surface": "yo"}, {"form_ids": ["11d6bc98-8db6-5ccc-831b-26325ce7b390"], "gloss": "so do I", "surface": "también."}]'::jsonb,
  audio_path = null
where id = 'b6a070b6-e820-546f-8055-bea225720456' and status = 'published' and es = 'Diego quiere otra cerveza y yo también.'; -- que-quieren-tomar
update public.sentences set es = 'Ellos quieren birra y yo quiero un fernet.',
  es_alt = array['Ellos quieren birra y quiero un fernet.', 'Quieren birra y yo quiero un fernet.', 'Quieren birra y quiero un fernet.', 'Ellos quieren cerveza y yo quiero un fernet.', 'Ellos quieren cerveza y quiero un fernet.', 'Quieren cerveza y yo quiero un fernet.', 'Quieren cerveza y quiero un fernet.']::text[],
  tokens = '[{"form_ids": ["451d12e1-e1ea-523d-92fa-26788154c893"], "gloss": "they", "surface": "Ellos"}, {"form_ids": ["89cfb197-59cc-5f6b-8584-f8efd74475b8"], "gloss": "want", "surface": "quieren"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["0bfd7395-526c-589d-8619-1794b0f8fc11"], "gloss": "I", "surface": "yo"}, {"form_ids": ["08f40d50-63c2-540f-a313-8c5748fe4b18"], "gloss": "want", "surface": "quiero"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["5a839a29-2676-521c-9083-8633cdbb996c"], "gloss": "fernet", "surface": "fernet."}]'::jsonb,
  audio_path = null
where id = '23613f4a-eb6a-5e72-a80a-e0285c082369' and status = 'published' and es = 'Ellos quieren cerveza y yo quiero un fernet.'; -- que-quieren-tomar
update public.sentences set es = 'Una birra, una gaseosa y una soda, por favor.',
  es_alt = array['Una cerveza, una gaseosa y una soda, por favor.']::text[],
  tokens = '[{"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "Una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["9444aa7b-bfae-5c03-b9d3-9718e9f19435"], "gloss": "soda", "surface": "gaseosa"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["b4a4b740-6130-53c7-8de6-75aadc0007c5"], "gloss": "sparkling water", "surface": "soda,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'c7f384ab-fcf9-5b67-9eb4-755b1e3b9ebd' and status = 'published' and es = 'Una cerveza, una gaseosa y una soda, por favor.'; -- que-quieren-tomar
update public.sentences set es = '¿Abro una birra?',
  es_alt = array['¿Yo abro una birra?', '¿Abro una cerveza?', '¿Yo abro una cerveza?']::text[],
  tokens = '[{"form_ids": ["582e4187-4136-5645-9a13-c15247b949e6"], "gloss": "should I open", "surface": "¿Abro"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '176ba2ba-f11d-5339-be5d-83d4e6774356' and status = 'published' and es = '¿Abro una cerveza?'; -- vendo-diarios
update public.sentences set es = 'Acá no vendemos birra.',
  es_alt = array['No vendemos birra acá.', 'Acá no vendemos cerveza.', 'No vendemos cerveza acá.']::text[],
  tokens = '[{"form_ids": ["e29831ef-42b2-51ea-8e38-e365e3311ab1"], "gloss": "here", "surface": "Acá"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "don''t", "surface": "no"}, {"form_ids": ["590e66c3-7bfc-5730-8336-d80377684c34"], "gloss": "we don''t sell", "surface": "vendemos"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '86ce1d2b-20a5-5936-9930-ec9a6a53e9c1' and status = 'published' and es = 'Acá no vendemos cerveza.'; -- vendo-diarios
update public.sentences set es = '¿Quién abre otra birra?',
  es_alt = array['¿Quién abre otra cerveza?']::text[],
  tokens = '[{"form_ids": ["f96f0902-45fe-5673-8523-21679c090782"], "gloss": "who''s", "surface": "¿Quién"}, {"form_ids": ["da819b85-50a8-539c-8f41-d85604ac7b7c"], "gloss": "who''s opening", "surface": "abre"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '0446a7d3-8f67-589b-9c50-a7280b5d6c5a' and status = 'published' and es = '¿Quién abre otra cerveza?'; -- practica-el-vecino
update public.sentences set es = 'No vendemos birra, perdón.',
  es_alt = array['Perdón, no vendemos birra.', 'No vendemos cerveza, perdón.', 'Perdón, no vendemos cerveza.']::text[],
  tokens = '[{"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "don''t", "surface": "No"}, {"form_ids": ["590e66c3-7bfc-5730-8336-d80377684c34"], "gloss": "we don''t sell", "surface": "vendemos"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["ea877a4b-8d12-5412-bf29-ac16c36bf180"], "gloss": "sorry", "surface": "perdón."}]'::jsonb,
  audio_path = null
where id = '7e6b6d56-7ef2-5860-a15b-bf73c6e918e1' and status = 'published' and es = 'No vendemos cerveza, perdón.'; -- practica-el-vecino
update public.sentences set es = 'Acá no podés tomar birra.',
  es_alt = array['No podés tomar birra acá.', 'Acá no podés tomar cerveza.', 'No podés tomar cerveza acá.']::text[],
  tokens = '[{"form_ids": ["e29831ef-42b2-51ea-8e38-e365e3311ab1"], "gloss": "here", "surface": "Acá"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "can''t", "surface": "no"}, {"form_ids": ["22a744a3-5009-5c6a-b052-dd0387426f29"], "gloss": "you can''t", "surface": "podés"}, {"form_ids": ["bfbc6151-23f4-5e63-8072-5d29d6e2266e"], "gloss": "drink", "surface": "tomar"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '0e7d5421-84f9-5e9d-a55c-17a2c28ada62' and status = 'published' and es = 'Acá no podés tomar cerveza.'; -- practica-a-la-vuelta
update public.sentences set es = '¿Quién tomó mi birra?',
  es_alt = array['¿Quién tomó mi cerveza?']::text[],
  tokens = '[{"form_ids": ["f96f0902-45fe-5673-8523-21679c090782"], "gloss": "who", "surface": "¿Quién"}, {"form_ids": ["30a1c777-2c58-5a9d-93b6-892251c540e1"], "gloss": "drank", "surface": "tomó"}, {"form_ids": ["b2985319-56f8-5558-8c7a-11dd1ff42858"], "gloss": "my", "surface": "mi"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '2c1df8f5-7f06-5a08-b10c-ebba56a954e8' and status = 'published' and es = '¿Quién tomó mi cerveza?'; -- llegaron-tarde
update public.sentences set es = 'Martín tomó mucha birra anoche.',
  es_alt = array['Anoche Martín tomó mucha birra.', 'Martín tomó mucha cerveza anoche.', 'Anoche Martín tomó mucha cerveza.']::text[],
  tokens = '[{"form_ids": ["4b3d9c85-07c4-572b-9723-8de6a728af94"], "gloss": "Martín", "surface": "Martín"}, {"form_ids": ["30a1c777-2c58-5a9d-93b6-892251c540e1"], "gloss": "drank", "surface": "tomó"}, {"form_ids": ["a44be1e4-d367-514d-8519-a36f36d85354"], "gloss": "a lot of", "surface": "mucha"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f52f5375-2665-57b3-a575-4f1fcf431856"], "gloss": "last night", "surface": "anoche."}]'::jsonb,
  audio_path = null
where id = '671773e6-9264-56b2-a94c-04f5a16e12d7' and status = 'published' and es = 'Martín tomó mucha cerveza anoche.'; -- llegaron-tarde
update public.sentences set es = 'La birra la invitaste vos, ¿no?',
  es_alt = array['La birra la pagaste vos, ¿no?', 'Vos pagaste la birra, ¿no?', 'La cerveza la invitaste vos, ¿no?', 'La cerveza la pagaste vos, ¿no?', 'Vos pagaste la cerveza, ¿no?']::text[],
  tokens = '[{"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "gloss": "the", "surface": "La"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1"], "surface": "la"}, {"form_ids": ["cce1d363-8e19-5a56-852c-edebe385e8de"], "gloss": "paid for", "surface": "invitaste"}, {"form_ids": ["97dde827-60cb-586f-ab2a-0b18dd4f9cfb"], "gloss": "you", "surface": "vos,"}, {"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "right", "surface": "¿no?"}]'::jsonb,
  audio_path = null
where id = '56f0edc1-d603-54be-a638-705f74d87926' and status = 'published' and es = 'La cerveza la invitaste vos, ¿no?'; -- practica-como-estuvo
update public.sentences set es = 'Los pibes trajeron birra y hielo.',
  es_alt = array['Los pibes trajeron hielo y birra.', 'Los pibes trajeron cerveza y hielo.', 'Los pibes trajeron hielo y cerveza.']::text[],
  tokens = '[{"form_ids": ["35d748c8-07e2-5627-bdd4-924d067fa130"], "gloss": "the", "surface": "Los"}, {"form_ids": ["59ae363e-dcbd-548b-9e36-8b645102593a"], "gloss": "guys", "surface": "pibes"}, {"form_ids": ["4eb57f3a-e952-59dc-92f3-828dfeb96a68"], "gloss": "brought", "surface": "trajeron"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["30307b04-a85d-5378-b879-1aa78fd7b3ba"], "gloss": "ice", "surface": "hielo."}]'::jsonb,
  audio_path = null
where id = 'c35aa53d-646d-55ee-8b18-99184a6a8e34' and status = 'published' and es = 'Los pibes trajeron cerveza y hielo.'; -- vinieron-todos
update public.sentences set es = 'Después de cada partido tomábamos una birra.',
  es_alt = array['Tomábamos una birra después de cada partido.', 'Después de cada partido tomábamos una cerveza.', 'Tomábamos una cerveza después de cada partido.']::text[],
  tokens = '[{"form_ids": ["acbd1c31-36cb-55e9-a5bf-ff19787a5774"], "gloss": "after", "surface": "Después"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["998cc56c-fc0a-54f2-a120-579287798fdf"], "gloss": "every", "surface": "cada"}, {"form_ids": ["e9027347-8030-5339-8e88-84c4872fbb10"], "gloss": "game", "surface": "partido"}, {"form_ids": ["ef8f56c7-6d7f-5bed-8cc1-8185787124a3"], "gloss": "we had", "surface": "tomábamos"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = 'f7cd184c-c9e3-5a3a-b6a4-c6a7f320529c' and status = 'published' and es = 'Después de cada partido tomábamos una cerveza.'; -- siempre-jugabamos
update public.sentences set es = 'Para mí, una porción y una birra, por favor.',
  es_alt = array['Una porción y una birra para mí, por favor.', 'Para mí, una porción y una cerveza, por favor.', 'Una porción y una cerveza para mí, por favor.']::text[],
  tokens = '[{"form_ids": ["257e30bf-916e-5772-840c-48bc957cf4d0"], "gloss": "for", "surface": "Para"}, {"form_ids": ["043468b4-c929-5e1d-b664-d1156cbd2874"], "gloss": "me", "surface": "mí,"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["8744ff55-741b-526b-aae5-92613bffa79d"], "gloss": "slice", "surface": "porción"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["466fd20d-f35f-5500-81e9-413001d92ce6"], "gloss": "please", "surface": "por favor."}]'::jsonb,
  audio_path = null
where id = 'b37b9187-3d00-5ad1-9fda-5d71586a997f' and status = 'published' and es = 'Para mí, una porción y una cerveza, por favor.'; -- una-grande-de-muzza
update public.sentences set es = 'Pedimos empanadas y una birra.',
  es_alt = array['Pedimos empanadas y una cerveza.']::text[],
  tokens = '[{"form_ids": ["0eaf5ffd-b86d-5e43-a677-48dd5c670465"], "gloss": "we ordered", "surface": "Pedimos"}, {"form_ids": ["eb6c2e93-d17a-598c-a2fd-48df3b6b3525"], "gloss": "empanadas", "surface": "empanadas"}, {"form_ids": ["f8d95e85-1f78-5547-b970-1ce34d4f9883"], "gloss": "and", "surface": "y"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = 'f026a813-84bd-5739-8bc7-2bfb5c89f896' and status = 'published' and es = 'Pedimos empanadas y una cerveza.'; -- practica-la-sobremesa
update public.sentences set es = 'Hace falta hielo para la birra.',
  es_alt = array['Para la birra hace falta hielo.', 'Hace falta hielo para la cerveza.', 'Para la cerveza hace falta hielo.']::text[],
  tokens = '[{"form_ids": ["55c29beb-fd26-5dbc-a67d-c70b7ebb2c92"], "gloss": "we need", "surface": "Hace falta"}, {"form_ids": ["30307b04-a85d-5378-b879-1aa78fd7b3ba"], "gloss": "ice", "surface": "hielo"}, {"form_ids": ["257e30bf-916e-5772-840c-48bc957cf4d0"], "gloss": "for", "surface": "para"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1", "dfa47ecf-a246-5612-8a97-61edafd4f2f8"], "gloss": "the", "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '3249416a-6306-5ac5-bedd-426373265e6b' and status = 'published' and es = 'Hace falta hielo para la cerveza.'; -- practica-la-feria
update public.sentences set es = 'No te olvides que me debés una birra.',
  es_alt = array['No te olvides que me debés una cerveza.']::text[],
  tokens = '[{"form_ids": ["0de01ef6-29bb-557a-a7e2-f6c1110d951b"], "gloss": "don''t", "surface": "No"}, {"form_ids": ["b1e79895-50ca-573c-862a-43b72fea8ad2"], "gloss": "forget", "surface": "te olvides"}, {"form_ids": ["44bd9db4-03ae-5b9d-85ed-10829cb2342c"], "surface": "que"}, {"form_ids": ["7ba02271-e8c8-5697-ab8c-d5cf79d5ea71"], "gloss": "you owe me", "surface": "me debés"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '78eac661-9c91-5e24-a165-43f6833556e9' and status = 'published' and es = 'No te olvides que me debés una cerveza.'; -- a-medias
update public.sentences set es = 'Se nos acabó la birra antes de las once.',
  es_alt = array['Nos quedamos sin birra antes de las once.', 'Se nos acabó la cerveza antes de las once.', 'Nos quedamos sin cerveza antes de las once.']::text[],
  tokens = '[{"form_ids": ["04b56649-197e-54d3-b502-2ff894351d59"], "gloss": "we ran out of", "surface": "Se nos acabó"}, {"form_ids": ["ac232d51-6535-5e0e-b91c-2828c7fbacf1", "dfa47ecf-a246-5612-8a97-61edafd4f2f8"], "surface": "la"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["f077196b-0352-5000-81bc-14197658412b"], "gloss": "before", "surface": "antes"}, {"form_ids": ["4692b8ee-7359-5686-855f-b800ded6906f"], "surface": "de"}, {"form_ids": ["5993dd9e-babf-5641-bdc9-b8205f708a64", "3eec4afe-08ab-5d40-ba25-588819c5c420"], "surface": "las"}, {"form_ids": ["8d063d51-06ec-5ef3-974a-08a0f4cc0bf3"], "gloss": "eleven", "surface": "once."}]'::jsonb,
  audio_path = null
where id = '93b037af-1a38-5b93-8b5e-7ef6ec3cc2f2' and status = 'published' and es = 'Se nos acabó la cerveza antes de las once.'; -- se-me-quemo
update public.sentences set es = '¿Le traigo una birra al asador?',
  es_alt = array['¿Yo le traigo una birra al asador?', '¿Al asador le traigo una birra?', '¿Le traigo una cerveza al asador?', '¿Yo le traigo una cerveza al asador?', '¿Al asador le traigo una cerveza?']::text[],
  tokens = '[{"form_ids": ["041f747b-9c35-590a-82cf-8d3824613669"], "surface": "¿Le"}, {"form_ids": ["993ddb9d-01d8-5aff-81f5-6cfa17981999"], "gloss": "should I bring", "surface": "traigo"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra"}, {"form_ids": ["dd13504b-d995-54cc-9911-4c6e0faa9947"], "gloss": "the", "surface": "al"}, {"form_ids": ["b64f7008-3ccd-5a4c-93e4-2bc4f29a3b6a"], "gloss": "grill master", "surface": "asador?"}]'::jsonb,
  audio_path = null
where id = '59b43f44-7fa5-5aa5-bf5c-05cc302b83f8' and status = 'published' and es = '¿Le traigo una cerveza al asador?'; -- practica-un-aplauso
update public.sentences set es = 'Agarren un vaso, que traje birra.',
  es_alt = array['Agarren un vaso, que yo traje birra.', 'Agarren un vaso, traje birra.', 'Agarren un vaso, que traje cerveza.', 'Agarren un vaso, que yo traje cerveza.', 'Agarren un vaso, traje cerveza.']::text[],
  tokens = '[{"form_ids": ["dc1dae5b-d242-51e1-9f71-0256358a9651"], "gloss": "grab", "surface": "Agarren"}, {"form_ids": ["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"], "gloss": "a", "surface": "un"}, {"form_ids": ["8ef6b15d-1bd5-5817-853c-bd19ea79f6e9"], "gloss": "glass", "surface": "vaso,"}, {"form_ids": ["44bd9db4-03ae-5b9d-85ed-10829cb2342c"], "surface": "que"}, {"form_ids": ["464e8999-d3e6-5198-ab4b-53de69f944a7"], "gloss": "I brought", "surface": "traje"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '71c43573-29d3-5b9e-a3e8-89a5e73e7601' and status = 'published' and es = 'Agarren un vaso, que traje cerveza.'; -- practica-a-la-mesa
update public.sentences set es = 'Pido otra birra, siempre y cuando pague Nico.',
  es_alt = array['Yo pido otra birra, siempre y cuando pague Nico.', 'Pido otra birra, siempre y cuando Nico pague.', 'Siempre y cuando pague Nico, pido otra birra.', 'Siempre y cuando Nico pague, pido otra birra.', 'Pido otra cerveza, siempre y cuando pague Nico.', 'Yo pido otra cerveza, siempre y cuando pague Nico.', 'Pido otra cerveza, siempre y cuando Nico pague.', 'Siempre y cuando pague Nico, pido otra cerveza.', 'Siempre y cuando Nico pague, pido otra cerveza.']::text[],
  tokens = '[{"form_ids": ["46d5be7a-7fee-5b97-a1e7-9d0d398e3a48"], "gloss": "I''ll order", "surface": "Pido"}, {"form_ids": ["0664bbd9-ccc8-59e5-a026-e87c290e74c4"], "gloss": "another", "surface": "otra"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra,"}, {"form_ids": ["627af654-35e8-5971-82d0-305c480c4898"], "gloss": "as long as", "surface": "siempre y cuando"}, {"form_ids": ["d7248f00-d3e5-5fb7-9723-b9591cf793eb"], "gloss": "pays", "surface": "pague"}, {"form_ids": ["3dfed415-c09f-5c72-84f6-47f13fe54405"], "gloss": "Nico", "surface": "Nico."}]'::jsonb,
  audio_path = null
where id = '0779ef86-2e26-5bae-8cb1-0e6b7cd5da8f' and status = 'published' and es = 'Pido otra cerveza, siempre y cuando pague Nico.'; -- a-menos-que
update public.sentences set es = '¿Solo una birra? Sí, claro.',
  es_alt = array['¿Solo una cerveza? Sí, claro.']::text[],
  tokens = '[{"form_ids": ["04757ff4-9e47-5218-ac9c-49ecba379f5f"], "gloss": "just", "surface": "¿Solo"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "one", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}, {"form_ids": ["e51d2504-4121-553e-b86e-722afb7da5de"], "gloss": "yeah, right", "surface": "Sí, claro."}]'::jsonb,
  audio_path = null
where id = 'd376d790-4917-5752-a4c6-c5c387f0ffec' and status = 'published' and es = '¿Solo una cerveza? Sí, claro.'; -- que-novedad
update public.sentences set es = 'De vez en cuando tomo birra.',
  es_alt = array['Tomo birra de vez en cuando.', 'Yo tomo birra de vez en cuando.', 'De vez en cuando tomo cerveza.', 'Tomo cerveza de vez en cuando.', 'Yo tomo cerveza de vez en cuando.']::text[],
  tokens = '[{"form_ids": ["3586d6b1-79a7-5f35-8788-7747c543bf3a"], "gloss": "every now and then", "surface": "De vez en cuando"}, {"form_ids": ["64609644-11e7-5af2-8b9d-dcda0500090e"], "gloss": "I drink", "surface": "tomo"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra."}]'::jsonb,
  audio_path = null
where id = '09fd22b5-da94-567e-8747-2bf6eb17cefe' and status = 'published' and es = 'De vez en cuando tomo cerveza.'; -- practica-me-pudri
update public.sentences set es = '¿Birra con hielo? Bueno, cada loco con su tema.',
  es_alt = array['¿Cerveza con hielo? Bueno, cada loco con su tema.']::text[],
  tokens = '[{"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "¿Birra"}, {"form_ids": ["d3f4bb24-5409-579d-b92f-11bdcaeecc9b"], "gloss": "with", "surface": "con"}, {"form_ids": ["30307b04-a85d-5378-b879-1aa78fd7b3ba"], "gloss": "ice", "surface": "hielo?"}, {"form_ids": ["770fb250-ae00-510b-8a63-ea9277702843"], "gloss": "well", "surface": "Bueno,"}, {"form_ids": ["ce2f1b39-2a2f-584c-bdc5-098206a0594d"], "gloss": "to each their own", "surface": "cada loco con su tema."}]'::jsonb,
  audio_path = null
where id = '92342b87-88c1-5a2a-94e3-d307d16edf1e' and status = 'published' and es = '¿Cerveza con hielo? Bueno, cada loco con su tema.'; -- practica-cada-loco-con-su-tema
update public.sentences set es = '¿Te convido una birra?',
  es_alt = array['¿Yo te convido una birra?', '¿Te convido una cerveza?', '¿Yo te convido una cerveza?']::text[],
  tokens = '[{"form_ids": ["4b91dc24-7e24-55ea-aea0-9f5e2f9deb6c"], "gloss": "you", "surface": "¿Te"}, {"form_ids": ["a9e23d79-7089-56b8-b6dd-735fb16139c6"], "gloss": "can I offer", "surface": "convido"}, {"form_ids": ["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"], "gloss": "a", "surface": "una"}, {"form_ids": ["7e75eb16-4a4b-5b22-86e9-96b79d81ceb3"], "gloss": "beer", "surface": "birra?"}]'::jsonb,
  audio_path = null
where id = '74be9a24-e61e-5dc7-9a3c-67e55f6ac6ca' and status = 'published' and es = '¿Te convido una cerveza?'; -- practica-se-instalaron
