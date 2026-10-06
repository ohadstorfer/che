-- "hombre" comes out of section 1 again (docs/course/new-words.yaml says why): it never left draft.
update public.forms set status = 'retired' where status = 'draft' and lemma_id = '3a4e3274-177a-5629-9722-609373d23f07';
update public.lemmas set status = 'retired' where status = 'draft' and id = '3a4e3274-177a-5629-9722-609373d23f07';

-- A sentence kept as approved that uses a word since taken out is taken out with it.
update public.sentences s set status = 'retired'
where s.status = 'approved' and exists (
  select 1 from jsonb_array_elements(s.tokens) t, jsonb_array_elements_text(coalesce(t->'form_ids', '[]'::jsonb)) fid
  join public.forms f on f.id = fid::uuid
  where f.status = 'retired');
