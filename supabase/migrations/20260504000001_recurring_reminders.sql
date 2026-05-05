-- Recurring reminders: every ~30 min from the user's reminder_time until
-- they finish today's class (i.e. streaks.last_practice_date becomes today).
-- The send-reminder edge function now gates on these two columns instead of
-- the old per-day last_sent_date.

alter table public.push_subscriptions
  add column if not exists last_sent_at    timestamptz,
  add column if not exists last_text_index int not null default -1;
