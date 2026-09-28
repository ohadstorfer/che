-- Section 12: the words that replace usted in units 282 (usted) and 283
-- (como-no-dona-rosa). From course:seed, lesson rows left out (unrelated drafts).

insert into public.lemmas (id, lemma, pos, gloss_en, gloss_note_en, register, is_glue, notes_en, status) values
  ('6b742e9e-4d55-5cb6-90b4-8732ab27150f', 'molestia', 'noun', 'bother, trouble', null, 'neutral', false, null, 'draft'),
  ('e405ba8a-e633-5da2-89c7-1fb60a043feb', 'muy amable', 'phrase', 'very kind of you', null, 'neutral', false, null, 'draft'),
  ('7e89125c-69af-5ad5-b775-094cf59cdf39', 'faltaba más', 'phrase', 'don''t mention it, of course', null, 'neutral', false, null, 'draft'),
  ('b2d9b608-3887-515d-a5cf-63d8ee20a68f', 'no es nada', 'phrase', 'it''s nothing', null, 'neutral', false, null, 'draft'),
  ('b605dc66-3b43-56ca-be7a-5c7b1f4ba0fe', 'dar una mano', 'phrase', 'to give a hand', null, 'neutral', false, null, 'draft'),
  ('9a83a052-7020-53c5-b19e-54595a5b946a', 'querido', 'noun', 'dear (as a form of address)', null, 'neutral', false, null, 'draft')
on conflict do nothing;

insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, audio_path, voice_id, status) values
  ('c2da3c66-e4dc-525e-a6bc-51a4b0685600', '36ac1f46-596e-5489-a83d-ad16d8640bc0', 'disculpame', '{"person":2,"number":"sg","mood":"imp","voseo":true,"clitic":true}'::jsonb, 'excuse me, sorry', null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 2, false, null, null, 'draft'),
  ('cb118049-3f64-5a75-b9b5-30bea82f4c0e', '7b74d01a-12bc-5a79-ac85-c1dd98d36bb2', 'moleste', '{"person":1,"number":"sg","tense":"pres","mood":"subj"}'::jsonb, '(that) I bother', null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 3, false, null, null, 'draft'),
  ('486d82e6-9ecb-5da2-bfd3-28e9a4895b5f', '6b742e9e-4d55-5cb6-90b4-8732ab27150f', 'molestia', '{}'::jsonb, null, null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 4, false, null, null, 'draft'),
  ('896d756f-a78e-5bc7-b295-be48c7e051fe', '1d52b7a7-a8b5-5d03-8874-200849c89160', 'tendrás', '{"person":2,"number":"sg","tense":"fut","mood":"ind","voseo":true,"irregular":true}'::jsonb, 'you''d have (polite ¿no tendrás…?)', null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 5, false, null, null, 'draft'),
  ('1a53263d-410d-524e-b479-575649a053fc', 'a4f93c5c-f70d-5d66-a7f2-ab38c0e26c15', 'sabrás', '{"person":2,"number":"sg","tense":"fut","mood":"ind","voseo":true,"irregular":true}'::jsonb, 'you''d know (polite ¿no sabrás…?)', null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 6, false, null, null, 'draft'),
  ('3e153cd8-f7ea-5bbb-8e29-933b59a1cd4e', 'e405ba8a-e633-5da2-89c7-1fb60a043feb', 'muy amable', '{}'::jsonb, null, null, 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 7, false, null, null, 'draft'),
  ('1397e62a-eb61-5724-be04-a1aeaf41df1b', '7e89125c-69af-5ad5-b775-094cf59cdf39', 'faltaba más', '{}'::jsonb, null, null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 10, false, null, null, 'draft'),
  ('52fdef03-4de8-52ce-a9f1-6712349615c3', 'b2d9b608-3887-515d-a5cf-63d8ee20a68f', 'no es nada', '{}'::jsonb, null, null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 11, false, null, null, 'draft'),
  ('9da1a249-23b1-567a-a02f-b6025753cdb3', 'b605dc66-3b43-56ca-be7a-5c7b1f4ba0fe', 'te doy una mano', '{"person":1,"number":"sg","tense":"pres","mood":"ind"}'::jsonb, 'I''ll give you a hand', null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 12, false, null, null, 'draft'),
  ('94d048db-ee6e-52d8-9f9d-436413017202', '7c941511-4dd1-51d0-841f-7c2412273053', 'dejá', '{"person":2,"number":"sg","mood":"imp","voseo":true}'::jsonb, 'leave it, let me', null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 13, false, null, null, 'draft'),
  ('f5e0ffa3-f737-5e55-a7a3-fea60a8f830c', '9a83a052-7020-53c5-b19e-54595a5b946a', 'querido', '{"gender":"m","number":"sg"}'::jsonb, null, null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 14, false, null, null, 'draft'),
  ('30174983-0acd-504f-96c8-3d89f000572e', '9a83a052-7020-53c5-b19e-54595a5b946a', 'querida', '{"gender":"f","number":"sg"}'::jsonb, null, null, 'e46f81c7-cdca-5d51-8738-55a0efa5a020', 15, false, null, null, 'draft')
on conflict do nothing;




