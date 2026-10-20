// Money events: what the stores say happened to a subscription, as events —
// in our own `funnel_events` (next to the paywall steps the app writes) and in
// PostHog, as the learner (her Supabase user id).
//
// verify-purchase, apple-notifications and google-notifications all call
// recordRevenue with the events read here. The same charge can be heard twice
// (the app's verify-purchase and the store's notification; a notification
// sent again), so each event carries a key: the database keeps the first row
// per key and only that row goes on to PostHog. A charge's key is its
// transaction (Apple) or order (Google), whatever the event is called, so
// "the first payment after the trial" can't also be counted as a renewal.
//
// Events (props: store, product_id, is_trial, price, currency, offer_type,
// offer_id, sandbox, source, notification, plus the ones named):
//   trial_started             a free trial began
//   first_payment             the first charge: a paid buy, or a trial
//                             turning paid (from_trial)
//   subscription_resubscribed a new purchase on a subscription she had before
//                             (back after it lapsed, a win-back, a plan change)
//   subscription_renewed      a later charge (billing_recovery: after a failed one)
//   subscription_cancelled    auto-renew turned off; access runs to the end
//   subscription_uncancelled  auto-renew turned back on
//   billing_issue             a charge failed (grace: she keeps access for now)
//   subscription_expired      access ended (reason)
//   subscription_refunded     refunded or revoked (kind)
//   winback_redeemed          the cheaper first year (PRODUCTS.winback) or an
//                             App Store win-back offer was bought
// Paid events also carry `revenue` (= price) outside the sandbox. Apple's
// price is what she paid, tax included; Google's is the base plan's price,
// left out while a trial or a cheaper first period is running.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { EntitlementRow, StoreState } from "./entitlement.ts";
import { capture, type Props, reportError, stableUuid } from "./posthog.ts";
import type { AppleNotification, AppleTransaction } from "./store-apple.ts";
import type { PlaySubscription } from "./store-google.ts";

export type RevenueEventName =
  | "trial_started"
  | "first_payment"
  | "subscription_resubscribed"
  | "subscription_renewed"
  | "subscription_cancelled"
  | "subscription_uncancelled"
  | "billing_issue"
  | "subscription_expired"
  | "subscription_refunded"
  | "winback_redeemed";

export interface RevenueEvent {
  event: RevenueEventName;
  /** One event per key, ever. */
  key: string;
  /** When it happened (ISO). */
  at: string;
  props: Props;
}

/** src/lib/billing-shared.ts PRODUCTS.winback. */
export const WINBACK_PRODUCT = "posta_premium_annual_offer";

/** verify-purchase only tells of a charge this recent: an old purchase
 *  restored on a new phone is not news. */
const FRESH_MS = 72 * 3600_000;

const PAID = new Set<RevenueEventName>(["first_payment", "subscription_resubscribed", "subscription_renewed"]);
const iso = (ms: number | undefined) => new Date(ms ?? Date.now()).toISOString();

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------

/** offerType 1 · 2 · 3 · 4 (store-apple.ts AppleTransaction). */
const APPLE_OFFER: Record<number, string> = { 1: "introductory", 2: "promotional", 3: "offer_code", 4: "winback" };

function appleProps(tx: AppleTransaction): Props {
  return {
    store: "apple",
    product_id: tx.productId,
    is_trial: tx.offerDiscountType === "FREE_TRIAL",
    price: typeof tx.price === "number" ? tx.price / 1000 : null,
    currency: tx.currency ?? null,
    offer_type: (tx.offerType && APPLE_OFFER[tx.offerType]) || null,
    offer_id: tx.offerIdentifier ?? null,
    family_shared: tx.inAppOwnershipType === "FAMILY_SHARED",
    sandbox: tx.environment !== "Production",
  };
}

const appleCharge = (tx: AppleTransaction, event: RevenueEventName, extra: Props = {}): RevenueEvent => ({
  event,
  key: `apple:${tx.transactionId}:charge`,
  at: iso(tx.purchaseDate ?? tx.signedDate),
  props: { ...appleProps(tx), ...extra },
});

