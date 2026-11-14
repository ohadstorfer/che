-- Instagram through the Graph API can't be scheduled, so social-queue publishes
-- each Instagram slot at its time: 09:00, 13:00 and 19:00 Argentina time
-- (12, 16, 22 UTC), with a second try half an hour later. Does nothing until
-- the function has IG_USER_ID.

select cron.schedule(
  'che-social-ig',
  '2,32 12,16,22 * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/social-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{"publishDue": true}'::jsonb,
    timeout_milliseconds := 150000
  );
  $cron$
);
