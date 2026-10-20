// Edge function: POST /functions/v1/google-notifications?token=<secret>
// Google → Posta: Real-time developer notifications. Play publishes to a
// Pub/Sub topic every time a subscription changes, and a push subscription on
// that topic posts here.
//
// Set up once:
//   1. Google Cloud → Pub/Sub: a topic, with
//      google-play-developer-notifications@system.gserviceaccount.com granted
//      "Pub/Sub Publisher" on it.
//   2. A push subscription on the topic, to
//      <SUPABASE_URL>/functions/v1/google-notifications?token=<GOOGLE_PUBSUB_TOKEN>
//   3. Play Console → Monetize → Monetization setup → Real-time developer
//      notifications: the topic's name.
//   4. supabase secrets set GOOGLE_PUBSUB_TOKEN=$(openssl rand -hex 32)
//      and GOOGLE_PLAY_SERVICE_ACCOUNT (see _shared/store-google.ts).
// Deployed without JWT verification (config.toml): the token in the address is
// the check, and nothing the message says is believed anyway — it only names
// a purchase token, and Play is asked what that token is worth.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { applyState } from "../_shared/entitlement.ts";
import { reported, reportError } from "../_shared/posthog.ts";
import { playEvents, recordRevenue } from "../_shared/revenue.ts";
import { playAcknowledge, playState, playSubscription, serviceAccount } from "../_shared/store-google.ts";

interface PlayMessage {
  packageName?: string;
  testNotification?: unknown;
  subscriptionNotification?: { notificationType: number; purchaseToken: string };
  /** A refund or chargeback. productType 1 is a subscription. */
  voidedPurchaseNotification?: { purchaseToken: string; orderId?: string; productType?: number; refundType?: number };
}

const ok = (body: unknown = { ok: true }) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

Deno.serve(reported("google-notifications", async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const secret = Deno.env.get("GOOGLE_PUBSUB_TOKEN") ?? "";
  if (!secret || new URL(req.url).searchParams.get("token") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  let message: PlayMessage;
  let messageId: string | undefined;
  try {
    const { message: envelope } = (await req.json()) as { message?: { data?: string; messageId?: string } };
    messageId = envelope?.messageId;
    message = JSON.parse(atob(envelope?.data ?? "")) as PlayMessage;
  } catch {
    // Acknowledged all the same: Pub/Sub would send a broken message forever.
    return ok({ ok: true, ignored: "unreadable" });
  }

  const packageName = Deno.env.get("GOOGLE_PACKAGE_NAME") ?? "app.posta.android";
  if (message.packageName !== packageName) return ok({ ok: true, ignored: "another app" });
  const voided = message.voidedPurchaseNotification;
  const purchaseToken = message.subscriptionNotification?.purchaseToken ?? (voided?.productType === 1 ? voided.purchaseToken : undefined);
  if (!purchaseToken) return ok({ ok: true, ignored: "not a subscription" });

  const account = serviceAccount(Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT"));
  if (!account) return new Response("Google Play is not configured", { status: 500 });

  try {
    const sub = await playSubscription(account, packageName, purchaseToken);
    const state = sub && playState(sub, purchaseToken);
    if (!sub || !state) return ok({ ok: true, ignored: "unknown purchase" });
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const event = voided ? "VOIDED" : `PLAY:${message.subscriptionNotification!.notificationType}`;
    const { userId, ignored, before } = await applyState(db, state, event);
    if (userId && state.active && sub.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") {
      await playAcknowledge(account, packageName, state.productId, purchaseToken);
    }
    if (ignored !== "unknown product") {
      const notice = voided
        ? { type: "voided" as const, messageId, orderId: voided.orderId, refundType: voided.refundType }
        : { type: message.subscriptionNotification!.notificationType, messageId };
      await recordRevenue(db, userId, playEvents(notice, sub, state, before), { source: "notification", notification: event });
    }
    return ok(ignored ? { ok: true, ignored } : { ok: true });
  } catch (e) {
    console.error("google notification failed", (e as Error).message);
    reportError("google-notifications", e, { notification: voided ? "VOIDED" : message.subscriptionNotification?.notificationType });
    // Non-2xx makes Pub/Sub send it again.
    return new Response("failed", { status: 500 });
  }
}));
