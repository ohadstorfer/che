-- Medialunas stay "medialunas" in the English, as in the other 105 sentences
-- and the word's own gloss; 13 said "croissants". The old English stays
-- accepted: a learner who writes "croissants" is not wrong.
update public.sentences set
  en_alt = case when en = any(coalesce(en_alt, '{}')) then en_alt else coalesce(en_alt, '{}') || en end,
  en = regexp_replace(regexp_replace(en, 'croissant', 'medialuna', 'g'), 'Croissant', 'Medialuna', 'g'),
  tokens = regexp_replace(regexp_replace(tokens::text, 'croissant', 'medialuna', 'g'), 'Croissant', 'Medialuna', 'g')::jsonb
where status <> 'retired' and en ilike '%croissant%';
