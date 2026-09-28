-- The caller's own course level, for the Speaking tab's first-visit default
-- (the level switch opens at it until she plays a chat at another level).
-- hablar_level itself stays service-role only; this wrapper can only ever
-- read auth.uid()'s level.
create or replace function public.hablar_my_level()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.hablar_level(auth.uid());
$$;

revoke all on function public.hablar_my_level() from public, anon;
grant execute on function public.hablar_my_level() to authenticated;
