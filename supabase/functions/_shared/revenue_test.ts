import { assert, assertEquals, assertMatch } from "jsr:@std/assert@1";
import type { EntitlementRow, StoreState } from "./entitlement.ts";
import { lineCost } from "./ai-cost.ts";
import { scrub, stableUuid } from "./posthog.ts";
import { appleEvents, appleVerifyEvents, playEvents, playVerifyEvents, WINBACK_PRODUCT } from "./revenue.ts";
import type { AppleNotification, AppleTransaction } from "./store-apple.ts";
import type { PlaySubscription } from "./store-google.ts";

const NOW = Date.UTC(2026, 9, 20);
const HOUR = 3600_000;

const tx = (over: Partial<AppleTransaction> = {}): AppleTransaction => ({
  bundleId: "app.posta.ios",
  productId: "posta_premium_annual",
  type: "Auto-Renewable Subscription",
  transactionId: "2000",
  originalTransactionId: "1000",
  environment: "Production",
  signedDate: NOW,
  purchaseDate: NOW - HOUR,
  price: 39990,
  currency: "USD",
  transactionReason: "RENEWAL",
  ...over,
});
const note = (notificationType: string, subtype?: string): AppleNotification => ({
  notificationType,
  subtype,
  notificationUUID: "n-1",
  signedDate: NOW,
});
const trialRow = { period_type: "TRIAL" } as EntitlementRow;
const names = (e: { event: string }[]) => e.map((x) => x.event);

Deno.test("apple: initial buy with a free trial is a trial, not money", () => {
  const t = tx({ transactionId: "1000", transactionReason: "PURCHASE", offerType: 1, offerDiscountType: "FREE_TRIAL", price: 0 });
  const e = appleEvents(note("SUBSCRIBED", "INITIAL_BUY"), t);
  assertEquals(names(e), ["trial_started"]);
  assertEquals(e[0].props.is_trial, true);
  assertEquals(e[0].key, "apple:1000:charge");
});

Deno.test("apple: the renewal after a trial is the first payment; after that, renewals", () => {
  const first = appleEvents(note("DID_RENEW"), tx(), trialRow);
  assertEquals(names(first), ["first_payment"]);
  assertEquals(first[0].props.from_trial, true);
  assertEquals(first[0].props.price, 39.99);
  const later = appleEvents(note("DID_RENEW", "BILLING_RECOVERY"), tx(), { period_type: "NORMAL" } as EntitlementRow);
  assertEquals(names(later), ["subscription_renewed"]);
  assertEquals(later[0].props.billing_recovery, true);
  // Same charge, same key, whatever it was called: counted once.
  assertEquals(first[0].key, later[0].key);
});

Deno.test("apple: the win-back product and win-back offers", () => {
  const t = tx({ transactionId: "1000", transactionReason: "PURCHASE", productId: WINBACK_PRODUCT, offerType: 1, offerDiscountType: "PAY_UP_FRONT" });
  assertEquals(names(appleEvents(note("SUBSCRIBED", "INITIAL_BUY"), t)), ["first_payment", "winback_redeemed"]);
  const back = tx({ transactionReason: "PURCHASE", offerType: 4, offerIdentifier: "come-back" });
  const e = appleEvents(note("SUBSCRIBED", "RESUBSCRIBE"), back);
  assertEquals(names(e), ["subscription_resubscribed", "winback_redeemed"]);
  assertEquals(e[0].props.offer_type, "winback");
  assertEquals(e[0].props.offer_id, "come-back");
});

Deno.test("apple: cancellation, billing, expiry, refund", () => {
  assertEquals(names(appleEvents(note("DID_CHANGE_RENEWAL_STATUS", "AUTO_RENEW_DISABLED"), tx())), ["subscription_cancelled"]);
  assertEquals(names(appleEvents(note("DID_CHANGE_RENEWAL_STATUS", "AUTO_RENEW_ENABLED"), tx())), ["subscription_uncancelled"]);
  assertEquals(appleEvents(note("DID_FAIL_TO_RENEW", "GRACE_PERIOD"), tx())[0].props.grace, true);
  assertEquals(appleEvents(note("EXPIRED", "VOLUNTARY"), tx())[0].props.reason, "VOLUNTARY");
  assertEquals(names(appleEvents(note("GRACE_PERIOD_EXPIRED"), tx())), ["subscription_expired"]);
  const refund = appleEvents(note("REFUND"), tx());
  assertEquals(names(refund), ["subscription_refunded"]);
  assertEquals(refund[0].key, "apple:2000:refund");
  assertEquals(appleEvents(note("PRICE_INCREASE", "PENDING"), tx()), []);
  assertEquals(appleEvents(note("TEST"), tx()), []);
});

Deno.test("apple verify: fresh charges only, keyed like the notification", () => {
  const buy = tx({ transactionId: "1000", transactionReason: "PURCHASE", offerType: 1, offerDiscountType: "FREE_TRIAL" });
  const v = appleVerifyEvents(buy, null, NOW);
  assertEquals(names(v), ["trial_started"]);
  assertEquals(v[0].key, appleEvents(note("SUBSCRIBED", "INITIAL_BUY"), buy)[0].key);
  assertEquals(appleVerifyEvents(tx({ purchaseDate: NOW - 80 * HOUR }), null, NOW), []);
  assertEquals(names(appleVerifyEvents(tx(), trialRow, NOW)), ["first_payment"]);
  assertEquals(appleVerifyEvents(tx({ type: "Non-Consumable" }), null, NOW), []);
});

