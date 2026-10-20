import type { ProductSubscription, Purchase } from 'expo-iap';
import { Platform } from 'react-native';

import {
  type Billing,
  type Catalog,
  CODE_OFFER_TAG,
  isoDays,
  type Period,
  periodDays,
  periodOf,
  perMonth,
  type Plan,
  PRODUCTS,
  type PurchaseOutcome,
} from './billing-shared';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Billing on the phones: StoreKit and Play Billing, through expo-iap, with no
// service in between.
//
// The store takes the money; the server says who has Premium. Every purchase
// the store hands over — bought just now, restored, or renewed while the app
// was closed — goes to the verify-purchase function, which checks it with the
// store and writes her `entitlements` row. Only then is the purchase finished
// (acknowledged): one that never reached the server comes back at the next
// launch, and Play refunds what nobody acknowledges in three days.
//
// Each purchase carries her Posta user id (Apple's appAccountToken, Play's
// obfuscated account id), so the stores' own notifications, months later,
// still say whose subscription it is.
// ---------------------------------------------------------------------------

type Iap = typeof import('expo-iap');

// A development build made before expo-iap was added has no native module,
// and importing it would throw at launch. Without it the app is the free tier.
let iap: Iap | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  iap = require('expo-iap') as Iap;
} catch {
  iap = null;
}

const IDS: string[] = Object.values(PRODUCTS);
const store = Platform.OS === 'ios' ? 'apple' : 'google';

let userId: string | null = null;
const listeners = new Set<(premium: boolean) => void>();
/** The last products fetched, so a purchase can find its offer again. */
const offerTokens = new Map<string, string>();
const known = new Set<string>();

let connecting: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  if (!iap) return Promise.resolve(false);
  const lib = iap;
  connecting ??= lib
    .initConnection()
    .then((ok) => {
      if (!ok) connecting = null;
      // Purchases that arrive on their own: a renewal, one approved by a
      // parent, one the server couldn't be reached for last time.
      else lib.purchaseUpdatedListener((purchase) => void settle(purchase));
      return ok;
    })
    .catch(() => {
      connecting = null;
      return false;
    });
  return connecting;
}

/** Whose purchase the store says it is; null when it carries no account. */
function owner(purchase: Purchase): string | null {
  const id =
    'appAccountToken' in purchase
      ? purchase.appAccountToken
      : 'obfuscatedAccountIdAndroid' in purchase
        ? purchase.obfuscatedAccountIdAndroid
        : null;
  return id ? id.toLowerCase() : null;
}

const inFlight = new Map<string, Promise<boolean | null>>();

/**
 * Has the server check a purchase and, once it has, finishes it with the
 * store. True: she has Premium. False: checked, and it opens nothing (it has
 * lapsed). Null: the server couldn't be asked, so the purchase is left
 * unfinished for the store to hand over again.
 */
function settle(purchase: Purchase): Promise<boolean | null> {
  let run = inFlight.get(purchase.id);
  if (!run) {
    run = verify(purchase).finally(() => inFlight.delete(purchase.id));
    inFlight.set(purchase.id, run);
  }
  return run;
}

async function verify(purchase: Purchase): Promise<boolean | null> {
  if (!iap || !IDS.includes(purchase.productId)) return null;
  if (purchase.purchaseState !== 'purchased' || !purchase.purchaseToken) return null;
  const { data, error } = await supabase.functions
    .invoke<{ premium: boolean }>('verify-purchase', { body: { store, token: purchase.purchaseToken } })
    .catch(() => ({ data: null, error: true }));
  if (error || !data) return null;
  await iap.finishTransaction({ purchase, isConsumable: false }).catch(() => {});
  if (data.premium) for (const l of listeners) l(true);
  return data.premium;
}

/** The running subscriptions the store on this phone holds. */
async function held(): Promise<Purchase[]> {
  if (!iap || !(await connect())) return [];
  const all = await iap.getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
  return all.filter((p) => IDS.includes(p.productId) && p.purchaseState === 'purchased');
}

/** Hers, or bought outside the app (an offer code) and so nobody's yet. */
const hers = (purchase: Purchase) => {
  const id = owner(purchase);
  return !id || id === userId;
};

async function claim(purchases: Purchase[]): Promise<boolean> {
  const results = await Promise.all(purchases.map(settle));
  return results.some((premium) => premium === true);
}

const IOS_PERIOD: Record<string, Period> = { year: 'year', month: 'month', week: 'week' };

interface Intro {
  free: boolean;
  days: number;
  price: number;
  priceString: string;
}

function iosIntro(product: Extract<ProductSubscription, { platform: 'ios' }>): Intro | null {
  const offer = product.subscriptionOffers?.find((o) => o.type === 'introductory');
  if (offer?.period) {
    return {
      free: offer.paymentMode === 'free-trial',
      days: periodDays(offer.period.unit, offer.period.value) * Math.max(offer.periodCount ?? 1, 1),
      price: offer.price,
      priceString: offer.displayPrice,
    };
  }
  const mode = product.introductoryPricePaymentModeIOS;
  if (!mode || mode === 'empty') return null;
  return {
    free: mode === 'free-trial',
    days: periodDays(product.introductoryPriceSubscriptionPeriodIOS ?? '', Number(product.introductoryPriceNumberOfPeriodsIOS) || 1),
    price: Number(product.introductoryPriceAsAmountIOS) || 0,
    priceString: product.introductoryPriceIOS ?? '',
  };
}

