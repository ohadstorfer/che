-- Word glosses that follow from the content review: "sale / salen" teach the price question first,
-- "me queda" is also how clothes fit, "se picó" is about a situation heating up, and "hacen" stands on its own
-- ("¿Hacen envíos?").
update public.forms set gloss_en = 'costs; goes out' where id = '4d665f57-895a-5e72-80e4-54457b571281' and gloss_en = 'goes out (he/she goes out)';
update public.forms set gloss_en = 'cost; they go out' where id = 'f371fb20-020d-5f9b-b007-b04755836a31' and gloss_en = 'they go out';
update public.forms set gloss_en = 'fits me; is (for me)' where id = '6e887719-65ff-5fab-a30d-d51e19ed17f7' and gloss_en = 'is (for me)';
update public.forms set gloss_en = 'choose, pick; I chose' where id = 'd62bef24-448d-5439-8577-799d1255cce4' and gloss_en = 'choose, pick';
update public.forms set gloss_en = 'the one (in, from, with); someone''s' where id = '42bada3b-2109-5b62-afa9-fabd5f49e9c1' and gloss_en is null;
update public.forms set gloss_en = 'they do, they make', bound = false where id = '363d39eb-9204-59ac-a36e-ee5ee082c9e6';
update public.forms set gloss_en = 'it got heated; he got touchy' where id = '3ae4473f-dd8f-5eb7-ae2d-c635faa58e7f' and gloss_en = 'he got touchy, she got touchy';
