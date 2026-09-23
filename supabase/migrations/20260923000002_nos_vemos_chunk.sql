-- "vemos" is never said without "nos": every one of its 10 live
-- sentences says "nos vemos" (see you). Same fix as "me llamo"
-- (20260920000001, docs/course-spec.md §1.5): the chunk becomes the form and
-- the bare one is marked bound. The merged tokens keep no gloss until
-- `npm run course:gloss` aligns them again; `npm run course:lessons -- la-hora`
-- rebuilds the unit's slots around the chunk.

begin;

insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('0481e436-8275-572d-a73e-7ae4483941ad', 'a6a9f7ca-4b38-59ef-bb3a-6f5780e92de5', 'nos vemos', '{"mood":"ind","number":"pl","person":1,"tense":"pres","clitic":true}'::jsonb, 'see you', null, '61a56ded-546a-5ad6-a8ac-310375bed4ac', 6, false, null, null, 'published')
on conflict (id) do nothing;

update public.forms set bound = true, gloss_en = null where id = 'a8a3f0e2-8383-570a-8a81-4a6780baee09';  -- vemos

update public.sentences set tokens = '[{"surface":"¿Nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"gloss":"on","surface":"el"},{"form_ids":["7c00177f-dc2b-583d-acc2-95fde9ad0d3a"],"gloss":"Saturday","surface":"sábado?"}]'::jsonb, target_form_id = '0481e436-8275-572d-a73e-7ae4483941ad'
 where id = '75092d31-1dad-5f30-b7e2-a960894982fc' and es = '¿Nos vemos el sábado?';  -- ¿Nos vemos el sábado?
update public.sentences set tokens = '[{"form_ids":["f562cddd-d50a-5293-83c4-35764a00a7cf"],"gloss":"what","surface":"¿Qué"},{"form_ids":["38ad4404-00b7-532e-8d0d-c368a0c45fd1"],"gloss":"day","surface":"día"},{"surface":"nos vemos?","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]}]'::jsonb
 where id = 'e30d96cf-18d9-5e6d-bf16-a6529e29db9d' and es = '¿Qué día nos vemos?';  -- ¿Qué día nos vemos?
update public.sentences set tokens = '[{"form_ids":["16df9c18-3edc-5405-8f9e-b7d5c3ec1103"],"gloss":"bye","surface":"Chau,"},{"surface":"nos vemos.","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]}]'::jsonb, target_form_id = '0481e436-8275-572d-a73e-7ae4483941ad'
 where id = 'd3eb1360-d84a-583b-8581-9466a83cc5ac' and es = 'Chau, nos vemos.';  -- Chau, nos vemos.
update public.sentences set tokens = '[{"form_ids":["f562cddd-d50a-5293-83c4-35764a00a7cf"],"gloss":"what","surface":"¿Qué"},{"form_ids":["38ad4404-00b7-532e-8d0d-c368a0c45fd1"],"gloss":"day","surface":"día"},{"surface":"nos vemos,","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"surface":"el"},{"form_ids":["7217ada7-ed38-5f9e-807b-b4145bf8d6f8"],"gloss":"Friday","surface":"viernes"},{"form_ids":["14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c"],"gloss":"or","surface":"o"},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"surface":"el"},{"form_ids":["7c00177f-dc2b-583d-acc2-95fde9ad0d3a"],"gloss":"Saturday","surface":"sábado?"}]'::jsonb
 where id = '0f460295-b5ce-55c0-b486-60d83ece4435' and es = '¿Qué día nos vemos, el viernes o el sábado?';  -- ¿Qué día nos vemos, el viernes o el sábado?
update public.sentences set tokens = '[{"surface":"¿Nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"gloss":"on","surface":"el"},{"form_ids":["8e315c80-175d-52fa-9fae-07cd32f1e78b"],"gloss":"Wednesday","surface":"miércoles?"}]'::jsonb
 where id = 'df3c6f2d-eb86-5668-af90-06ddc62088ba' and es = '¿Nos vemos el miércoles?';  -- ¿Nos vemos el miércoles?
