-- Access codes: a promo code that opens Premium for a number of days, with no
-- store purchase. For store reviewers (Google can't buy or use free trials to
-- review) and hand-picked people. redeem-code writes them an `entitlements`
-- row (store 'CODE') that expires on its own, like the tester unlock did.
-- product_id / google_offer_tag stay filled ('access' / 'code-access') to keep
-- the table's checks; nothing buys with them.
alter table public.promo_codes
  add column if not exists grants_days integer check (grants_days is null or grants_days between 1 and 366);
