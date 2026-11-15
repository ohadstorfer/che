-- 2026-11-06: one post of each kind a day (social-queue's SLOTS), and new kinds come
-- (versus-es, versus-mx, versus-tour, ...): any slug is a kind now.
alter table public.social_items drop constraint if exists social_items_kind_check;
alter table public.social_items add constraint social_items_kind_check check (kind ~ '^[a-z0-9-]+$');

-- Slots sit at any hour now, so Instagram's publishDue runs every half hour
-- (it only publishes slots that are due and not posted yet).
select cron.alter_job(jobid, schedule := '2,32 * * * *') from cron.job where jobname = 'che-social-ig';
