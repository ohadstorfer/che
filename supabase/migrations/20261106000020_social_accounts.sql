-- 2026-11-06: social-queue can post to more Instagram and TikTok accounts
-- (its ACCOUNTS). Their rows carry the account's slug: 'instagram:ugc-1', 'tiktok:ugc-1'.
alter table public.social_posts drop constraint if exists social_posts_channel_check;
alter table public.social_posts add constraint social_posts_channel_check
  check (channel ~ '^(instagram|tiktok|youtube|facebook|twitter)(:[a-z0-9-]+)?$');
