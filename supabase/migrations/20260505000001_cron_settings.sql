-- Wire pg_cron → send-reminder using Supabase Vault. Avoids `alter database`
-- (which requires superuser on Supabase) and keeps the secret out of git:
-- the cron_secret is generated in-DB on first run.

create extension if not exists supabase_vault;

-- Functions URL (not a secret, but vault is the cleanest store on Supabase).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'functions_url') then
    perform vault.create_secret(
      'https://qbzjaseetusewxnfgpes.supabase.co/functions/v1',
      'functions_url',
      'send-reminder edge function base URL'
    );
  end if;
end $$;

-- Cron shared secret. Generated in-DB so it never appears in source files.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    perform vault.create_secret(
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      'cron_secret',
      'pg_cron → send-reminder shared bearer'
    );
  end if;
end $$;

-- Edge function reads this via service_role to compare against incoming Auth.
create or replace function public.get_cron_secret()
returns text
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret::text
  from vault.decrypted_secrets
  where name = 'cron_secret';
$$;

revoke all on function public.get_cron_secret() from public;
grant execute on function public.get_cron_secret() to service_role;

-- Re-schedule the cron job to pull URL + secret from vault.
do $$
declare
  v_jobid bigint;
begin
  for v_jobid in
    select j.jobid from cron.job j where j.jobname = 'che-send-reminders'
  loop
    perform cron.unschedule(v_jobid);
  end loop;
end $$;

select cron.schedule(
  'che-send-reminders',
  '*/15 * * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/send-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
