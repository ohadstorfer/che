-- Learner report, 2026-10-06.
-- "No, de nada, todo bien." is asked for from "You're welcome, it's all good."
-- The opening "No," is how a porteño waves thanks away, and the English has
-- nothing for it (20261003000007 took "No, you're welcome" out of the prompt as
-- not English, and nothing made the "No" optional in its place). So a learner
-- who built "De nada, todo bien." — a right answer to that prompt — was marked
-- wrong. The sentence keeps its Spanish, so she still reads and hears the
-- "No,"; the answer without it is accepted, in both orders the sentence
-- already allowed. A sentence edited since (its text no longer matches) is
-- left alone.
update public.sentences set
  es_alt = array['No, todo bien, de nada.', 'De nada, todo bien.', 'Todo bien, de nada.']::text[]
where id = 'c257800c-a57b-5466-ad35-3a60d4702d51'
  and es = 'No, de nada, todo bien.'
  and en = 'You''re welcome, it''s all good.';
