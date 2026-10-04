-- ---------------------------------------------------------------------------
-- What the review of the second course map found in the content
-- (20261005000001–21).
-- ---------------------------------------------------------------------------

-- A merged unit handed over its words, tips and sentences but not its grammar:
-- Pancho, the answer explanations and the sentence prompts read it from here.
update public.units set grammar_focus = array_append(grammar_focus, 'voy-a-tener-que') where slug = 'la-semana-que-viene' and not 'voy-a-tener-que' = any (grammar_focus);
update public.units set grammar_focus = array_append(grammar_focus, 'futuro.irregulares') where slug = 'donde-estara' and not 'futuro.irregulares' = any (grammar_focus);
update public.units set grammar_focus = array_append(grammar_focus, 'repaso.b1') where slug = 'no-sabes-lo-que-me-contaron' and not 'repaso.b1' = any (grammar_focus);

-- US English, where 20261005000016 and 21 didn't reach. The sentences say
-- "soccer" everywhere; the unit's title said "football".
update public.units set title_en = 'Ask for a favor' where slug = 'me-haces-un-favor';
update public.units set title_en = 'Practice: favors, forms and the market' where slug = 'practica-la-feria';
update public.units set title_en = 'Practice: mishaps, favors and first times' where slug = 'practica-nunca-habia';
update public.units set title_en = 'Say you realized or got mixed up' where slug = 'que-significa';
update public.units set title_en = 'Talk to your older neighbors' where slug = 'como-no-dona-rosa';
update public.units set title_en = 'Talk about soccer' where slug = 'el-partido';
update public.forms set gloss_note_en = replace(gloss_note_en, 'your mum', 'your mom') where form = 'anda' and gloss_note_en like '%your mum%';
update public.lemmas set gloss_en = 'orange (color)' where lemma = 'naranja' and gloss_en = 'orange (colour)';
update public.lemmas set gloss_note_en = replace(gloss_note_en, 'the colour of', 'the color of') where lemma = 'celeste' and gloss_note_en like '%the colour of%';
update public.lemmas set gloss_note_en = replace(gloss_note_en, 'neighbourhood', 'neighborhood') where lemma = 'chino' and gloss_note_en like '%neighbourhood%';
update public.lemmas set gloss_note_en = 'a furnished apartment rented for days or weeks' where lemma = 'alquiler temporario' and gloss_note_en = 'a furnished flat rented for days or weeks';
update public.tips set body_md = replace(body_md, 'is a flat you rent', 'is an apartment you rent'), updated_at = now() where id = 'c584c6c4-0148-5cf4-9a92-48b82350a4e0';
update public.tips set body_md = replace(body_md, 'older neighbours', 'older neighbors'), updated_at = now() where id = 'e05a6f2c-db31-58b3-91ea-a33abfd335c9';
update public.tips set body_md = replace(body_md, 'learn to recognise it', 'learn to recognize it'), updated_at = now() where id = '89ceed83-6de5-5102-bf3b-75fb12b34e48';

-- "I can't be bothered" was swapped for "I don't feel like it" inside a longer
-- sentence (20261005000016), and the answer key came out ungrammatical.
update public.sentences set en = 'I don''t feel like going to the bank today.', updated_at = now()
where id = 'e83f4b74-0622-57d3-8a69-c7b8afa68440' and en = 'I don''t feel like it to go to the bank today.';

