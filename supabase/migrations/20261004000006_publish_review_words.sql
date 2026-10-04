-- The words the content review added to units that are already live (seeded as drafts) go live with their units.
update public.lemmas l set status = 'published' where l.status = 'draft'
  and exists (select 1 from public.forms f join public.units u on u.id = f.unit_id where f.lemma_id = l.id and u.status = 'published');
update public.forms f set status = 'published' from public.units u where u.id = f.unit_id and u.status = 'published' and f.status = 'draft';