const state = (over: Partial<StoreState> = {}): StoreState => ({
  store: "PLAY_STORE",
  ref: "secret-token",
  linkedRef: null,
  productId: "posta_premium_annual",
  active: true,
  expiresAt: "2027-10-20T00:00:00.000Z",
  periodType: "NORMAL",
  signedAt: new Date(NOW).toISOString(),
  accountId: null,
  sandbox: false,
  ...over,
});
const play = (over: Partial<PlaySubscription> = {}, item: Record<string, unknown> = {}): PlaySubscription => ({
  subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
  startTime: new Date(NOW - HOUR).toISOString(),
  latestOrderId: "GPA.1",
  lineItems: [{
    productId: "posta_premium_annual",
    expiryTime: "2027-10-20T00:00:00Z",
    offerDetails: { basePlanId: "annual", offerId: undefined, offerTags: [] },
    autoRenewingPlan: { autoRenewEnabled: true, recurringPrice: { currencyCode: "USD", units: "39", nanos: 990000000 } },
    ...item,
  }],
  ...over,
});

Deno.test("google: purchase, renewal after trial, refund", () => {
  const trial = play({}, { offerPhase: { freeTrial: {} }, offerDetails: { basePlanId: "annual", offerId: "trial-7d" } });
  const t = playEvents({ type: 4, messageId: "m1" }, trial, state());
  assertEquals(names(t), ["trial_started"]);
  assertEquals(t[0].props.offer_id, "trial-7d");
  assertEquals(t[0].key, "google:GPA.1:charge");

  const paid = play({ latestOrderId: "GPA.1..0" });
  const r = playEvents({ type: 2, messageId: "m2" }, paid, state(), trialRow);
  assertEquals(names(r), ["first_payment"]);
  assertEquals(r[0].props.price, 39.99);
  assertEquals(names(playEvents({ type: 1, messageId: "m3" }, paid, state())), ["subscription_renewed"]);

  const voided = playEvents({ type: "voided", messageId: "m4", orderId: "GPA.1..0", refundType: 1 }, paid, state());
  const revoked = playEvents({ type: 12, messageId: "m5" }, paid, state());
  assertEquals(names(voided), ["subscription_refunded"]);
  // A refund heard as both "voided" and "revoked" is one refund.
  assertEquals(voided[0].key, revoked[0].key);
  for (const e of [...t, ...r, ...voided]) assert(!e.key.includes("secret-token"));
});

Deno.test("google: lifecycle notices", () => {
  const s = play();
  assertEquals(names(playEvents({ type: 3, messageId: "a" }, s, state())), ["subscription_cancelled"]);
  assertEquals(names(playEvents({ type: 7, messageId: "a" }, s, state())), ["subscription_uncancelled"]);
  assertEquals(playEvents({ type: 6, messageId: "a" }, s, state())[0].props.grace, true);
  assertEquals(playEvents({ type: 5, messageId: "a" }, s, state())[0].props.grace, false);
  assertEquals(names(playEvents({ type: 13, messageId: "a" }, s, state())), ["subscription_expired"]);
  assertEquals(playEvents({ type: 10, messageId: "a" }, s, state()), []);
  assertEquals(names(playEvents({ type: 4, messageId: "a" }, s, state({ linkedRef: "old" }))), ["subscription_resubscribed"]);
  const wb = play({}, { productId: WINBACK_PRODUCT, offerPhase: { introductoryPrice: {} } });
  const e = playEvents({ type: 4, messageId: "a" }, wb, state({ productId: WINBACK_PRODUCT }));
  assertEquals(names(e), ["first_payment", "winback_redeemed"]);
  assertEquals(e[0].props.price, null); // the cheaper year isn't in recurringPrice
});

Deno.test("google verify: only a fresh first order", () => {
  assertEquals(names(playVerifyEvents(play(), state(), NOW)), ["first_payment"]);
  assertEquals(playVerifyEvents(play({ latestOrderId: "GPA.1..3" }), state(), NOW), []);
  assertEquals(playVerifyEvents(play({ startTime: new Date(NOW - 100 * HOUR).toISOString() }), state(), NOW), []);
});

Deno.test("posthog helpers: stable uuids, scrubbed messages", async () => {
  const a = await stableUuid("apple:1:charge");
  assertEquals(a, await stableUuid("apple:1:charge"));
  assert(a !== (await stableUuid("apple:2:charge")));
  assertMatch(a, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assertEquals(scrub("mail ana@example.com Bearer abcdefghijklmnop"), "mail <email> <token>");
});

Deno.test("ai cost: tokens, characters, seconds", () => {
  const haiku = lineCost({
    provider: "anthropic", model: "claude-haiku-5-5", stage: "reply", calls: 1,
    input_tokens: 1_000_000, output_tokens: 1_000_000, cache_read_tokens: 1_000_000, cache_write_tokens: 1_000_000,
    audio_seconds: 0, tts_chars: 0,
  });
  assertEquals(Math.round(haiku.usd * 1000) / 1000, 0.735);
  assertEquals(haiku.unknown, false);
  const odd = lineCost({
    provider: "anthropic", model: "claude-new", stage: "reply", calls: 1,
    input_tokens: 1_000_000, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, audio_seconds: 0, tts_chars: 0,
  });
  assertEquals(odd, { usd: 4, unknown: true });
  const eleven = lineCost({
    provider: "elevenlabs", model: null, stage: "tts", calls: 1,
    input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, audio_seconds: 3600, tts_chars: 1000,
  });
  assertEquals(Math.round(eleven.usd * 100) / 100, 0.45);
});
