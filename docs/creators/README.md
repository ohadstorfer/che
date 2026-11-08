# Creators: how it runs

Creators bring learners with their own code and get paid for the ones who pay.
Everything lives in Supabase (migration `20261107000020_creators.sql`).

- **Their code:** the onboarding step "Did a creator send you here?" (`src/app/onboarding.tsx` → `CodeStep`) or "Have a code?" on the paywall. Either way it ends up in `creator_referrals`. The first code an account gives is the one that counts.
- **What the learner gets:** on Android, the yearly plan bought with the Play offer tagged `code-creator30` (first month free). On iOS nothing yet: App Store offer codes can only be made once the app is approved.
- **What the creator earns:** $10 for the first yearly payment, $3 for the second monthly payment, after a 14-day hold with no refund (`creator_commissions` view). Defaults are per creator: `payout_annual` / `payout_monthly`.
- **Their dashboard:** `https://postaspanish.com/creator/?t=<dashboard_token>` (`posta-site/creator/`), counts and money only.
- **CRM:** the "Creadores" tab of the Posta Marketing artifact: pipeline, terms, the dashboard link, and the numbers Claude loads.

## Add a creator

```sql
select code, dashboard_token from public.add_creator('MARTI', 'Martina', '@marti.habla', 'tiktok');
```

Then send them: `docs/creators/creator-kit.md` (fill in {CODE} and {DASHBOARD_LINK}), `creator-agreement.md`, and the dashboard link.

## Pause or end one

```sql
update public.creators set status = 'paused' where code = 'MARTI';
update public.promo_codes set active = false where code = 'MARTI';
```

## Pay every month

```sql
-- what each creator is owed now
select c.code, c.name, c.payout_method, (public.creator_summary(c.id) ->> 'owed')::numeric as owed
from public.creators c order by owed desc;

-- once you have paid
insert into public.creator_payouts (creator_id, amount, method, reference)
select id, 59, 'PayPal', 'Nov 2026' from public.creators where code = 'MARTI';
```

Payments under $20 roll over to the next month (as the agreement says).
