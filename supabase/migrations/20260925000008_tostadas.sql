-- Toast is ordered in the plural in Buenos Aires (café con tostadas): otro-cafe teaches tostadas too.
insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, status)
select 'c2d5a465-c03a-51a3-b24e-26b577623136', '2ff4d67d-4ee4-5c6d-a825-c1559ce7296c', 'tostadas', '{"gender":"f","number":"pl"}'::jsonb, 'toast', 'ordered in the plural: café con tostadas', 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', coalesce((select max(position) from public.forms where unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128'), 0) + 1, false, 'draft'
where not exists (select 1 from public.forms where id = 'c2d5a465-c03a-51a3-b24e-26b577623136');
