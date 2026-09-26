-- Words added to units that were already published (the basic words moved earlier) were seeded as drafts, and nothing
-- published them, so learners never saw them (estar, ver, saber, decir, pagar, así, vez, además…). Publish them as
-- publishing their unit would have.
update public.lemmas set status = 'published'
  where status = 'draft'
    and id in (select f.lemma_id from public.forms f join public.units u on u.id = f.unit_id where u.status = 'published' and f.status <> 'retired');
update public.forms f set status = 'published'
  from public.units u
  where u.id = f.unit_id and u.status = 'published' and f.status = 'draft';
