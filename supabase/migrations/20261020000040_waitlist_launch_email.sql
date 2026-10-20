-- The launch mail to the waitlist (functions/launch-email) goes once per
-- person: it stamps who got it, so running it again only reaches the rest.
alter table public.waitlist
  add column if not exists launch_emailed_at timestamptz;
