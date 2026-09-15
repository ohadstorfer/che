-- ---------------------------------------------------------------------------
-- Accepted Spanish answers.
--
-- A sentence is rebuilt from its English, and English underdetermines Spanish:
-- "Are you Juan?" is "¿Vos sos Juan?" and just as much "¿Sos Juan?". `es_alt`
-- holds the other answers the app accepts — the author's, plus the ones the
-- content build generates (dropped or added subject pronouns, an optional
-- "che", the other gender where the English doesn't say). A reviewer edits the
-- list like any other field of the sentence.
--
-- The next migration re-seeds section 1 with the lists filled in.
-- ---------------------------------------------------------------------------

alter table public.sentences
  add column es_alt text[] not null default '{}';

comment on column public.sentences.es_alt is
  'Other Spanish answers accepted when the sentence is built from its English. Not used when it is transcribed from audio.';
