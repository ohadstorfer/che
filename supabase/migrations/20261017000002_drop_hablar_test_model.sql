-- The blind model test is over (Sonnet stays): its column goes.
alter table public.conversations drop column if exists model;
