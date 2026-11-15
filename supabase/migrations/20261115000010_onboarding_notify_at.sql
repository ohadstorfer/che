-- Where onboarding asks for notifications, switchable from the dashboard with
-- no app update (onboarding.tsx reads it once, with the anon key):
--   "after_class"  after the first class and its day-1 streak, before the paywall (default)
--   "after_build"  right after "Building your course", before the class intro
insert into public.app_config (key, value)
values ('onboarding_notify_at', '"after_class"'::jsonb)
on conflict (key) do nothing;
