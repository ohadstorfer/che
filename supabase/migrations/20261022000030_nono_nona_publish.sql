-- The words added as drafts from nono.yaml go live (scripts/course/add-words.mjs --publish).
update public.lemmas set status = 'published' where status = 'draft' and id in ('326dc173-1b3a-5187-bc56-b8fa427d0dcc');
update public.forms set status = 'published' where status = 'draft' and id in ('acecf461-d4cf-56bd-bacf-129fd5c4c605', 'd07a0965-8604-5920-9359-b51ed635e0c7');
-- Their sentences were kept as approved until the words were live (course:topup-publish --approved).
update public.sentences set status = 'published' where status = 'approved' and unit_id in ('9a649d54-c14a-56da-8701-c4783ad9a159');
