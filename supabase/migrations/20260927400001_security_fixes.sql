-- Security fixes (2026-09-27 audit).

-- 1. The cron secret was readable by anyone with the anon key: `revoke ... from
--    public` leaves Supabase's default grants to anon and authenticated in place.
--    Only the edge functions (service role) may read it. The old value may have
--    leaked, so it is replaced; the cron jobs read it from the vault on every
--    run, so they pick up the new one by themselves.
revoke all on function public.get_cron_secret() from public, anon, authenticated;
grant execute on function public.get_cron_secret() to service_role;

select vault.update_secret(
  (select id from vault.secrets where name = 'cron_secret'),
  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
);

-- 4. explain-answer's daily limit: read-then-write let parallel requests all
--    pass the check. This takes a slot atomically before the model is called;
--    false means the learner is over the limit.
create or replace function public.take_explain_slot(p_user uuid, p_limit int)
returns boolean
language sql
security definer
set search_path = public
as $$
  with bumped as (
    insert into public.explain_usage as u (user_id, day, count)
    values (p_user, current_date, 1)
    on conflict (user_id, day) do update set count = u.count + 1
    where u.count < p_limit
    returning 1
  )
  select exists (select 1 from bumped);
$$;

revoke all on function public.take_explain_slot(uuid, int) from public, anon, authenticated;
grant execute on function public.take_explain_slot(uuid, int) to service_role;
