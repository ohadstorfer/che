-- form_gloss_tallies, cached. Summing every sentence's glosses takes seconds
-- (~6 s over 26k sentences), far too long to sit in front of a lesson and too
-- close to the API's statement timeout. So it is built in the background and
-- the app reads the stored result:
--   - refresh_gloss_tallies() rebuilds it when the content has changed since
--     the last build (a fingerprint of sentences, forms, lemmas and units);
--   - pg_cron runs that every 5 minutes, so a publish reaches it within 5;
--   - form_gloss_tallies() only reads. Before the first build it returns null,
--     and the app falls back to loading every sentence.
--
-- The build runs as the owner, past RLS, so it applies the app's visibility
-- itself: a form counts only when it, its lemma and its unit are published —
-- what form_entries shows a learner.

create table if not exists public.gloss_tallies_cache (
  id boolean primary key default true check (id),
  fingerprint text not null,
  tallies jsonb not null,
  built_at timestamptz not null default now()
);
alter table public.gloss_tallies_cache enable row level security;
revoke all on public.gloss_tallies_cache from anon, authenticated;

create or replace function public.content_fingerprint()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select md5(concat_ws('|',
    (select count(*) || '/' || coalesce(max(updated_at)::text, '') from public.sentences),
    (select count(*) || '/' || coalesce(max(updated_at)::text, '') from public.forms),
    (select count(*) || '/' || coalesce(max(updated_at)::text, '') from public.lemmas),
    (select count(*) || '/' || coalesce(max(updated_at)::text, '') from public.units)
  ));
$$;
revoke all on function public.content_fingerprint() from public, anon, authenticated;

create or replace function public.build_gloss_tallies()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with lex as materialized (
    select f.id::text as id, l.is_glue, l.pos, u.course_order as unit_order
    from public.forms f
    join public.lemmas l on l.id = f.lemma_id and l.status = 'published'
    join public.units u on u.id = f.unit_id and u.status = 'published'
    where f.status = 'published'
  ),
  tok as materialized (
    select
      s.target_form_id::text as tf,
      coalesce(tl.unit_order, 0) as sunit,
      btrim(t.e ->> 'gloss', E' \t\n\r') as g,
      t.e -> 'form_ids' as ids,
      row_number() over (order by s.id, t.ord) as pos
    from public.sentences s
    left join lex tl on tl.id = s.target_form_id::text
    cross join lateral jsonb_array_elements(s.tokens) with ordinality as t(e, ord)
    where s.status = 'published'
      and btrim(coalesce(t.e ->> 'gloss', ''), E' \t\n\r') <> ''
  ),
  ids as materialized (
    select tok.pos, tok.tf, tok.sunit, tok.g, f.ord as ford, lex.id as fid, lex.is_glue
    from tok
    cross join lateral jsonb_array_elements_text(tok.ids) with ordinality as f(fid, ord)
    join lex on lex.id = f.fid and lex.pos <> 'propn'
  ),
  counted as (
    select pos, tf, sunit, g, fid from ids where not is_glue
    union all
    select pos, tf, sunit, g, fid from (
      select distinct on (pos) pos, tf, sunit, g, fid from ids where is_glue order by pos, ford desc
    ) last_glue
  ),
  agg as (
    select
      fid,
      (array_agg(g order by pos))[1] as text,
      count(*) as uses,
      count(*) filter (where tf = fid) as carries,
      min(sunit) as unit,
      min(pos) as first
    from counted
    group by fid, lower(g)
  )
  select coalesce(jsonb_object_agg(fid, list), '{}'::jsonb)
  from (
    select fid, jsonb_agg(jsonb_build_array(text, uses, carries, unit) order by first) as list
    from agg
    group by fid
  ) per_form
$$;
revoke all on function public.build_gloss_tallies() from public, anon, authenticated;

create or replace function public.refresh_gloss_tallies()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fp text;
begin
  -- One build at a time; a second caller finds the first one's result.
  perform pg_advisory_xact_lock(hashtext('refresh_gloss_tallies'));
  fp := public.content_fingerprint();
  if exists (select 1 from public.gloss_tallies_cache where fingerprint = fp) then
    return;
  end if;
  insert into public.gloss_tallies_cache (id, fingerprint, tallies, built_at)
  values (true, fp, public.build_gloss_tallies(), now())
  on conflict (id) do update
    set fingerprint = excluded.fingerprint, tallies = excluded.tallies, built_at = excluded.built_at;
end;
$$;
revoke all on function public.refresh_gloss_tallies() from public, anon, authenticated;

-- What the app calls: the stored result, instantly.
create or replace function public.form_gloss_tallies()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$ select tallies from public.gloss_tallies_cache where id $$;

revoke all on function public.form_gloss_tallies() from public, anon;
grant execute on function public.form_gloss_tallies() to authenticated;

select public.refresh_gloss_tallies();

select cron.schedule(
  'posta-refresh-gloss-tallies',
  '*/5 * * * *',
  $cron$ select public.refresh_gloss_tallies() $cron$
);
