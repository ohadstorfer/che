-- Word meaning review, round 4 (2026-10-03): "Yo laburo; …" is the verb, so its
-- token drops the link to the noun laburo (job) that round 2 left in place.
update public.sentences s
set tokens = (
  select jsonb_agg(case when t->>'surface' ~* '^laburo' then jsonb_set(t, '{form_ids}', (t->'form_ids') - '788fa25e-b7d2-5b60-abca-3c3bcb31458f') else t end order by ord)
  from jsonb_array_elements(s.tokens) with ordinality x(t, ord))
where id in ('1dd5e1b0-935c-533c-9d29-9c6c0ed5565a', '9456c8a4-1dad-5f58-ae23-72fc4189ad5d');
