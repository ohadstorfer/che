-- Blind model test: an admin's chat runs on a Claude model picked at start
-- (hablar-start), kept here so every call of that chat uses the same one.
-- Null for everyone else, who get the default model.
alter table public.conversations add column if not exists model text;
