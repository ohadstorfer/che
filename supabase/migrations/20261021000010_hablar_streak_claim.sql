-- A chat credits the streak once (functions/hablar-end): the call that stamps
-- this first is the one that runs finish_lesson, so a second end() sent while
-- the first is still grading (a dropped connection) doesn't credit it again.
alter table public.conversations
  add column if not exists streak_claimed_at timestamptz;
