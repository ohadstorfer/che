------------------------------------------------------------
-- reminder_learners also returns recoverable_streak: on a comeback day, after
-- one round, the evening save goes out for the run still waiting to be bought
-- back (reminder-policy.ts). The return type changes, so drop and recreate.
------------------------------------------------------------
drop function if exists public.reminder_learners();

create or replace function public.reminder_learners()
returns table (
  user_id               uuid,
  anchor_at             timestamptz,
  current_streak        int,
  recoverable_streak    int,
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
    coalesce(s.recoverable_streak, 0),
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
