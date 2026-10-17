-- The premium lock of 20261015000030 opens a locked sentence to whoever has a
-- sentence_states row for it ("she has already been shown it"). But the app
-- writes those rows itself, so a free account could write a row for any
-- sentence id and then read the sentence: the lock had a back door.
--
-- Now a row can only be written for a sentence she can already read. The app
-- only ever records sentences it was served (lib/sentences recordShown), so
-- nothing it does changes. Rows written while premium keep working after a
-- subscription lapses, as before: only new writes are checked.
--
-- The update gets the same check, or a row could be moved to another
-- sentence_id after the insert.
--
-- The test is a security definer function with the read policy's terms: a
-- plain subquery on sentences from here loops (sentences' policy reads
-- sentence_states, whose check would read sentences again).

create or replace function public.can_read_sentence(p_sentence uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sentences s
    where s.id = p_sentence
      and (
        public.is_staff()
        or (
          s.status = 'published'
          and (
            public.has_premium()
            or s.unit_id = any (public.free_unit_ids())
            or exists (select 1 from public.unit_phrases p where p.sentence_id = s.id)
            or exists (
              select 1 from public.sentence_states ss
              where ss.sentence_id = s.id and ss.user_id = auth.uid()
            )
          )
        )
      )
  );
$$;

revoke all on function public.can_read_sentence(uuid) from public, anon;
grant execute on function public.can_read_sentence(uuid) to authenticated;

alter policy "sentence_states: owner insert" on public.sentence_states
  with check (user_id = (select auth.uid()) and public.can_read_sentence(sentence_id));

alter policy "sentence_states: owner update" on public.sentence_states
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.can_read_sentence(sentence_id));
