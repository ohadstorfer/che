// ---------------------------------------------------------------------------
// Billing — the shape both platforms speak. The phones sell through the
// stores themselves, StoreKit and Play Billing (billing.native.ts); the web
// has no store, so it gets a mock in development and nothing to buy in
// production (billing.ts).
//
// Store setup this expects, the same product ids in App Store Connect and in
// Play Console (all three subscriptions, in one subscription group on Apple):
//   · PRODUCTS.annual   yearly, with a 7-day free trial as its introductory
//                       offer
//   · PRODUCTS.monthly  monthly
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
  /** Free-trial length she is eligible for; null when there is none. */
  trialDays: number | null;
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

/** ("week", 1) → 7, ("day", 3) → 3: the length of an intro phase. */
export function periodDays(unit: string, count: number): number {
  const u = unit.toUpperCase();
  const per = u.startsWith('D') ? 1 : u.startsWith('W') ? 7 : u.startsWith('M') ? 30 : u.startsWith('Y') ? 365 : 0;
  return per * count;
}

/** Play's billing periods, ISO 8601: "P1Y" → year, "P1W" → week. */
export function periodOf(iso: string | null | undefined): Period {
  if (!iso) return 'month';
  if (/Y$/.test(iso) || iso === 'P12M') return 'year';
  if (/W$/.test(iso) || iso === 'P7D') return 'week';
  return 'month';
}

/** "P1W" → 7, "P3D" → 3, "P1M" → 30. */
export function isoDays(iso: string): number {
  const m = /^P(\d+)([DWMY])$/.exec(iso);
  return m ? periodDays(m[2], Number(m[1])) : 0;
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