update public.sentences set tokens = '[{"form_ids":["770fb250-ae00-510b-8a63-ea9277702843"],"gloss":"OK","surface":"Bueno,"},{"surface":"nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["1ed2393d-a340-50b3-8c63-de2c49b7d78e"],"gloss":"at","surface":"en"},{"form_ids":["ac232d51-6535-5e0e-b91c-2828c7fbacf1"],"gloss":"the","surface":"la"},{"form_ids":["e4598e5b-f82b-54ca-ac13-3a9c8c46cfb8"],"gloss":"corner","surface":"esquina"},{"form_ids":["74e2a507-6e97-590f-8ec7-c33934590ffe"],"gloss":"by the","surface":"del"},{"form_ids":["0a4f7f5f-c293-5a05-b698-b2150e144e0d"],"gloss":"kiosco","surface":"kiosco."}]'::jsonb, target_form_id = '0481e436-8275-572d-a73e-7ae4483941ad'
 where id = '4242f830-31f5-5706-9072-87a292ba050a' and es = 'Bueno, nos vemos en la esquina del kiosco.';  -- Bueno, nos vemos en la esquina del kiosco.
update public.sentences set tokens = '[{"form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey","surface":"Che,"},{"form_ids":["b20bba62-c9b9-5803-9cdf-93d9b550a550"],"gloss":"it''s","surface":"es"},{"form_ids":["5b521c42-9260-586a-a6d5-2160c6464fed","2eb0ac43-7ec8-5338-80df-b535b021f655"],"gloss":"late","surface":"tarde,"},{"surface":"¿nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["73876919-f6a3-5323-acd9-3362ac56e4bb","437e8e1b-32e2-5bd3-a37c-53039fba2b26"],"gloss":"tomorrow","surface":"mañana?"}]'::jsonb
 where id = 'cb0d6cfd-6c80-5d9d-b091-2ef5c5d11f6b' and es = 'Che, es tarde, ¿nos vemos mañana?';  -- Che, es tarde, ¿nos vemos mañana?
update public.sentences set tokens = '[{"surface":"Nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["8f951310-6c70-5801-9504-b9eccf75e5f3"],"gloss":"at","surface":"a"},{"form_ids":["5993dd9e-babf-5641-bdc9-b8205f708a64"],"surface":"las"},{"form_ids":["6ab1bab9-505c-5f5f-83f8-44e0be2d2529"],"gloss":"eight","surface":"ocho"},{"form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"past","surface":"y"},{"form_ids":["f512becb-9933-5b39-88df-e2551d9cdfc4"],"gloss":"half","surface":"media."}]'::jsonb
 where id = '9584cedb-f8e2-5349-bd39-2333a75e9151' and es = 'Nos vemos a las ocho y media.';  -- Nos vemos a las ocho y media.
update public.sentences set tokens = '[{"surface":"Nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["1ed2393d-a340-50b3-8c63-de2c49b7d78e"],"gloss":"in","surface":"en"},{"form_ids":["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"],"gloss":"a","surface":"una"},{"form_ids":["c8941827-bb3e-51ee-b4d1-bf842c43355e"],"gloss":"week","surface":"semana."}]'::jsonb
 where id = '2534fabc-1341-50f6-89ee-4e1b014980cf' and es = 'Nos vemos en una semana.';  -- Nos vemos en una semana.
update public.sentences set tokens = '[{"surface":"Nos vemos","form_ids":["0481e436-8275-572d-a73e-7ae4483941ad"]},{"form_ids":["73876919-f6a3-5323-acd9-3362ac56e4bb","437e8e1b-32e2-5bd3-a37c-53039fba2b26"],"gloss":"tomorrow","surface":"mañana."}]'::jsonb, target_form_id = '0481e436-8275-572d-a73e-7ae4483941ad'
 where id = 'c0605ad9-858a-5f78-ad87-286507f8f796' and es = 'Nos vemos mañana.';  -- Nos vemos mañana.

commit;
