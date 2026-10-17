-- A phone's push row moves to a new account only with the phone's word for it.
--
-- claim_push_device (20261014000005) moved a row to whoever named its Expo
-- token, so anyone who learned a token could take that phone's reminders over.
-- Now each install keeps a random secret of its own (lib/native-push), sends it
-- with the claim, and the row keeps its hash. A row moves to another account
-- only when the secret matches.
--
-- Rows written before the secret existed carry no hash, and they still move on
-- the token alone; the first claim with a secret seals them. Builds without
-- the secret call the same function with four arguments and keep working.
--
-- And the partner policies go: a linked partner could read the other's token
-- and rewrite any column of the row, token and owner included. Partner
-- reminders run through sync_partner_reminder, which is security definer and
-- writes only reminder_time and notifications_enabled; the app never touched
-- the other's rows directly.

alter table public.push_subscriptions add column if not exists device_secret_hash text;

comment on column public.push_subscriptions.device_secret_hash is
  'SHA-256 (hex) of the secret the app keeps on this install. The row moves to another account only with it (claim_push_device).';

drop function if exists public.claim_push_device(text, text, text, text);

create or replace function public.claim_push_device(
  p_token text,
  p_platform text,
  p_timezone text,
  p_reminder_time text,
  p_device_secret text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  proof text := case
    when p_device_secret is null or length(p_device_secret) < 16 then null
    else encode(sha256(convert_to(p_device_secret, 'UTF8')), 'hex')
  end;
  row_owner uuid;
  row_hash text;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_token is null or p_token = '' then
    raise exception 'no push token';
  end if;

  select user_id, device_secret_hash into row_owner, row_hash
  from public.push_subscriptions
  where expo_push_token = p_token
  for update;

  if not found then
    insert into public.push_subscriptions
      (user_id, platform, expo_push_token, reminder_time, timezone, notifications_enabled, device_secret_hash)
    values (uid, p_platform, p_token, p_reminder_time, p_timezone, true, proof)
    on conflict (expo_push_token) do nothing;
    if found then
      return;
    end if;
    -- Another claim wrote it in between: read it and go on as below.
    select user_id, device_secret_hash into row_owner, row_hash
    from public.push_subscriptions
    where expo_push_token = p_token
    for update;
  end if;

  -- Someone else's phone row: it moves only with this install's secret, or
  -- on the token alone while the row has no secret yet.
  if row_owner <> uid and row_hash is not null and row_hash is distinct from proof then
    raise exception 'this device is registered to another account'
      using errcode = '42501';
  end if;

  update public.push_subscriptions
  set user_id = uid,
      platform = p_platform,
      reminder_time = p_reminder_time,
      timezone = p_timezone,
      notifications_enabled = true,
      device_secret_hash = coalesce(proof, row_hash)
  where expo_push_token = p_token;
end;
$$;

revoke all on function public.claim_push_device(text, text, text, text, text) from public, anon;
grant execute on function public.claim_push_device(text, text, text, text, text) to authenticated;

drop policy if exists "push: partner read" on public.push_subscriptions;
drop policy if exists "push: partner update" on public.push_subscriptions;

-- Revoked from public only when it was written; anon kept the default grant.
-- It refuses a null auth.uid() anyway, but anon has no business calling it.
revoke all on function public.sync_partner_reminder(text, boolean) from anon;
