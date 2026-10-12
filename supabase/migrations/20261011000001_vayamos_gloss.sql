-- "that we go" → "we go (that we go)", 2026-10-11.
-- `vayamos` was the one subjunctive glossed with a bare "that": every other is
-- "(that) we can" or "you go (that you go)", whose bracket the app turns into
-- the hint after “quiero que” (src/lib/answers.ts, senseOf). Bare, the prompt
-- printed "that we go" and marked "que vayamos" wrong. The grader now accepts
-- the "que" either way; this makes the prompt read like its siblings `vayas`
-- and `vaya`. Left alone if the gloss was edited since.
update public.forms set gloss_en = 'we go (that we go)'
  where id = '70fd014b-3598-561b-9a6c-4bd0db11c976' and gloss_en = 'that we go'; -- vayamos
