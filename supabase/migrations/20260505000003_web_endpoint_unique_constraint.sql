-- PostgREST's onConflict inference doesn't accept partial unique indexes.
-- Replace with a plain UNIQUE constraint on web_push_endpoint. Postgres
-- allows multiple NULLs in a UNIQUE column, so the rows where the channel
-- is Expo (and web_push_endpoint is NULL) coexist fine.

drop index if exists public.push_subs_web_endpoint_uniq;

alter table public.push_subscriptions
  add constraint push_subs_web_endpoint_unique unique (web_push_endpoint);
