-- The onboarding's creator-code step ("Did a creator send you here?",
-- migration 20261107000020) is a step like the others in onboarding_steps.
alter table public.onboarding_steps drop constraint if exists onboarding_steps_step_check;
alter table public.onboarding_steps add constraint onboarding_steps_step_check check (step in (
  'welcome', 'name', 'level', 'why', 'try', 'struggle', 'achieve', 'goal',
  'notify', 'code', 'building', 'pledge', 'account', 'ready'));
