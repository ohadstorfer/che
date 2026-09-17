-- A typed answer can now be right with a fourth note: `synonym`. The prompt
-- shows one meaning of the word being drilled ("well"), and another word that
-- means the same (`bueno` for `bien`) answers it as truly — so it is accepted,
-- with a note naming the word the exercise was after (src/lib/answers.ts,
-- gradeTyped). The note is logged like the others, so how often it happens can
-- be read back.

alter table public.review_logs drop constraint if exists review_logs_note_check;
alter table public.review_logs
  add constraint review_logs_note_check check (note in ('accent', 'typo', 'enye', 'synonym'));
