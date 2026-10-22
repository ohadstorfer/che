-- Two tester notes, 2026-10-22 (owner's call):
-- 1. "una masa" is not said: the slang word comes out of la-familia, with its
--    three sentences, and the one sentence in cuantos-anos-tenes that used it.
--    "años" keeps 10 other sentences there.
-- 2. "¿Gata? No, es un gato." ("A girl cat? No, it's a boy.") sounds wrong in
--    both languages; so does its neighbour "Mi gata es genial, pero mi gato no."
--    ("My female cat…"). Both go; "gata" keeps 3 sentences in mi-mujer-y-mi-suegra.
-- Lessons of the three units are rebuilt after this (npm run course:lessons).

update public.forms set status = 'retired', updated_at = now()
  where id = '5bfa6e93-54e7-59e2-ad9c-f15124c4df0a' and status = 'published'; -- una masa
update public.lemmas set status = 'retired', updated_at = now()
  where id = 'a9cdccf7-0302-561a-b2d7-87f554f2cf84' and status = 'published'; -- una masa

update public.sentences set status = 'retired', updated_at = now() where status = 'published' and id in (
  'dadd4d92-239a-560e-bf54-f90da4eaf6cc', -- ¡Sos una masa!
  '27714fd1-1ed7-5e67-a57b-49ea2483bd9d', -- Mi abuela es una masa.
  '403228c2-0919-5b24-a3ad-3d1ad5ccf6b7', -- —¿Quién es Fede? —Mi hermano, es una masa.
  '983708c4-88ee-5ccf-8066-402b2f7ef794', -- Mi gata tiene tres años y es una masa.
  '624129ca-865c-541f-ac16-ebe635232f81', -- ¿Gata? No, es un gato.
  '3e604e84-3181-5a02-b217-dc2fa56114fd'  -- Mi gata es genial, pero mi gato no.
);

delete from public.lesson_slots
  where form_id = '5bfa6e93-54e7-59e2-ad9c-f15124c4df0a'
     or sentence_id in (select id from public.sentences where status = 'retired');
