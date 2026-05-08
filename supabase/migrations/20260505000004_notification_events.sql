-- Debug log table for the send-reminder pipeline. Inserts come from the
-- edge function (service_role). RLS-locked to service_role only; query from
-- the Supabase Dashboard SQL editor.

create table public.notification_events (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  trace_id    text,
  kind        text not null,
  user_id     uuid,
  sub_id      uuid,
  detail      jsonb
);

create index notification_events_created_at_idx
  on public.notification_events (created_at desc);

create index notification_events_user_id_idx
  on public.notification_events (user_id, created_at desc)
  where user_id is not null;

alter table public.notification_events enable row level security;
-- No policies → only service_role (and direct postgres) can read/write.
