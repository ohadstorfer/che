-- A phone has one Expo push token, and its reminders belong to whoever is
-- signed in on it now. The owner-only policies can't hand the row from one
-- account to the next (a second account on the same phone, a guest who signs
-- in to her older account): the upsert hit the other account's row, RLS
-- refused it, and the phone stayed subscribed to the account before. This
-- moves the row to the caller. Called by enableNativePush (lib/native-push).

create or replace function public.claim_push_device(
  p_token text,
  p_platform text,
  p_timezone text,
  p_reminder_time text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  insert into public.push_subscriptions (user_id, platform, expo_push_token, reminder_time, timezone, notifications_enabled)
  values (auth.uid(), p_platform, p_token, p_reminder_time, p_timezone, true)
  on conflict (expo_push_token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        reminder_time = excluded.reminder_time,
        timezone = excluded.timezone,
        notifications_enabled = true;
end;
$$;

revoke all on function public.claim_push_device(text, text, text, text) from public, anon;
grant execute on function public.claim_push_device(text, text, text, text) to authenticated;
