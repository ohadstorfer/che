-- Whether "Skip the class" shows under "Let's go" on the first class's opener
-- in onboarding (first-class-opener.tsx). Flipped from the dashboard, no app
-- update; onboarding.tsx reads it once, with the anon key. true = shown, false = hidden (the
-- default since 2026-11-18, and what the app falls back to when it can't read this).
insert into public.app_config (key, value)
values ('first_class_skip', 'false'::jsonb)
on conflict (key) do nothing;