-- Three verb forms only ever said after their pronoun (course:validate, docs/course-spec.md §1.5; same fix as
-- 20260924000023): the chunk becomes the form, the bare one is marked bound, and every sentence has the two
-- tokens merged. Merged tokens keep no gloss until course:gloss aligns them.
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('b50f42f6-2f5d-5711-a506-2a02bfb5f875', 'e6c73968-a2f1-567c-8d37-9970a9b778ab', 'me repetís', '{"mood":"ind","number":"sg","person":2,"tense":"pres","voseo":true,"clitic":true}'::jsonb, 'you repeat for me', null, '9f62a065-778e-5620-b8e5-de9e6f8c2907', 15, false, null, null, 'published')
on conflict (id) do nothing;
update public.forms set bound = true, gloss_en = null where id = 'dba1c634-0bcd-545e-a72f-f73f1ca47180';  -- repetís
update public.lesson_slots set form_id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875' where form_id = 'dba1c634-0bcd-545e-a72f-f73f1ca47180';
update public.sentences set tokens = '[{"surface":"—¿Me repetís?","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["191fd126-be91-54fb-8848-9f3aa180ca5d"],"gloss":"yes","surface":"—Sí,"},{"form_ids":["c771d6c2-ff28-59a2-835a-6401aa611826"],"gloss":"of course","surface":"claro,"},{"form_ids":["bc260843-41a2-537d-847f-782817c58d02"],"gloss":"more","surface":"más"},{"form_ids":["179c5fbd-23a6-541b-856c-166a65464785"],"gloss":"slowly","surface":"despacio."}]'::jsonb, target_form_id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875' where id = '10702e93-126b-546f-b47f-72a192b6ccce' and es = '—¿Me repetís? —Sí, claro, más despacio.';
update public.sentences set tokens = '[{"surface":"¿Me repetís","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["bacd3417-72d8-527e-9373-e589af0609dd"],"gloss":"how you say it","surface":"cómo se dice?"}]'::jsonb, target_form_id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875' where id = '0a76a13c-fb02-5685-8ac7-6f248b749e35' and es = '¿Me repetís cómo se dice?';
update public.sentences set tokens = '[{"surface":"¿Me repetís","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["af3a59da-b961-5310-80f6-95b5b4c531bd"],"surface":"cómo"},{"form_ids":["4f173e8a-138d-5e78-ac11-53284731caa7"],"gloss":"your name","surface":"te llamás?"}]'::jsonb, target_form_id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875' where id = 'ea2d811c-00ec-5193-b587-39a464e503fb' and es = '¿Me repetís cómo te llamás?';
update public.sentences set tokens = '[{"surface":"¿Me repetís","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["a8b720e9-4445-55c5-be41-171be0b697b5"],"gloss":"first","surface":"nombre"},{"form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"],"gloss":"and","surface":"y"},{"form_ids":["7c70c282-b339-5e39-8a57-8fb18e5ee7b8"],"gloss":"last name","surface":"apellido,"},{"form_ids":["466fd20d-f35f-5500-81e9-413001d92ce6"],"gloss":"please","surface":"por favor?"}]'::jsonb where id = '8bfa8e49-1eba-5e7d-9a92-a588358eb502' and es = '¿Me repetís nombre y apellido, por favor?';
update public.sentences set tokens = '[{"surface":"¿Me repetís?","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]}]'::jsonb, target_form_id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875' where id = 'd3f9b821-c241-5e55-b9be-6a561d108426' and es = '¿Me repetís?';
update public.sentences set tokens = '[{"form_ids":["f562cddd-d50a-5293-83c4-35764a00a7cf"],"gloss":"what","surface":"¿Qué?"},{"surface":"¿Me repetís,","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["466fd20d-f35f-5500-81e9-413001d92ce6"],"gloss":"please","surface":"por favor?"}]'::jsonb where id = '34a6f1bc-fbd9-586f-bcb2-9c0336d9b7e1' and es = '¿Qué? ¿Me repetís, por favor?';
update public.sentences set tokens = '[{"form_ids":["8ca5bc53-dfc5-5a7a-b4d7-9c0175e57c05"],"gloss":"I understand","surface":"Entiendo"},{"form_ids":["e657f1ae-ea6c-534f-ab82-4c588ff4c310"],"gloss":"very little","surface":"poco."},{"surface":"¿Me repetís","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["bc260843-41a2-537d-847f-782817c58d02"],"gloss":"more","surface":"más"},{"form_ids":["179c5fbd-23a6-541b-856c-166a65464785"],"gloss":"slowly","surface":"despacio?"}]'::jsonb where id = '677fdf56-8f4f-597d-9911-6f260c8ca46c' and es = 'Entiendo poco. ¿Me repetís más despacio?';
update public.sentences set tokens = '[{"form_ids":["0de01ef6-29bb-557a-a7e2-f6c1110d951b"],"gloss":"don''t","surface":"No"},{"form_ids":["8ca5bc53-dfc5-5a7a-b4d7-9c0175e57c05"],"gloss":"understand","surface":"entiendo."},{"surface":"¿Me repetís?","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]}]'::jsonb where id = 'ec47fd3e-d28e-5050-9f86-fbfd060bc7fe' and es = 'No entiendo. ¿Me repetís?';
update public.sentences set tokens = '[{"form_ids":["7bad7209-3158-537f-98a7-d94d162d56e9"],"gloss":"I''m","surface":"Soy"},{"form_ids":["9c95a032-82d1-589e-ac82-8f88c9497954"],"gloss":"tourist","surface":"turista,"},{"surface":"¿me repetís","form_ids":["b50f42f6-2f5d-5711-a506-2a02bfb5f875"]},{"form_ids":["bc260843-41a2-537d-847f-782817c58d02"],"gloss":"more","surface":"más"},{"form_ids":["179c5fbd-23a6-541b-856c-166a65464785"],"gloss":"slowly","surface":"despacio?"}]'::jsonb where id = 'bf6001f6-076d-5e8b-a4d2-3136abbc8d9e' and es = 'Soy turista, ¿me repetís más despacio?';
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('044179d3-21aa-5a3e-9dbd-90c72ded7290', '7b74d01a-12bc-5a79-ac85-c1dd98d36bb2', 'te moleste', '{"mood":"subj","number":"sg","person":1,"tense":"pres","clitic":true}'::jsonb, '(that) I bother you', null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 3, false, null, null, 'published')
on conflict (id) do nothing;
update public.forms set bound = true, gloss_en = null where id = 'cb118049-3f64-5a75-b9b5-30bea82f4c0e';  -- moleste
update public.lesson_slots set form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where form_id = 'cb118049-3f64-5a75-b9b5-30bea82f4c0e';
update public.sentences set tokens = '[{"form_ids":["c48e6e77-ae50-51b9-b468-45a4afd5bec4"],"gloss":"can I","surface":"¿Puedo"},{"form_ids":["43f53ba0-9b94-59ff-9c6b-c63c7c87dc3f"],"gloss":"put on","surface":"poner"},{"form_ids":["0d7d2982-d23b-5af2-ac97-ce7d035e6b76"],"gloss":"music","surface":"música"},{"form_ids":["58e4b868-4f13-5f85-86ec-2b420b12b4f0"],"gloss":"without","surface":"sin que"},{"surface":"te moleste?","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]}]'::jsonb where id = '8058bfb4-88ee-5580-8db7-1cb296e457ed' and es = '¿Puedo poner música sin que te moleste?';
update public.sentences set tokens = '[{"form_ids":["dbf59afc-7a1f-5d87-b1d2-f5160b6df0b4"],"gloss":"sorry","surface":"Disculpá"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"gloss":"to","surface":"que"},{"surface":"te moleste,","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]},{"form_ids":["d949f0c1-7827-5d85-aa25-b68296561f40"],"gloss":"is there","surface":"¿hay"},{"form_ids":["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"],"gloss":"a","surface":"una"},{"form_ids":["e5629604-d9ca-5046-ae5f-7d505db8a555"],"gloss":"pharmacy","surface":"farmacia"},{"form_ids":["c6afea0e-fbc1-57b7-ba94-09357438226e"],"gloss":"around here","surface":"por acá?"}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '9a149c8d-0050-5445-8c16-e15e519fd678' and es = 'Disculpá que te moleste, ¿hay una farmacia por acá?';
update public.sentences set tokens = '[{"form_ids":["dbf59afc-7a1f-5d87-b1d2-f5160b6df0b4"],"gloss":"sorry","surface":"Disculpá"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"surface":"que"},{"surface":"te moleste,","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]},{"form_ids":["85ce7e19-1a7d-5fdd-9223-18bba4be8317"],"gloss":"ma''am","surface":"señora,"},{"form_ids":["9bc152d6-03be-59a4-9aa5-e0b413382864"],"gloss":"can you save","surface":"¿me cuidás"},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"gloss":"my","surface":"el"},{"form_ids":["79fd484a-d703-5752-bf1b-24c30768bf33"],"gloss":"place","surface":"lugar?"}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '8a55315c-659e-5ead-a9f1-e86b88e77522' and es = 'Disculpá que te moleste, señora, ¿me cuidás el lugar?';
update public.sentences set tokens = '[{"form_ids":["dbf59afc-7a1f-5d87-b1d2-f5160b6df0b4"],"gloss":"sorry","surface":"Disculpá"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"gloss":"to","surface":"que"},{"surface":"te moleste.","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '573373bc-8823-5465-9847-6a23b979f609' and es = 'Disculpá que te moleste.';
update public.sentences set tokens = '[{"form_ids":["ea877a4b-8d12-5412-bf29-ac16c36bf180"],"gloss":"sorry","surface":"Perdón"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"gloss":"to","surface":"que"},{"surface":"te moleste","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]},{"form_ids":["f7c1db2c-dafd-51e2-9b70-b54f30cc1d7e"],"gloss":"again","surface":"otra vez."}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '6bdef2d5-6faa-51cb-9cdf-f57b1d13a56f' and es = 'Perdón que te moleste otra vez.';
update public.sentences set tokens = '[{"form_ids":["ea877a4b-8d12-5412-bf29-ac16c36bf180"],"gloss":"sorry","surface":"Perdón"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"surface":"que"},{"surface":"te moleste,","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]},{"form_ids":["fa370862-7bc6-5b7c-b4a4-3e27ec6b8df0"],"gloss":"sir","surface":"señor,"},{"form_ids":["6f728516-9c03-54d3-9d4a-651b4c5313fe"],"gloss":"this","surface":"¿esto"},{"form_ids":["b20bba62-c9b9-5803-9cdf-93d9b550a550"],"gloss":"is","surface":"es"},{"form_ids":["a9135a3d-e641-5c55-ae7b-9f9a48421f93"],"gloss":"yours","surface":"tuyo?"}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '7669d925-3877-5a90-9d05-1d2db66cda30' and es = 'Perdón que te moleste, señor, ¿esto es tuyo?';
update public.sentences set tokens = '[{"form_ids":["ea877a4b-8d12-5412-bf29-ac16c36bf180"],"gloss":"sorry","surface":"Perdón"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"gloss":"to","surface":"que"},{"surface":"te moleste.","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '3d451846-1b71-54d4-ad8c-04c21c9d0580' and es = 'Perdón que te moleste.';
update public.sentences set tokens = '[{"form_ids":["fa370862-7bc6-5b7c-b4a4-3e27ec6b8df0"],"gloss":"sir","surface":"Señor,"},{"form_ids":["ea877a4b-8d12-5412-bf29-ac16c36bf180"],"gloss":"sorry","surface":"perdón"},{"form_ids":["44bd9db4-03ae-5b9d-85ed-10829cb2342c"],"surface":"que"},{"surface":"te moleste,","form_ids":["044179d3-21aa-5a3e-9dbd-90c72ded7290"]},{"form_ids":["f82a4bd5-e06c-50f0-ba6e-f988eb9934d6"],"gloss":"can you","surface":"¿se puede"},{"form_ids":["98efa0e8-848f-532e-897e-ba93eea8bcd6"],"gloss":"park","surface":"estacionar"},{"form_ids":["e29831ef-42b2-51ea-8e38-e365e3311ab1"],"gloss":"here","surface":"acá?"}]'::jsonb, target_form_id = '044179d3-21aa-5a3e-9dbd-90c72ded7290' where id = '4dd78c36-3a4d-5cb7-b5b8-ab0544b163f2' and es = 'Señor, perdón que te moleste, ¿se puede estacionar acá?';
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('f0e5ca34-449b-5d64-a426-1067d42e9cdd', '93b89ea2-e4e7-5738-aebd-872762c66493', 'me salvaste', '{"mood":"ind","number":"sg","person":2,"tense":"pret","voseo":true,"clitic":true}'::jsonb, 'you saved me', null, '7a4e0aad-1065-50e6-bfec-a76b27e0ed9a', 2, false, null, null, 'published')
on conflict (id) do nothing;
update public.forms set bound = true, gloss_en = null where id = 'eec453ea-5773-5853-ad98-d48f94d1a051';  -- salvaste
update public.lesson_slots set form_id = 'f0e5ca34-449b-5d64-a426-1067d42e9cdd' where form_id = 'eec453ea-5773-5853-ad98-d48f94d1a051';
update public.sentences set tokens = '[{"surface":"—Me salvaste.","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["29f8c64e-d5df-53e2-a5af-91aef55d7787"],"gloss":"don''t mention it","surface":"—Ni hablar."}]'::jsonb where id = '95d7c08e-b0b4-5930-a8af-aed5c15184a9' and es = '—Me salvaste. —Ni hablar.';
update public.sentences set tokens = '[{"surface":"¡Me salvaste","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["ac232d51-6535-5e0e-b91c-2828c7fbacf1","dfa47ecf-a246-5612-8a97-61edafd4f2f8"],"surface":"la"},{"form_ids":["19f53923-4f45-5162-ba1f-38857f0925fc"],"gloss":"life","surface":"vida!"}]'::jsonb, target_form_id = 'f0e5ca34-449b-5d64-a426-1067d42e9cdd' where id = 'fe776174-9b5f-50a9-bfda-19ae1a468e82' and es = '¡Me salvaste la vida!';
update public.sentences set tokens = '[{"form_ids":["f562cddd-d50a-5293-83c4-35764a00a7cf"],"gloss":"what a","surface":"¡Qué"},{"form_ids":["a49c3c63-184b-5ccd-8600-05f6e780a9a8"],"gloss":"genius","surface":"genia,"},{"surface":"me salvaste!","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]}]'::jsonb where id = '7e90a9a4-6bc9-5508-9987-f56612d94387' and es = '¡Qué genia, me salvaste!';
update public.sentences set tokens = '[{"form_ids":["69aca2df-3fd3-5a0f-832e-67272c867fc5"],"gloss":"yesterday","surface":"Ayer"},{"surface":"me salvaste","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["1ed2393d-a340-50b3-8c63-de2c49b7d78e"],"gloss":"in","surface":"en"},{"form_ids":["ac232d51-6535-5e0e-b91c-2828c7fbacf1","dfa47ecf-a246-5612-8a97-61edafd4f2f8"],"gloss":"the","surface":"la"},{"form_ids":["a5448845-5067-5d70-91dd-8255feba8742"],"gloss":"meeting","surface":"reunión."}]'::jsonb, target_form_id = 'f0e5ca34-449b-5d64-a426-1067d42e9cdd' where id = '1ebdeb89-9341-5adb-9705-06fb8fd689ad' and es = 'Ayer me salvaste en la reunión.';
update public.sentences set tokens = '[{"form_ids":["91232a84-b055-5e03-8ed2-651c79f5b376"],"gloss":"hey","surface":"Che,"},{"form_ids":["4b91dc24-7e24-55ea-aea0-9f5e2f9deb6c"],"surface":"te"},{"form_ids":["12291ce1-d6f8-5937-abf7-0f0417912787"],"gloss":"thanks","surface":"agradezco"},{"form_ids":["89b17f31-167e-56b8-aaf8-99d944d7a475"],"gloss":"for the","surface":"lo"},{"form_ids":["74e2a507-6e97-590f-8ec7-c33934590ffe"],"gloss":"the","surface":"del"},{"form_ids":["4d495006-b278-5acd-9d30-6a7720424a03"],"gloss":"moving truck","surface":"flete,"},{"surface":"me salvaste.","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]}]'::jsonb where id = 'cce106ce-1a92-530e-bbeb-fd1349a2db88' and es = 'Che, te agradezco lo del flete, me salvaste.';
update public.sentences set tokens = '[{"form_ids":["9c78c990-e652-5b9f-a449-4cdda2a3937b"],"gloss":"thanks","surface":"Gracias,"},{"form_ids":["4a689b58-a8f4-5574-b6b4-f78d38269097"],"gloss":"Cami","surface":"Cami,"},{"surface":"me salvaste.","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]}]'::jsonb, target_form_id = 'f0e5ca34-449b-5d64-a426-1067d42e9cdd' where id = 'b18991a9-7469-5756-850c-e9a011129886' and es = 'Gracias, Cami, me salvaste.';
update public.sentences set tokens = '[{"form_ids":["036dd23b-0baf-5adf-8b08-ab2cbdaa61fb"],"gloss":"Juli","surface":"Juli,"},{"form_ids":["a40b6376-6354-58aa-972a-651fa54cc725"],"gloss":"you''re","surface":"sos"},{"form_ids":["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"],"gloss":"a","surface":"una"},{"form_ids":["a49c3c63-184b-5ccd-8600-05f6e780a9a8"],"gloss":"genius","surface":"genia,"},{"surface":"me salvaste","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"gloss":"my","surface":"el"},{"form_ids":["7b189100-f9ab-5fb8-87c6-db19bbc3d8a9"],"gloss":"birthday party","surface":"cumple."}]'::jsonb where id = 'cf2bb1d9-712a-5cc2-958e-e3ef05acc168' and es = 'Juli, sos una genia, me salvaste el cumple.';
update public.sentences set tokens = '[{"form_ids":["e04deac3-5570-5018-8202-0af9dbca4604"],"gloss":"Mica","surface":"Mica,"},{"surface":"me salvaste,","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["56918598-34c4-5168-8557-335face04c15"],"gloss":"the","surface":"el"},{"form_ids":["a9a6e852-534a-5395-9c96-c29693456fca"],"gloss":"supermarket","surface":"súper"},{"form_ids":["87238f27-439a-583e-b1a2-881ea40b9f6e"],"gloss":"already","surface":"ya"},{"form_ids":["1a1319e5-02f6-582c-a864-d01e6bf64d96"],"gloss":"was","surface":"estaba"},{"form_ids":["c78922a7-fe14-59ea-b3e2-644bfbbd4886"],"gloss":"closed","surface":"cerrado."}]'::jsonb, target_form_id = 'f0e5ca34-449b-5d64-a426-1067d42e9cdd' where id = 'f30e0451-af64-5f4d-81f4-549e98dcafba' and es = 'Mica, me salvaste, el súper ya estaba cerrado.';
update public.sentences set tokens = '[{"form_ids":["f7c1db2c-dafd-51e2-9b70-b54f30cc1d7e"],"gloss":"again","surface":"Otra vez"},{"surface":"me salvaste,","form_ids":["f0e5ca34-449b-5d64-a426-1067d42e9cdd"]},{"form_ids":["12abeae3-d9f6-52e5-995a-fbca54f0f13e"],"gloss":"I owe you","surface":"te debo"},{"form_ids":["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"],"gloss":"one","surface":"una."}]'::jsonb where id = '94958bc6-86cf-5f4f-acbd-0038b9bccf8f' and es = 'Otra vez me salvaste, te debo una.';
update public.units set review_form_ids = array_replace(array_replace(array_replace(review_form_ids,
    'dba1c634-0bcd-545e-a72f-f73f1ca47180'::uuid, 'b50f42f6-2f5d-5711-a506-2a02bfb5f875'::uuid),
    'cb118049-3f64-5a75-b9b5-30bea82f4c0e'::uuid, (select id from public.forms where form = 'te moleste' and status = 'published')),
    'eec453ea-5773-5853-ad98-d48f94d1a051'::uuid, (select id from public.forms where form = 'me salvaste' and status = 'published'))
