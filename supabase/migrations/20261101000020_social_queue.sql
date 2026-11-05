-- The daily posts: 1 word carousel, 1 Drake carousel and 1 reel a day on
-- Instagram and TikTok (YouTube takes only the reel). Buffer's free plan holds 10
-- scheduled posts per channel, so functions/social-queue tops each channel up
-- once a day from pg_cron. Approved content comes from social/approved
-- (social/publish-approved.mjs), its files live on S3 (posta-audio/social/).
--
--   social_items   what can be posted; active = false keeps it out of the rotation
--   social_plan    which item goes out on which day, so every channel posts the same one
--   social_posts   what went to Buffer: (channel, due_at) is the key, so a slot fills once
--
-- Only the service role reads or writes them.

create table if not exists public.social_items (
  id         text primary key,
  kind       text not null check (kind in ('words', 'drake', 'reel')),
  title      text not null,
  captions   text[] not null,
  yt_title   text,
  media      text[] not null,
  position   integer not null,
  active     boolean not null default true,
  score      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.social_plan (
  day     date not null,
  kind    text not null,
  item_id text not null references public.social_items (id),
  primary key (day, kind)
);

create table if not exists public.social_posts (
  channel        text not null check (channel in ('instagram', 'tiktok', 'youtube')),
  due_at         timestamptz not null,
  item_id        text not null references public.social_items (id),
  buffer_post_id text not null unique,
  score          integer not null default 0,
  created_at     timestamptz not null default now(),
  primary key (channel, due_at)
);

alter table public.social_items enable row level security;
alter table public.social_plan enable row level security;
alter table public.social_posts enable row level security;
-- No policies: only social-queue and publish-approved.mjs, as the service role.
