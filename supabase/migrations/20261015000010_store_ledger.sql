-- What the stores last said about each purchase, kept apart from any account.
--
-- `entitlements` remembers a purchase only while an account holds it, so a
-- refund recorded there vanished with the account: delete the account, sign
-- in again, send the transaction saved from before the refund, and Premium
-- came back. This ledger outlives accounts. A store's word older than the
-- newest one here is ignored, whoever sends it (functions/_shared/entitlement.ts).
--
-- `sandbox` marks purchases made in Apple's sandbox (TestFlight, App Review)
-- or as Play test purchases, here and on `entitlements`, so they can be told
-- apart from real ones and switched off with one update when that's wanted.

create table if not exists public.store_purchases (
  store      text not null,
  ref        text not null,
  signed_at  timestamptz not null,
  active     boolean not null,
  sandbox    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (store, ref)
);

alter table public.store_purchases enable row level security;
revoke all on public.store_purchases from anon, authenticated;

comment on table public.store_purchases is
  'The newest word each store gave about each purchase, kept after the account that held it is deleted. Service role only.';

alter table public.entitlements
  add column if not exists sandbox boolean not null default false;

-- Today's rows: every purchase an account holds now.
insert into public.store_purchases (store, ref, signed_at, active)
select store, store_ref, store_signed_at, active
from public.entitlements
where store in ('APP_STORE', 'PLAY_STORE') and store_ref is not null and store_signed_at is not null
on conflict (store, ref) do nothing;

-- Records a store's word unless a newer one is already here, and answers the
-- newest word's date: when it is later than p_signed_at, this one was stale.
create or replace function public.note_store_word(
  p_store text, p_ref text, p_signed_at timestamptz, p_active boolean, p_sandbox boolean
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  newest timestamptz;
begin
  insert into public.store_purchases as p (store, ref, signed_at, active, sandbox)
  values (p_store, p_ref, p_signed_at, p_active, p_sandbox)
  on conflict (store, ref) do update
    set signed_at = excluded.signed_at, active = excluded.active, sandbox = excluded.sandbox, updated_at = now()
    where p.signed_at <= excluded.signed_at;
  select signed_at into newest from public.store_purchases where store = p_store and ref = p_ref;
  return newest;
end;
$$;

revoke all on function public.note_store_word(text, text, timestamptz, boolean, boolean) from public, anon, authenticated;
grant execute on function public.note_store_word(text, text, timestamptz, boolean, boolean) to service_role;
