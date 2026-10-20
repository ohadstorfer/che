-- Win-back mails: a short series for people who saved their account (Apple or
-- Google) and haven't bought, on days 1, 3, 7 and 30 after saving it, the last
-- one with the 40% first-year offer. functions/winback-email sends them, once
-- an hour from pg_cron; the series itself (days, words) is in
-- functions/_shared/winback.ts.
--
--   winback_emails  one row per mail sent: (user, step) is the key, so a mail
--                   never goes twice.
--   email_optouts   who asked for no more mail (functions/email-unsubscribe,
--                   from the link in every mail or the mail app's own button).
--
-- Both go with the account (on delete cascade). Only the service role reads or
-- writes them.

create table if not exists public.winback_emails (
  user_id   uuid not null references auth.users (id) on delete cascade,
  step      smallint not null check (step in (1, 3, 7, 30)),
  email     text not null,
  resend_id text,
  sent_at   timestamptz not null default now(),
  primary key (user_id, step)
);

create table if not exists public.email_optouts (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  source     text not null default 'link' check (source in ('link', 'one-click')),
  created_at timestamptz not null default now()
);

alter table public.winback_emails enable row level security;
alter table public.email_optouts enable row level security;
-- No policies: only winback-email and email-unsubscribe, as the service role.

-- Who could get a win-back mail now: saved her account with Apple or Google in
-- the last 33 days (the day-30 mail plus some slack), has an address, has no
-- live premium, hasn't opted out and hasn't had the last mail yet. Which mail
-- is due, if any, winback.ts decides from saved_at, timezone and sent.
create or replace function public.winback_candidates()
returns table (
  user_id   uuid,
  email     text,
  name      text,
  saved_at  timestamptz,
  timezone  text,
  sent      smallint[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    coalesce(nullif(u.email, ''), i.email),
    p.display_name,
    i.saved_at,
    coalesce(ps.timezone, p.timezone, 'UTC'),
    coalesce((select array_agg(w.step order by w.step) from public.winback_emails w where w.user_id = u.id), '{}')
  from auth.users u
  join lateral (
    select min(ai.created_at) as saved_at, min(nullif(ai.email, '')) as email
    from auth.identities ai
    where ai.user_id = u.id and ai.provider in ('apple', 'google')
  ) i on i.saved_at is not null
  left join public.profiles p on p.user_id = u.id
  left join lateral (
    select s.timezone from public.push_subscriptions s
    where s.user_id = u.id
    order by s.updated_at desc
    limit 1
  ) ps on true
  where not u.is_anonymous
    and u.deleted_at is null
    and coalesce(nullif(u.email, ''), i.email) is not null
    and i.saved_at > now() - interval '33 days'
    and not public.is_premium(u.id)
    and not exists (select 1 from public.email_optouts o where o.user_id = u.id)
    and not exists (select 1 from public.winback_emails w where w.user_id = u.id and w.step = 30);
$$;

revoke all on function public.winback_candidates() from public, anon, authenticated;
grant execute on function public.winback_candidates() to service_role;

-- Once an hour, at :23 (clear of send-reminder's quarter hours). The mail goes
-- out only in the learner's daytime; winback.ts picks the hour.
do $$
declare
  v_jobid bigint;
begin
  for v_jobid in select j.jobid from cron.job j where j.jobname = 'che-winback-email' loop
    perform cron.unschedule(v_jobid);
  end loop;
end $$;

select cron.schedule(
  'che-winback-email',
  '23 * * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/winback-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $cron$
);
