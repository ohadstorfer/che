-- Units 11-30 were seeded at the old five-a-lesson sizing, before FORMS_PER_LESSON
-- dropped to three (20260918000014 did the same for section 1). Each unit's
-- last lesson — its check — becomes a teaching lesson and a new check goes at
-- the end, so ids stay the ones the outline derives (lesson:<unit-slug>:<ordinal>).
-- Some of those ids belong to lessons retired earlier and parked at ordinal
-- 20001+; they come back rather than being skipped.
--
-- The new lessons are empty until `npm run course:lessons -- <unit>` fills them;
-- for units still in draft, `course:agent -- publish` does that.
--
-- U11 la-gente: 9 words, 2 teaching lessons -> 3; check moves to 4
-- U12 donde-esta: 7 words, 2 teaching lessons -> 3; check moves to 4
-- U13 hay-un-kiosco: 9 words, 2 teaching lessons -> 3; check moves to 4
-- U14 como-estas: 28 words, 6 teaching lessons -> 10; check moves to 11
-- U15 que-haces: 37 words, 8 teaching lessons -> 13; check moves to 14
-- U16 mate-y-facturas: 12 words, 3 teaching lessons -> 4; check moves to 5
-- U17 me-traes-un-cafe: 10 words, 2 teaching lessons -> 4; check moves to 5
-- U18 facu-y-laburo: 27 words, 6 teaching lessons -> 9; check moves to 10
-- U19 comes-vivis: 27 words, 6 teaching lessons -> 9; check moves to 10
-- U20 mi-casa: checkpoint unit, left as it is
-- U21 la-hora: 34 words, 7 teaching lessons -> 12; check moves to 13
-- U22 el-barrio: 16 words, 4 teaching lessons -> 6; check moves to 7
-- U23 queres-podes-vas: 23 words, 5 teaching lessons -> 8; check moves to 9
-- U24 dale-veni: 14 words, 3 teaching lessons -> 5; check moves to 6
-- U25 ropa-y-colores: 46 words, 10 teaching lessons -> 16; check moves to 17
-- U26 cuanto-sale: 30 words, 6 teaching lessons -> 10; check moves to 11
-- U27 la-rutina: 22 words, 5 teaching lessons -> 8; check moves to 9
-- U28 que-te-gusta-hacer: 23 words, 5 teaching lessons -> 8; check moves to 9
-- U29 clima: 15 words, 3 teaching lessons -> 5; check moves to 6
-- U30 ahora-y-planes: checkpoint unit, left as it is

update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = '71948571-23f6-5e0c-9958-958283692393';
update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = '25d422a3-20db-5465-adde-b34866003d4e';
update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = '5057564e-d895-55f1-830b-d80bee63259f';
update public.lessons set kind = 'lesson', title_en = 'Lesson 7' where id = 'a9cd7dc8-1c59-57fc-b4f5-e046ea1bd3f9';
update public.lessons set kind = 'lesson', title_en = 'Lesson 9' where id = '174d2b12-c281-5388-b8e5-6cd3b13c4c3f';
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = '578be95e-5c6f-59a2-886b-51247d8b4cde';
update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = 'd86653e5-3a0c-5ee2-8a88-0808e9f0af06';
update public.lessons set kind = 'lesson', title_en = 'Lesson 7' where id = 'c770a175-bf15-5e18-b461-5cc4f2e7b3b6';
update public.lessons set kind = 'lesson', title_en = 'Lesson 7' where id = '0b922fda-a1d3-5d94-bf9a-71a9d754ca6c';
update public.lessons set kind = 'lesson', title_en = 'Lesson 8' where id = 'af850c3a-1fc7-5f46-a1ca-12fc29a272e6';
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = '20666985-0b1f-5112-b7f5-2d0cc6b8d22a';
update public.lessons set kind = 'lesson', title_en = 'Lesson 6' where id = 'a9d69f19-f2fa-5ee3-bb0d-78f51a34faa6';
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = 'b01cabd4-0548-5883-bdcd-16483d679bc7';
update public.lessons set kind = 'lesson', title_en = 'Lesson 11' where id = '3ee76fe5-5057-5ded-9b7a-ea63188e88d6';
update public.lessons set kind = 'lesson', title_en = 'Lesson 7' where id = '9e1c1bab-bdb2-5c1f-90db-8de1eb6be436';
update public.lessons set kind = 'lesson', title_en = 'Lesson 6' where id = '5973b32f-aeae-5b95-bf9c-c28cd854ac36';
update public.lessons set kind = 'lesson', title_en = 'Lesson 6' where id = '3551bb9d-d055-57e2-bc60-819a753e0324';
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = '512ee9b9-120c-58aa-a8ce-c18258674eeb';

insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values
  ('aa45383c-f04e-511e-90a7-9a8acbf24fd3', '3cc8b1a1-6314-5a4f-be82-b713ea584203', 4, 'Unit check', 'review', 'published'),
  ('b6e5d03d-d173-56b7-b358-c1b49aa1004e', '71481540-7f7c-5939-9d96-ee76d80128b9', 4, 'Unit check', 'review', 'draft'),
  ('18fa4804-c923-5ae9-bd4e-b9e66060e0d1', 'e4dc651e-4fd9-5ba8-8e83-1c8a4131e09e', 4, 'Unit check', 'review', 'draft'),
  ('4fa494c3-66d8-5859-a25e-d961e5ec9b0b', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 8, 'Lesson 8', 'lesson', 'draft'),
  ('ce7cd9bb-a60f-5e5a-abd1-7dde36b30844', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 9, 'Lesson 9', 'lesson', 'draft'),
  ('ed8bd52e-b680-5ef9-acf7-86c11ff8412f', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 10, 'Lesson 10', 'lesson', 'draft'),
  ('59a0852c-5906-55fd-8db3-f5cb877b72f1', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 11, 'Unit check', 'review', 'draft'),
  ('de4b51d2-b543-5f7a-a513-b94779063e49', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 10, 'Lesson 10', 'lesson', 'draft'),
  ('195af764-f442-531d-8f02-0eaaeac8a7d0', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 11, 'Lesson 11', 'lesson', 'draft'),
  ('4246665d-44a9-52c1-ae38-045a429c97c8', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 12, 'Lesson 12', 'lesson', 'draft'),
  ('7ac090ed-67f9-5f51-b119-eec7b1159117', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 13, 'Lesson 13', 'lesson', 'draft'),
  ('d4138fbf-e466-5329-b5a8-9bd30821b753', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 14, 'Unit check', 'review', 'draft'),
  ('2abf4016-73bc-59c7-8c14-4463a07ce10d', 'b95d926c-3168-53bd-88bd-c02c868d1119', 5, 'Unit check', 'review', 'draft'),
  ('b58de8d3-03ba-5cbf-b6d6-a8d3a2756b45', 'a2eec2e1-5a4c-5372-a1e8-7ac3076576e6', 4, 'Lesson 4', 'lesson', 'draft'),
  ('659c24de-3649-548c-8ade-3a8175db79c8', 'a2eec2e1-5a4c-5372-a1e8-7ac3076576e6', 5, 'Unit check', 'review', 'draft'),
  ('79ff741a-bc70-512a-84af-598cf24f4b78', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', 8, 'Lesson 8', 'lesson', 'draft'),
  ('a4a6597e-2f02-516a-90ac-fdeb93fbb959', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', 9, 'Lesson 9', 'lesson', 'draft'),
  ('d135c5ff-7b9d-57e1-8c6c-f306e6593806', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', 10, 'Unit check', 'review', 'draft'),
  ('55aeb256-af0e-5333-98fb-d5db5f356bc3', '1974689a-177e-55c9-b4b1-69fba40389f0', 8, 'Lesson 8', 'lesson', 'draft'),
  ('20ef2620-c3c2-55c1-bd53-f4804ff75258', '1974689a-177e-55c9-b4b1-69fba40389f0', 9, 'Lesson 9', 'lesson', 'draft'),
  ('e1009dd1-56f2-5cb2-b4ce-d444ec46a084', '1974689a-177e-55c9-b4b1-69fba40389f0', 10, 'Unit check', 'review', 'draft'),
  ('4121cb79-54a2-5b79-949a-b307bcd5a17c', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 9, 'Lesson 9', 'lesson', 'draft'),
  ('c65dc784-d0f9-585e-a18a-65a6ba5d407f', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 10, 'Lesson 10', 'lesson', 'draft'),
  ('a278b06d-c4a1-5bba-8319-15d092cf0677', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 11, 'Lesson 11', 'lesson', 'draft'),
  ('3e93bcd3-d16b-5d6a-a3ec-e0375e7db8b9', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 12, 'Lesson 12', 'lesson', 'draft'),
  ('9d3ccd66-94c7-56bb-8c1c-d14056209c7e', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 13, 'Unit check', 'review', 'draft'),
  ('52c5e0fb-aa68-583a-a5e7-b532263cc79d', 'be613042-6935-5185-bf3a-fa4dc33eca15', 6, 'Lesson 6', 'lesson', 'draft'),
  ('7c037b2f-6e88-54f3-bece-b6063f3e65a3', 'be613042-6935-5185-bf3a-fa4dc33eca15', 7, 'Unit check', 'review', 'draft'),
  ('b2e8a93c-0a9d-5bd5-b9c6-83b74153a32a', '740b6205-cb92-54dc-806f-96cc347f8ee0', 7, 'Lesson 7', 'lesson', 'draft'),
  ('3b26196b-2fc1-5e31-8286-4f05d1fe4a47', '740b6205-cb92-54dc-806f-96cc347f8ee0', 8, 'Lesson 8', 'lesson', 'draft'),
  ('0ff701e7-0c83-5cba-9d39-79e8674f0010', '740b6205-cb92-54dc-806f-96cc347f8ee0', 9, 'Unit check', 'review', 'draft'),
  ('cda348a9-2203-56eb-8d94-327a6479089a', '3376ea65-8afe-56be-bae8-b5d06b46c9cd', 5, 'Lesson 5', 'lesson', 'draft'),
  ('195317e8-cf55-5288-a0a4-eee4ecc36903', '3376ea65-8afe-56be-bae8-b5d06b46c9cd', 6, 'Unit check', 'review', 'draft'),
  ('3db0e643-1b26-56ce-ab35-8a49c617ea48', '13fec277-30b8-5bdb-9718-e682351abfd9', 12, 'Lesson 12', 'lesson', 'draft'),
  ('d55ce1be-cc34-566d-9bdf-fd461cbcfe36', '13fec277-30b8-5bdb-9718-e682351abfd9', 13, 'Lesson 13', 'lesson', 'draft'),
  ('9269c577-d402-5798-95af-5625d61dea60', '13fec277-30b8-5bdb-9718-e682351abfd9', 14, 'Lesson 14', 'lesson', 'draft'),
  ('9030dd0b-7019-5a66-b13c-594cd1a33b03', '13fec277-30b8-5bdb-9718-e682351abfd9', 15, 'Lesson 15', 'lesson', 'draft'),
  ('cfde5a5e-e37e-52ad-b9bd-8af13f573b1f', '13fec277-30b8-5bdb-9718-e682351abfd9', 16, 'Lesson 16', 'lesson', 'draft'),
  ('50db6e14-093a-589a-b157-7c3567ae160c', '13fec277-30b8-5bdb-9718-e682351abfd9', 17, 'Unit check', 'review', 'draft'),
  ('83b7484e-328d-5a9e-91a6-bf83baa60808', 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', 8, 'Lesson 8', 'lesson', 'draft'),
  ('3f7a0545-14ef-5bfc-b19d-ad063672686a', 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', 9, 'Lesson 9', 'lesson', 'draft'),
  ('56c03c6d-a47f-5301-b6c3-8910288838d7', 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', 10, 'Lesson 10', 'lesson', 'draft'),
  ('3ad01aff-2573-5b9a-b619-d0c0018b40f9', 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', 11, 'Unit check', 'review', 'draft'),
  ('4b8c3463-ac71-5234-8e59-8f9b7ed801e4', '441e2e5b-f704-511a-9e55-ef9613425ce8', 7, 'Lesson 7', 'lesson', 'draft'),
  ('a7dd8480-5763-54b2-adba-01e178023d57', '441e2e5b-f704-511a-9e55-ef9613425ce8', 8, 'Lesson 8', 'lesson', 'draft'),
  ('75048472-0e09-55b7-b0ed-ec68b7f87e81', '441e2e5b-f704-511a-9e55-ef9613425ce8', 9, 'Unit check', 'review', 'draft'),
  ('8311260e-0332-5b07-9f73-0633db5e72c4', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', 7, 'Lesson 7', 'lesson', 'draft'),
  ('170cafce-4d44-5436-9f82-a7cdd1fcad8c', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', 8, 'Lesson 8', 'lesson', 'draft'),
  ('1d5c1191-7fc0-531f-9fbd-dfd9617750fb', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', 9, 'Unit check', 'review', 'draft'),
  ('d91dfd4d-c2bb-5e90-a520-5583d0090c3a', '2c5ceb94-a924-5797-9279-29476c698177', 5, 'Lesson 5', 'lesson', 'draft'),
  ('1acc966f-208d-5c61-aa54-8bbbfaacabd1', '2c5ceb94-a924-5797-9279-29476c698177', 6, 'Unit check', 'review', 'draft')
on conflict (id) do update set ordinal = excluded.ordinal, title_en = excluded.title_en, kind = excluded.kind, status = excluded.status;
