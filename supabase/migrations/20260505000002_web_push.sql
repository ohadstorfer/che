-- Web Push (iOS/Android/desktop PWA) — second delivery channel alongside Expo.
-- One row per device: native devices fill expo_push_token; PWA devices fill
-- the three web_push_* columns. send-reminder branches on whichever is set.

alter table public.push_subscriptions
  alter column expo_push_token drop not null,
  add column if not exists web_push_endpoint text,
  add column if not exists web_push_p256dh   text,
  add column if not exists web_push_auth     text,
  add constraint push_subs_one_channel_chk
    check (
      (expo_push_token is not null and web_push_endpoint is null) or
      (expo_push_token is null and web_push_endpoint is not null)
    );

create unique index if not exists push_subs_web_endpoint_uniq
  on public.push_subscriptions (web_push_endpoint)
  where web_push_endpoint is not null;
