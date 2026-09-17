-- More than one right answer for a word typed on its own.
--
-- The rules cover what follows from the grammar (src/lib/answers.ts): a verb
-- with its subject pronoun ("yo soy"), a noun with its article ("una
-- medialuna"), the other gender, another course word with the same meaning.
-- What doesn't follow from the grammar has to be listed: "buenas" for "hi". Those are drafted by a model (`course:answers`),
-- checked against the same denylists as the content, and stored here, where a
-- reviewer sees and retires exactly what the app accepts.
--
-- An answer belongs to one meaning, not to the word: the meaning a prompt shows
-- comes from the word's sentences (src/lib/meanings.ts), and `joya` answers
-- "fine" but not "well". `meaning` is the English as a prompt shows it;
-- compared without case.
--
-- `forms.alt` stays what it was: other spellings of the word itself.

create table public.form_answers (
  id         uuid primary key default gen_random_uuid(),
  form_id    uuid not null references public.forms on delete cascade,
  meaning    text not null,
  answer     text not null,
  source     text not null default 'generated' check (source in ('generated', 'report', 'staff')),
  status     public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index form_answers_key on public.form_answers (form_id, lower(meaning), lower(answer));

create trigger form_answers_set_updated_at before update on public.form_answers
  for each row execute function public.set_updated_at();

comment on table public.form_answers is
  'Other answers accepted when a form is typed for one of its meanings ("buenas" for hola, "hi"). Retired, never deleted.';

alter table public.form_answers enable row level security;

create policy "form_answers: read published" on public.form_answers for select to authenticated
  using (status = 'published' or public.is_staff());
create policy "form_answers: staff insert" on public.form_answers for insert to authenticated
  with check (public.is_staff());
create policy "form_answers: staff update" on public.form_answers for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
