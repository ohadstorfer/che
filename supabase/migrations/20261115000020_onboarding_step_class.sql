-- The trial class inside onboarding (intro → class → streak) is tracked in
-- onboarding_steps too, so drop-off during the class shows up.
alter table public.onboarding_steps drop constraint if exists onboarding_steps_step_check;
alter table public.onboarding_steps add constraint onboarding_steps_step_check check (step in (
  'welcome', 'name', 'level', 'why', 'try', 'struggle', 'achieve', 'goal',
  'notify', 'code', 'building', 'pledge', 'account', 'ready',
  'intro', 'class', 'streak'));
