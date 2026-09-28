// ---------------------------------------------------------------------------
// Billing — the shape both platforms speak. The phones sell through
// RevenueCat (billing.native.ts); the web has no store, so it gets a mock in
// development and nothing to buy in production (billing.ts).
//
// Store setup this expects (RevenueCat dashboard):
//   · entitlement  `premium`
//   · offering     current (`default`): an annual package with a 7-day free
//                  trial, and a monthly package
//   · offering     `winback`: an annual package whose first year is cheaper
//                  (an intro price, or a cheaper product) — the one-time offer
//                  shown when the first paywall is closed
//   · metadata     `{ "hard_paywall": true }` on the current offering closes
//                  the free tier without an app update
// ---------------------------------------------------------------------------

export const ENTITLEMENT = 'premium';
export const WINBACK_OFFERING = 'winback';

export type Period = 'year' | 'month' | 'week' | 'lifetime';

export interface Plan {
  /** The package identifier, what `purchase` takes. */
  id: string;
  period: Period;
  price: number;
  priceString: string;
  /** "$4.99" — the price broken down per month, for the annual card. */
  perMonthString: string | null;
  /** Free-trial length she is eligible for; null when there is none. */
  trialDays: number | null;
  /** A paid first period, cheaper than the rest (the win-back's discount). */
  introPrice: { price: number; priceString: string } | null;
  currency: string;
}

export interface Offer {
  plans: Plan[];
  hardPaywall: boolean;
}

export interface Catalog {
  main: Offer | null;
  winback: Offer | null;
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending' | { error: string };

export interface Billing {
  /** Whether this build can take money at all. */
  available: boolean;
  /** Ties purchases to the Supabase user, so the webhook knows whose they are. */
  identify(userId: string): Promise<void>;
  forget(): Promise<void>;
  catalog(): Promise<Catalog>;
  purchase(planId: string, offer: 'main' | 'winback'): Promise<PurchaseOutcome>;
  /** Resolves to whether premium is active afterwards. */
  restore(): Promise<boolean>;
  isPremium(): Promise<boolean>;
  onChange(listener: (premium: boolean) => void): () => void;
}

/** "P1W" → 7, "P3D" → 3; RevenueCat's own period units, for the intro phase. */
export function periodDays(unit: string, count: number): number {
  const u = unit.toUpperCase();
  const per = u.startsWith('D') ? 1 : u.startsWith('W') ? 7 : u.startsWith('M') ? 30 : u.startsWith('Y') ? 365 : 0;
  return per * count;
}

export function periodOf(iso: string | null | undefined, packageType?: string): Period {
  if (packageType === 'LIFETIME') return 'lifetime';
  if (!iso) return packageType === 'ANNUAL' ? 'year' : packageType === 'WEEKLY' ? 'week' : 'month';
  if (/Y$/.test(iso) || iso === 'P12M') return 'year';
  if (/W$/.test(iso) || iso === 'P7D') return 'week';
  return 'month';
}

/** How much the annual plan saves against paying monthly for a year. */
export function annualSaving(plans: Plan[]): number | null {
  const year = plans.find((p) => p.period === 'year');
  const month = plans.find((p) => p.period === 'month');
  if (!year || !month || month.price <= 0) return null;
  const saving = 1 - year.price / (month.price * 12);
  return saving > 0.05 ? Math.round(saving * 100) : null;
}

/** The win-back's discount on the first year, against the regular annual. */
export function winbackDiscount(main: Offer | null, winback: Offer | null): number | null {
  const regular = main?.plans.find((p) => p.period === 'year');
  const offer = winback?.plans.find((p) => p.period === 'year');
  if (!regular || !offer) return null;
  const firstYear = offer.introPrice?.price ?? offer.price;
  const off = 1 - firstYear / regular.price;
  return off >= 0.1 ? Math.round(off * 100) : null;
}