function plan(product: ProductSubscription, introEligible: boolean): Plan | null {
  if (product.platform === 'ios') {
    const price = product.price ?? 0;
    const unit = product.subscriptionPeriodUnitIOS ?? 'month';
    // A year sold as twelve months is still the yearly plan.
    const period: Period = unit === 'month' && product.subscriptionPeriodNumberIOS === '12' ? 'year' : (IOS_PERIOD[unit] ?? 'month');
    const intro = introEligible ? iosIntro(product) : null;
    return {
      id: product.id,
      period,
      price,
      priceString: product.displayPrice,
      perMonthString: period === 'year' ? perMonth(price, product.currency) : period === 'month' ? product.displayPrice : null,
      trialDays: intro?.free && intro.days > 0 ? intro.days : null,
      introPrice: intro && !intro.free && intro.price > 0 ? { price: intro.price, priceString: intro.priceString } : null,
      currency: product.currency,
    };
  }

  // Play lists a base plan and the offers on it she can still take; each is a
  // run of phases ending in the regular price. The one with the most phases
  // is the one with a trial or a cheaper start.
  // Offers kept for discount codes are never what the paywall shows.
  const offers = product.subscriptionOffers
    .filter((o) => o.offerTokenAndroid && o.pricingPhasesAndroid?.pricingPhaseList.length)
    .filter((o) => !isCodeOffer(o.offerTagsAndroid))
    .sort((a, b) => b.pricingPhasesAndroid!.pricingPhaseList.length - a.pricingPhasesAndroid!.pricingPhaseList.length);
  const offer = offers[0];
  if (!offer) return null;
  offerTokens.set(product.id, offer.offerTokenAndroid!);
  const phases = offer.pricingPhasesAndroid!.pricingPhaseList;
  const regular = phases[phases.length - 1];
  const first = phases.length > 1 ? phases[0] : null;
  const price = Number(regular.priceAmountMicros) / 1_000_000;
  const period = periodOf(regular.billingPeriod);
  const firstPrice = first ? Number(first.priceAmountMicros) / 1_000_000 : 0;
  const firstDays = first ? isoDays(first.billingPeriod) * Math.max(first.billingCycleCount, 1) : 0;
  return {
    id: product.id,
    period,
    price,
    priceString: regular.formattedPrice,
    perMonthString: period === 'year' ? perMonth(price, regular.priceCurrencyCode) : period === 'month' ? regular.formattedPrice : null,
    trialDays: first && firstPrice === 0 && firstDays > 0 ? firstDays : null,
    introPrice: first && firstPrice > 0 ? { price: firstPrice, priceString: first.formattedPrice } : null,
    currency: regular.priceCurrencyCode,
  };
}

const isCodeOffer = (tags: string[] | null | undefined) => !!tags?.some((t) => t.startsWith(CODE_OFFER_TAG));

/** The token of the Play offer tagged `tag` on a product, for a code. */
async function codeOfferToken(productId: string, tag: string): Promise<string | null> {
  if (!iap) return null;
  const fetched = ((await iap.fetchProducts({ skus: [productId], type: 'subs' })) ?? []) as ProductSubscription[];
  const product = fetched.find((p) => p.id === productId);
  if (!product || product.platform === 'ios') return null;
  return product.subscriptionOffers.find((o) => o.offerTagsAndroid?.includes(tag))?.offerTokenAndroid ?? null;
}

/** Apple answers once per subscription group: has she ever had an intro offer in it. */
async function introEligibility(products: ProductSubscription[]): Promise<Map<string, boolean>> {
  const out = new Map<string, boolean>();
  if (!iap || Platform.OS !== 'ios') return out;
  const groups = new Set(products.map((p) => (p.platform === 'ios' ? p.subscriptionGroupIdIOS : null)).filter((g): g is string => !!g));
  for (const group of groups) out.set(group, await iap.isEligibleForIntroOfferIOS(group).catch(() => true));
  return out;
}

/** What redeem-code answers. */
type CodeVerdict =
  | { ok: true; productId: string; offerTag: string; granted?: undefined }
  // An access code: the server opened Premium itself, nothing to buy.
  | { ok: true; granted: true }
  | { ok: false; reason: 'unknown' | 'expired' | 'used' };

const CODE_ERRORS: Record<'unknown' | 'expired' | 'used', string> = {
  unknown: 'That code isn’t valid.',
  expired: 'That code has expired.',
  used: 'That code has already been used up.',
};

