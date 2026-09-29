-- content_version() answered in 2–4 s: its per-unit sentence stamps read the
-- whole sentences table (57 MB) on every app open. The stamps are now kept in
-- a small table, moved by a trigger as sentences change — one unit's rows
-- re-counted per edit, through the (unit_id, status) index — and the version
-- call reads 381 rows.

create table if not exists public.content_unit_stamps (
  unit_id uuid primary key,
  -- <published sentence count>:<last change, epoch seconds>
  stamp text not null
);
alter table public.content_unit_stamps enable row level security;
revoke all on public.content_unit_stamps from anon, authenticated;

create or replace function public.restamp_unit(u uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s text;
begin
  if u is null then return; end if;
  select count(*)::text || ':' || extract(epoch from max(updated_at))::bigint::text
    into s
    from public.sentences
    where unit_id = u and status = 'published'
    having count(*) > 0;
  if s is null then
    delete from public.content_unit_stamps where unit_id = u;
  else
    insert into public.content_unit_stamps (unit_id, stamp) values (u, s)
      on conflict (unit_id) do update set stamp = excluded.stamp;
  end if;
end;
$$;
revoke all on function public.restamp_unit(uuid) from public, anon, authenticated;

create or replace function public.sentences_restamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then perform public.restamp_unit(new.unit_id); end if;
  if tg_op in ('DELETE', 'UPDATE') and (tg_op = 'DELETE' or old.unit_id is distinct from new.unit_id) then
    perform public.restamp_unit(old.unit_id);
  end if;
  return null;
end;
$$;

drop trigger if exists sentences_restamp on public.sentences;
create trigger sentences_restamp
  after insert or update or delete on public.sentences
  for each row execute function public.sentences_restamp();

-- Fill it for what is already there.
truncate public.content_unit_stamps;
insert into public.content_unit_stamps (unit_id, stamp)
select unit_id, count(*)::text || ':' || extract(epoch from max(updated_at))::bigint::text
from public.sentences
where status = 'published'
group by unit_id;

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
    'units', (select coalesce(jsonb_object_agg(unit_id, stamp), '{}'::jsonb) from public.content_unit_stamps)
  );
$$;

revoke all on function public.content_version() from public, anon;
grant execute on function public.content_version() to authenticated;
