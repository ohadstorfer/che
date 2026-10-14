-- ---------------------------------------------------------------------------
-- Feedback: a chat between each tester and the team.
--
-- A floating bubble over the whole app (components/feedback.tsx) opens a
-- sheet where a tester writes what happened, with a screenshot of the screen
-- she was on, and reads the team's replies. One continuous thread per user;
-- the team answers from /admin/feedback.
--
-- Who sees the bubble is one switch (feedback_settings.mode):
--   off       nobody
--   everyone  every user, signed in or not (the testing round, before launch)
--   testers   only users on feedback_testers
-- Anyone who writes while it is 'everyone' is put on feedback_testers by
-- the insert trigger, so the people from the testing round keep the bubble
-- once the store launch turns it to 'testers'. Staff add and remove testers
-- by hand too.
--
-- Screenshots live in the private `feedback` bucket under <user id>/…, read
-- back through signed URLs. The pushes (a new message to the admins, a reply
-- to the tester) go out from the `feedback-notify` edge function.
-- ---------------------------------------------------------------------------

create table public.feedback_settings (
  id         boolean primary key default true check (id),
  mode       text not null default 'off' check (mode in ('off', 'everyone', 'testers')),
  updated_at timestamptz not null default now()
);

-- The testing round starts on: the app isn't in the stores yet.
insert into public.feedback_settings (mode) values ('everyone');

alter table public.feedback_settings enable row level security;

create policy "feedback settings: anyone reads" on public.feedback_settings for select using (true);
create policy "feedback settings: staff write" on public.feedback_settings for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

