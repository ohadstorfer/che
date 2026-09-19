-- More teaching lessons where a unit was cramming.
--
-- A lesson runs 12-16 screens and a new word costs three of them (teach .
-- meaning . gap), so a teaching lesson holds three new words - FORMS_PER_LESSON
-- in scripts/course/lib/outline.mjs, which sizes every unit seeded from here on.
-- These units of section 1 were seeded at five a lesson and ran to twenty and
-- twenty-two screens. They get the lessons they were always short of.
--
-- The unit's last lesson was its check. It becomes an ordinary teaching lesson
-- and a new check goes at the end, so ids stay the ones the outline derives
-- (lesson:<unit-slug>:<ordinal>) and a learner's progress keeps pointing at a
-- lesson that still exists.
--
-- The new lessons are empty until `npm run course:lessons -- <unit>` fills them.

-- U1 un-cafe-por-favor: 9 words, 2 teaching lessons -> 3; check moves to 4
-- U2 hola-che: 13 words, 3 teaching lessons -> 5; check moves to 7
-- U7 argentino-argentina: 10 words, 2 teaching lessons -> 4; check moves to 5
-- U8 la-familia: 14 words, 3 teaching lessons -> 5; check moves to 6
-- U9 cuantos-anos-tenes: 27 words, 6 teaching lessons -> 9; check moves to 10

update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = '0bb58808-6701-5a0d-a899-a3a1599ecd32';
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = '24af986b-0337-576a-8bb3-c2a1fe5aa3e2';
update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = 'a9b91672-7367-541c-931e-9ba21713b6f1';
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = '6dbf11d4-2b0c-51ba-b555-336493e04597';
update public.lessons set kind = 'lesson', title_en = 'Lesson 7' where id = '0f852559-0e7f-534a-956f-1b78340a152c';

insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values
  ('0ec1cf53-1a89-5331-85d0-f4162b940579', '7acbb453-0fe4-550b-87a1-c81f0f7e4bd3', 4, 'Unit check', 'review', 'published'),
  ('4207cc6c-3a4e-556d-9f5d-6ef3f67be284', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 6, 'Lesson 6', 'lesson', 'published'),
  ('8d2ae763-bf21-59dc-9ee9-fb570cda6794', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', 7, 'Unit check', 'review', 'published'),
  ('0ef60964-bb17-510a-b311-2278794ffe9f', '70dda450-3825-5ea7-88fd-296775bc426c', 4, 'Lesson 4', 'lesson', 'published'),
  ('60b6bf7c-cc61-5fd2-bfc5-e22727512615', '70dda450-3825-5ea7-88fd-296775bc426c', 5, 'Unit check', 'review', 'published'),
  ('3b926d44-28a6-5ef9-b1e0-bccb0d0a9a4c', '9a649d54-c14a-56da-8701-c4783ad9a159', 5, 'Lesson 5', 'lesson', 'published'),
  ('e093cf35-6944-5744-9d3c-807b1f07fc06', '9a649d54-c14a-56da-8701-c4783ad9a159', 6, 'Unit check', 'review', 'published'),
  ('01c93554-f120-5230-b86b-2102ff21ece9', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', 8, 'Lesson 8', 'lesson', 'published'),
  ('c42eb6ec-4721-5df6-b1a5-de6f9abd762d', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', 9, 'Lesson 9', 'lesson', 'published'),
  ('44832339-25d8-5790-949b-4f8da07475d1', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', 10, 'Unit check', 'review', 'published')
on conflict do nothing;
