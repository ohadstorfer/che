-- Words and sentences edited in the admin (docs/superplan-admin-palabras.md §6).
--
-- The database is now the only source of truth for the vocabulary: the admin
-- edits it in place, the pipeline scripts read it, and the YAML outline only
-- adds new units. What that needs:
--
-- * Why a sentence is kept from learners. An edit that leaves a sentence
--   invalid (a word not taught yet, tuteo, the English no longer asking for a
--   word…) still saves; the sentence goes back to draft with the reasons, in
--   plain words, and goes live again once an edit clears them.
-- * Where a word came from: the outline or the admin.
-- * The order a unit teaches its words in. It lived in the YAML; lessons are
--   built in this order.
-- * One undo for one operation. Fixing a spelling rewrites every sentence that
--   uses the word; all those revisions share a batch, and undoing the batch
--   undoes them together.

alter table public.sentences
  add column if not exists problems text[] not null default '{}';
comment on column public.sentences.problems is
  'Why the sentence is kept from learners, in plain words. Paused = status draft with problems. Empty when it passes every check.';

alter table public.lemmas
  add column if not exists source text not null default 'outline' check (source in ('outline', 'dashboard'));
alter table public.forms
  add column if not exists source text not null default 'outline' check (source in ('outline', 'dashboard'));

alter table public.forms
  add column if not exists position smallint not null default 0;
comment on column public.forms.position is
  'Its place among the words its unit teaches (1-based): the order lessons take them in.';

alter table public.content_revisions
  add column if not exists batch_id uuid;
create index if not exists content_revisions_batch_idx on public.content_revisions (batch_id) where batch_id is not null;
