-- X (Twitter) took Instagram's place in Buffer on 2026-11-05.
alter table public.social_posts drop constraint if exists social_posts_channel_check;
alter table public.social_posts add constraint social_posts_channel_check
  check (channel in ('instagram', 'tiktok', 'youtube', 'facebook', 'twitter'));
