-- The seed publishes units up to course place 2 (build-seed.mjs PUBLISH_THROUGH),
-- and the doubling put the new otro-cafe there. It has no sentences yet: back to
-- draft until course:agent publishes it.
update public.lessons set status = 'draft' where unit_id = (select id from public.units where slug = 'otro-cafe');
update public.units set status = 'draft' where slug = 'otro-cafe';
