-- Cache writes cost 1.25x input and were not logged, so the cost per chat
-- read low and a cache that never hits looked the same as one that does.
alter table public.hablar_usage add column if not exists cache_write_tokens int;
