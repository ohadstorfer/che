-- "medialuna" stays in Spanish in the English (its gloss is the word itself,
-- and a note explains it), but its plural was glossed "croissants". The judge
-- marked "medialunas" in an English line as wrong and the writer marked
-- "croissants" as wrong the other way, so every sentence with the plural lost
-- one way or the other. The plural follows the singular.
update public.forms set gloss_en = 'medialunas' where form = 'medialunas' and gloss_en is distinct from 'medialunas';
