-- ---------------------------------------------------------------------------
-- Smart reminders.
--
-- send-reminder used to nudge every device every ~30 minutes from 08:00 until
-- the learner practised, every day, for ever. It now decides per learner
-- (supabase/functions/_shared/reminder-policy.ts): one reminder around the
-- time she practised last, one in the evening if a live streak is about to
-- freeze, fewer as the days away add up, then nothing.
--
-- That needs a memory of what each learner was sent, and of which templates
-- she could have been sent instead, so the words can be chosen by what was
-- followed by a round.
-- ---------------------------------------------------------------------------

create table public.notification_sends (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  sent_at    timestamptz not null default now(),
  -- Her date when it was sent: "already had today's" is a local question.
  local_date date not null,
  slot       text not null check (slot in ('routine', 'save')),
  template   text not null,
  eligible   text[] not null
);

create index notification_sends_user_idx on public.notification_sends (user_id, sent_at desc);
create index notification_sends_sent_at_idx on public.notification_sends (sent_at);

comment on table public.notification_sends is
  'One row per reminder per learner (not per device). eligible = every template that could have been picked.';

alter table public.notification_sends enable row level security;
-- No policies → only service_role (and direct postgres) can read/write.

------------------------------------------------------------
-- reminder_learners: everything the policy needs to know about each learner
-- with reminders on, one row each, ordered so it can be read in pages.
------------------------------------------------------------
create or replace function public.reminder_learners()
returns table (
  user_id               uuid,
  anchor_at             timestamptz,
  current_streak        int,
  last_practice_date    date,
  last_completed_at     timestamptz,
  last_round_started_at timestamptz,
  recent                jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.user_id,
    u.anchor_at,
    coalesce(s.current_streak, 0),
    s.last_practice_date,
    (select max(d.completed_at) from public.daily_sessions d where d.user_id = u.user_id),
    (select max(r.started_at) from public.rounds r where r.user_id = u.user_id),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'template', n.template, 'slot', n.slot, 'sent_at', n.sent_at, 'local_date', n.local_date
      ))
      from public.notification_sends n
      where n.user_id = u.user_id and n.sent_at > now() - interval '45 days'
    ), '[]'::jsonb)
  from (
    select p.user_id, min(p.created_at) as anchor_at
    from public.push_subscriptions p
    where p.notifications_enabled
    group by p.user_id
  ) u
  left join public.streaks s on s.user_id = u.user_id
  order by u.user_id;
$$;

revoke all on function public.reminder_learners() from public, anon, authenticated;
grant execute on function public.reminder_learners() to service_role;

------------------------------------------------------------
-- reminder_template_stats: per template, how often a round followed within
-- two hours when it was the one sent (chosen) and when it was eligible but
-- another was sent (passed). daily_sessions.completed_at is the first round
-- finished that day, and a reminder only goes to someone who hasn't finished
-- one yet, so it is exactly "the round this reminder may have caused".
-- Sends from the last two hours are left out: their answer isn't in yet.
------------------------------------------------------------
create or replace function public.reminder_template_stats()
returns table (template text, chosen int, chosen_won int, passed int, passed_won int)
language sql
stable
security definer
set search_path = public
as $$
  with sends as (
    select
      n.template,
      n.eligible,
      exists (
        select 1 from public.daily_sessions d
        where d.user_id = n.user_id
          and d.completed_at > n.sent_at
          and d.completed_at <= n.sent_at + interval '2 hours'
      ) as won
    from public.notification_sends n
    where n.sent_at > now() - interval '90 days'
      and n.sent_at < now() - interval '2 hours'
  )
  select
    e.template,
    (count(*) filter (where e.template = sends.template))::int,
    (count(*) filter (where e.template = sends.template and sends.won))::int,
    (count(*) filter (where e.template <> sends.template))::int,
    (count(*) filter (where e.template <> sends.template and sends.won))::int
  from sends
  cross join lateral unnest(sends.eligible) as e(template)
  group by e.template;
$$;

revoke all on function public.reminder_template_stats() from public, anon, authenticated;
grant execute on function public.reminder_template_stats() to service_role;

-- The stats look back 90 days; nothing older is read.
select cron.schedule(
  'posta-notification-sends-retention',
  '29 4 * * *',
  $cron$ delete from public.notification_sends where sent_at < now() - interval '120 days' $cron$
);
