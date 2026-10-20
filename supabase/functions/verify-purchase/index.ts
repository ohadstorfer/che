// Edge function: POST /functions/v1/verify-purchase
// The app, right after she buys or restores: "the store on this phone says I
// have Premium". Nothing the phone says is believed; the proof it sends is
// checked with the store itself, and only then is her `entitlements` row
// written — the row the lesson lock (migration 20260928000004) and
// hablar-start read.
//
// Body: { "store": "apple", "token": <the transaction's JWS> }
//       { "store": "google", "token": <the purchase token> }
// Answers { premium }.
//
// Apple needs no secret: the JWS carries Apple's own signature. Google needs
// GOOGLE_PLAY_SERVICE_ACCOUNT (see _shared/store-google.ts). APPLE_BUNDLE_ID
// and GOOGLE_PACKAGE_NAME default to app.posta.ios and app.posta.android.
//
// What happens later — renewals, cancellations, refunds — arrives on its own
// through apple-notifications and google-notifications.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { applyState, type StoreState } from "../_shared/entitlement.ts";
import { reported, reportError } from "../_shared/posthog.ts";
import { appleVerifyEvents, playVerifyEvents, recordRevenue } from "../_shared/revenue.ts";
import { type AppleTransaction, appleState, verifyAppleJws } from "../_shared/store-apple.ts";
import { playAcknowledge, type PlaySubscription, playState, playSubscription, serviceAccount } from "../_shared/store-google.ts";

const APPLE_BUNDLE_ID = "app.posta.ios";
const GOOGLE_PACKAGE_NAME = "app.posta.android";

Deno.serve(reported("verify-purchase", async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });

  const asUser = createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: who } = await asUser.auth.getUser();
  const userId = who?.user?.id;
  if (!userId) return json({ error: "not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { store?: string; token?: string };
  if (typeof body.token !== "string" || !body.token) return json({ error: "no token" }, { status: 400 });

  let state: StoreState | null = null;
  let tx: AppleTransaction | null = null;
  let sub: PlaySubscription | null = null;
  if (body.store === "apple") {
    try {
      tx = await verifyAppleJws<AppleTransaction>(body.token);
    } catch (e) {
      console.error("Apple transaction refused", (e as Error).message);
      return json({ error: "not an App Store transaction" }, { status: 400 });
    }
    if (tx.bundleId !== (Deno.env.get("APPLE_BUNDLE_ID") ?? APPLE_BUNDLE_ID)) return json({ error: "another app's purchase" }, { status: 400 });
    state = appleState(tx, null);
  } else if (body.store === "google") {
    const account = serviceAccount(Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT"));
    if (!account) return json({ error: "Google Play is not configured" }, { status: 500 });
    const packageName = Deno.env.get("GOOGLE_PACKAGE_NAME") ?? GOOGLE_PACKAGE_NAME;
    try {
      sub = await playSubscription(account, packageName, body.token);
      state = sub && playState(sub, body.token);
      if (!sub || !state) return json({ error: "Play does not know this purchase" }, { status: 400 });
      if (state.active && sub.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") {
        await playAcknowledge(account, packageName, state.productId, body.token);
      }
    } catch (e) {
      // Play was unreachable: the app keeps the purchase and asks again.
      console.error("Play unreachable", (e as Error).message);
      reportError("verify-purchase", e, { user_id: userId, store: "google", stage: "play" });
      return json({ error: "store unreachable, try again" }, { status: 502 });
    }
  } else {
    return json({ error: "store must be apple or google" }, { status: 400 });
  }

  try {
    const db = createClient(url, serviceRole, { auth: { persistSession: false } });
    const { premium, before } = await applyState(db, state, "VERIFY", userId);
    const events = tx ? appleVerifyEvents(tx, before) : sub ? playVerifyEvents(sub, state) : [];
    await recordRevenue(db, userId, events, { source: "verify" });
    return json({ premium });
  } catch (e) {
    console.error("entitlements write failed", (e as Error).message);
    reportError("verify-purchase", e, { user_id: userId, store: body.store, stage: "entitlements" });
    return json({ error: "could not save the purchase" }, { status: 500 });
  }
}));