------------------------------------------------------------
create table public.feedback_testers (
  user_id    uuid primary key references auth.users on delete cascade,
  -- 'auto': wrote while the bubble was open to everyone; 'admin': added by hand.
  source     text not null check (source in ('auto', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.feedback_testers enable row level security;

create policy "feedback testers: own or staff read" on public.feedback_testers for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy "feedback testers: staff add" on public.feedback_testers for insert to authenticated
  with check (public.is_staff());
create policy "feedback testers: staff remove" on public.feedback_testers for delete to authenticated
  using (public.is_staff());

------------------------------------------------------------
-- Messages. `user_id` is whose thread it is (the tester), `author_id` who
-- wrote it: the tester herself, or a member of staff when `from_staff`.
create table public.feedback_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  author_id  uuid default auth.uid() references auth.users on delete set null,
  from_staff boolean not null default false,
  body       text not null default '' check (char_length(body) <= 4000),
  -- Storage paths in the `feedback` bucket.
  images     text[] not null default '{}' check (cardinality(images) <= 4),
  -- Where she was when she wrote: route, app version, device, OS.
  context    jsonb,
  created_at timestamptz not null default now(),
  check (btrim(body) <> '' or cardinality(images) > 0)
);

create index feedback_messages_thread_idx on public.feedback_messages (user_id, created_at);

alter table public.feedback_messages enable row level security;

-- Whether the bubble is open to this user right now.
create or replace function public.feedback_open(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case s.mode
    when 'everyone' then true
    when 'testers' then uid is not null and exists (select 1 from public.feedback_testers t where t.user_id = uid)
    else false
  end
  from public.feedback_settings s;
$$;

create policy "feedback: own thread or staff read" on public.feedback_messages for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy "feedback: tester writes her own" on public.feedback_messages for insert to authenticated
  with check (
    user_id = auth.uid() and author_id = auth.uid() and not from_staff and public.feedback_open(auth.uid())
  );
create policy "feedback: staff reply" on public.feedback_messages for insert to authenticated
  with check (from_staff and author_id = auth.uid() and public.is_staff());

------------------------------------------------------------
-- One row per thread, kept by the trigger below: what the inbox lists, and
-- when each side last read it (for the unread dot and the inbox count).
create table public.feedback_threads (
  user_id         uuid primary key references auth.users on delete cascade,
  last_message_at timestamptz not null,
  last_from_staff boolean not null,
  preview         text not null default '',
  user_read_at    timestamptz,
  staff_read_at   timestamptz
);

alter table public.feedback_threads enable row level security;

create policy "feedback threads: own or staff read" on public.feedback_threads for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
-- No write policies: only the trigger and the read functions touch it.

create or replace function public.feedback_message_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  preview text := case when btrim(new.body) <> '' then left(btrim(new.body), 140) else '📷 Screenshot' end;
begin
  insert into public.feedback_threads as t (user_id, last_message_at, last_from_staff, preview, user_read_at, staff_read_at)
  values (
    new.user_id, new.created_at, new.from_staff, preview,
    case when new.from_staff then null else new.created_at end,
    case when new.from_staff then new.created_at else null end
  )
  on conflict (user_id) do update set
    last_message_at = excluded.last_message_at,
    last_from_staff = excluded.last_from_staff,
    preview = excluded.preview,
    -- Whoever writes has read everything before it.
    user_read_at = case when new.from_staff then t.user_read_at else new.created_at end,
    staff_read_at = case when new.from_staff then new.created_at else t.staff_read_at end;

  if not new.from_staff and (select mode from public.feedback_settings) = 'everyone' then
    insert into public.feedback_testers (user_id, source) values (new.user_id, 'auto')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger feedback_message_added
  after insert on public.feedback_messages
  for each row execute function public.feedback_message_added();

------------------------------------------------------------
-- The bubble's one question, also asked before there is an account (the
-- start of onboarding): is it open, and how many replies are unread.
create or replace function public.feedback_access()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'open', public.feedback_open(auth.uid()),
    'unread', (
      select count(*) from public.feedback_messages m
      left join public.feedback_threads t on t.user_id = m.user_id
      where m.user_id = auth.uid() and m.from_staff
        and (t.user_read_at is null or m.created_at > t.user_read_at)
    )
  );
$$;

create or replace function public.feedback_mark_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.feedback_threads set user_read_at = now() where user_id = auth.uid();
$$;

create or replace function public.feedback_mark_read_staff(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  update public.feedback_threads set staff_read_at = now() where user_id = p_user;
end;
$$;

-- The admin inbox: every thread, newest first, with who it is.
create or replace function public.feedback_inbox()
returns table (
  user_id         uuid,
  name            text,
  email           text,
  anonymous       boolean,
  tester          boolean,
  last_message_at timestamptz,
  last_from_staff boolean,
  preview         text,
  unread          int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  return query
    select
      t.user_id,
      nullif(p.display_name, ''),
      u.email::text,
      coalesce(u.is_anonymous, false),
      exists (select 1 from public.feedback_testers ft where ft.user_id = t.user_id),
      t.last_message_at,
      t.last_from_staff,
      t.preview,
      (select count(*)::int from public.feedback_messages m
        where m.user_id = t.user_id and not m.from_staff
          and (t.staff_read_at is null or m.created_at > t.staff_read_at))
    from public.feedback_threads t
    join auth.users u on u.id = t.user_id
    left join public.profiles p on p.user_id = t.user_id
    order by t.last_message_at desc;
end;
$$;

-- Testers, or (with a search) any user by email, name or id, so staff can
-- add someone who hasn't written yet.
create or replace function public.feedback_people(q text default null)
returns table (
  user_id   uuid,
  name      text,
  email     text,
  anonymous boolean,
  tester    text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  return query
    select u.id, nullif(p.display_name, ''), u.email::text, coalesce(u.is_anonymous, false), ft.source
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    left join public.feedback_testers ft on ft.user_id = u.id
    where case
      when nullif(btrim(q), '') is null then ft.user_id is not null
      else u.email ilike '%' || btrim(q) || '%'
        or p.display_name ilike '%' || btrim(q) || '%'
        or u.id::text = btrim(q)
    end
    order by ft.created_at desc nulls last, u.email
    limit 50;
end;
$$;

grant execute on function public.feedback_access() to anon, authenticated;
grant execute on function public.feedback_mark_read() to authenticated;
grant execute on function public.feedback_mark_read_staff(uuid) to authenticated;
grant execute on function public.feedback_inbox() to authenticated;
grant execute on function public.feedback_people(text) to authenticated;

------------------------------------------------------------
-- Screenshots: private, each user writes under her own id; staff read all.
insert into storage.buckets (id, name, public)
values ('feedback', 'feedback', false)
on conflict (id) do nothing;

create policy "feedback: own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'feedback' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "feedback: own or staff read" on storage.objects for select to authenticated
  using (bucket_id = 'feedback' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
