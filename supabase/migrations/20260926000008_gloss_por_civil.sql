-- "por civil" in US English: a civil wedding is at city hall, not a registry office.
update public.lemmas set gloss_en = 'in a civil ceremony, at city hall' where lemma = 'por civil' and gloss_en = 'at the registry office';