where review_form_ids && array['dba1c634-0bcd-545e-a72f-f73f1ca47180', 'cb118049-3f64-5a75-b9b5-30bea82f4c0e', 'eec453ea-5773-5853-ad98-d48f94d1a051']::uuid[];

-- Every edit to a sentence's Spanish in 20261005000009 and 20 also emptied its
-- accepted English answers. Where the English stayed the same but for
-- punctuation (a dialogue's dashes, a comma), the answers it had are still
-- right and come back. A sentence whose English was rewritten keeps none: its
-- old answers are answers to another sentence.
update public.sentences s set en_alt = v.en_alt, updated_at = now()
from (values
  ('03419896-40d1-5e56-b952-ed7cbfdfbc12', 'Juan trabaja de noche.', array['Juan works nights.']::text[]),
  ('038043cc-f59f-52d1-8083-865bfa82321a', 'Estaba cocinando tranquilo cuando empezó el ruido del vecino.', array['I was calmly cooking when the neighbor''s noise started.', 'I was cooking calmly when the neighbor''s noise started.']::text[]),
  ('0389d589-2397-5363-b5f4-91927efb7687', 'Hace seis meses que estoy acá y sigo mejorando.', array['I''ve been here for six months and I''m still improving.']::text[]),
  ('0969b663-bc44-5d59-84fb-438eff1ff587', 'Te pido una sola cosa: no hiervas el agua.', array['Just one thing: don''t boil the water.']::text[]),
  ('102f1c4b-1511-5da5-90e2-5ee3c316fee8', 'Completá la dirección con el número.', array['Put the street number in the address.']::text[]),
  ('1363d473-d9fa-5158-811d-9cedbb83d6e4', '¿De cuánto fue la inflación este mes?', array['What was inflation this month?']::text[]),
  ('18818886-0f00-5ca9-b332-b03190aed9e4', 'Prendé la luz, si no, no veo nada.', array['Turn the light on, or else I can''t see a thing.']::text[]),
  ('190399a3-a862-580c-8ff8-f891db7f048d', 'Lucía, ¿me cuidás el gato?', array['Lucía, can you take care of the cat for me?']::text[]),
  ('3076d60e-228f-5df2-9c41-8fc06122f62e', 'Nico es re tranquilo, pero su novia siempre está apurada.', array['Nico is super chill, but his girlfriend is always in a hurry.']::text[]),
  ('3e1726f3-fcf8-5093-86e3-e385032c63be', 'Nunca practico y no entiendo nada.', array['I never practice and I understand nothing.']::text[]),
  ('4250dd09-5ce1-5ff0-8e38-04ce412d26b7', 'Nada de fútbol, estás en reposo.', array['No soccer for you, you''re on bed rest.']::text[]),
  ('4a90558d-b823-5c06-af88-a72af0a07c36', 'Me aseguró que era la última vez.', array['She assured me it was the last time.', 'He swore it was the last time.']::text[]),
  ('51fd8883-4c09-5a19-813b-c79e51a1919b', 'Me prometió que iba a venir, pero al final no vino.', array['He promised he''d come, but in the end he didn''t.']::text[]),
  ('5d1c52bc-1a28-58c9-b83e-ab79892205a1', 'En el fondo, ¿estás contento?', array['Are you happy, deep down?']::text[]),
  ('5ed27363-18e0-5684-bd50-7ab11054cdb4', 'Dijo que iba a pasar y después me puso una excusa.', array['She said she''d stop by, then sent me an excuse.']::text[]),
  ('673d5b77-2b3b-5f0c-ac39-be783ecd33e9', 'Resultó ser mentira.', array['It turned out it was a lie.']::text[]),
  ('71b9d1d5-86da-5796-a3cd-c60f94718456', 'Hace meses que estoy practicando y todavía me cuesta.', array['I''ve been practicing for months and I still struggle.']::text[]),
  ('79970caa-cba3-592d-880c-d57643ef3aa7', 'Contame, ¿cómo estuvo el partido?', array['Tell me, how did the game go?']::text[]),
  ('870e38b1-7661-5ad5-bc65-65f2edeca76f', 'Para la juntada llevo empanadas.', array['I''ll bring empanadas for the get-together.']::text[]),
  ('890a6043-5fbf-5d5a-ab68-5c3e2a563e16', 'Mi familia está cerca.', array['I have my family nearby.']::text[]),
  ('8964971a-e8a2-5833-98c0-a5943f303f87', 'No te encontré en la parada, ¿ya te fuiste?', array['I couldn''t find you at the stop, did you leave already?']::text[]),
  ('8f680c2b-5280-5c6d-86b9-691947025369', 'Lo raro es que hoy el wifi anda.', array['What''s weird is that the wifi is working today.']::text[]),
  ('904c1cd5-d380-5ae0-9d16-b1f372463a67', '¿Mentirosa yo? Te dije que iba a pasar, y acá estoy.', array['I''m a liar? I said I would come by, and here I am.']::text[]),
  ('93965f2c-c8f7-52bd-8779-dd9e5d119ceb', '¿Cuánto demoró tu DNI?', array['How long did it take you to get your ID?']::text[]),
  ('9fe9bddc-a48c-5053-a018-d88e7c8024ae', '¿Yo? Laburo en el hospital, de noche.', array['Me? I work nights at the hospital.']::text[]),
  ('a43b41f4-b983-523b-9b62-706d7dcd8705', 'Si decís gracias, salís de la ronda.', array['If you say thank you, you leave the circle.']::text[]),
  ('ad3fe8de-beff-523e-bdc7-a8ea188e1060', 'Hace dos años que estoy acá; sin embargo, me cuesta el castellano.', array['I''ve been here for two years; however, I find Spanish hard.']::text[]),
  ('bd0f4ce1-28a9-525e-adfc-f4e82bb68bdf', 'Yo llevo el vino y vos, las empanadas.', array['I''m bringing the wine and you''re bringing the empanadas.']::text[]),
  ('d70b4fc9-cc13-5d9d-bb68-25bf0bba184f', 'Un paquete de chicles sale ochocientos pesos.', array['Gum costs eight hundred pesos.']::text[]),
  ('dc02ecf4-4612-5ac5-80ba-8ad3878d65d0', 'Me aseguró que arreglaría todo en un día.', array['She assured me she''d fix it all in one day.', 'He swore he''d fix everything in a day.']::text[]),
  ('e259250d-8e01-5392-98ff-5e2a803711be', 'Quedamos en que yo llevo el vino.', array['We agreed I''d bring the wine.']::text[]),
  ('f8d0a12d-347a-53dc-a606-08f74c602c37', 'Si querés, te paso a buscar a las ocho.', array['If you want, I''ll pick you up at eight.']::text[]),
  ('fa868dfb-d290-5b12-b81f-6f9e03c891ef', 'Llevo vino, pero no tengo plata para la carne.', array['I''m bringing wine, but I''ve got no money for the meat.']::text[]),
  ('00a15dbe-dba9-5793-961e-a791207cb513', '—¿Está nublado? —Sí, y hace frío.', array['Is it cloudy out? Yeah, and it''s cold.']::text[]),
  ('00af5080-18d5-5a4c-b48e-5dd5118c3d15', '—¿Cómo se llama él? —Fede, un vecino de Mica.', array['What''s his name? —Fede, a neighbor of Mica''s.']::text[]),
  ('01e7b49e-1250-5ff4-8a11-48053dd927f0', '—¿Querés un mate? —¡Claro!', array['Do you want a mate? —Of course!']::text[]),
  ('044b3e04-dd82-536b-b744-e857acc524e0', '—¿Se brinda con agua? —No, trae mala suerte.', array['Do people toast with water? —No, it''s bad luck.']::text[]),
  ('044de748-c048-58bc-b8c8-a71eb863ee60', '—¿Estás ocupada? —No, todo bien.', array['Are you busy? No, it''s all good.']::text[]),
  ('04ecd964-ffd9-59ee-817d-878775fc414b', '—¿Qué te picó? —Ni idea, pero me duele.', array['What stung you? —No idea, but it hurts me.']::text[]),
  ('071a0773-ab96-539c-9d76-071c2ca4b58b', '—¿Dónde estás? —En la esquina de la plaza.', array['Where are you? At the corner by the park.']::text[]),
  ('071e2dc6-e8a5-5f83-abb9-9d1fe6b5ecb8', '—¿Practicamos? —Dale.', array['Should we practice? Sure.']::text[]),
  ('0764dd0e-688e-54a1-960a-c7dd446a2d56', '—Perdón, ¿está libre? —No, está ocupado.', array['Sorry, is this free? No, it''s taken.']::text[]),
  ('07f44278-bde8-5dee-8854-a84677708802', '—¿La de la izquierda o la roja? —La que prefieras.', array['The one on the left or the red one? Whichever one you like.']::text[]),
  ('0806715f-ed4c-5176-8769-d87592829f5f', '—¿Es normal saludar con un beso? —Sí, acá sí.', array['Is greeting with a kiss normal? —Yes, here it is.']::text[]),
  ('086442a7-d9fa-5e72-8f9e-6e0f8b46ff7a', '—¿Qué le digo? —Te acompaño en el sentimiento.', array['What should I tell her? I''m sorry for your loss.']::text[]),
  ('0980dff1-bbc0-532a-a137-60756b446463', '—¿Empezás a las ocho? —No, a las nueve y media.', array['Do you start at eight? No, at half past nine.']::text[]),
  ('09b019b4-f6e7-5f5d-bd28-56ce849a6d0c', '—¿Venís mañana? —A lo mejor, te aviso.', array['Are you coming tomorrow? Maybe, I''ll tell you.']::text[]),
  ('0a3015a9-9fb3-5d8b-b07f-fee9580d8e19', '—¿Estás nervioso por el examen? —Ni ahí, estudié un montón.', array['Are you nervous about the exam? Not at all, I studied a ton.']::text[]),
  ('0b966b46-2216-5931-acbf-6ce105d61646', '—¿Tenés alfajores? —Sí, de Córdoba.', array['Got any alfajores? Yes, from Córdoba.']::text[]),
  ('0be96024-05e5-5730-8def-ef47cbedbb2d', '—¿Un mate? —Claro.', array['A mate? Of course.']::text[]),
  ('0c850b18-4949-59d3-80dc-7134a0f55c01', '—¿Qué estás haciendo? —Nada, tomando mate.', array['What are you up to? Nothing, having mate.']::text[]),
  ('0e848426-787b-553a-8b57-f1b692e5c19b', '—¿Qué pedís? —Lo de siempre.', array['What are you having? The usual.']::text[]),
  ('0ee9420c-08b4-56ea-b341-cfc5aa6ad1be', '—¿Cómo te fue? —Perdí, pero estuvo divertido.', array['How''d it go? I lost, but it was fun.']::text[]),
  ('10cafd6d-c421-5950-9538-e6e1f1c00763', '—¿Contestaste la invitación de Diego? —No, todavía no.', array['Did you reply to Diego''s invitation? No, not yet.']::text[]),
  ('10ee405f-bb73-5ad2-9efa-2bd90bc880c9', '—¿Tus hijos estudian acá? —No, en Montevideo.', array['Do your sons study here? No, in Montevideo.']::text[]),
  ('1287056b-359a-5bf3-b351-b6fd94617367', '—¿Sos de acá? —Sí, de zona norte.', array['Are you from here? —Yeah, from the north side.', 'Are you from here? —Yes, the north side.']::text[]),
  ('13705628-23d2-5a98-8215-aef30a1eb4bd', '—¿Por qué cortaron? —Le metió los cuernos.', array['Why did they break up? —He cheated on her.']::text[]),
  ('13bb0b3e-78cc-5da3-9ab6-f625e950256b', '—¿Cómo es tu novio? —Alto y simpático.', array['What''s your boyfriend like? Tall and friendly.']::text[]),
  ('14c32c6c-1c4f-5309-affd-2e6b4e5d545a', '—¿Hace mucho que estudiás castellano? —No, dos meses.', array['Have you studied Spanish for long? —No, two months.']::text[]),
  ('1807d6eb-1e51-581c-a798-8b981ed88b5b', '—¿Sos ordenado? —Más o menos.', array['Are you organized? —Sort of.']::text[]),
  ('188b798b-815e-5181-9297-4158b68a79d6', '—¿Cuántos son? —Somos cuatro.', array['How many are you? We''re four.']::text[]),
  ('18ed76ef-d31e-521f-b7b3-64257fc03303', '—¿Sacaste al perro? —Sí, recién.', array['Did you walk the dog? Yes, just now.']::text[]),
  ('1959decd-a987-5335-a9e7-5eddc744bde5', '—¿Quién es ella? —Una señora de afuera.', array['Who is she? A woman from somewhere else.']::text[]),
  ('19bc9c01-38f1-5c7e-9fbe-17ef9d5b7abf', '—¿Compraste los pasajes? —No, me arrepentí.', array['Did you get the tickets? No, I changed my mind.']::text[]),
  ('1ab809fe-e76f-5916-bf14-e48e3de70aae', '—¿Efectivo o tarjeta? —Como quieras.', array['Cash or card? Up to you.']::text[]),
  ('1befe2c8-24cf-5f9e-8f5b-8495683aab83', '—Che, ¿cómo está tu papá? —Más o menos.', array['Hey, how is your dad? So-so.']::text[]),
  ('1c45ee2f-0d7e-544a-ab30-8fd41cd679b9', '—¿Eso es una araña? —No, un mosquito.', array['Is that a spider? —No, it''s a mosquito.']::text[]),
  ('1d77a9ef-b042-536c-9e8b-5388c4d63e4b', '—¿Quién tiene chocolate? —Yo no.', array['Who''s got chocolate? Not me.']::text[]),
  ('1dba7f6c-803b-5705-9306-62deaa5e2ef8', '—¿El subte está lejos? —No, a una cuadra.', array['Is the metro far? No, one block away.']::text[]),
  ('1f39bb8d-78f9-5962-942b-09176123b0af', '—Yo no bailo. —Yo tampoco.', array['I don''t dance. Neither do I.']::text[]),
  ('21035901-ebe6-5cec-89b8-25c4ae9fe20a', '—¿Entendés? —Sí, entiendo.', array['Do you get it? —Yes, I get it.']::text[]),
  ('2149cc59-4308-581a-be24-172a7eac6700', '—¿Una cerveza? —No, gracias.', array['Beer? No thanks.']::text[]),
  ('2177a806-74c6-5bdd-98ec-aca3b0126561', '—¿Todo bien? —Sí, todo bien.', array['Everything OK? Yeah, all good.']::text[]),
  ('219c305f-00cb-5f82-9cce-45cfae26d3e8', '—¿Juan te pagó? —No, pero ya fue.', array['Did Juan pay you? No, but forget it.']::text[]),
  ('21a4bc83-7a17-57b8-b964-06d9d034630d', '—¿Es tu kiosco? —No, es de mis viejos.', array['Is it your kiosco? No, it belongs to my parents.']::text[]),
  ('23d5d68d-e997-5ec4-91c1-cae4011f6cdf', '—¿Cómo te sentís? —Mejor, gracias.', array['How are you feeling? Better, thanks.']::text[]),
  ('24a53e9f-7427-5ada-ac46-c44285407681', '—¿Mati es uruguayo? —No, es de Córdoba.', array['Mati''s Uruguayan? No, he''s from Córdoba.']::text[]),
  ('24bbb993-62b8-5d13-816e-76409d9f6fb9', '—¿Ustedes son de acá? —No, somos de Montevideo.', array['Are you from here? No, we''re from Montevideo.']::text[]),
  ('24eaaa77-80d3-55e6-b7d7-f75c42a73c75', '—¿Hay un cajero por acá? —Sí, en la esquina.', array['Is there an ATM near here? —Yes, at the corner.']::text[]),
  ('25e36039-54bf-583f-854b-f572c06f3cbd', '—¿Rocío es cocinera? —No, es médica.', array['Rocío wants to be a cook.']::text[]),
  ('26709032-c057-5623-bbde-19b85cd0bfcd', '—¿Un té y torta? —Un café y torta, gracias.', array['A tea and cake? A coffee and cake, thanks.']::text[]),
  ('26ee33fe-14be-58f0-9659-85ad82709cf2', '—¿Vos vas a votar? —Sí, obvio.', array['Are you voting? Yes, obviously.']::text[]),
  ('27302856-07de-5878-919a-8ac35530694d', '—¿Y si la bici no vuelve entera? —Me la pagás.', array['What if the bike doesn''t come back in one piece? Then you pay for it.']::text[]),
  ('27f77442-4653-54ee-969b-1e751d473bbd', '—¿Qué hacés? —Todo bien, ¿y vos?', array['What''s up? All good, you?']::text[]),
  ('294d6e81-60ca-5247-98db-fb1ef57df31c', '—No me gusta mirar fútbol. —A mí tampoco.', array['I don''t like to watch soccer. Neither do I.']::text[]),
  ('2a812458-0972-5a70-bd79-28983a0a4050', '—¿Medialuna? —Claro, y otro café.', array['A croissant? Of course, and another coffee.']::text[]),
  ('2aa1191b-ba7b-556e-acc4-b05f7bd94e79', '—¿Otro mate? —Dale, gracias.', array['One more mate? OK, thanks.']::text[]),
  ('2b009b8c-1201-5e7e-b5d3-f2d774b11108', '—¿Y los chicos? —Puede ser que lleguen a las diez.', array['And the others? Maybe they''ll arrive around ten.']::text[]),
  ('2b57e19f-7c85-5132-8ccf-d6aed7dd52ef', 'Andá despacio, si no, no te presto más el auto.', array['Drive slowly, or I''m not lending you the car again.']::text[]),
  ('2c52cd99-e0f9-5af0-ac26-95e8d2e7d635', '—¿Cómo es tu vecina? —Flaca y alta.', array['What''s your neighbor like? Tall and skinny.']::text[]),
  ('2c6f143d-7a01-5337-ad4b-65e01b0e25cd', '—¿Estás cansado? —Ni ahí.', array['Are you tired? No way.']::text[]),
  ('2c888b7c-f1a5-5aa3-b383-b58df0826559', '—¿Por qué hay tazas en el piso? —Se me cayeron.', array['Why are there cups on the floor? —They fell.']::text[]),
  ('2d0aa03f-b5f9-54c8-8eb1-d848f150c0db', '—¿Se fue Sofi? —Y bueno, que se vaya.', array['Sofi''s gone? Oh well, let her go.']::text[]),
  ('2d4d1a45-6fee-57d0-bf67-2529002d1ec9', '—¿Votaste? —Sí, voté ayer.', array['Have you voted? Yes, I voted yesterday.']::text[]),
  ('2dbf2840-b173-5194-9b6f-bb163c31e750', '—¿Por qué dejaste la facu? —Me pudrí.', array['Why did you quit college? I got sick of it.']::text[]),
  ('2fed8315-4953-5390-949d-01670656a74f', '—¿Por qué están acá? —Porque Sofi está enferma.', array['Why are you here? Because Sofi is ill.']::text[]),
  ('2ff4357a-8437-5e6e-9ed9-706a3a86cfe1', '—¿Una medialuna? —No, gracias, una tostada.', array['A medialuna? No, thanks, toast.']::text[]),
  ('3008194c-e69b-5557-b9fd-a352be911209', '—¿Quién es? —Puede ser que sean los chicos.', array['Who''s that? Could be the kids.']::text[]),
  ('3030b25d-adea-5045-8217-dbff78735924', '—¿Y tu hermano? —No vino, está enfermo.', array['And your brother? He didn''t come because he''s sick.']::text[]),
  ('33001462-3206-5514-91f1-32f305465171', '—¿Cuántos años tenés? —Dieciséis.', array['What''s your age? Sixteen.']::text[]),
  ('331959c0-850c-55ac-8f88-6f3b5d399e32', '—¿Vas al asado? —¡Obvio!', array['Are you going to the barbecue? —Of course!']::text[]),
  ('3405d133-6e1a-51cc-8127-5016c25edad2', '—¿Es de acá? —No, es española.', array['Is she from here? No, she''s Spanish.']::text[]),
  ('3581e6fc-f510-5dc7-a942-1fb339b9d13d', '—Juli, ¿estás lista? —Sí, dale.', array['Juli, are you ready? Yeah, OK.']::text[]),
  ('35ffdc40-c18b-53ea-a02e-7e190547faa5', '—¿Cuántos años tenés? —Tengo diecinueve.', array['How old are you? Nineteen.']::text[]),
  ('36351dce-4162-54c2-89df-325eb47c24a5', '—¿Y la pizza? —Se me quemó.', array['Where''s the pizza? It got burned.']::text[]),
  ('371915a8-d78e-5930-abab-f660a39c8793', '—¿Cómo son los mellizos? —Rubios y simpáticos.', array['What are the twins like? Blond and nice.']::text[]),
  ('377b241d-6467-5baf-8693-d0624924c74c', '—¿Viste la serie? —Sí, pero me aburrí un poco.', array['Did you see the series? Yes, but I got a bit bored.']::text[]),
  ('37f57351-363f-5404-b8b1-c749fd0860ca', '—¿Quién es canadiense? —Yo.', array['Who''s Canadian? I am.']::text[]),
  ('38017a98-1534-5525-9256-1b5473f5c640', '—¿Tus viejos son altos? —Sí, y mi hermano también.', array['Are your parents tall? Yes, and so is my brother.']::text[]),
  ('38b81d04-1345-5959-a485-bbfd600ded4f', '—¿Quién es ella? —Ana, una amiga de Martín.', array['Who is she? —Ana, one of Martín''s friends.']::text[]),
  ('38d8f04a-d322-5a5c-9bfa-51774a382fea', '—¿Tenés exámenes? —Sí, y tengo que laburar también.', array['Have you got exams? Yeah, and I have to work too.']::text[]),
  ('3a85cdbc-99a9-5fb1-a67a-7f2790054d5b', '—¿Había sidra en Navidad? —Sí, siempre.', array['Did you have cider at Christmas? Yeah, every year.']::text[]),
  ('3b5a1fc3-0565-5710-90dd-fcf97475c8fb', '—¿Santi está enojado conmigo? —Puede ser, no sé.', array['Is Santi mad at me? Could be, I don''t know.']::text[]),
  ('3d847973-ef8e-5e2d-8de0-ff0032e85b91', '—¿Por qué no venís? —El tema es que laburo.', array['Why don''t you come? The thing is, I have work.']::text[]),
  ('3e12b5fc-4fb3-5373-b6ea-d508876487a3', '—Che, ¿tenés monedas? —Sí, tengo cinco.', array['Hey, do you have any coins? Yeah, I have five.']::text[]),
  ('3ed633d5-6ef9-5ea0-b1ea-9bcec9294312', '—¿Cómo son tus hermanos? —Altos y flacos.', array['What are your siblings like? Tall and thin.']::text[]),
  ('409bd900-2b1d-5f48-9cd4-ae4ef4184669', '—¿Cuándo volvés? —En junio.', array['When are you back? In June.']::text[]),
  ('4120618c-3789-5155-87e4-36aabf0e6a7c', '—¿Está madura? —Sí, es para hoy.', array['Is it ripe? Yes, eat it today.']::text[]),
  ('42a48e39-6130-56b0-adf0-7b2f749acf14', '—¿Fede es argentino? —Sí, de Córdoba.', array['Is Fede Argentinian? Yeah, from Córdoba.']::text[]),
  ('43831df1-2f05-537e-9eab-6353eea92ea3', '—¿Estás durmiendo? —No, estoy leyendo.', array['Are you sleeping? No, I''m reading.']::text[]),
  ('45905f4d-601b-5395-9ca0-e1e5ba3464e3', '—¿Cómo está el negocio? —Más o menos.', array['How''s the store doing? So-so.']::text[]),
  ('465dc8ac-ebb5-52c1-acbe-5e6fec3b6d34', '—¿Hay algo en las cámaras? —No, nada.', array['Anything on the cameras? No, nothing.']::text[]),
  ('47f72668-69ab-5914-a915-f80e5b26326a', '—¿Una cerveza? —¡Dale!', array['A beer? Sounds good!']::text[]),
  ('49eb396f-9774-5f7d-bd2b-d836f28ac86d', '—¿Ella es turista? —No, es de acá.', array['Is she a tourist? No, she''s local.']::text[]),
  ('4a09198a-09f2-52ab-851a-29eccbcf1173', '—¿Cómo es tu cuñada? —Morocha, flaca y simpática.', array['What does your sister-in-law look like? Brunette, slim, and nice.']::text[]),
  ('4a4cd8d5-cdc5-512a-b881-f90606f5a449', '—¿Estás nerviosa? —No, todo bien.', array['Are you nervous? No, it''s all good.']::text[]),
  ('4c801654-2c4a-5ec0-918d-afa81eba47f3', '—¿Qué le pasó al auto? —Choqué anoche.', array['What happened to the car? I had a crash last night.']::text[]),
  ('4d1d0b7f-ad5f-578e-a7e7-dc9f3bef205f', '—¿A qué hora llegaste anoche? —Tarde, a las tres.', array['What time did you get home last night? Late, at three.']::text[]),
  ('4d804006-723a-540c-bdf1-e372d5654a2b', '—¿Se puede fumar? —No, mirá: no se permite.', array['Is smoking OK? No, look: it''s not allowed.']::text[]),
  ('4e19d342-c9c8-5363-b752-f073d90bee9a', '—¿Quién atajó ayer? —Nico, porque Diego estaba enfermo.', array['Who was in goal yesterday? —Nico, because Diego was sick.']::text[]),
  ('4e24e503-dd9c-5436-bd4d-53fa0d4ef668', '—¿Qué te dijo? —Que le trajera el paraguas.', array['What did she tell you? To bring her the umbrella.']::text[]),
  ('4e6cba41-bd9e-5495-a743-74fa3fef0146', '—¿Es de confianza? —Sí, es mi primo.', array['Is he trustworthy? —Yes, he''s my cousin.']::text[]),
  ('4e7ea66e-d0f1-5f04-ba5d-c9c52bc2a8a5', '—¿Te encargó algo? —Sí, que sacara al perro.', array['Did he ask you to do anything? Yes, to walk the dog.']::text[]),
  ('4ebb211f-4cb5-5e23-8b89-fb0d30e8358a', '—¿Me llevás al médico? —Sí, obvio.', array['Can you drive me to the doctor? —Yeah, obviously.']::text[]),
  ('4ed3012a-4216-5673-a292-800f68088b9d', '—¿Qué pasó? —Me robaron.', array['What happened? I was robbed.']::text[]),
  ('52081347-d6fc-53f7-aa65-4d1041ec5781', '—¿Y el informe? —Lo entregamos anoche.', array['And the report? We handed it in last night.']::text[]),
  ('52bf3955-ea75-54b5-85d9-4c47dd3ae8d0', '—¿Entendés inglés? —Sí, entiendo bien.', array['Do you understand English? —Yes, pretty well.']::text[]),
  ('5439bab7-2062-5d4c-b667-b5903c2d72df', '—¿Lo viste? —Sí, pero me hice el gil.', array['Did you see him? Yes, but I acted like I didn''t.']::text[]),
  ('543d97f5-6f23-541a-b921-ae3c97682bfe', '—¿De qué te reís? —De la escena del perro.', array['What''s so funny? —The dog scene.']::text[]),
  ('54a04030-4467-5c3c-8c9e-ff31ea9b46e1', '—¿Por qué no vinieron? —Porque ya habíamos hecho planes.', array['Why didn''t you guys come? Because we had already made plans.']::text[]),
  ('54f5a7ea-4a51-59b4-bad2-384334cd32da', '—¿Me prestás el libro? —Sí, pero quiero que lo cuides.', array['Can I borrow the book? Yes, but I want you to look after it.']::text[]),
  ('5635072c-7f21-58e6-bae7-ab843a17ee72', '—¿Y el electricista? —Viene mañana.', array['And the electrician? —He''s coming tomorrow.']::text[]),
  ('56b60c2b-eb39-5558-9ebb-0b4222ce55c9', '—¿El subte funciona? —Aparentemente, no.', array['Is the subway working? Apparently not.']::text[]),
  ('572f30f3-f942-5b2e-ba26-c8208419ab0e', '—¿Me traés un jugo? —Sí, ¿con o sin azúcar?', array['Could you bring me a juice? Yes, with or without sugar?']::text[]),
  ('573ea7cf-a922-5910-abd6-e0faa65bac33', '—¿Cómo te fue? —Ni te cuento.', array['How''d it go? —You don''t even want to know.']::text[]),
  ('593fcb5a-14dd-5f34-80e7-7190466d2e65', '—¿Corro? —No, tranqui, hay tiempo.', array['Do I run? No, chill, there''s time.']::text[]),
  ('59887fd1-e426-5495-9ee0-d44375cb00da', '—¿Sos estadounidense? —No, canadiense.', array['Are you American? No, I''m Canadian.']::text[]),
  ('59b803c0-1b29-5e61-b7ac-a206e813c885', '—¿Cómo van a ir? —Pensamos tomar el tren.', array['How are you going to get there? We plan to take the train.']::text[]),
  ('59e62471-abf5-52c5-8317-b7a95a524457', '—¿Una docena? —Dale.', array['A dozen? —Sure.']::text[]),
  ('5a22ad2a-7c9d-5ece-8bbb-94fec15462ec', '—¿Ya salieron? —No, estamos por salir.', array['Have you left yet? No, we''re just about to.']::text[]),
  ('5c648efd-6783-5fa4-8635-79ea061bc609', '—¿Viene Lucía? —Supongo que sí.', array['Is Lucía coming? I suppose so.']::text[]),
  ('5d828075-8c58-52b9-9da1-0c8bee6c35cc', '—¿Una medialuna? —Joya, gracias.', array['A medialuna? Great, thanks.']::text[]),
  ('5d964484-2355-5444-9070-cf5cff4c8d4d', '—¿Un té? —Sí, joya.', array['Tea? Yeah, great.']::text[]),
  ('5e017dce-9588-5de9-b4cc-9f84f4df9937', '—Un gusto, Pablo. —Igualmente.', array['Nice to meet you, Pablo. Likewise.']::text[]),
  ('5e52f4a3-4774-5497-a284-f3af2ba25037', '—¿Cuántos años tiene? —Uno.', array['How old is she? One.']::text[]),
  ('60fa8229-e96f-5d02-8080-4215cf18f223', '—¿Practicás mucho? —No, practico poco porque laburo mucho.', array['Do you practice much? No, not much, because I work a lot.']::text[]),
  ('61560cac-bae7-561b-b55d-24d66d30c979', '—¿Cuántos años tiene Mica? —Quince.', array['What''s Mica''s age? Fifteen.']::text[]),
  ('621b98ca-3472-5857-ad52-2b5df12e5cde', '—¿Cómo era el ladrón? —Petiso.', array['What did the robber look like? Short.']::text[]),
  ('625a92e5-878d-5fac-b8c3-e86827b4138e', '—¿Esperaste mucho? —No, cinco minutos.', array['Have you been waiting long? No, just five minutes.']::text[]),
  ('6311e289-fbe7-5439-b8f8-c7670116728a', '—¿Belén es argentina? —Sí, de Buenos Aires.', array['Belén''s Argentinian? Yeah, from Buenos Aires.']::text[]),
  ('66793cf4-6a3f-5d2f-a163-cbf5612e662c', '—¿Fue un error? —No, fue lo mejor.', array['Was it a mistake? No, it was for the best.']::text[]),
  ('677aa100-8543-5c3c-be7f-43abcadf469b', '—¿Pizza o empanadas? —Me da igual.', array['Pizza or empanadas? Either is fine.']::text[]),
  ('6851dbde-fede-5709-bfee-15fb15bb5231', '—¿Tu papá es inmigrante? —No, es de acá.', array['Is your dad an immigrant? No, he''s from around here.']::text[]),
  ('688bb676-4b6f-52c6-aae2-6de4d221b67b', '—¿Te queda cerca? —Sí, me queda a tres cuadras.', array['Is it near you? Yes, it''s three blocks away.']::text[]),
  ('69e74069-2e48-5378-9ddd-23d9d3b29496', '—¿Santi no vino? —Por lo visto, no.', array['Didn''t Santi come? —Looks like he didn''t.']::text[]),
  ('6a683638-352f-5868-90c2-560d7883fbd6', '—¿Viste la película? —Sí, me hizo llorar.', array['Did you watch the movie? Yeah, it made me cry.']::text[]),
  ('6ab25efc-cacc-5836-b0c5-77670a84a8af', '—¿Hay una farmacia por la zona? —Sí, a dos cuadras.', array['Is there a pharmacy around here? Yes, two blocks away.']::text[]),
  ('6c9df56a-b74c-58f3-a082-6ace2a8665b2', '—¿Hay alfajores en la mochila? —Sí, dos.', array['Any alfajores in the backpack? Yeah, two.']::text[]),
  ('6dc57c8b-6072-52ad-ada5-ba276f6556f9', '—¿Llegamos a tiempo? —Puede ser, si salimos ya.', array['Do we get there on time? Maybe, if we leave now.']::text[]),
  ('6fcb916d-eeb7-51a4-8bb5-5cf18a184b2a', '—¿Cuántos años tiene Belén? —Catorce.', array['What''s Belén''s age? Fourteen.']::text[]),
  ('6fcbec70-0d99-5f61-8133-4b52a61231f4', '—¿Es caro? —Al contrario, es baratísimo.', array['Expensive? Quite the opposite, it''s really cheap.']::text[]),
  ('6ff66a50-75a1-5029-b089-116ec1a59480', '—¿Viene Diego? —Supongo que no.', array['Is Diego coming? I don''t think so.']::text[]),
  ('70d3ae60-06a0-5f33-bb44-f129a94803c8', '—¿Cómo estás? —Medio cansada.', array['How are you? A bit tired.']::text[]),
  ('70ec79df-7a38-5624-8801-7d007ad7a393', '—¿Cuántos años tiene? —Dos.', array['How old is she? Two.']::text[]),
  ('712dea75-a6f3-51bc-9492-a8d763dfafe5', '—¿Dónde estás? —Estoy cerca, en el kiosco.', array['Where are you? I''m nearby, at the kiosk.']::text[]),
  ('72c6ac22-f6d1-5d58-a0bb-3136b8b72790', '—¿La jefa está en la oficina? —Sí, con un abogado.', array['Is the boss in her office? Yes, she''s with a lawyer.']::text[]),
  ('73178410-cc95-5a61-b632-59dcedcb5dd0', '—¿Por qué estás tan agotado? —Tuve mucho laburo.', array['Why are you so wiped out? I had tons of work.']::text[]),
  ('73eff65e-fbce-57e9-b57b-d085aa42552e', '—¿Una medialuna? —No, gracias.', array['A croissant? No, thanks.']::text[]),
  ('73f14fcc-dc8a-5760-bc54-975bd5dc874b', '—¿Estás en el kiosco? —Sí, y tengo las galletitas.', array['Are you at the kiosk? Yeah, and I have the cookies.', 'Are you at the kiosk? Yes, and I''ve got the cookies.']::text[]),
  ('753efe29-094e-5a7f-8a9c-70eeddaf888d', '—¿Salís mucho? —De vez en cuando.', array['Do you go out much? Once in a while.']::text[]),
  ('75f56b7d-bffc-520d-bf8c-b9a51e59fc4b', '—¿Cuántos años tenés? —Trece.', array['What''s your age? Thirteen.']::text[]),
  ('762ca609-07ff-5547-b12b-ddb726ba338c', '—¿Qué quieren? —Queremos dos empanadas y un jugo.', array['What would you like? Two empanadas and a juice.']::text[]),
  ('769ae2d4-47e4-5a0d-aac9-7cae961d2c1f', '—¿Estás ocupado? —No, dale.', array['Are you busy? No, sure.']::text[]),
  ('777771fe-d750-528a-8863-4dd1926ea68b', '—¿Dónde está Juli? —Desapareció.', array['Where''s Juli? She vanished.']::text[]),
  ('77bf1a04-be3a-5872-910a-3c960be3151c', '—¿Qué había los domingos? —Ravioles, siempre.', array['What was there on Sundays? Always ravioli.']::text[]),
  ('77c4ec74-3078-5406-88fd-7c050bad2fe3', '—¿Vendrá Diego? —Capaz que no, está re ocupado.', array['Do you think Diego will come? Maybe not, he''s super busy.']::text[]),
  ('78bdca97-4ed2-51fc-9f6f-9210d7464ffa', '—¿Sabés a quién votó tu papá? —Ni idea.', array['Do you know who your father voted for? No clue.']::text[]),
  ('7b5a5646-3331-5ab1-84e3-20aeedf3cfd0', '—¿Llegás a tiempo? —Puede ser, si el tren sale ya.', array['Are you going to get there on time? Could be, if the train leaves right now.']::text[]),
  ('7b88c4c9-6e40-5980-9a39-2a68c172ac2d', '—¿En serio se cena a las once? —Sí, es normal.', array['Seriously, dinner at eleven? —Yes, that''s normal.']::text[]),
  ('7ba25138-ad65-522d-b726-34008ee3f9dc', '—¿Te dolió el brazo? —Sí, tomé una pastilla.', array['Did your arm hurt? —Yeah, I took a pill.']::text[]),
  ('7c45863a-c99a-5016-be45-e3982127b2c3', '—¿Querés mate? —Sí, dale.', array['Want some mate? Yeah, sure.']::text[]),
  ('7c464068-a41c-5837-be8a-ced023d85ed1', '—Che, ¿Sofi está embarazada? —Sí, de cinco meses.', array['Hey, is Sofi pregnant? Yes, five months along.']::text[]),
  ('7dfff30c-0232-520d-8c7e-dbb7faf7c0a4', '—¿Él es porteño? —No, es de Córdoba.', array['Is he a porteño? No, he''s from Córdoba.']::text[]),
  ('7f69b659-c601-5a71-9df2-5abd1c7bfeea', '—¿Quién entró? —Mi hermano.', array['Who walked in? My brother.']::text[]),
  ('808d6865-e3d8-5dbb-b695-f06a18ffc0ec', '—¿Cómo es tu compañera nueva? —Es re divertida.', array['What''s your new classmate like? She''s really funny.']::text[]),
  ('80d18e6c-bb51-5b45-b5c5-c86a3288e293', '—¿Me prestás tu campera? —Dale, pero no la rompas.', array['Can I borrow your jacket? OK, but don''t tear it.']::text[]),
  ('812c164a-5f81-5aa4-b71f-c284ba73bb4d', '—Che, ¿otra cerveza? —Sí, dale.', array['Hey, one more beer? Yes, OK.']::text[]),
  ('8370dbe2-2095-5a9e-a645-5f8210b41708', '—¿Ustedes tienen hijos? —Sí, nosotras tenemos tres.', array['Do you two have children? Yes, we have three.']::text[]),
  ('848f4edd-1a20-5265-9bc5-dd37d78fa565', '—¿Nos olvidamos de algo? —Sí, del regalo.', array['Did we forget anything? Yes, the gift.']::text[]),
  ('866e1310-d3f0-5f22-bd96-65bbcc7c1576', '—¿Estás cansada? —Sí, medio.', array['Are you tired? Yeah, a bit.']::text[]),
  ('874be759-bdd6-5686-b6d7-6845a95afc11', '—¿Es costumbre traer algo? —Sí, vino o postre.', array['Are you supposed to bring something? —Yes, wine or dessert.']::text[]),
  ('874de398-9f08-5f44-9b98-4d0c38416210', '—¿Me ayudás? —¡Faltaba más!', array['Can you help me? Of course!']::text[]),
  ('876b4cc6-b59a-576a-9067-31274ee59065', '—¿Puedo pasar? —¡Faltaba más!', array['May I come in? Of course!']::text[]),
  ('87ee1a55-f736-5ef9-83c6-8a7b0ff06256', '—¿Hay un bar por acá? —Sí, en la esquina.', array['Is there a bar around here? Yeah, on the corner.']::text[]),
  ('87f38257-76dc-59a0-bf5f-6dac10064270', '—Me encanta jugar al fútbol. —A mí también.', array['I love to play soccer. So do I.']::text[]),
  ('88c4d70b-a792-521f-81c6-bf858154366a', '—¿Viene Fede al asado? —Puede ser.', array['Is Fede coming to the barbecue? Could be.', 'Is Fede coming to the barbecue? Maybe.']::text[]),
  ('89f8f0f1-b3a1-59fd-b306-f3fb5929f41a', '—¿Tienen alfajores? —Sí, de chocolate.', array['Got any alfajores? Yeah, chocolate.']::text[]),
  ('8a89e168-7388-5fee-b223-1932ded6d59f', '—¿Cuántos años tiene Mati? —Tiene veinte.', array['How old is Mati? Twenty.']::text[]),
  ('8aa45824-ad45-588c-832f-24792cef0fb3', '—¿Y la vuelta al mundo? —Si ganara la lotería, sí.', array['What about a trip around the world? If I won the lottery, sure.']::text[]),
  ('8b414c29-2270-513d-9a7d-c7c60673c970', '—¿Sofi? —No, soy Juan.', array['Sofi? No, it''s Juan.']::text[]),
  ('8bed2a44-9023-5c0b-b76b-173c3fb649ac', '—¿Cómo te llamás? —Perdón, no entiendo.', array['What''s your name? Sorry, I don''t get it.']::text[]),
  ('8ca1aa94-8899-56f3-9246-6ed9fe06fdb1', '—¿Café? —No, mate.', array['Coffee? No, mate for me.', 'Coffee? No, mate.']::text[]),
  ('8cd929ac-9046-5aed-b3a0-664f10abf8c3', '—¿Qué hora es? —Las siete y veintidós.', array['What time is it? Twenty-two past seven.']::text[]),
  ('908aec65-5e56-51fc-9912-243c156d9c6d', '—¿Cómo va el laburo nuevo? —Cada vez mejor.', array['How''s the new job? Getting better and better.']::text[]),
  ('913164ff-3733-589c-8854-0f804528aee7', '—¿Es largo? —No, es una historia cortita.', array['Is it long? No, it''s a short little story.']::text[]),
  ('917399a7-1a53-584d-a3d7-93df235d868f', '—¿Cómo hacés con la plata? —Me las arreglo.', array['How do you do it with money? I get by.']::text[]),
  ('91b03dd3-7488-5487-ac2a-1ab1ba931217', '—¿Quién tiene hambre? —Yo.', array['Who''s hungry? I am.']::text[]),
  ('92138d48-f6cf-52a1-b7fe-647c8d73701f', '—¿Quién es él? —Es mi sobrino de Córdoba.', array['Who is he? That''s my nephew from Córdoba.']::text[]),
  ('94f9fe89-8f3d-5ce0-ad04-800b728ce694', '—¿Me regás la planta? —Sí, ¿dónde está?', array['Will you water my plant? —Yes, where is it?']::text[]),
  ('95cf44cc-a534-505f-9c63-2ef0651f3ca0', '—¿De dónde sos? —Soy español.', array['Where are you from? I''m Spanish.']::text[]),
  ('95d7c08e-b0b4-5930-a8af-aed5c15184a9', '—Me salvaste. —Ni hablar.', array['You saved me. No problem.']::text[]),
  ('95eed0b8-808a-5b1a-979e-8f56c1d593ee', '—¿A qué hora? —Ponele a las ocho.', array['What time? Say eight.', 'What time? Eight, say.']::text[]),
  ('97a46cd2-f933-5f53-a83a-3258eeba575f', '—¿Vos sos argentina? —No, yo soy de Montevideo.', array['You''re Argentinian? No, I''m from Montevideo.']::text[]),
  ('99b4e5ac-bf88-5077-bc72-69912f44a59e', '—¿Fuente? —El diario.', array['Source? The newspaper.']::text[]),
  ('9a4e2396-6a09-57a1-aee1-bd027b742c05', '—¿Compro más hielo por si falta? —Dale, por las dudas.', array['Should I buy more ice in case it''s missing? OK, just in case.']::text[]),
  ('9b3f669d-5748-5391-a44c-edfec06d1917', '—¿Cómo andás? —Bien, no me quejo.', array['How''s it going? Fine, I can''t complain.']::text[]),
  ('9c7283fd-fcba-5c71-94d7-1eddba9a9bbf', '—¿Algo más? —No, nada más, gracias.', array['Anything else? No, that''s it, thanks.']::text[]),
  ('9d0e5151-31f2-57f5-bde9-f26a4c905b7d', '—¿Ganó tu candidata? —Sí, ganó.', array['Did your candidate win? Yes, she did.']::text[]),
  ('9d367b98-7028-5721-ab0a-389a37392a28', '—¿Cuántos años tiene Martín? —Tiene veinte.', array['How old''s Martín? Twenty.']::text[]),
  ('9ddf6b3d-fa9c-5899-8b17-42bba012ef78', '—¿Todavía tenés el arbolito? —Sí, hasta Reyes.', array['You still have the Christmas tree? Yes, until Three Kings'' Day.']::text[]),
  ('9e7b36b4-aacf-5ab5-b519-1b98738abe4d', '—En la cancha, ¿se aplaude al árbitro? —Nunca.', array['Do fans ever applaud the referee? —Never.']::text[]),
  ('9f6b3ddc-8426-5c87-9d17-a5f27857fa4d', '—¿Y el presidente? —Lo desmintió.', array['What about the president? He denied it.']::text[]),
  ('9f7818c6-0709-5f83-ab1c-b89f75bb1e99', '—¿Renunciaste? —Sí, y no me arrepiento.', array['You quit? Yes, and I don''t regret it.']::text[]),
  ('a0ecec19-0aa3-5a1d-9eef-744229534950', '—¿Pudiste ir al súper? —No, no pude.', array['Did you manage to go to the supermarket? No, I couldn''t.']::text[]),
  ('a15ad526-1df4-52cb-80f5-ef12312a652f', '—¿Venís mañana? —Claro, ¿a qué hora?', array['Are you coming tomorrow? —Sure, at what time?']::text[]),
  ('a1c00b30-2afa-5ebb-887d-07acf2ed156a', '—Che, Diego, ¿otro mate? —No, gracias, todo bien.', array['Hey Diego, more mate? No thanks, all good.']::text[]),
  ('a3b835c3-370c-54c9-9d55-7d9e271fa9e1', '—¿Cami estaba? —No, ya se había ido.', array['Was Cami there? No, she was already gone.']::text[]),
  ('a3eb2f3a-31bb-529e-9604-566a5a685d74', '—¿Tu novio se la cree? —Sí, un montón.', array['Is your boyfriend full of himself? Yes, a ton.']::text[]),
  ('a6020dbf-3a48-52c7-9572-8b1f3a741f5d', '—¿Llovió en las vacaciones? —Sí, dos días.', array['Did it rain on your vacation? Yeah, two days.']::text[]),
  ('a617b1d4-8329-5f9e-b364-65d4dd33a501', '—¿Y la rodilla? —Mucho mejor, gracias.', array['And your knee? Much better, thanks.']::text[]),
  ('a66a462c-5bbb-567c-84f1-90aa81e534ba', '—¿Cómo es tu novia? —Alta y morocha.', array['What does your girlfriend look like? Tall and dark-haired.']::text[]),
  ('a7dfe112-4a58-5876-80d5-8d518f509d26', '—¡Perdón! —No, todo bien.', array['Sorry! —No worries.']::text[]),
  ('a8194c57-fccc-5d91-ac23-63e4a6fada38', '—¿Un té? —Sí, gracias.', array['A tea? Yes, thank you.']::text[]),
  ('a95b6322-173c-5f55-9554-99f6ca3a7199', '—¿Tenés candidato? —No, todavía no.', array['Have you got a candidate? No, not yet.']::text[]),
  ('a9a41b10-05c0-5a84-ba16-8b0ea9331b43', '—¿Dónde está Pablo? —Qué sé yo.', array['Where''s Pablo? Beats me.', 'Where''s Pablo? No idea.', 'Where''s Pablo? How should I know?', 'Where''s Pablo? I dunno.']::text[]),
  ('aaa9847d-35fa-5227-9039-4442e8986218', '—¿Se hacen envíos? —Sí, hacemos envíos hasta las once.', array['Do you deliver? Yes, we deliver until eleven.']::text[]),
  ('abb09f18-b76d-5aeb-9caf-472a9ec3526b', '—¿Hablás inglés? —Sí, soy de Estados Unidos.', array['Do you speak English? —Yes, I''m from the US.']::text[]),
  ('ac2cf255-f388-51c6-a0a1-ed796b1965d3', '—¿Una cerveza? —Bueno, dale.', array['Beer? OK, sure.']::text[]),
  ('ac5cec1c-2180-5ecd-9dd0-a2d9bf8c5b25', '—¿Un café? —¡Claro!', array['Coffee? Of course!']::text[]),
  ('ad5ab5cc-bd7b-55e5-9b89-9af5403c930a', '—¿Te dolió algo? —Sí, los ojos.', array['Did something hurt? —Yeah, my eyes.']::text[]),
  ('af2ce17c-a4be-526b-ae2f-1800827da63c', '—¿Dónde está Belén? —En lo de su novio.', array['Where''s Belén? At her boyfriend''s place.']::text[]),
  ('af3c1601-df4e-5eb8-9173-ba6fbd0095df', '—¿Y el vino? —Me olvidé.', array['What about the wine? I forgot.']::text[]),
  ('aff16a5e-6cbc-51a5-8093-6f07ab40ee85', '—¿Cómo es tu cuñado? —Alto, flaco y morocho.', array['What''s your brother-in-law like? Tall and thin, with dark hair.']::text[]),
  ('b28354d5-4632-5f71-96dc-3b7c6faf47b9', '—¿Cuándo se separaron? —Hace un mes, más o menos.', array['When did they break up? A month ago, more or less.']::text[]),
  ('b28acf96-3638-5887-a576-a00acf22d15f', '—¿Cuántas facturas, Fede? —Ocho.', array['How many pastries do you want, Fede? Eight.']::text[]),
  ('b3714dbe-15e7-5652-b134-4b4c96d21b5b', '—¿Cuándo tenés que ir al médico? —El jueves.', array['When do you need to see the doctor? —Thursday.']::text[]),
  ('b4b4b10a-18df-52e2-aedc-46bca72a655e', '—¿Hace mucho que aprendés castellano? —No, hace poco.', array['Have you been learning Spanish long? —No, not long.']::text[]),
  ('b53c8f2d-0d69-5561-9e63-7f25ef0d6504', '—¿Dormís bien? —No, duermo muy poco.', array['Do you sleep well? No, I don''t sleep much.']::text[]),
  ('b599ab17-6b81-5a9a-bfa3-b9cf6f08e00c', '—¿Hablaste con tu jefe? —Sí, ayer, en la oficina.', array['Did you talk to your boss? Yes, yesterday, at the office.']::text[]),
  ('b6f0130c-a1f9-581b-812a-a1b16128e6a2', '—¿Qué hicieron en las sierras? —Caminamos y nadamos.', array['What did you do in the hills? We hiked and swam.']::text[]),
  ('b74b5559-a75e-5a57-8b98-1b033076548d', '—¿Salís mucho? —De vez en cuando.', array['Do you go out much? Once in a while.']::text[]),
  ('b841c102-f0ed-5a84-be4f-8d591269032a', '—¿Cuántos años tiene Cami? —Tiene once.', array['How old is Cami? Eleven.']::text[]),
  ('b8455048-0545-5d4f-b292-02b8a6888eb0', '—¿Viene Juan? —Puede ser.', array['Is Juan coming? Could be.']::text[]),
  ('b852f410-a63b-5beb-a3f6-448cd091bfdf', '—¿Salimos esta noche? —No, estoy agotada.', array['Going out tonight? No, I''m wiped out.']::text[]),
  ('b85d7f9c-2669-52d0-a1bd-3b259feaf7f6', '—¿Martín es francés? —No, es de La Plata.', array['Martín''s French? No, he''s from La Plata.']::text[]),
  ('b957306c-6745-579e-90ab-cbd878f42611', '—¿Quién es él? —Un conocido.', array['Who''s he? Just someone I know.']::text[]),
  ('b9e71c58-c5ec-5379-b803-3e0a9e6f5eb1', '—¿Un tostado sale más? —Sí, sale siete mil.', array['Does a toasted sandwich cost more? Yes, it costs seven thousand.']::text[]),
  ('ba7a17ad-aaa2-5464-9ee9-5a3ae7a6bb30', '—¿Todavía estudiás? —No, me cansé.', array['Do you still study? No, I got sick of it.']::text[]),
  ('bbe21c05-5fa6-5d32-bbab-3a6c1450ce51', '—Mucho gusto. —Encantada.', array['Nice to meet you. —Pleased to meet you.']::text[]),
  ('be099f90-0e07-5206-b9ee-8cf23963aa86', '—¿Subió? —Sí, un montón.', array['Did it go up? Yeah, a lot.', 'Did it go up? Yes, a ton.']::text[]),
  ('bedd9cbd-1f95-50ff-b4dc-a5f0e3dba168', '—¿Y la gaseosa? —La trae Juli.', array['And the soda? —Juli is bringing it.']::text[]),
  ('bfc0779d-7f92-5bee-802b-e4c5e6b5194e', '—¿Vas a la fiesta? —Ni loco, va mi ex.', array['Going to the party? Not a chance, my ex will be there.']::text[]),
  ('bfd60056-f494-5a1a-a24c-ff60493782bc', '—¿Por qué no viniste? —Es que estaba enfermo.', array['Why didn''t you come? I was sick.']::text[]),
  ('c07b292b-e45c-516b-a30c-a7c2b2fc2c36', '—¿Fede es cuñado de Ana? —No, es primo.', array['Is Fede Ana''s brother-in-law? No, cousin.']::text[]),
  ('c142708f-e7e4-5c75-86fc-e5d7fb34658b', '—¿Cuántos invitados hay? —Ponele veinte.', array['How many guests are there? Like twenty.', 'How many guests are there? Around twenty.']::text[]),
  ('c157b1d2-540d-587a-b259-6aabee3296c4', '—¿Qué hiciste el finde? —Lo de siempre.', array['What did you do on the weekend? The usual stuff.']::text[]),
  ('c2cef76c-04b1-5d70-9675-b8901469a38a', '—Profe, ¿otro mate? —Dale, gracias.', array['Teacher, another mate? OK, thanks.']::text[]),
  ('c389b56b-bba4-5c3c-8f0f-6731e6401abc', '—¿Tu hermana es ordenada? —Para nada.', array['Is your sister organized? —Not at all.']::text[]),
  ('c396a78c-fddc-5c90-84c6-00a17a8932a4', '—¿Nos juntamos el jueves? —No puedo, estoy a full.', array['Want to get together Thursday? I can''t, I''m super busy.', 'Are we meeting up Thursday? I can''t, I''m slammed.']::text[]),
  ('c4796ac6-254d-5605-8cf2-b282492c4f91', '—¿Estás por llegar? —Sí, estoy a dos cuadras.', array['Are you about to get here? Yeah, I''m two blocks away.']::text[]),
  ('c48fe5a2-9fdd-5105-90b6-9f67ae1e3c3b', '—¿Son casados? —No, son hermanos.', array['Are they married? No, they''re brother and sister.']::text[]),
  ('c4a90b6d-af5e-59bb-a7cd-0e319ce0b9ad', '—¿Tomás mate? —Casi nunca.', array['Do you drink mate? Almost never.']::text[]),
  ('c504d742-03f1-5569-bb7f-d54905d4be43', '—¿Quién es? —Mi tío.', array['Who''s that? My uncle.']::text[]),
  ('c8701e27-816e-5df2-b3af-803d24acfc12', '—¿Cómo querés el lomo? —Jugoso.', array['How do you want the tenderloin? Juicy.']::text[]),
  ('c87b415b-a0f7-5ea2-8474-102814f9f160', '—¿Tenés monedas? —Sí, tengo dos.', array['Do you have any coins? Yes, I have two.']::text[]),
  ('c9013873-ee2a-5ba6-8469-b82269214bf6', '—¿Quién era? —Mi ex.', array['Who was it? My ex.']::text[]),
  ('ca2da3aa-e3e7-53c2-9b17-6633fcaae3f3', '—¿Llegaste a la parada? —Sí, estoy en la esquina.', array['Did you get to the stop? Yes, I''m at the corner.']::text[]),
  ('ca6600fb-48f2-5966-99d4-72435e107d31', '—¿Qué hora es? —Las cuatro y cuarto.', array['What time is it? A quarter past four.']::text[]),
  ('cb0d5a8a-8f8c-5bbf-9be8-b77f510c8f12', '—¿La verdulería está lejos? —No, a dos cuadras.', array['Is the produce store far? No, two blocks away.']::text[]),
  ('cbc595b9-f484-5af3-8dd2-b6daf5668001', '—¿Qué hago? —Yo en tu lugar, esperaría.', array['What do I do? If I were you, I''d wait.']::text[]),
  ('cbdab841-9590-5e8f-9dd8-23e058323f87', '—¿Querés algo? —No, gracias, estoy bien.', array['Want anything? No, thanks, I''m good.']::text[]),
  ('cc00f9f5-eb00-5616-a266-b849d98a20e6', '—¿Te robaron mucha plata? —No, por suerte.', array['Did they steal a lot of money? Luckily, no.']::text[]),
  ('cc66eafc-365c-5946-bde6-a1250d051083', '—¿Una torta? —¡Genial, gracias!', array['Cake? Awesome, thanks!']::text[]),
  ('cd1e9985-4a03-51af-af12-4d5869ae6614', '—¿Te acordás de Belén? —¡Más vale, éramos vecinos!', array['Remember Belén? Sure I do, we were neighbors!', 'Do you remember Belén? You bet, we used to be neighbors!']::text[]),
  ('cd960d1e-20cf-550e-97c0-7a90123514be', '—¿La profesora está en clase? —No, en una reunión.', array['Is the professor in class? No, she''s in a meeting.']::text[]),
  ('ceee44b9-85cf-5239-b85b-4d9b5f5dbb09', '—¿Me prestás el auto? —Sí, si me lo devolvés entero.', array['Can I borrow the car? Yes, if you give it back in one piece.']::text[]),
  ('ceffabc9-42e4-579c-9e22-40233c6d2d79', '—¿Cómo salieron? —Empataron.', array['How''d it go? —They tied.']::text[]),
  ('cff1bb2d-4d07-5d4f-b5b8-decc830de026', '—¿Estás libre? —Sí, ¿por qué?', array['Are you free? Yeah, why?']::text[]),
  ('d5067ce5-a152-59a8-979e-a2bf624635eb', '—¿Querés un vaso de agua o un jugo? —Agua, gracias.', array['Would you like a glass of water or a juice? Water, thanks.']::text[]),
  ('d54a5e98-7d89-55e7-9c67-3bc0586ab065', '—¿La torta está lista? —Sí, y está caliente.', array['Is the cake ready? Yes, and it''s hot.']::text[]),
  ('d5dde2e5-5fe4-5f69-8343-6e24fd673d01', '—¿Vos sos uruguaya? —No, yo soy de Rosario.', array['You''re Uruguayan? No, I''m from Rosario.']::text[]),
  ('d632d191-6a3b-5b67-a730-54bb504ebcd5', '—¿Ravioles otra vez? —Es la costumbre.', array['Ravioli another time? It''s the custom.']::text[]),
  ('d6656fd9-982a-538c-92b0-074eb70c2723', '—Mucho gusto, soy Diego. —Igualmente, yo soy Mica.', array['Nice to meet you, I''m Diego. You too, I''m Mica.']::text[]),
  ('d7899949-c1ba-54c9-9c52-f25c981490bc', '—¿Le cuento? —No, cuanto menos sepa, mejor.', array['Should I tell her? No, the less she knows, the better.']::text[]),
  ('d8ab081b-1201-5410-9e5b-14ccd9338745', '—¿Cómo son los hijos de Juan? —Altos y rubios.', array['What are Juan''s kids like? Tall and blond.']::text[]),
  ('d9849cf4-9c34-5e87-93cd-9edf2836065e', '—¿Todo bien? —Sí, genial.', array['Everything OK? Yes, great.']::text[]),
  ('da92bdc7-d9a9-596c-af79-ca3a569c0cf6', '—Mucho gusto. —Igualmente.', array['Nice to meet you. You too.', 'Nice to meet you. Same here.']::text[]),
  ('dc136538-b79d-56d3-872e-6609058009c5', '—¿Me regás las plantas? —Dale, ¿cuándo te vas?', array['Can you water the plants for me? —OK, when do you leave?']::text[]),
  ('ddc7ba2d-5e7a-5506-858d-d397a23b7fc4', '—¿Podés cuidar al perro? —Sí, yo lo cuido.', array['Can you take care of the dog? Yeah, I''ll take care of him.']::text[]),
  ('de479b95-90c9-5b3c-b974-23b70a7b40df', '—¿Todo bien? —Más o menos.', array['Everything OK? So-so.']::text[]),
  ('df2b6855-2ea7-5f47-8e01-d24ffd16cf02', '—¿Pizza o sándwich? —Pizza, joya.', array['Pizza or sandwich? Pizza, great.']::text[]),
  ('e11ccdca-b84a-5d35-a66c-ec6f3193e400', '—¿Funciona el subte? —No, hoy hay paro.', array['Is the subway working? No, there''s a strike today.']::text[]),
  ('e162df54-41ef-51bc-b2b8-8a51f6e9432c', '—¿Dónde están las fotocopias? —En tu mochila.', array['Where are the copies? —In your backpack.']::text[]),
  ('e28498bc-4bda-5a13-ba1c-f85bf4cd0d8c', '—Perdón, ¿vos sos Sofi? —Sí, soy yo.', array['Excuse me, are you Sofi? Yes, it''s me.']::text[]),
  ('e2b0fc74-d1c2-5192-9a8a-73875015d217', '—¿Estás cansado? —En realidad, no.', array['Are you tired? Actually, I''m not.']::text[]),
  ('e39365ac-adcf-5c97-bf6b-49ae49cfff7c', '—¿Votaste a la presidenta? —Sí, obvio.', array['Did you vote for the president? Yeah, of course.']::text[]),
  ('e4478855-fa6a-5ee7-890f-c8294584c036', '—¿Otro té? —Sí, gracias.', array['More tea? Yes, thanks.']::text[]),
  ('e5834e24-ac98-517a-813f-6b6de1e8c117', '—¿Te contestó? —No, me clavó el visto.', array['Did she answer you? No, she left me on read.']::text[]),
  ('e850a400-7312-55d4-982b-783256ded07f', '—¿Y el gimnasio? —Me harté, ya no voy.', array['And the gym? I''d had enough, I don''t go anymore.']::text[]),
  ('ea85939b-b107-5522-88d1-48d8217a1cce', '—Yo soy alemán, ¿y vos? —Chileno.', array['I''m German, what about you? Chilean.']::text[]),
  ('eb35ac92-6140-5829-9991-651c2abfa315', '—¿Hace falta llevar efectivo? —Sí, conviene.', array['Do you need to bring cash? —Yes, you''d better.']::text[]),
  ('ec222e9b-92c8-5713-accb-66427de0015a', '—¿Te vas solo a Bariloche? —Sí, me la juego.', array['Are you going to Bariloche by yourself? —Yes, I''m taking the risk.']::text[]),
  ('ec566a8b-2816-562c-8ba6-a110adfc6239', '—¿Te gusta el barrio? —Sí, pero tiene sus cosas.', array['Do you like the neighborhood? Yeah, but it has its ups and downs.']::text[]),
  ('ec577631-99af-5770-bd93-a4e30ca08e54', '—¿Hay azúcar? —No, se nos acabó.', array['Do we have sugar? No, we''re out.']::text[]),
  ('ec8fab55-375c-5e18-8c27-03f018bc3f95', '—Me voy a Bariloche. —¿En serio?', array['I''m going to Bariloche. —Seriously?']::text[]),
  ('ed09f74c-a990-51e9-9059-155bbd1e3a81', '—¿Una pizza italiana? —Dale.', array['An Italian pizza? OK.']::text[]),
  ('ed3f21a1-a6fb-5da7-9b16-640b65732587', '—¿Te gusta el laburo nuevo? —Y, ponele.', array['Do you like your new job? Eh, sort of.', 'Do you like the new job? Well, I guess.']::text[]),
  ('ee8122ed-fecb-59da-86fc-2c5a7904f206', '—¿De dónde es Martín? —Es uruguayo.', array['Where is Martín from? He''s Uruguayan.']::text[]),
  ('ef7dd056-da5e-53d0-a7fe-b3e795ff48b2', '—¿Saco la basura? —No, no la saques, está lloviendo.', array['Should I take the trash out? No, don''t take it out, it''s raining.', 'Should I take out the trash? No, don''t, it''s raining.']::text[]),
  ('f0a631e6-2853-55db-9b98-52647e4da7de', '—¿En Córdoba hay humedad? —Menos que acá.', array['Is there humidity in Córdoba? Less than here.']::text[]),
  ('f1182a22-71f4-5b0a-ba3c-b26142967de0', '—¿Fideos con queso? —¡Dale!', array['Noodles with cheese? Sure!']::text[]),
  ('f2be2124-7eb2-5fe6-96ad-08a878cd1b7b', '—¿Te ayudo? —No, gracias.', array['Should I help you? —No, thanks.']::text[]),
  ('f43a404e-2331-5fc5-825e-6024f8910de6', '—¿Cómo querés el bife? —A punto.', array['How do you want your steak? Medium.']::text[]),
  ('f46060a9-af5b-5757-881f-5b26665810c2', '—¿Dormís la siesta? —A veces, los domingos.', array['Do you nap? —Sometimes, on Sundays.']::text[]),
  ('f497d8f0-5473-53f7-92d0-6c077c4e2389', '—¿Sos estudiante extranjera? —No, soy profe.', array['Are you an international student? No, I''m a teacher.']::text[]),
  ('f63ff974-61ae-5e45-aceb-25e3622483da', '—¿Y la nafta? —Vamos a medias, obvio.', array['And the gas? —We''ll go halves, of course.']::text[]),
  ('f79bc021-1b34-5b9e-9496-c6b8ae1e8041', '—¿Me bancás? —Obvio, te banco.', array['Have you got my back? Of course I''ve got yours.']::text[]),
  ('f7ba5953-ae2f-5eb5-9d81-f282bb1566e7', '—¿Sofi? —No, Lucía.', array['Sofi? No, it''s Lucía.']::text[]),
  ('f7e1418f-e8a9-5198-94b2-89ddaabfbd2d', '—¿Llevo al perro? —No, yo lo cuido.', array['Should I bring the dog? No, I''ll take care of him.']::text[]),
  ('fa1508ab-1e95-5253-8e09-9bd7be5caec0', '—No entiendo. —Yo tampoco.', array['I don''t get it. —Neither do I.']::text[]),
  ('fa6b8b04-22a7-56fe-9d47-458f39d9d7a3', '—¿Salimos esta noche? —No, tengo fiaca.', array['Should we go out tonight? No, I can''t be bothered.']::text[]),
  ('fab30add-1f3d-5f1e-bd28-264573b2c69e', '—¿Qué pasó? —Nada, el subte llegó muy tarde.', array['What happened? Nothing, the subway arrived very late.']::text[]),
  ('fb8900ef-76ac-594e-a780-05d6ac08d271', '—¿Cuántas medialunas? —Cuatro.', array['How many medialunas? Four.', 'How many croissants? Four.']::text[]),
  ('fbae0ca1-1462-576c-afce-f1114925af81', '—¿Qué hiciste? —Nada, me quedé helado.', array['What did you do? Nothing, I was stunned.']::text[]),
  ('fc3aa68d-9564-5f03-832a-605f588e1795', '—¿Quién es tu profesor de castellano? —Nico.', array['Who is your Spanish teacher? Nico.']::text[]),
  ('feaa89a1-6b9e-5bb4-82f9-7a8ddd94eae3', '—¿Un café? —Dale.', array['Coffee? OK.']::text[])
) as v (id, es, en_alt)
where s.id = v.id::uuid and s.es = v.es and s.en_alt = '{}';
