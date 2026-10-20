-- Discount codes. One name for both stores: on iOS it is an App Store offer
-- code of the same name, redeemed in Apple's own sheet, and this table isn't
-- asked; on Android redeem-code looks it up here and answers which Play offer
-- (by its tag, "code-…") the plan is bought with. Only the service role reads
-- or writes these.

create table if not exists public.promo_codes (
  code          text primary key check (code = upper(code)),
  product_id    text not null,
  google_offer_tag text not null check (google_offer_tag like 'code-%'),
  active        boolean not null default true,
  expires_at    timestamptz,   -- null: never
  max_uses      integer,       -- null: no limit; counts people, not purchases
  note          text,
  created_at    timestamptz not null default now()
);

-- Who has opened a code, once each: what max_uses counts.
create table if not exists public.promo_redemptions (
  code       text not null references public.promo_codes (code) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (code, user_id)
);

alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
-- No policies: the app never reads these, redeem-code does with the service role.

insert into public.promo_codes (code, product_id, google_offer_tag, note)
values ('POSTA50', 'posta_premium_annual', 'code-posta50', '50% off the first year of the annual plan')
on conflict (code) do nothing;
