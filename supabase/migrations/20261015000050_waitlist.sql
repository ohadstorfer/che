-- The postaspanish.com waitlist, which Netlify Forms kept until the site moved
-- to AWS. The site posts { name, contact } to the waitlist edge function,
-- which writes here with the service role. RLS is on with no policies, so the
-- anon and signed-in keys can neither read nor write it.

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  contact text not null check (char_length(contact) between 3 and 200),
  user_agent text
);

alter table public.waitlist enable row level security;

create unique index if not exists waitlist_contact_key on public.waitlist (lower(contact));

comment on table public.waitlist is
  'Pre-launch sign-ups from postaspanish.com (an email or a phone number). Written only by the waitlist edge function.';
