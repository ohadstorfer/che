-- The AI bill, watched: functions/cost-alert, once an hour from pg_cron, sums
-- today's and yesterday's Claude and ElevenLabs calls (hablar_usage) and mails
-- ALERT_EMAIL when a day passes ALERT_DAILY_COST_USD (default US$5).
--
--   hablar_usage_totals(from, to)  the day's calls, summed per provider,
--                                  model and stage (priced in the function)
--   ops_alerts                     one row per alert sent: (kind, day) is the
--                                  key, so a day's alert goes once
--
-- Service role only.

create or replace function public.hablar_usage_totals(p_from timestamptz, p_to timestamptz)
returns table (
  provider           text,
  model              text,
  stage              text,
  calls              bigint,
  input_tokens       bigint,
  output_tokens      bigint,
  cache_read_tokens  bigint,
  cache_write_tokens bigint,
  audio_seconds      double precision,
  tts_chars          bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.provider,
    u.model,
    u.stage,
    count(*),
    coalesce(sum(u.input_tokens), 0),
    coalesce(sum(u.output_tokens), 0),
    coalesce(sum(u.cache_read_tokens), 0),
    coalesce(sum(u.cache_write_tokens), 0),
    coalesce(sum(u.audio_seconds), 0),
    coalesce(sum(u.tts_chars), 0)
  from public.hablar_usage u
  where u.created_at >= p_from and u.created_at < p_to
  group by u.provider, u.model, u.stage;
$$;

revoke all on function public.hablar_usage_totals(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.hablar_usage_totals(timestamptz, timestamptz) to service_role;

create table if not exists public.ops_alerts (
  kind    text not null,
  day     date not null,
  value   numeric,
  sent_at timestamptz not null default now(),
  primary key (kind, day)
);

alter table public.ops_alerts enable row level security;
-- No policies: only cost-alert, as the service role.

-- Once an hour, at :41 (clear of send-reminder's quarter hours and
-- winback-email's :23).
do $$
declare
  v_jobid bigint;
begin
  for v_jobid in select j.jobid from cron.job j where j.jobname = 'che-cost-alert' loop
    perform cron.unschedule(v_jobid);
  end loop;
end $$;

select cron.schedule(
  'che-cost-alert',
  '41 * * * *',
  $cron$
  select net.http_post(
    url     := (select decrypted_secret::text from vault.decrypted_secrets where name = 'functions_url') || '/cost-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret::text from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
