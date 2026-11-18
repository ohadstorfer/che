// ---------------------------------------------------------------------------
// Billing — the shape both platforms speak. The phones sell through the
// stores themselves, StoreKit and Play Billing (billing.native.ts); the web
// has no store, so it gets a mock in development and nothing to buy in
// production (billing.ts).
//
// Store setup this expects, the same product ids in App Store Connect and in
// Play Console (all three subscriptions, in one subscription group on Apple):
//   · PRODUCTS.annual   yearly, with a free month as its introductory offer
//                       (Apple: 1 month; Play: offer free-trial-7d, 30 days)
//   · PRODUCTS.monthly  monthly, with a free week (Apple: 1 week; Play: offer
//                       free-trial-7d, 7 days) — since 2026-11-15
//   · PRODUCTS.winback  yearly, whose first year is cheaper (an introductory
//                       price paid up front) — the one-time offer shown when
//                       the first paywall is closed
// On Play each is a subscription with one base plan; the trial and the cheaper
// first year are offers on that base plan.
//
// Who has paid is the server's to say: verify-purchase checks each purchase
// with its store and writes `entitlements`.
// ---------------------------------------------------------------------------

export const PRODUCTS = {
  annual: 'posta_premium_annual',
  monthly: 'posta_premium_monthly',
  winback: 'posta_premium_annual_offer',
} as const;

export type Period = 'year' | 'month' | 'week' | 'lifetime';

export interface Plan {
  /** The store's product id, what `purchase` takes. */
  id: string;
  period: Period;
  price: number;
  priceString: string;
  /** "$4.99" — the price broken down per month, for the annual card. */
  perMonthString: string | null;
  /** Free-trial length she is eligible for, in days (a month counted as 30,
   *  for labels and sorting); null when there is none. */
  trialDays: number | null;
  /** The same trial as the store measures it: calendar months plus days. A
   *  "1 month" Apple trial started on Feb 1 ends on Mar 1, not Mar 3. Dates
   *  shown or scheduled come from this (trialEnd), never from trialDays. */
  trialLength: TrialLength | null;
  /** A paid first period, cheaper than the rest (the win-back's discount). */
  introPrice: { price: number; priceString: string } | null;
  currency: string;
}

export interface Offer {
  plans: Plan[];
}

