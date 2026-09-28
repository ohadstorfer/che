import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  type Billing,
  type Catalog,
  ENTITLEMENT,
  type Offer,
  type Plan,
  periodDays,
  periodOf,
  WINBACK_OFFERING,
} from './billing-shared';

// ---------------------------------------------------------------------------
// Billing on the phones: RevenueCat over StoreKit / Play Billing.
// Keys are public SDK keys (safe to ship): EXPO_PUBLIC_REVENUECAT_IOS_KEY and
// EXPO_PUBLIC_REVENUECAT_ANDROID_KEY. Without one, nothing can be bought and
// the app runs as the free tier.
// ---------------------------------------------------------------------------

const apiKey =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;
function ensure(): boolean {
  if (!apiKey) return false;
  if (!configured) {
    Purchases.configure({ apiKey });
    configured = true;
  }
  return true;
}

const active = (info: CustomerInfo) => ENTITLEMENT in info.entitlements.active;

/** Keeps the last offerings so a purchase can find its package again. */
const packages = new Map<string, PurchasesPackage>();
const key = (offer: 'main' | 'winback', id: string) => `${offer}:${id}`;

async function toOffer(
  offering: PurchasesOffering | null | undefined,
  which: 'main' | 'winback',
): Promise<Offer | null> {
  if (!offering || offering.availablePackages.length === 0) return null;
  const pkgs = offering.availablePackages;
  for (const p of pkgs) packages.set(key(which, p.identifier), p);

  // Apple answers trial eligibility per product; Play only ever lists the
  // phases she is still eligible for, so there the intro price is the answer.
  let eligible: Record<string, boolean> = {};
  if (Platform.OS === 'ios') {
    const ids = pkgs.map((p) => p.product.identifier);
    const res = await Purchases.checkTrialOrIntroductoryPriceEligibility(ids).catch(() => ({}));
    eligible = Object.fromEntries(
      Object.entries(res).map(([id, e]) => [
        id,
        (e as { status: number }).status !== Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE,
      ]),
    );
  }

  const plans: Plan[] = pkgs.map((p) => {
    const product = p.product;
    const intro = product.introPrice;
    const canIntro = eligible[product.identifier] ?? true;
    const isTrial = !!intro && intro.price === 0 && canIntro;
    const isDiscount = !!intro && intro.price > 0 && canIntro;
    return {
      id: p.identifier,
      period: periodOf(product.subscriptionPeriod, p.packageType),
      price: product.price,
      priceString: product.priceString,
      perMonthString: product.pricePerMonthString ?? null,
      trialDays: isTrial ? periodDays(intro.periodUnit, intro.periodNumberOfUnits * Math.max(intro.cycles, 1)) : null,
      introPrice: isDiscount ? { price: intro.price, priceString: intro.priceString } : null,
      currency: product.currencyCode,
    };
  });
  // Annual first: it is the one the paywall leads with.
  const rank = { year: 0, month: 1, week: 2, lifetime: 3 } as const;
  plans.sort((a, b) => rank[a.period] - rank[b.period]);
  return { plans, hardPaywall: offering.metadata?.hard_paywall === true };
}

export const billing: Billing = {
  get available() {
    return !!apiKey;
  },

  async identify(userId) {
    if (!ensure()) return;
    await Purchases.logIn(userId).catch(() => {});
  },

  async forget() {
    if (!ensure()) return;
    if (await Purchases.isAnonymous().catch(() => true)) return;
    await Purchases.logOut().catch(() => {});
  },

  async catalog(): Promise<Catalog> {
    if (!ensure()) return { main: null, winback: null };
    const offerings = await Purchases.getOfferings();
    const [main, winback] = await Promise.all([
      toOffer(offerings.current, 'main'),
      toOffer(offerings.all[WINBACK_OFFERING], 'winback'),
    ]);
    return { main, winback };
  },

  async purchase(planId, offer) {
    if (!ensure()) return { error: 'Purchases are not set up in this build.' };
    const pkg = packages.get(key(offer, planId));
    if (!pkg) return { error: 'That plan is no longer available. Try again.' };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return active(customerInfo) ? 'purchased' : 'pending';
    } catch (e) {
      const err = e as { userCancelled?: boolean | null; code?: string; message?: string };
      if (err.userCancelled || err.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
      if (err.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
      return { error: err.message ?? 'The purchase did not go through.' };
    }
  },

  async restore() {
    if (!ensure()) return false;
    return active(await Purchases.restorePurchases());
  },

  async isPremium() {
    if (!ensure()) return false;
    return active(await Purchases.getCustomerInfo());
  },

  onChange(listener) {
    if (!ensure()) return () => {};
    const handler = (info: CustomerInfo) => listener(active(info));
    Purchases.addCustomerInfoUpdateListener(handler);
    return () => Purchases.removeCustomerInfoUpdateListener(handler);
  },
};
