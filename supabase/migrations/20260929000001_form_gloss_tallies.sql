-- What every published sentence says each word means, summed up per word.
--
-- The app used to download all ~26k sentences (24 MB of JSON) on the first
-- lesson of every run, partly because a word's meaning is ranked over every
-- sentence that glosses it (meanings.ts, meaningsFromSentences). It now loads
-- only the sentences up to where the learner is, and reads the ranking's
-- content-wide part from here instead: ~14k rows, a few hundred KB.
--
-- Mirrors the app exactly, so meanings don't move:
--   - a token's ids are read as toSentence reads them: published forms only,
--     names (propn) dropped, every content id counted, and of the glue ids only
--     the last one;
--   - `unit` is the smallest unit_order of the target form of a sentence that
--     glosses the word so (0 when the target is not published);
--   - per word, meanings are listed in the order the app first met them: by
--     sentence id, then by token.
-- The per-learner part of the ranking (how often she has been shown each
-- sentence) stays in the app, from the sentences she has seen.
--
-- Returns { form_id: [[text, uses, carries, unit], ...] }.

create or replace function public.form_gloss_tallies()
returns jsonb
language sql
stable
set search_path = public
as $$
  with lex as (
    select id, is_glue from public.form_entries where status = 'published' and pos <> 'propn'
  ),
  tok as (
    select
      s.id as sid,
      s.target_form_id::text as tf,
      coalesce(tl.unit_order, 0) as sunit,
      t.ord,
      btrim(t.e ->> 'gloss', E' \t\n\r') as g,
      t.e -> 'form_ids' as ids,
      row_number() over (order by s.id, t.ord) as pos
    from public.sentences s
    left join public.form_entries tl on tl.id = s.target_form_id and tl.status = 'published'
    cross join lateral jsonb_array_elements(s.tokens) with ordinality as t(e, ord)
    where s.status = 'published'
      and btrim(coalesce(t.e ->> 'gloss', ''), E' \t\n\r') <> ''
  ),
  ids as (
    select tok.pos, tok.tf, tok.sunit, tok.g, f.ord as ford, lex.id::text as fid, lex.is_glue
    from tok
    cross join lateral jsonb_array_elements_text(tok.ids) with ordinality as f(fid, ord)
    join lex on lex.id::text = f.fid
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
  ) per_form;
$$;

revoke all on function public.form_gloss_tallies() from public, anon;
grant execute on function public.form_gloss_tallies() to authenticated;