function appleWinback(tx: AppleTransaction): RevenueEvent[] {
  if (tx.productId !== WINBACK_PRODUCT && tx.offerType !== 4) return [];
  return [{ event: "winback_redeemed", key: `apple:${tx.transactionId}:winback`, at: iso(tx.purchaseDate ?? tx.signedDate), props: appleProps(tx) }];
}

/** A buy: the trial, or the first charge; again on a subscription she had. */
function appleBuy(tx: AppleTransaction, resubscribe: boolean): RevenueEvent[] {
  const trial = tx.offerDiscountType === "FREE_TRIAL";
  const event: RevenueEventName = resubscribe ? "subscription_resubscribed" : trial ? "trial_started" : "first_payment";
  return [appleCharge(tx, event, event === "first_payment" ? { from_trial: false } : {}), ...appleWinback(tx)];
}

/** A renewal charge; the first one after a free trial is the first payment. */
function appleRenewal(tx: AppleTransaction, before: EntitlementRow | null | undefined, recovery: boolean): RevenueEvent[] {
  if (before?.period_type === "TRIAL") return [appleCharge(tx, "first_payment", { from_trial: true, billing_recovery: recovery })];
  return [appleCharge(tx, "subscription_renewed", { billing_recovery: recovery })];
}

/**
 * What an App Store Server Notification (v2) means, by its type and subtype
 * (developer.apple.com/documentation/appstoreservernotifications/notificationtype).
 * Types not listed (DID_CHANGE_RENEWAL_PREF, PRICE_INCREASE, RENEWAL_EXTENDED,
 * REFUND_DECLINED, CONSUMPTION_REQUEST, TEST, …) are no money event.
 */
export function appleEvents(note: AppleNotification, tx: AppleTransaction, before?: EntitlementRow | null): RevenueEvent[] {
  const sub = note.subtype ?? null;
  const notice = (event: RevenueEventName, extra: Props = {}): RevenueEvent => ({
    event,
    key: `apple:${note.notificationUUID ?? `${tx.transactionId}:${note.signedDate}`}:${event}`,
    at: iso(note.signedDate),
    props: { ...appleProps(tx), ...extra },
  });
  switch (note.notificationType) {
    case "SUBSCRIBED":
      return appleBuy(tx, sub === "RESUBSCRIBE");
    case "DID_RENEW":
      return appleRenewal(tx, before, sub === "BILLING_RECOVERY");
    // An offer redeemed on a running subscription (UPGRADE, DOWNGRADE or none);
    // a buy with an offer comes as SUBSCRIBED.
    case "OFFER_REDEEMED":
      return appleWinback(tx);
    case "DID_CHANGE_RENEWAL_STATUS":
      if (sub === "AUTO_RENEW_DISABLED") return [notice("subscription_cancelled")];
      if (sub === "AUTO_RENEW_ENABLED") return [notice("subscription_uncancelled")];
      return [];
    case "DID_FAIL_TO_RENEW":
      return [notice("billing_issue", { grace: sub === "GRACE_PERIOD" })];
    case "EXPIRED":
      return [notice("subscription_expired", { reason: sub })];
    case "GRACE_PERIOD_EXPIRED":
      return [notice("subscription_expired", { reason: "GRACE_PERIOD_EXPIRED" })];
    case "REFUND":
    case "REVOKE":
      return [{ ...notice("subscription_refunded", { kind: note.notificationType.toLowerCase() }), key: `apple:${tx.transactionId}:refund` }];
    default:
      return [];
  }
}

/** What verify-purchase heard from the app: a fresh charge, if this is one. */
export function appleVerifyEvents(tx: AppleTransaction, before?: EntitlementRow | null, now = Date.now()): RevenueEvent[] {
  if (tx.type !== "Auto-Renewable Subscription") return [];
  if (now - (tx.purchaseDate ?? tx.signedDate) > FRESH_MS || tx.revocationDate) return [];
  if (tx.transactionReason === "RENEWAL") return appleRenewal(tx, before, false);
  return appleBuy(tx, tx.transactionId !== tx.originalTransactionId);
}

