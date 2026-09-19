-- Four of the lessons 20260918000014 meant to add already existed, retired.
--
-- A lesson's id is derived from its unit and its ordinal (lesson:<slug>:<n>),
-- so the rows the admin retired at ordinals 20001/20002 were holding exactly
-- the ids the migration generated, and its `on conflict do nothing` skipped
-- them in silence. U1 and U7 came out of it with no unit check at all, and U8
-- with a gap where its fifth lesson should be.
--
-- These are the same four rows, brought back at the place they belong. Their
-- slots go with them: they are the ones the old planner left there, and
-- `npm run course:lessons` writes the new ones.

update public.lessons set ordinal = 4, title_en = 'Unit check', kind = 'review', status = 'published'
  where id = '0ec1cf53-1a89-5331-85d0-f4162b940579'; -- un-cafe-por-favor
update public.lessons set ordinal = 4, title_en = 'Lesson 4', kind = 'lesson', status = 'published'
  where id = '0ef60964-bb17-510a-b311-2278794ffe9f'; -- argentino-argentina
update public.lessons set ordinal = 5, title_en = 'Unit check', kind = 'review', status = 'published'
  where id = '60b6bf7c-cc61-5fd2-bfc5-e22727512615'; -- argentino-argentina
update public.lessons set ordinal = 5, title_en = 'Lesson 5', kind = 'lesson', status = 'published'
  where id = '3b926d44-28a6-5ef9-b1e0-bccb0d0a9a4c'; -- la-familia

delete from public.lesson_slots where lesson_id in (
  '0ec1cf53-1a89-5331-85d0-f4162b940579',
  '0ef60964-bb17-510a-b311-2278794ffe9f',
  '60b6bf7c-cc61-5fd2-bfc5-e22727512615',
  '3b926d44-28a6-5ef9-b1e0-bccb0d0a9a4c'
);
