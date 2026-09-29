-- What changed? One small answer the app asks on opening, so it can keep the
-- course on the phone (docs/content-on-device.md §2.1) and download again only
-- the pieces that moved:
--   lexicon  a fingerprint of the published words (forms, lemmas, answers, and
--            the units they sit in);
--   course   a fingerprint of the published road (sections, units, lessons, tips);
--   tallies  the fingerprint the stored gloss tallies were built from;
--   units    per unit, how many published sentences and when one last changed.
-- Every table here bumps updated_at on edit (set_updated_at), a publish is an
-- edit, and only published rows count, so a draft in the admin moves nothing.

create or replace function public.content_version()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
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
      select coalesce(jsonb_object_agg(unit_id, stamp), '{}'::jsonb)
      from (
        select unit_id, count(*)::text || ':' || extract(epoch from max(updated_at))::bigint::text as stamp
        from public.sentences
        where status = 'published'
        group by unit_id
      ) per_unit
    )
  );
$$;

revoke all on function public.content_version() from public, anon;
grant execute on function public.content_version() to authenticated;
