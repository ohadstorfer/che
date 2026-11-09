-- Free guides for comment-to-DM posts ("comment GUIDE and I'll send it to you").
--
-- guide_leads: emails left on postaspanish.com/free/<guide> (functions/free-guide,
--   which also mails the PDF). One row per email and guide.
-- comment_dms: every comment that matched a keyword on Instagram or Facebook and
--   got (or failed to get) a private reply from functions/meta-comments. The
--   comment id is the key, so a webhook Meta sends twice gets one DM.
-- Both are written with the service role only: RLS on, no policies.

create table if not exists public.guide_leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null check (char_length(email) between 5 and 200),
  guide text not null check (guide in ('slang', 'vos', 'learn')),
  source text check (char_length(source) <= 120),
  user_agent text,
  emailed_at timestamptz
);
create unique index if not exists guide_leads_email_guide_key on public.guide_leads (lower(email), guide);
alter table public.guide_leads enable row level security;
comment on table public.guide_leads is
  'Emails left on postaspanish.com/free/* to unlock a free guide. Written only by the free-guide edge function.';

create table if not exists public.comment_dms (
  comment_id text primary key,
  created_at timestamptz not null default now(),
  platform text not null check (platform in ('instagram', 'facebook')),
  media_id text,
  from_id text,
  from_name text,
  comment text,
  keyword text not null,
  guide text not null,
  dm_ok boolean,
  reply_ok boolean,
  error text
);
create index if not exists comment_dms_created_at on public.comment_dms (created_at desc);
alter table public.comment_dms enable row level security;
comment on table public.comment_dms is
  'Keyword comments on Posta posts and the DM each one got. Written only by the meta-comments edge function.';
