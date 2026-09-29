-- The premium lock (20260928000004), finished: stories were left out of it,
-- and the app had no way to tell a locked lesson from an empty or failed read.

-- A story is its lines, so they take the same lock as a lesson's slots.
alter policy "story_lines: read with lesson" on public.story_lines
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_id and (l.status = 'published' or (select public.is_staff()))
    )
    and (
      (select public.is_staff())
      or (select public.has_premium())
      or lesson_id in (select unnest(public.free_lesson_ids()))
    )
  );

-- Whether the caller is held back from a lesson. An empty read of its slots or
-- lines can mean locked, a draft with nothing in it yet, or a failed request;
-- the app asks this rather than guessing from the empty result.
create or replace function public.lesson_locked(p_lesson uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not (
    public.is_staff()
    or public.has_premium()
    or p_lesson = any (public.free_lesson_ids())
  );
$$;

revoke all on function public.lesson_locked(uuid) from public, anon;
grant execute on function public.lesson_locked(uuid) to authenticated;
