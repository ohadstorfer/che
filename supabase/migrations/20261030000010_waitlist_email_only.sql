-- The bio page (postaspanish.com/links) asks for an email and nothing else, so
-- a waitlist row can come without a name. The length check still holds for the
-- rows that have one (a null passes it).

alter table public.waitlist alter column name drop not null;
