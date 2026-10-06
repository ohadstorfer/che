-- New words taken out again (docs/course/new-words.yaml says why): they never left draft.
update public.forms set status = 'retired' where status = 'draft' and lemma_id in ('1fdb8f27-1f07-545b-9322-4db1bb2e21ca', '6028290e-2862-5681-9a95-33ef16979c61', '0915b5dd-f5e4-5633-9c1b-2120531ca7a7', '67f7a478-fabc-5a1d-a870-bc8b44403416', '17768903-085e-5a45-865a-d80a3d843c50', 'e824c13a-b718-5de3-90fa-c3bc3c22b16d', '7725d89a-4402-5e47-8da7-c27e84698d1d');
update public.lemmas set status = 'retired' where status = 'draft' and id in ('1fdb8f27-1f07-545b-9322-4db1bb2e21ca', '6028290e-2862-5681-9a95-33ef16979c61', '0915b5dd-f5e4-5633-9c1b-2120531ca7a7', '67f7a478-fabc-5a1d-a870-bc8b44403416', '17768903-085e-5a45-865a-d80a3d843c50', 'e824c13a-b718-5de3-90fa-c3bc3c22b16d', '7725d89a-4402-5e47-8da7-c27e84698d1d');
-- Their sentences, kept as approved and never shown.
update public.sentences s set status = 'retired' where s.status = 'approved' and s.target_form_id in (select id from public.forms where lemma_id in ('1fdb8f27-1f07-545b-9322-4db1bb2e21ca', '6028290e-2862-5681-9a95-33ef16979c61', '0915b5dd-f5e4-5633-9c1b-2120531ca7a7', '67f7a478-fabc-5a1d-a870-bc8b44403416', '17768903-085e-5a45-865a-d80a3d843c50', 'e824c13a-b718-5de3-90fa-c3bc3c22b16d', '7725d89a-4402-5e47-8da7-c27e84698d1d'));

-- US English, as the rest of the course (20261005000016).
update public.lemmas set gloss_en = 'motorcycle' where status = 'draft' and id = 'f62bb10a-04e9-5f31-a173-92834ea7a4c5';
