-- RLS policies called is_staff() and auth.uid() bare, so Postgres ran them
-- once per row. On sentences (~60k rows, most not published) a learner's
-- page of 1,000 took ~9s and hit the statement timeout. Wrapped in a scalar
-- subquery they run once per statement (an InitPlan) — same rules, same
-- results, one call. Rewrites every public policy in place.

do $$
declare
  p record;
  q text;
  c text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') ~ '(is_staff|auth\.uid)\(\)'
        or coalesce(with_check, '') ~ '(is_staff|auth\.uid)\(\)')
  loop
    q := regexp_replace(regexp_replace(p.qual, 'auth\.uid\(\)', '(select auth.uid())', 'g'),
                        '(?<!\.)is_staff\(\)', '(select is_staff())', 'g');
    c := regexp_replace(regexp_replace(p.with_check, 'auth\.uid\(\)', '(select auth.uid())', 'g'),
                        '(?<!\.)is_staff\(\)', '(select is_staff())', 'g');
    if q is not null and c is not null then
      execute format('alter policy %I on %I.%I using (%s) with check (%s)', p.policyname, p.schemaname, p.tablename, q, c);
    elsif q is not null then
      execute format('alter policy %I on %I.%I using (%s)', p.policyname, p.schemaname, p.tablename, q);
    else
      execute format('alter policy %I on %I.%I with check (%s)', p.policyname, p.schemaname, p.tablename, c);
    end if;
  end loop;
end $$;

-- The app pages published sentences in id order.
create index if not exists sentences_status_id_idx on public.sentences (status, id);