// ---------------------------------------------------------------------------
// Google Play
// ---------------------------------------------------------------------------

/** The line item playState reads: the one that runs longest. */
function playItem(sub: PlaySubscription) {
  return [...(sub.lineItems ?? [])].sort((a, b) => Date.parse(b.expiryTime ?? "") - Date.parse(a.expiryTime ?? ""))[0];
}

/** No order id (it shouldn't happen): the product and the period's end stand
 *  in for the charge. Never the purchase token, which proves a purchase. */
const noOrder = (state: StoreState) => `${state.productId}:${state.expiresAt}`;

const playOrder = (sub: PlaySubscription) => playItem(sub)?.latestSuccessfulOrderId ?? sub.latestOrderId ?? null;

function playProps(sub: PlaySubscription): Props {
  const item = playItem(sub);
  const trial = !!item?.offerPhase?.freeTrial;
  const intro = !!item?.offerPhase?.introductoryPrice;
  const money = item?.autoRenewingPlan?.recurringPrice;
  const base = money?.units != null || money?.nanos != null ? Number(money?.units ?? 0) + (money?.nanos ?? 0) / 1e9 : null;
  const tags = item?.offerDetails?.offerTags ?? [];
  return {
    store: "google",
    product_id: item?.productId ?? null,
    is_trial: trial,
    price: trial ? 0 : intro ? null : base,
    currency: money?.currencyCode ?? null,
    offer_type: tags.some((t) => t.startsWith("code-"))
      ? "offer_code"
      : item?.productId === WINBACK_PRODUCT
      ? "winback"
      : trial
      ? "free_trial"
      : intro
      ? "introductory"
      : null,
    offer_id: item?.offerDetails?.offerId ?? null,
    base_plan: item?.offerDetails?.basePlanId ?? null,
    sandbox: sub.testPurchase != null,
  };
}

function playCharge(sub: PlaySubscription, state: StoreState, event: RevenueEventName, extra: Props = {}): RevenueEvent {
  return {
    event,
    key: `google:${playOrder(sub) ?? noOrder(state)}:charge`,
    at: iso(undefined),
    props: { ...playProps(sub), ...extra },
  };
}

function playBuy(sub: PlaySubscription, state: StoreState): RevenueEvent[] {
  const props = playProps(sub);
  // A purchase that replaces an earlier one (resubscribing, changing plan).
  const event: RevenueEventName = state.linkedRef ? "subscription_resubscribed" : props.is_trial ? "trial_started" : "first_payment";
  const out = [playCharge(sub, state, event, event === "first_payment" ? { from_trial: false } : {})];
  if (props.product_id === WINBACK_PRODUCT) {
    out.push({ event: "winback_redeemed", key: `google:${playOrder(sub) ?? noOrder(state)}:winback`, at: iso(undefined), props });
  }
  return out;
}

function playRenewal(sub: PlaySubscription, state: StoreState, before: EntitlementRow | null | undefined, recovery: boolean): RevenueEvent[] {
  if (before?.period_type === "TRIAL") return [playCharge(sub, state, "first_payment", { from_trial: true, billing_recovery: recovery })];
  return [playCharge(sub, state, "subscription_renewed", { billing_recovery: recovery })];
}

export interface PlayNotice {
  /** SubscriptionNotification.notificationType, or "voided" for a
   *  voidedPurchaseNotification. */
  type: number | "voided";
  /** Pub/Sub's message id, the same on every redelivery. */
  messageId?: string;
  /** voidedPurchaseNotification.orderId and refundType (1 full, 2 partial). */
  orderId?: string;
  refundType?: number;
}

/**
 * What a Play real-time developer notification means
 * (developer.android.com/google/play/billing/rtdn-reference). Types not
 * listed (9 deferred, 10/11 paused, 17 items changed, 19/22 price changes,
 * 20 pending purchase cancelled, …) are no money event.
 */
