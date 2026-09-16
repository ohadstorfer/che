-- ---------------------------------------------------------------------------
-- Accepted answers from learners, explanations, and the content quality loop —
-- docs/learning-engine-spec.md §6.2, §6.3, §10.
--
--  - answer_reports: "my answer should be accepted". A reviewer resolves a
--    group of identical reports at once, usually by adding the answer to
--    `sentences.es_alt` (or `forms.alt` for a single word).
--  - explanations: the cached "Why?" for a wrong answer, one row per
--    (exercise, answer), shared by every learner who makes the same mistake.
--  - staff_* functions: sentences that fail too often, words that keep lapsing.
-- ---------------------------------------------------------------------------

alter table public.forms
  add column alt text[] not null default '{}';
comment on column public.forms.alt is
  'Other spellings accepted when the form is typed on its own.';

create table public.answer_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  round_id    uuid references public.rounds on delete set null,
  sentence_id uuid references public.sentences on delete cascade,
  form_id     uuid references public.forms on delete cascade,
  mode        text not null,
  answer      text not null,
  answer_key  text not null,
  status      text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'duplicate')),
  resolved_by uuid references auth.users,
  resolved_at timestamptz,
  note        text,
  created_at  timestamptz not null default now(),
  check (sentence_id is not null or form_id is not null),
  unique nulls not distinct (user_id, sentence_id, form_id, answer_key)
);
create index answer_reports_open_idx on public.answer_reports (status, sentence_id, form_id, answer_key);

alter table public.answer_reports enable row level security;
create policy "answer_reports: owner insert" on public.answer_reports for insert to authenticated
  with check (user_id = auth.uid() and status = 'open' and resolved_by is null);
create policy "answer_reports: owner or staff read" on public.answer_reports for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy "answer_reports: staff update" on public.answer_reports for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create table public.explanations (
  key        text primary key,
  body_md    text not null,
  model      text not null,
  served     int not null default 1,
  flagged    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.explanations enable row level security;
create policy "explanations: read unflagged" on public.explanations for select to authenticated
  using (not flagged or public.is_staff());
create policy "explanations: staff update" on public.explanations for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Generated explanations per learner per day, for the rate limit. Written by
-- the edge function with the service role only.
create table public.explain_usage (
  user_id uuid not null references auth.users on delete cascade,
  day     date not null,
  count   int not null default 0,
  primary key (user_id, day)
);
alter table public.explain_usage enable row level security;

------------------------------------------------------------
-- Quality loop (staff only, no learner ids)
------------------------------------------------------------
create or replace function public.staff_sentence_quality(p_min_tries int default 20)
returns table (sentence_id uuid, unit_id uuid, es text, tries bigint, fail_rate numeric,
               build_fail_rate numeric, median_ms double precision, open_reports bigint)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.unit_id, s.es,
         count(*) filter (where not l.is_retry),
         round(avg((not l.correct)::int) filter (where not l.is_retry), 3),
         round(avg((not l.correct)::int) filter (where not l.is_retry and l.mode in ('sentence_build', 'sentence_listen')), 3),
         percentile_cont(0.5) within group (order by l.latency_ms),
         (select count(*) from public.answer_reports r where r.sentence_id = s.id and r.status = 'open')
  from public.sentences s
  join public.review_logs l on l.sentence_id = s.id and l.correct is not null
                            and l.reviewed_at > now() - interval '60 days'
  where public.is_staff()
  group by s.id
  having count(*) filter (where not l.is_retry) >= p_min_tries
  order by 5 desc;
$$;

create or replace function public.staff_form_leeches(p_min_lapses int default 3)
returns table (form_id uuid, form text, learners bigint, avg_lapses numeric)
language sql
stable
security definer
set search_path = public
as $$
  select fs.form_id, f.form, count(distinct fs.user_id), round(avg(fs.lapses), 2)
  from public.form_states fs
  join public.forms f on f.id = fs.form_id
  where public.is_staff() and fs.lapses >= p_min_lapses
  group by fs.form_id, f.form
  order by 3 desc, 4 desc;
$$;

create or replace function public.staff_open_reports()
returns table (sentence_id uuid, form_id uuid, answer_key text, answer text, reports bigint, first_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.sentence_id, r.form_id, r.answer_key, min(r.answer), count(*), min(r.created_at)
  from public.answer_reports r
  where public.is_staff() and r.status = 'open'
  group by r.sentence_id, r.form_id, r.answer_key
  order by 5 desc, 6;
$$;

-- Whether a reminder was followed by a round within two hours — the reward a
-- notification experiment would be judged on.
create or replace function public.staff_reminder_followthrough(p_since timestamptz default now() - interval '4 weeks')
returns table (day date, sent bigint, followed bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.created_at::date,
         count(*),
         count(*) filter (where exists (
           select 1 from public.rounds r
           where r.user_id = e.user_id and r.started_at between e.created_at and e.created_at + interval '2 hours'))
  from public.notification_events e
  where public.is_staff() and e.kind in ('expo-push-ok', 'web-push-ok') and e.created_at >= p_since
  group by 1
  order by 1 desc;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'staff_sentence_quality(int)', 'staff_form_leeches(int)', 'staff_open_reports()',
    'staff_reminder_followthrough(timestamptz)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- The lexicon view the app reads gains `alt`. available_forms returns rows of
-- the view, so it is dropped and recreated around it.
drop function if exists public.available_forms(smallint);
drop view if exists public.form_entries;
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
  u.course_order as unit_order,
  u.section_id,
  l.is_glue,
  l.register,
  f.audio_path,
  f.status,
  f.alt
from public.forms f
join public.lemmas l on l.id = f.lemma_id
join public.units u on u.id = f.unit_id;

create or replace function public.available_forms(p_course_order smallint)
returns setof public.form_entries
language sql
stable
as $$
  select * from public.form_entries where unit_order <= p_course_order;
$$;
