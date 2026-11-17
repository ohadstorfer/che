-- Bounces and complaints from Amazon SES (functions/ses-events, fed by SNS).
-- SES's own account-level suppression list already stops mail to these
-- addresses; this keeps our own record and opts the matching user out of
-- win-back mail, so we stop trying at all.

create table if not exists public.email_suppressions (
  email      text primary key,
  reason     text not null check (reason in ('bounce', 'complaint')),
  detail     jsonb,
  created_at timestamptz not null default now()
);

alter table public.email_suppressions enable row level security;
-- No policies: only ses-events, as the service role.

alter table public.email_optouts drop constraint if exists email_optouts_source_check;
alter table public.email_optouts
  add constraint email_optouts_source_check check (source in ('link', 'one-click', 'bounce', 'complaint'));

create or replace function public.ses_suppress(p_email text, p_reason text, p_detail jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.email_suppressions (email, reason, detail)
  values (lower(p_email), p_reason, p_detail)
  on conflict (email) do update
    set reason = case when excluded.reason = 'complaint' then 'complaint' else public.email_suppressions.reason end,
        detail = excluded.detail;

  insert into public.email_optouts (user_id, source)
  select u.id, p_reason from auth.users u where lower(u.email) = lower(p_email)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ses_suppress(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.ses_suppress(text, text, jsonb) to service_role;