export function playEvents(notice: PlayNotice, sub: PlaySubscription, state: StoreState, before?: EntitlementRow | null): RevenueEvent[] {
  const props = playProps(sub);
  const named = (event: RevenueEventName, extra: Props = {}): RevenueEvent => ({
    event,
    key: `google:${notice.messageId ?? crypto.randomUUID()}:${event}`,
    at: iso(undefined),
    props: { ...props, ...extra },
  });
  const refund = (kind: string, orderId: string | null, extra: Props = {}): RevenueEvent => ({
    ...named("subscription_refunded", { kind, ...extra }),
    key: `google:${orderId ?? noOrder(state)}:refund`,
  });
  switch (notice.type) {
    case "voided":
      return [refund("voided", notice.orderId ?? playOrder(sub), { refund_type: notice.refundType === 2 ? "partial" : "full" })];
    case 4: // SUBSCRIPTION_PURCHASED
      return playBuy(sub, state);
    case 2: // SUBSCRIPTION_RENEWED
      return playRenewal(sub, state, before, false);
    case 1: // SUBSCRIPTION_RECOVERED: charged after account hold
      return playRenewal(sub, state, before, true);
    case 3: // SUBSCRIPTION_CANCELED
      return [named("subscription_cancelled")];
    case 7: // SUBSCRIPTION_RESTARTED
      return [named("subscription_uncancelled")];
    case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
      return [named("billing_issue", { grace: true })];
    case 5: // SUBSCRIPTION_ON_HOLD
      return [named("billing_issue", { grace: false })];
    case 13: // SUBSCRIPTION_EXPIRED
      return [named("subscription_expired", { reason: null })];
    case 12: // SUBSCRIPTION_REVOKED
      return [refund("revoked", playOrder(sub))];
    default:
      return [];
  }
}

/** What verify-purchase heard from the app: the first order of a purchase
 *  made in the last few days (renewals reach us as notifications). */
export function playVerifyEvents(sub: PlaySubscription, state: StoreState, now = Date.now()): RevenueEvent[] {
  const order = playOrder(sub);
  const started = sub.startTime ? Date.parse(sub.startTime) : NaN;
  if (!order || order.includes("..") || !(now - started <= FRESH_MS)) return [];
  return playBuy(sub, state);
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

/**
 * Writes the events to funnel_events (one row per key) and sends the new ones
 * to PostHog. Never throws and never waits on PostHog; await it only to keep
 * the database write inside the request. No user: nothing (no one to count).
 */
export async function recordRevenue(
  db: SupabaseClient,
  userId: string | null | undefined,
  events: RevenueEvent[],
  meta: { source: "verify" | "notification"; notification?: string },
): Promise<void> {
  if (!userId || !events.length) return;
  try {
    const props = (e: RevenueEvent): Props => ({ ...e.props, source: meta.source, notification: meta.notification ?? null });
    let fresh = events;
    const { data, error } = await db
      .from("funnel_events")
      .upsert(
        events.map((e) => ({ user_id: userId, event: e.event, props: props(e), dedupe_key: e.key, created_at: e.at })),
        { onConflict: "dedupe_key", ignoreDuplicates: true },
      )
      .select("dedupe_key");
    if (error) {
      // Sent all the same; their uuids are stable, so PostHog still keeps one.
      console.error("funnel_events revenue insert failed", error.message);
      reportError("revenue", new Error(error.message), { user_id: userId, stage: "funnel_events" });
    } else {
      const written = new Set((data ?? []).map((r: { dedupe_key: string }) => r.dedupe_key));
      fresh = events.filter((e) => written.has(e.key));
    }
    if (!fresh.length) return;
    capture(await Promise.all(fresh.map(async (e) => {
      const p = props(e);
      if (PAID.has(e.event) && !p.sandbox && !p.family_shared && typeof p.price === "number" && p.price > 0) p.revenue = p.price;
      return { event: e.event, distinctId: userId, timestamp: e.at, uuid: await stableUuid(e.key), properties: p };
    })));
  } catch (err) {
    console.error("revenue events failed", (err as Error).message);
  }
}