export interface Catalog {
  main: Offer | null;
  winback: Offer | null;
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending' | { error: string };

/** Play offers tagged with this are for discount codes only: the paywall
 *  never shows them, and redeem-code says which one a code opens. */
export const CODE_OFFER_TAG = 'code-';

/** The App Store's own page for an offer code, with the code filled in. */
export const APPLE_APP_ID = '6817374310';
export const appleRedeemUrl = (code: string) =>
  `https://apps.apple.com/redeem?ctx=offercodes&id=${APPLE_APP_ID}&code=${encodeURIComponent(code)}`;

/** "posta50 " → "POSTA50": how codes are typed is not how they are kept. */
export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

export interface Billing {
  /** Whether this build can take money at all. */
  available: boolean;
  /** Ties purchases to the Supabase user, so the stores' notifications say whose they are. */
  identify(userId: string): Promise<void>;
  forget(): Promise<void>;
  catalog(): Promise<Catalog>;
  purchase(planId: string, offer: 'main' | 'winback'): Promise<PurchaseOutcome>;
  /** A discount code. On iOS Apple's own redeem sheet takes it (the code
   *  passed here is ignored: Apple's sheet is where it is typed); on Android
   *  redeem-code checks it and the plan is bought with the offer it opens. */
  redeem(code?: string): Promise<PurchaseOutcome>;
  /** Asks the store again and claims what it holds for this account. Resolves
   *  to whether premium is active afterwards. */
  restore(): Promise<boolean>;
  /** Sends the server what the store on this phone already holds for her,
   *  without asking the store anything. Resolves to whether she has premium. */
  sync(): Promise<boolean>;
  /** Claims for this account what she bought as a guest (`guestId`) before
   *  signing in to an account she already had. Resolves to whether premium is
   *  active afterwards. */
  adopt(guestId: string): Promise<boolean>;
  /** The store on this phone holds a running subscription of hers. */
  isPremium(): Promise<boolean>;
  onChange(listener: (premium: boolean) => void): () => void;
}

/** Play's billing periods, ISO 8601: "P1Y" → year, "P1W" → week. */
export function periodOf(iso: string | null | undefined): Period {
  if (!iso) return 'month';
  if (/Y$/.test(iso) || iso === 'P12M') return 'year';
  if (/W$/.test(iso) || iso === 'P7D') return 'week';
  return 'month';
}

/** A trial's length the way the stores count it: calendar months, then days. */
export interface TrialLength {
  months: number;
  days: number;
}

/** "P1M" → 1 month, "P4W2D" (how Play sends a 30-day trial) → 30 days, "P1Y"
 *  → 12 months. Null for anything else, so a new shape is noticed, not
 *  silently read as no trial (2026-11-17: "P4W2D" hid the free month). */
export function isoLength(iso: string | null | undefined): TrialLength | null {
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/i.exec((iso ?? '').trim());
  if (!m || m[0].length < 3) return null;
  const [y, mo, w, d] = m.slice(1).map((n) => Number(n ?? 0));
  return { months: y * 12 + mo, days: w * 7 + d };
}

/** ("week", 2) → 14 days, ("month", 1) → 1 month: an intro phase as a length. */
export function unitLength(unit: string, count: number): TrialLength | null {
  const u = unit.toUpperCase();
  if (!(count > 0)) return null;
  if (u.startsWith('Y')) return { months: 12 * count, days: 0 };
  if (u.startsWith('M')) return { months: count, days: 0 };
  if (u.startsWith('W')) return { months: 0, days: 7 * count };
  if (u.startsWith('D')) return { months: 0, days: count };
  return null;
}

/** Repeated: a phase of `count` cycles, each `t` long. */
export const timesLength = (t: TrialLength, count: number): TrialLength => ({
  months: t.months * Math.max(count, 1),
  days: t.days * Math.max(count, 1),
});

/** Days, a month counted as 30: for labels ("30 days free"), never for dates. */
export const lengthDays = (t: TrialLength) => t.months * 30 + t.days;

/** `from` plus a length, as the stores renew: a month later on the same day,
 *  or the month's last day when it has no such day (Jan 31 → Feb 28). */
export function addLength(from: Date, t: TrialLength): Date {
  const out = new Date(from.getTime());
  if (t.months) {
    const day = out.getDate();
    out.setDate(1);
    out.setMonth(out.getMonth() + t.months);
    const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
    out.setDate(Math.min(day, last));
  }
  if (t.days) out.setDate(out.getDate() + t.days);
  return out;
}

/** When the free trial turns into the first charge, if she starts it now. */
export function trialEnd(plan: Plan, from = new Date()): Date | null {
  return plan.trialLength ? addLength(from, plan.trialLength) : null;
}

/** Whole days from `from` to the trial's end ("In 28 days" in a February). */
export function trialDaysLeft(plan: Plan, from = new Date()): number {
  const end = trialEnd(plan, from);
  return end ? Math.round((end.getTime() - from.getTime()) / 86_400_000) : 0;
}

/** "1 month" / "30 days", and as an adjective "1-month" / "30-day". */
export function trialLabel(plan: Plan): { noun: string; adj: string } | null {
  const t = plan.trialLength;
  if (!t || !plan.trialDays) return null;
  if (t.months && !t.days) {
    const years = t.months % 12 === 0 ? t.months / 12 : 0;
    if (years) return { noun: years === 1 ? '1 year' : `${years} years`, adj: `${years}-year` };
    return { noun: t.months === 1 ? '1 month' : `${t.months} months`, adj: `${t.months}-month` };
  }
  return { noun: `${plan.trialDays} days`, adj: `${plan.trialDays}-day` };
}

/** "$8.25": a yearly price as what it comes to each month. */
export function perMonth(price: number, currency: string): string | null {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price / 12);
  } catch {
    return null;
  }
}

/** How much the annual plan saves against paying monthly for a year. */
export function annualSaving(plans: Plan[]): number | null {
  const year = plans.find((p) => p.period === 'year');
  const month = plans.find((p) => p.period === 'month');
  if (!year || !month || month.price <= 0) return null;
  const pct = Math.round((1 - year.price / (month.price * 12)) * 100);
  return pct >= 5 ? pct : null;
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
