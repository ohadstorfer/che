-- functions/social-queue also schedules on Posta's Facebook page, through the
-- Graph API rather than Buffer. Its rows use channel 'facebook', and
-- buffer_post_id holds the Facebook id (the reel's video id or the post's id).

alter table public.social_posts drop constraint if exists social_posts_channel_check;
alter table public.social_posts add constraint social_posts_channel_check
  check (channel in ('instagram', 'tiktok', 'youtube', 'facebook'));
