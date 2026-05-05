-- Schedule the reminder cron via pg_cron + pg_net.
--
-- Before applying this migration, set these as Postgres custom settings
-- (Dashboard → Database → Settings → Custom Postgres Config, or via SQL):
--
--   alter database postgres set app.functions_url    = 'https://qbzjaseetusewxnfgpes.supabase.co/functions/v1';
--   alter database postgres set app.cron_secret      = '<random-string-also-set-in-edge-fn-env>';
--
-- The cron secret is verified by the send-reminder function so random
-- internet traffic can't trigger pushes.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Idempotent re-schedule
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
    url     := current_setting('app.functions_url') || '/send-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
