-- Premium, enforced on the course text too. The lock of 20260928000004 and
-- 20260929000006 covered a lesson's slots and a story's lines, but every
-- published sentence stayed readable by any account, a guest included: the
-- whole course could be paged out of the API without paying.
--
-- Now a sentence is readable when:
--   · she is staff or premium, or
--   · it is in a free unit, or
--   · it is one of a unit's guidebook phrases (the guidebook opens on locked
--     units too, as a preview), or
--   · she has already been shown it (sentence_states), so review keeps working
--     after a subscription lapses.
-- Everything else in a locked unit reads as absent, the way locked slots do.
--
-- Deliberately left readable: units, lessons, sections and tips (the road and
-- the guidebook draw the whole course, locked steps included), unit_phrases
-- (ids only), and the lexicon (lemmas, forms, form_entries, form_answers),
-- which the app loads whole for every round, across units.
--
-- `hard_paywall` (app_config, 20261013000001) now closes the free tier on the
-- server too: no free lessons, no free sentences. The app already sends a
-- free account to the paywall then.
--
-- The phone keeps sentence blocks by the per-unit stamps of content_version();
-- a locked unit's stamp now carries ':locked' for her, so the day she pays (or
-- lapses) every block changes version and is fetched again.

------------------------------------------------------------
-- The free tier, with hard_paywall.
------------------------------------------------------------

create or replace function public.free_lesson_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  with road as (
    select u.id, row_number() over (order by s.ordinal, u.ordinal) as n
    from public.units u
    join public.sections s on s.id = u.section_id
    where u.status = 'published'
      and s.status = 'published'
      and exists (select 1 from public.lessons l where l.unit_id = u.id and l.status = 'published')
  )
  select coalesce(array_agg(l.id), '{}')
  from public.lessons l
  join road r on r.id = l.unit_id
  where r.n <= public.free_units()
    and l.status = 'published'
    and not coalesce((select c.value = 'true'::jsonb from public.app_config c where c.key = 'hard_paywall'), false);
$$;

revoke all on function public.free_lesson_ids() from public, anon;
grant execute on function public.free_lesson_ids() to authenticated;

-- The units of the free tier.
create or replace function public.free_unit_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct l.unit_id), '{}')
  from public.lessons l
  where l.id = any (public.free_lesson_ids());
$$;

revoke all on function public.free_unit_ids() from public, anon;
grant execute on function public.free_unit_ids() to authenticated;

------------------------------------------------------------
-- Sentences.
------------------------------------------------------------

-- The guidebook's lookup: is this sentence one of a unit's phrases.
create index if not exists unit_phrases_sentence_idx on public.unit_phrases (sentence_id);

-- Uncorrelated subqueries run once per statement (20260927300001), so per row
-- this is a hashed lookup of the free units and, only for a locked unit's
-- rows, two index probes (unit_phrases by sentence, sentence_states by its
-- primary key).
alter policy "sentences: read published" on public.sentences
  using (
    (select public.is_staff())
    or (
      status = 'published'
      and (
        (select public.has_premium())
        or unit_id in (select unnest(public.free_unit_ids()))
        or exists (select 1 from public.unit_phrases p where p.sentence_id = sentences.id)
        or exists (
          select 1 from public.sentence_states ss
          where ss.sentence_id = sentences.id and ss.user_id = (select auth.uid())
        )
      )
    )
  );

------------------------------------------------------------
-- Explanations: only explain-answer reads them (as the service role). The app
-- never does, so learners no longer can; staff still review them.
------------------------------------------------------------

alter policy "explanations: read unflagged" on public.explanations
  using ((select public.is_staff()));

------------------------------------------------------------
-- content_version(): a locked unit's stamp is marked for her, so a block kept
-- on the phone while locked is not taken for the open one (and back).
------------------------------------------------------------

create or replace function public.content_version()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with access as (
    select public.is_staff() or public.has_premium() as open, public.free_unit_ids() as free
  )
  select jsonb_build_object(
    'lexicon', md5(concat_ws('|',
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.forms where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.lemmas where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.form_answers where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.units where status = 'published')
    )),
    'course', md5(concat_ws('|',
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.sections where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.units where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.lessons where status = 'published'),
      (select count(*)::text || coalesce(max(updated_at)::text, '') from public.tips where status = 'published')
    )),
    'tallies', (select fingerprint from public.gloss_tallies_cache where id),
    'units', (
      select coalesce(jsonb_object_agg(
        s.unit_id,
        case when a.open or s.unit_id = any (a.free) then s.stamp else s.stamp || ':locked' end
      ), '{}'::jsonb)
      from public.content_unit_stamps s cross join access a
    )
  );
$$;

revoke all on function public.content_version() from public, anon;
grant execute on function public.content_version() to authenticated;
