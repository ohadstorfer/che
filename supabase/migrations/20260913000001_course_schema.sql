-- ---------------------------------------------------------------------------
-- Course schema — docs/course-spec.md §2.
--
-- Purely additive. The app deployed from `main` keeps using `profiles`,
-- `streaks`, `sessions` and `push_subscriptions`, and the send-reminder cron
-- reads `streaks.last_practice_date` to decide whether today is done. So
-- nothing here renames or drops: `profiles` gains a role, `streaks` gains the
-- banked run, and the new RPCs write the same `last_practice_date` the old app
-- does — which also keeps the reminders working for the new one.
-- ---------------------------------------------------------------------------

create type public.content_status as enum
  ('draft', 'linted', 'ai_reviewed', 'approved', 'published', 'retired');

------------------------------------------------------------
-- Profiles: who may edit the course
------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'student'
    check (role in ('student', 'reviewer', 'admin')),
  add column if not exists timezone text not null default 'America/Argentina/Buenos_Aires';

-- A client may create and edit its own profile (existing policies), but never
-- choose its own role: a new row is always a student, and only the service
-- role — the dashboard's admin path, or SQL — can change it afterwards.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.role := 'student';
  elsif new.role is distinct from old.role then
    raise exception 'role can only be changed by an admin';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before insert or update on public.profiles
  for each row execute function public.guard_profile_role();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where user_id = auth.uid() and role in ('reviewer', 'admin')
  );
$$;

------------------------------------------------------------
-- Streaks: the banked run a comeback day can buy back
------------------------------------------------------------
alter table public.streaks
  add column if not exists recoverable_streak int not null default 0;