/** Buys a plan with the Play offer `offerToken` (none on iOS). */
async function buy(planId: string, offerToken: string | undefined): Promise<PurchaseOutcome> {
  if (!iap || !userId) return { error: 'Purchases are not available on this device.' };
  try {
    const out = await iap.requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: planId, appAccountToken: userId, andDangerouslyFinishTransactionAutomatically: false },
        google: {
          skus: [planId],
          obfuscatedAccountId: userId,
          subscriptionOffers: offerToken ? [{ sku: planId, offerToken }] : [],
        },
      },
    });
    const bought = (Array.isArray(out) ? out : out ? [out] : []).find((p) => p.productId === planId);
    // Waiting on someone else (a parent, the bank): it arrives through the
    // listener when it is approved.
    if (!bought || bought.purchaseState === 'pending') return 'pending';
    const premium = await settle(bought);
    if (premium) return 'purchased';
    return {
      error:
        premium === null
          ? 'Your purchase went through, but we couldn’t confirm it yet. Posta will unlock as soon as it can; you won’t be charged again.'
          : 'The purchase did not go through.',
    };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === iap.ErrorCode.UserCancelled) return 'cancelled';
    if (err.code === iap.ErrorCode.DeferredPayment || err.code === iap.ErrorCode.Pending) return 'pending';
    // The store already has it: what's missing is our side of it.
    if (err.code === iap.ErrorCode.AlreadyOwned && (await claim(await held().catch(() => [])))) return 'purchased';
    return { error: err.message ?? 'The purchase did not go through.' };
  }
}

export const billing: Billing = {
  get available() {
    return !!iap;
  },

  async identify(id) {
    userId = id.toLowerCase();
    await connect();
  },

  async forget() {
    userId = null;
  },

  async catalog(): Promise<Catalog> {
    if (!iap || !(await connect())) return { main: null, winback: null };
    const fetched = ((await iap.fetchProducts({ skus: IDS, type: 'subs' })) ?? []) as ProductSubscription[];
    const eligible = await introEligibility(fetched);
    const plans = new Map<string, Plan>();
    for (const product of fetched) {
      const group = product.platform === 'ios' ? product.subscriptionGroupIdIOS : null;
      const p = plan(product, (group ? eligible.get(group) : undefined) ?? true);
      if (!p) continue;
      plans.set(p.id, p);
      known.add(p.id);
    }
    // Annual first: it is the one the paywall leads with.
    const main = [plans.get(PRODUCTS.annual), plans.get(PRODUCTS.monthly)].filter((p): p is Plan => !!p);
    const winback = plans.get(PRODUCTS.winback);
    return {
      main: main.length ? { plans: main } : null,
      winback: winback ? { plans: [winback] } : null,
    };
  },

  async purchase(planId) {
    if (!iap || !(await connect())) return { error: 'Purchases are not available on this device.' };
    if (!userId) return { error: 'Sign in to subscribe.' };
    if (!known.has(planId)) return { error: 'That plan is no longer available. Try again.' };
    return buy(planId, offerTokens.get(planId));
  },

  async redeem(code) {
    if (!iap || !(await connect())) return { error: 'Codes are not available on this device.' };
    if (!userId) return { error: 'Sign in to use a code.' };
    if (Platform.OS === 'ios') {
      // Apple's own sheet takes the code and the money. What it bought
      // arrives here or through the listener, carrying no account of ours.
      try {
        const redeemed = await iap.openRedeemOfferCode();
        if (redeemed && IDS.includes(redeemed.productId)) {
          const premium = await settle(redeemed);
          if (premium) return 'purchased';
        }
      } catch (e) {
        return { error: (e as Error).message || 'The code sheet could not open. Try again.' };
      }
      return (await claim((await held()).filter(hers))) ? 'purchased' : 'cancelled';
    }
    const { data, error } = await supabase.functions
      .invoke<CodeVerdict>('redeem-code', { body: { code } })
      .catch(() => ({ data: null, error: true }));
    if (error || !data) return { error: 'Could not check the code. Check your connection and try again.' };
    if (!data.ok) return { error: CODE_ERRORS[data.reason] };
    if (data.granted) return 'purchased';
    const token = await codeOfferToken(data.productId, data.offerTag).catch(() => null);
    if (!token) return { error: 'That code can’t be used with this account.' };
    return buy(data.productId, token);
  },

  async restore() {
    if (!iap || !(await connect())) return false;
    await iap.restorePurchases().catch(() => {});
    // Asked for by hand, so it also takes over a subscription bought under
    // another Posta account with this same store account.
    return claim(await held());
  },

  async sync() {
    if (!userId) return false;
    return claim((await held()).filter(hers));
  },

  async adopt(guestId) {
    if (!userId) return false;
    // Bought under the guest's id; the server moves it to whoever claims it
    // with a store receipt, which only this phone's store account can give.
    const guest = guestId.toLowerCase();
    return claim((await held()).filter((p) => owner(p) === guest));
  },

  async isPremium() {
    if (!userId) return false;
    const mine = (await held()).filter(hers);
    // One bought outside the app is nobody's until the server has seen it.
    const unclaimed = mine.filter((p) => !owner(p));
    if (unclaimed.length) void claim(unclaimed);
    return mine.some((p) => owner(p) === userId);
  },

  onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
