-- Practice units stop reviewing words that left the course (map round 2).
update public.units u
set review_form_ids = (select coalesce(array_agg(x order by ord), '{}') from unnest(u.review_form_ids) with ordinality as t(x, ord)
                       where exists (select 1 from public.forms f where f.id = x and f.status = 'published')),
    updated_at = now()
where u.status = 'published' and exists (select 1 from unnest(u.review_form_ids) x join public.forms f on f.id = x where f.status <> 'published');
