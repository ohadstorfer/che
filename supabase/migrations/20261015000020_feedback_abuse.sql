-- The feedback chat, closed to abuse (security review, 2026-10-15).
--
--  · Each message pushes once. feedback-notify claims `notified_at` before it
--    sends, so asking again for the same message sends nothing; before, one
--    message could be pushed to every admin's phone again and again for ten
--    minutes.
--  · A tester writes at most 30 messages an hour and 200 a day. Staff replies
--    are not counted.
--  · Screenshots: images only, 10 MB at most, only while the bubble is open
--    to her, and 30 an hour. Before, any account could upload any file of
--    any size, feedback open or not.
--  · feedback_open() is no longer callable without signing in. The insert
--    policy still calls it as the signed-in user, so `authenticated` keeps it.

alter table public.feedback_messages add column if not exists notified_at timestamptz;

comment on column public.feedback_messages.notified_at is
  'When feedback-notify pushed this message. Set once; a second ask sends nothing.';

create or replace function public.feedback_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.from_staff then
    return new;
  end if;
  if (select count(*) from public.feedback_messages
      where author_id = new.author_id and not from_staff and created_at > now() - interval '1 hour') >= 30
  or (select count(*) from public.feedback_messages
      where author_id = new.author_id and not from_staff and created_at > now() - interval '1 day') >= 200 then
    raise exception 'Too many messages for now. Try again in a little while.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists feedback_rate_limit on public.feedback_messages;
create trigger feedback_rate_limit
  before insert on public.feedback_messages
  for each row execute function public.feedback_rate_limit();

create index if not exists feedback_messages_author_idx on public.feedback_messages (author_id, created_at);

update storage.buckets
set file_size_limit = 10 * 1024 * 1024,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id = 'feedback';

-- Whether she may upload a screenshot now: the bubble is open to her and she
-- hasn't sent 30 in the last hour.
create or replace function public.feedback_upload_ok()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.feedback_open(auth.uid())
    and (select count(*) from storage.objects o
         where o.bucket_id = 'feedback'
           and (storage.foldername(o.name))[1] = auth.uid()::text
           and o.created_at > now() - interval '1 hour') < 30;
$$;

revoke all on function public.feedback_upload_ok() from public, anon;
grant execute on function public.feedback_upload_ok() to authenticated;

drop policy if exists "feedback: own upload" on storage.objects;
create policy "feedback: own upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'feedback'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.feedback_upload_ok()
  );

revoke execute on function public.feedback_open(uuid) from public, anon;
grant execute on function public.feedback_open(uuid) to authenticated;
