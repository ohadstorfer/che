-- Hablar: staff (reviewers, admins) talk to Tomás with no 5-minute clock and
-- no one-chat-a-day limit, for testing. The flag is set by hablar-start from
-- profiles.role; the daily limit now only binds chats without it.

alter table public.conversations add column unlimited boolean not null default false;

alter table public.conversations drop constraint conversations_user_id_local_date_key;
create unique index conversations_one_per_day
  on public.conversations (user_id, local_date) where not unlimited;
