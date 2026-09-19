-- Who says a clip.
--
-- The vendor is ElevenLabs and the accent is rioplatense (docs/course-spec.md
-- §0 left the choice open between Azure es-AR and ElevenLabs; this settles it).
-- Two speakers, alternating, so a unit does not sound like one person reading a
-- list.
--
-- The speaker is recorded per clip rather than read back out of the file's name
-- because the app is going to put a face to the voice: a unit's speakers become
-- the figures on screen, and the figure beside a line has to be the one that
-- actually said it. A path cannot answer that question; a column can.
create table public.voices (
  id          text primary key, -- 'malena', 'tomas' — short, stable, readable in a query
  name        text not null,
  gender      text not null check (gender in ('female', 'male')),
  accent      text not null default 'rioplatense',
  provider    text not null default 'elevenlabs',
  provider_id text not null, -- the vendor's own voice id, what the TTS job sends
  model       text not null default 'eleven_multilingual_v2',
  status      public.content_status not null default 'published',
  updated_at  timestamptz not null default now()
);

comment on table public.voices is
  'The speakers the course is recorded in. A clip points at one of these.';
comment on column public.voices.gender is
  'Which figure may speak the line on screen. Not a label on the voice itself.';

create trigger voices_set_updated_at before update on public.voices
  for each row execute function public.set_updated_at();

alter table public.voices enable row level security;

-- Read by anyone signed in: a learner needs the row to draw the speaker beside
-- a line. Written by staff only, like every other content table.
create policy "voices: read published" on public.voices for select to authenticated
  using (status = 'published' or public.is_staff());
create policy "voices: staff insert" on public.voices for insert to authenticated
  with check (public.is_staff());
create policy "voices: staff update" on public.voices for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Both from the ElevenLabs voice library, both labelled `argentine`:
-- "Malena - Warm, Dynamic and Confident" and "Tomas - Argentina & Uruguaya".
insert into public.voices (id, name, gender, provider_id) values
  ('malena', 'Malena', 'female', 'p7AwDmKvTdoHTBuueGvP'),
  ('tomas',  'Tomás',  'male',   'QK4xDwo9ESPHA4JNUpX3');

-- A clip and its speaker are written together by the TTS job, so the column
-- sits beside `audio_path` on both tables that carry one. Null where there is
-- no recording yet; `on delete restrict` is the default, which is what we want
-- — a voice still heard in a clip cannot quietly disappear.
alter table public.sentences add column voice_id text references public.voices;
alter table public.forms     add column voice_id text references public.voices;

comment on column public.sentences.voice_id is 'Who says audio_path.';
comment on column public.forms.voice_id is 'Who says audio_path.';

-- form_entries carries audio_path, so it carries the speaker too.
-- available_forms returns rows of the view, so it is dropped around it.
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
  coalesce(f.gloss_note_en, l.gloss_note_en) as gloss_note_en,
  f.features,
  f.unit_id,
  u.ordinal as unit_ordinal,
  u.course_order as unit_order,
  u.section_id,
  l.is_glue,
  l.register,
  f.audio_path,
  f.voice_id,
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