------------------------------------------------------------
-- Curriculum
------------------------------------------------------------
create table public.sections (
  id         smallint primary key,
  ordinal    smallint not null unique,
  slug       text not null unique,
  title_en   text not null,
  cefr       text not null,
  status     public.content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table public.units (
  id            uuid primary key default gen_random_uuid(),
  section_id    smallint not null references public.sections,
  ordinal       smallint not null,
  slug          text not null unique,
  title_en      text not null,
  summary_en    text not null,
  grammar_focus text[] not null default '{}',
  register_max  text not null default 'informal'
                check (register_max in ('neutral', 'informal', 'lunfardo', 'vulgar')),
  status        public.content_status not null default 'draft',
  updated_at    timestamptz not null default now(),
  unique (section_id, ordinal)
);

create table public.lessons (
  id         uuid primary key default gen_random_uuid(),
  unit_id    uuid not null references public.units on delete cascade,
  ordinal    smallint not null,
  title_en   text not null,
  kind       text not null default 'lesson' check (kind in ('lesson', 'review', 'checkpoint')),
  status     public.content_status not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (unit_id, ordinal)
);

create table public.tips (
  id         uuid primary key default gen_random_uuid(),
  unit_id    uuid not null references public.units on delete cascade,
  title_en   text not null,
  body_md    text not null,
  status     public.content_status not null default 'draft',
  updated_at timestamptz not null default now()
);
create index tips_unit_idx on public.tips (unit_id);

------------------------------------------------------------
-- Lexicon
------------------------------------------------------------
create table public.lemmas (
  id         uuid primary key default gen_random_uuid(),
  lemma      text not null,
  pos        text not null
             check (pos in ('verb', 'noun', 'adj', 'adv', 'pron', 'det', 'prep', 'conj',
                            'interj', 'num', 'phrase', 'propn')),
  gloss_en   text not null,
  register   text not null default 'neutral'
             check (register in ('neutral', 'informal', 'lunfardo', 'vulgar')),
  is_glue    boolean not null default false,
  notes_en   text,
  status     public.content_status not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (lemma, pos)
);

create table public.forms (
  id         uuid primary key default gen_random_uuid(),
  lemma_id   uuid not null references public.lemmas on delete cascade,
  form       text not null,
  features   jsonb not null default '{}',
  gloss_en   text, -- overrides the lemma's gloss when the form needs its own ("you have")
  unit_id    uuid not null references public.units, -- the unit that teaches this form
  audio_path text,
  status     public.content_status not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (lemma_id, form)
);
create index forms_unit_idx on public.forms (unit_id);

-- What the app reads: a form with its lemma's facts and its unit's position
-- folded in. security_invoker, so the base tables' RLS still decides who sees
-- what — a student sees published forms only.
create view public.form_entries
with (security_invoker = true) as
select
  f.id,
  f.lemma_id,
  l.lemma,
  l.pos,
  f.form,
  coalesce(f.gloss_en, l.gloss_en) as gloss_en,
  f.features,
  f.unit_id,
  u.ordinal as unit_ordinal,
  u.section_id,
  l.is_glue,
  l.register,
  f.audio_path,
  f.status
from public.forms f
join public.lemmas l on l.id = f.lemma_id
join public.units u on u.id = f.unit_id;

------------------------------------------------------------
-- Raw content
------------------------------------------------------------
create table public.sentences (
  id             uuid primary key default gen_random_uuid(),
  unit_id        uuid not null references public.units,
  es             text not null,
  en             text not null,
  en_alt         text[] not null default '{}',
  tokens         jsonb not null, -- [{ surface, form_ids: uuid[] }]
  target_form_id uuid not null references public.forms,
  kind           text not null default 'sentence'
                 check (kind in ('word', 'phrase', 'sentence', 'dialogue')),
  difficulty     smallint not null default 1 check (difficulty between 1 and 4),
  source         text not null default 'ai' check (source in ('ai', 'human', 'tatoeba')),
  attribution    text,
  audio_path     text,
  status         public.content_status not null default 'draft',
  created_by     uuid references auth.users,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (source <> 'tatoeba' or attribution is not null)
);
create index sentences_unit_idx on public.sentences (unit_id, status);
create index sentences_target_idx on public.sentences (target_form_id);

-- Which forms a sentence exercises, kept in step with `tokens` by trigger, so
-- "sentences using form X" is a join rather than a scan of every jsonb array.
create table public.sentence_forms (
  sentence_id uuid not null references public.sentences on delete cascade,
  form_id     uuid not null references public.forms on delete cascade,
  is_target   boolean not null default false,
  primary key (sentence_id, form_id)
);
create index sentence_forms_form_idx on public.sentence_forms (form_id);

create or replace function public.sync_sentence_forms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from sentence_forms where sentence_id = new.id;
  insert into sentence_forms (sentence_id, form_id, is_target)
  select new.id, fid::uuid, bool_or(fid::uuid = new.target_form_id)
  from jsonb_array_elements(new.tokens) as t,
       jsonb_array_elements_text(t -> 'form_ids') as fid
  group by fid;
  return new;
end;
$$;

create trigger sentences_sync_forms
  after insert or update of tokens, target_form_id on public.sentences
  for each row execute function public.sync_sentence_forms();

------------------------------------------------------------
-- Lessons are ordered slots
------------------------------------------------------------
create table public.lesson_slots (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons on delete cascade,
  ordinal      smallint not null,
  kind         text not null check (kind in ('teach', 'drill', 'match', 'tip', 'review')),
  form_id      uuid references public.forms,
  sentence_id  uuid references public.sentences,
  tip_id       uuid references public.tips,
  mode         text, -- drill: a pinned exercise mode; null lets the ladder decide
  review_count smallint,
  unique (lesson_id, ordinal),
  check (
    (kind = 'teach' and form_id is not null) or
    (kind = 'drill' and sentence_id is not null) or
    (kind = 'match') or
    (kind = 'tip' and tip_id is not null) or
    (kind = 'review' and review_count between 1 and 6)
  )
);

------------------------------------------------------------
-- Review workflow
------------------------------------------------------------
create table public.content_reviews (
  id         bigint generated always as identity primary key,
  table_name text not null,
  row_id     uuid not null,
  stage      text not null check (stage in ('lint', 'ai', 'native')),
  verdict    text not null check (verdict in ('pass', 'flag', 'fail')),
  notes      jsonb not null default '{}',
  reviewer   uuid references auth.users,
  created_at timestamptz not null default now()
);
create index content_reviews_row_idx on public.content_reviews (table_name, row_id, created_at desc);

create table public.content_revisions (
  id         bigint generated always as identity primary key,
  table_name text not null,
  row_id     uuid not null,
  before     jsonb,
  after      jsonb not null,
  edited_by  uuid not null references auth.users,
  created_at timestamptz not null default now()
);
create index content_revisions_row_idx on public.content_revisions (table_name, row_id, created_at desc);

------------------------------------------------------------
-- Per learner
------------------------------------------------------------
create table public.lesson_progress (
  user_id      uuid not null references auth.users on delete cascade,
  lesson_id    uuid not null references public.lessons on delete cascade,
  completed_at timestamptz not null default now(),
  score        smallint check (score between 0 and 100),
  primary key (user_id, lesson_id)
);

-- SM-2 per form per learner (the engine's card_states).
create table public.form_states (
  id            uuid primary key default gen_random_uuid(),
  form_id       uuid not null references public.forms on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  state         text not null default 'new' check (state in ('new', 'learning', 'review')),
  ease_factor   real not null default 2.5,
  interval_days real not null default 0,
  repetitions   int not null default 0,
  lapses        int not null default 0,
  due_at        timestamptz,
  introduced_on date not null default (now() at time zone 'utc')::date,
  updated_at    timestamptz not null default now(),
  unique (form_id, user_id)
);
create index form_states_due_idx on public.form_states (user_id, due_at);

create table public.review_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users on delete cascade,
  form_id     uuid not null references public.forms on delete cascade,
  rating      smallint not null check (rating between 0 and 3),
  mode        text not null check (mode in (
                'flashcard', 'multiple_choice', 'listen', 'typing', 'matching', 'word_build',
                'true_false', 'listen_build', 'sentence_intro', 'sentence_meaning', 'sentence_gap',
                'sentence_build', 'sentence_listen')),
  reviewed_at timestamptz not null default now()
);
create index review_logs_user_idx on public.review_logs (user_id, reviewed_at desc);

-- One row per local day with any finished round — the week strip and the
-- sentence ladder's daily dose read it.
create table public.daily_sessions (
  user_id          uuid not null references auth.users on delete cascade,
  session_date     date not null,
  total_cards      int not null default 0,
  completed_cards  int not null default 0,
  sentence_screens int not null default 0,
  sentence_fails   int not null default 0,
  completed_at     timestamptz,
  primary key (user_id, session_date)
);

create table public.sentence_states (
  sentence_id   uuid not null references public.sentences on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  shown_count   int not null default 0,
  correct_count int not null default 0,
  last_shown_at timestamptz,
  primary key (sentence_id, user_id)
);

------------------------------------------------------------
-- updated_at
------------------------------------------------------------
create trigger sections_set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();
create trigger units_set_updated_at before update on public.units
  for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger tips_set_updated_at before update on public.tips
  for each row execute function public.set_updated_at();
create trigger lemmas_set_updated_at before update on public.lemmas
  for each row execute function public.set_updated_at();
create trigger forms_set_updated_at before update on public.forms
  for each row execute function public.set_updated_at();
create trigger sentences_set_updated_at before update on public.sentences
  for each row execute function public.set_updated_at();
create trigger form_states_set_updated_at before update on public.form_states
  for each row execute function public.set_updated_at();

------------------------------------------------------------
-- RLS
------------------------------------------------------------
alter table public.sections          enable row level security;
alter table public.units             enable row level security;
alter table public.lessons           enable row level security;
alter table public.tips              enable row level security;
alter table public.lemmas            enable row level security;
alter table public.forms             enable row level security;
alter table public.sentences         enable row level security;
alter table public.sentence_forms    enable row level security;
alter table public.lesson_slots      enable row level security;
alter table public.content_reviews   enable row level security;
alter table public.content_revisions enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.form_states       enable row level security;
alter table public.review_logs       enable row level security;
alter table public.daily_sessions    enable row level security;
alter table public.sentence_states   enable row level security;

-- Content: learners read what is published; staff read and write everything.
-- There is no delete policy anywhere — content is retired, not deleted.
do $$
declare t text;
begin
  foreach t in array array['sections', 'units', 'lessons', 'tips', 'lemmas', 'forms', 'sentences'] loop
    execute format(
      'create policy "%1$s: read published" on public.%1$I for select to authenticated
         using (status = ''published'' or public.is_staff())', t);
    execute format(
      'create policy "%1$s: staff insert" on public.%1$I for insert to authenticated
         with check (public.is_staff())', t);
    execute format(
      'create policy "%1$s: staff update" on public.%1$I for update to authenticated
         using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

create policy "lesson_slots: read with lesson" on public.lesson_slots for select to authenticated
  using (exists (
    select 1 from public.lessons l
    where l.id = lesson_id and (l.status = 'published' or public.is_staff())
  ));
create policy "lesson_slots: staff insert" on public.lesson_slots for insert to authenticated
  with check (public.is_staff());
create policy "lesson_slots: staff update" on public.lesson_slots for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
-- Slots are the one content row that is deleted: reordering a lesson in the
-- dashboard rewrites them, and a slot has no history worth keeping.
create policy "lesson_slots: staff delete" on public.lesson_slots for delete to authenticated
  using (public.is_staff());

create policy "sentence_forms: read with sentence" on public.sentence_forms for select to authenticated
  using (exists (
    select 1 from public.sentences s
    where s.id = sentence_id and (s.status = 'published' or public.is_staff())
  ));

create policy "content_reviews: staff read" on public.content_reviews for select to authenticated
  using (public.is_staff());
create policy "content_reviews: staff insert" on public.content_reviews for insert to authenticated
  with check (public.is_staff() and (reviewer is null or reviewer = auth.uid()));
create policy "content_revisions: staff read" on public.content_revisions for select to authenticated
  using (public.is_staff());
create policy "content_revisions: staff insert" on public.content_revisions for insert to authenticated
  with check (public.is_staff() and edited_by = auth.uid());

-- Per learner: owner only.
do $$
declare t text;
begin
  foreach t in array array['lesson_progress', 'form_states', 'review_logs', 'daily_sessions', 'sentence_states'] loop
    execute format(
      'create policy "%1$s: owner read" on public.%1$I for select to authenticated
         using (user_id = auth.uid())', t);
    execute format(
      'create policy "%1$s: owner insert" on public.%1$I for insert to authenticated
         with check (user_id = auth.uid())', t);
    execute format(
      'create policy "%1$s: owner update" on public.%1$I for update to authenticated
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

------------------------------------------------------------
-- RPCs
------------------------------------------------------------

-- Forms a sentence in a given unit may use: its own and every earlier unit's.
-- The linter, the generator and the lesson builder all ask this question.
create or replace function public.available_forms(p_unit_ordinal smallint, p_section_id smallint default 1)
returns setof public.form_entries
language sql
stable
as $$
  select * from public.form_entries
  where section_id = p_section_id and unit_ordinal <= p_unit_ordinal;
$$;

-- Every finished round — a path lesson or a practice round — lands here.
--
--  - A lesson id records it in lesson_progress (keeping the best score), which
--    is what moves the path on.
--  - The first round of a local day credits the day: the streak grows if
--    yesterday was practised, and otherwise restarts at 1 with the lost run
--    banked in recoverable_streak.
--  - A later round on a day that has a banked run buys it back — the
--    "two classes in a row" that un-freezes a streak.
--
-- The client passes its local date, so the server never has to know the
-- learner's time zone. Writes the same last_practice_date the old app's
-- bump_streak does, so the reminder cron keeps reading the truth.
create or replace function public.finish_lesson(
  p_local_date date,
  p_lesson_id uuid default null,
  p_score smallint default null
)
returns table (current_streak int, previous_streak int, recoverable_streak int)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user uuid := auth.uid();
  v_row public.streaks%rowtype;
  v_prev int;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_lesson_id is not null then
    insert into public.lesson_progress (user_id, lesson_id, score)
    values (v_user, p_lesson_id, p_score)
    on conflict (user_id, lesson_id) do update
      set completed_at = now(),
          score = greatest(public.lesson_progress.score, excluded.score);
  end if;

  insert into public.daily_sessions (user_id, session_date, completed_at)
  values (v_user, p_local_date, now())
  on conflict (user_id, session_date) do update
    set completed_at = coalesce(public.daily_sessions.completed_at, now()),
        completed_cards = public.daily_sessions.total_cards;

  insert into public.streaks (user_id) values (v_user) on conflict (user_id) do nothing;
  select * into v_row from public.streaks where user_id = v_user for update;
  v_prev := v_row.current_streak;

  if v_row.last_practice_date is distinct from p_local_date then
    if v_row.last_practice_date = p_local_date - 1 then
      v_row.current_streak := v_row.current_streak + 1;
      -- A run banked on a comeback day she never finished recovering is gone.
      v_row.recoverable_streak := 0;
    else
      v_row.recoverable_streak := case when v_row.last_practice_date is null then 0 else v_row.current_streak end;
      v_row.current_streak := 1;
    end if;
  elsif v_row.recoverable_streak > 0 then
    -- The lost run plus the comeback day itself.
    v_row.current_streak := v_row.recoverable_streak + v_row.current_streak;
    v_row.recoverable_streak := 0;
  end if;
  v_row.longest_streak := greatest(v_row.longest_streak, v_row.current_streak);

  update public.streaks
  set current_streak = v_row.current_streak,
      longest_streak = v_row.longest_streak,
      recoverable_streak = v_row.recoverable_streak,
      last_practice_date = p_local_date
  where user_id = v_user;

  return query select v_row.current_streak, v_prev, v_row.recoverable_streak;
end;
$$;

revoke all on function public.finish_lesson(date, uuid, smallint) from public;
grant execute on function public.finish_lesson(date, uuid, smallint) to authenticated;

------------------------------------------------------------
-- Audio
------------------------------------------------------------
-- Public, so a clip's URL derives from its path with no signing round trip
-- (src/lib/audio.ts). Writes stay with staff.
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

create policy "audio: staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'audio' and public.is_staff());
create policy "audio: staff update" on storage.objects for update to authenticated
  using (bucket_id = 'audio' and public.is_staff());
