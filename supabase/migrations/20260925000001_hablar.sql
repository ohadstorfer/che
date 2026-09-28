-- ---------------------------------------------------------------------------
-- Hablar: a daily spoken chat with Tomás — docs/hablar-hld.md §5.
--
-- Three tables and a private bucket, all written by the hablar-* edge functions
-- with the service role. The learner only ever reads: her own conversations,
-- their turns, and her own recordings. The usage log is not readable at all.
--
-- One chat per local day is the unique (user_id, local_date) key, so the limit
-- holds even if two starts race.
-- ---------------------------------------------------------------------------

------------------------------------------------------------
-- conversations: one row per chat
------------------------------------------------------------
create table public.conversations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users on delete cascade,
  local_date     date not null,
  kind           text not null check (kind in ('scenario', 'culture', 'free')),
  topic_id       text,
  level          text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  started_at     timestamptz not null default now(),
  ended_at       timestamptz,
  end_reason     text check (end_reason in ('user', 'time')),
  paused_seconds int not null default 0 check (paused_seconds between 0 and 900),
  hints_used     smallint not null default 0,
  -- idx of the user turns a hint was asked for, so two in a row can make
  -- Tomás simplify (§2.3).
  hint_turns     int[] not null default '{}',
  goals_done     text[] not null default '{}',
  summary        jsonb,
  unique (user_id, local_date)
);

comment on table public.conversations is
  'A Hablar chat. One per learner per local day; the functions write it, the learner reads it.';
comment on column public.conversations.level is
  'CEFR band the chat ran at: the learner''s course level, or her override.';
comment on column public.conversations.paused_seconds is
  'Background time the client reported (cumulative), capped at 15 minutes. Not counted against the 5:00.';

create index conversations_user_idx on public.conversations (user_id, started_at desc);

------------------------------------------------------------
-- conversation_turns: every line, both speakers
------------------------------------------------------------
-- The id is the client's turn_id, which makes transcribe and reply idempotent.
-- `idx` orders the chat. A draft has none; it gets one when it is sent, and
-- Tomás's reply takes the next number (user turns are odd, Tomás's even; the
-- opener is 0), so a draft recorded while a reply is still being saved cannot
-- land between them.
create table public.conversation_turns (
  id              uuid primary key,
  conversation_id uuid not null references public.conversations on delete cascade,
  idx             int,
  role            text not null check (role in ('user', 'tomas')),
  status          text not null default 'final' check (status in ('draft', 'final')),
  text            text not null default '',
  text_en         text,
  audio_path      text,
  feedback        jsonb,
  reply_to        uuid references public.conversation_turns on delete set null,
  meta            jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  unique (conversation_id, idx)
);

comment on column public.conversation_turns.audio_path is
  'Path in the private `hablar` bucket: the learner''s clip, or Tomás''s joined reply mp3.';
comment on column public.conversation_turns.feedback is
  'On user turns: { has_error, severity, corrected, spans, why_en, better, goals_done }.';
comment on column public.conversation_turns.reply_to is
  'On Tomás turns: the user turn he is answering. How a retried reply finds its stored result.';

create index conversation_turns_conv_idx on public.conversation_turns (conversation_id, idx);
create unique index conversation_turns_reply_idx on public.conversation_turns (reply_to) where reply_to is not null;

------------------------------------------------------------
-- hablar_usage: what each call cost
------------------------------------------------------------
create table public.hablar_usage (
  id                bigserial primary key,
  conversation_id   uuid references public.conversations on delete cascade,
  turn_id           uuid,
  provider          text not null check (provider in ('anthropic', 'elevenlabs')),
  model             text,
  stage             text not null check (stage in ('stt', 'reply', 'feedback', 'hint', 'translate', 'summary', 'tts', 'guard')),
  input_tokens      int,
  output_tokens     int,
  cache_read_tokens int,
  audio_seconds     real,
  tts_chars         int,
  ms                int,
  created_at        timestamptz not null default now()
);

create index hablar_usage_conv_idx on public.hablar_usage (conversation_id, stage);
create index hablar_usage_created_idx on public.hablar_usage (created_at desc);

------------------------------------------------------------
-- RLS: owners read, nobody writes from the client
------------------------------------------------------------
alter table public.conversations      enable row level security;
alter table public.conversation_turns enable row level security;
alter table public.hablar_usage       enable row level security;

create policy "conversations: owner read" on public.conversations
  for select to authenticated
  using (auth.uid() = user_id);

create policy "conversation_turns: owner read" on public.conversation_turns
  for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));

-- hablar_usage: no policies — service role only.

------------------------------------------------------------
-- The learner's level: the CEFR of the section she is in
------------------------------------------------------------
-- "In" means the section of the first published lesson on the road she has not
-- passed — what the path calls the current lesson (currentIndex in
-- src/lib/course.ts). Once the course is done, the last section. Returns the
-- section's own label ('A2.3'); the functions reduce it to the band.
create or replace function public.hablar_level(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select s.cefr
     from public.lessons l
     join public.units u on u.id = l.unit_id
     join public.sections s on s.id = u.section_id
     where l.status = 'published' and u.status = 'published' and s.status = 'published'
       and not exists (
         select 1 from public.lesson_progress p
         where p.user_id = p_user and p.lesson_id = l.id and p.passed
       )
     order by u.course_order, l.ordinal
     limit 1),
    (select s.cefr from public.sections s where s.status = 'published' order by s.ordinal desc limit 1),
    'A1.1'
  );
$$;

revoke all on function public.hablar_level(uuid) from public, anon, authenticated;
grant execute on function public.hablar_level(uuid) to service_role;

------------------------------------------------------------
-- Storage: the recordings
------------------------------------------------------------
-- Private. Paths are {user_id}/{session_id}/…, so the first folder is the
-- owner. Playback uses signed URLs the client makes itself under this policy.
insert into storage.buckets (id, name, public)
values ('hablar', 'hablar', false)
on conflict (id) do nothing;

create policy "hablar: owner read" on storage.objects for select to authenticated
  using (bucket_id = 'hablar' and (storage.foldername(name))[1] = auth.uid()::text);

------------------------------------------------------------
-- Retention: recordings go after 30 days, transcripts stay
------------------------------------------------------------
-- Objects have to be removed through the Storage API (a plain delete on
-- storage.objects leaves the file behind), so the cron calls the
-- hablar-retention function, which lists what is due here and removes it.
create or replace function public.hablar_expired_recordings(p_limit int default 500)
returns setof text
language sql
stable
security definer
set search_path = public, storage
as $$
  select o.name from storage.objects o
  where o.bucket_id = 'hablar' and o.created_at < now() - interval '30 days'
  order by o.created_at
  limit p_limit;
$$;

revoke all on function public.hablar_expired_recordings(int) from public, anon, authenticated;
grant execute on function public.hablar_expired_recordings(int) to service_role;

-- Same wiring as che-send-reminders: URL and bearer from the vault.
do $$
declare
  v_jobid bigint;
begin
  for v_jobid in select j.jobid from cron.job j where j.jobname = 'che-hablar-retention' loop
    perform cron.unschedule(v_jobid);
  end loop;
end $$;

select cron.schedule(
  'che-hablar-retention',
  '17 4 * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/hablar-retention',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $cron$
);
