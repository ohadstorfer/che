-- ---------------------------------------------------------------------------
-- Hablar: chat limits (the "Chat limits UX" canvas).
--
-- The Speaking tab: three chats a day instead of one, eight lines each (the
-- eight are counted by the functions, hablar-draft.ts). Each of the day's
-- chats takes the next of three slots; the unique (user_id, local_date,
-- day_slot) key and the 1–3 check hold the limit even if two starts race.
-- The slot is given here, by a trigger, so the function that inserts the row
-- doesn't have to (and an older hablar-start, still live while this deploys,
-- gets a slot too).
--
-- The course: a unit chat counts toward no day's limit, but it is had once.
-- Only one may be open per lesson at a time; that a finished one isn't
-- started again, and the rare safety cap on unit chats in a day, are
-- hablar-start's.
--
-- Staff chats (unlimited) take no slot, as before.
-- ---------------------------------------------------------------------------

alter table public.conversations add column day_slot smallint;

comment on column public.conversations.day_slot is
  'A Speaking-tab chat: which of the day''s three it is (1–3). Null for unit and staff chats.';

-- Under the old one-a-day key every counted chat was the only one of its day.
update public.conversations set day_slot = 1 where kind <> 'unit' and not unlimited;

alter table public.conversations add constraint conversations_day_slot_check
  check (day_slot between 1 and 3);
alter table public.conversations add constraint conversations_day_slot_needed
  check (unlimited or kind = 'unit' or day_slot is not null);

drop index public.conversations_one_per_day;
create unique index conversations_three_per_day
  on public.conversations (user_id, local_date, day_slot) where day_slot is not null;

-- Unit chats could be had again before this, so a learner may have left more
-- than one open for a lesson: the latest stays open, the others are closed the
-- way the app closes a chat left behind.
update public.conversations c set ended_at = now(), end_reason = 'time'
where c.kind = 'unit' and c.ended_at is null and not c.unlimited
  and exists (
    select 1 from public.conversations n
    where n.user_id = c.user_id and n.lesson_id = c.lesson_id and n.kind = 'unit'
      and n.ended_at is null and not n.unlimited
      and (n.started_at, n.id) > (c.started_at, c.id)
  );

create unique index conversations_one_open_unit_chat
  on public.conversations (user_id, lesson_id) where kind = 'unit' and ended_at is null and not unlimited;

-- The slot: one more than the day's highest. Two starts at once wait for each
-- other here, so the second sees the first; past the third the check refuses
-- the row (23514), which hablar-start answers with the limit.
create or replace function public.conversations_take_day_slot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.unlimited or new.kind = 'unit' then
    new.day_slot := null;
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('hablar-day:' || new.user_id::text || ':' || new.local_date::text, 0));
  select coalesce(max(c.day_slot), 0) + 1 into new.day_slot
  from public.conversations c
  where c.user_id = new.user_id and c.local_date = new.local_date and c.day_slot is not null;
  return new;
end;
$$;

create trigger conversations_take_day_slot
  before insert on public.conversations
  for each row execute function public.conversations_take_day_slot();
