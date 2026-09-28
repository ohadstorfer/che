-- Performance audit (docs: "Posta — Performance Audit", N8 + N10).

-- N8: every read of sentence_states is by learner (her Words tab, loadSentences,
-- and RLS), but the only index is the primary key (sentence_id, user_id), which
-- can't serve a user_id filter. The table grows as learners × sentences.
create index if not exists sentence_states_user_idx
  on public.sentence_states (user_id, sentence_id);

-- N10: send-reminder logs a few debug events every 15 minutes (~700 rows a
-- day, 102k rows so far) and nothing ever removed them. Two weeks is plenty to
-- debug a missed reminder.
delete from public.notification_events where created_at < now() - interval '14 days';

select cron.schedule(
  'posta-notification-events-retention',
  '23 4 * * *',
  $cron$ delete from public.notification_events where created_at < now() - interval '14 days' $cron$
);
