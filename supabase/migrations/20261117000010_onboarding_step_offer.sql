-- The "Getting your offer ready…" beat before the paywall is tracked too, and
-- 'struggle' (already allowed) is now sent by the app, so drop-off on both shows.
alter table public.onboarding_steps drop constraint if exists onboarding_steps_step_check;
alter table public.onboarding_steps add constraint onboarding_steps_step_check check (step in (
  'welcome', 'name', 'level', 'why', 'try', 'struggle', 'achieve', 'goal',
  'notify', 'code', 'building', 'pledge', 'account', 'ready',
  'intro', 'class', 'streak', 'offer'));
