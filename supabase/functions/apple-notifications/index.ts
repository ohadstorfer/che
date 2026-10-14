// Edge function: POST /functions/v1/apple-notifications
// Apple → Posta: App Store Server Notifications (version 2). Apple posts here
// every time a subscription changes — renewed, cancelled, failed to bill,
// expired, refunded — and this keeps `entitlements` in step.
//
// Set up in App Store Connect → the app → App Information → App Store Server
// Notifications, for both Production and Sandbox, version 2:
//   <SUPABASE_URL>/functions/v1/apple-notifications
// Deployed without JWT verification (config.toml): Apple signs the body, and
// that signature is what is checked.
//
// The notification names the purchase, not the person. She is found by the
// row that already holds the purchase (written by verify-purchase when she
// bought it), or by the Posta user id the app attached at purchase.
//
// The type of notification is recorded but not trusted for the answer: the
// transaction inside says when access ends and whether it was revoked.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { applyState } from "../_shared/entitlement.ts";
import {
  type AppleNotification,
  type AppleRenewal,
  type AppleTransaction,
  appleState,
  verifyAppleJws,
} from "../_shared/store-apple.ts";

const ok = (body: unknown = { ok: true }) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  let note: AppleNotification;
  let tx: AppleTransaction | null = null;
  let renewal: AppleRenewal | null = null;
  try {
    const { signedPayload } = (await req.json()) as { signedPayload?: string };
    if (!signedPayload) return new Response("no signedPayload", { status: 400 });
    note = await verifyAppleJws<AppleNotification>(signedPayload);
    if (note.data?.signedTransactionInfo) tx = await verifyAppleJws<AppleTransaction>(note.data.signedTransactionInfo);
    if (note.data?.signedRenewalInfo) renewal = await verifyAppleJws<AppleRenewal>(note.data.signedRenewalInfo);
  } catch (e) {
    return new Response(`not from Apple: ${(e as Error).message}`, { status: 400 });
  }

  // TEST, and the few that carry no transaction (a summary of extensions).
  if (!tx) return ok({ ok: true, ignored: note.notificationType });
  if (tx.bundleId !== (Deno.env.get("APPLE_BUNDLE_ID") ?? "app.posta.ios")) return ok({ ok: true, ignored: "another app" });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  try {
    const event = note.subtype ? `${note.notificationType}:${note.subtype}` : note.notificationType;
    const { ignored } = await applyState(db, appleState(tx, renewal), event);
    return ok(ignored ? { ok: true, ignored } : { ok: true });
  } catch (e) {
    console.error("entitlements write failed", (e as Error).message);
    // Non-2xx makes Apple send it again, which is what a failed write wants.
    return new Response("write failed", { status: 500 });
  }
});
