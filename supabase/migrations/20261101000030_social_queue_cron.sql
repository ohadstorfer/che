-- Turns the daily social-queue run on, once a test post has gone through Buffer.

select cron.schedule(
  'che-social-queue',
  '17 6 * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/social-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $cron$
);
