-- Hints a learner can read, 2026-10-10.
-- A gloss's brackets are no longer printed with the meaning: what they said
-- shows as a small hint, and only when another word would otherwise read the
-- same (src/lib/answers.ts, splitSense). Most brackets already read well that
-- way ("a story", "plural"). These eight were written for a dictionary line
-- and read badly on their own — "(noun) work" came out as "work · noun". Only
-- the bracket changes; the meaning is the same. A gloss edited since (its text
-- no longer matches) is left alone.
update public.forms set gloss_en = 'I work; work (the job), job'
  where id = '1a16f931-a217-5a7e-9949-c501f2a399b4' and gloss_en = 'I work; (noun) work, job'; -- laburo
update public.forms set gloss_en = 'I work; job, work (the job)'
  where id = '81c85f2f-1730-5868-8508-cda305d7e976' and gloss_en = 'I work; (noun) job, work'; -- trabajo
update public.forms set gloss_en = 'you would be (place or state)'
  where id = '91487a14-aef2-5b4c-8590-471ca12516c5' and gloss_en = 'you would be (somewhere, some way)'; -- estarías
update public.forms set gloss_en = 'you''d have (polite question)'
  where id = '896d756f-a78e-5bc7-b295-be48c7e051fe' and gloss_en = 'you''d have (polite ¿no tendrás…?)'; -- tendrás
update public.forms set gloss_en = 'you''d know (polite question)'
  where id = '1a53263d-410d-524e-b479-575649a053fc' and gloss_en = 'you''d know (polite ¿no sabrás…?)'; -- sabrás
update public.lemmas set gloss_en = 'great (person or thing)'
  where id = (select lemma_id from public.forms where id = '5bfa6e93-54e7-59e2-ad9c-f15124c4df0a')
    and gloss_en = 'great (a great person or thing)'; -- una masa
update public.lemmas set gloss_en = 'I love you (friends and family too)'
  where id = (select lemma_id from public.forms where id = '20dd7838-85c1-5592-965f-58ed350a3433')
    and gloss_en = 'I love you (also said to friends and relatives)'; -- te quiero
update public.lemmas set gloss_en = 'first (floor or place)'
  where id = (select lemma_id from public.forms where id = 'b684bc3b-e569-5629-a514-6c96b18bfd64')
    and gloss_en = 'first (floor, place in a row)'; -- primero (adj)
