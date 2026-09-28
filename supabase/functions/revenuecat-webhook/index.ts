// Edge function: POST /functions/v1/revenuecat-webhook
// RevenueCat → Che: keeps `entitlements` in step with the stores.
//
// Set up in RevenueCat → Integrations → Webhooks:
//   URL:            <SUPABASE_URL>/functions/v1/revenuecat-webhook
//   Authorization:  Bearer <REVENUECAT_WEBHOOK_SECRET>
// and `supabase secrets set REVENUECAT_WEBHOOK_SECRET=...`. Deploy with
// --no-verify-jwt: RevenueCat sends its own secret, not a Supabase JWT.
//
// The app logs purchases in with the Supabase user id (Purchases.logIn), so
// app_user_id is the user. Anonymous ids ($RCAnonymousID:…) are ignored.

import { createClient } from "jsr:@supabase/supabase-js@2";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Events after which she has access (until expiration_at_ms), and the one
// after which she doesn't. Cancellation keeps access to the end of the period;
// billing issues keep it through the grace period RevenueCat reports.
const GRANTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "CANCELLATION",
  "BILLING_ISSUE",
]);

interface RcEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  store?: string;
  period_type?: string;
  expiration_at_ms?: number | null;
  grace_period_expiration_at_ms?: number | null;
  transferred_to?: string[];
  transferred_from?: string[];
}

const ok = (body: unknown = { ok: true }) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") ?? "";
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }

  let event: RcEvent;
  try {
    event = ((await req.json()) as { event: RcEvent }).event;
  } catch {
    return new Response("invalid JSON", { status: 400 });
  }
  if (!event?.type) return new Response("no event", { status: 400 });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const now = new Date().toISOString();

  // A purchase moved between accounts (restore on another login).
  if (event.type === "TRANSFER") {
    const from = (event.transferred_from ?? []).filter((id) => UUID.test(id));
    const to = (event.transferred_to ?? []).filter((id) => UUID.test(id));
    if (from.length) {
      const { data: rows } = await db.from("entitlements").select("*").in("user_id", from);
      const carried = rows?.find((r) => r.active) ?? null;
      await db.from("entitlements").update({ active: false, last_event: "TRANSFER", updated_at: now }).in("user_id", from);
      for (const id of to) {
        await db.from("entitlements").upsert({
          user_id: id,
          active: !!carried,
          product_id: carried?.product_id ?? null,
          store: carried?.store ?? null,
          period_type: carried?.period_type ?? null,
          expires_at: carried?.expires_at ?? null,
          last_event: "TRANSFER",
          updated_at: now,
        });
      }
    }
    return ok();
  }

  const ids = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])];
  const userId = ids.find((id): id is string => !!id && UUID.test(id));
  if (!userId) return ok({ ok: true, ignored: "no Posta user id" });

  if (event.type !== "EXPIRATION" && !GRANTS.has(event.type)) return ok({ ok: true, ignored: event.type });

  const until = event.grace_period_expiration_at_ms ?? event.expiration_at_ms ?? null;
  const { error } = await db.from("entitlements").upsert({
    user_id: userId,
    active: event.type !== "EXPIRATION",
    product_id: event.product_id ?? null,
    store: event.store ?? null,
    period_type: event.period_type ?? null,
    expires_at: until ? new Date(until).toISOString() : null,
    last_event: event.type,
    updated_at: now,
  });
  if (error) {
    console.error("entitlements upsert failed", error.message);
    // Non-2xx makes RevenueCat retry, which is what a failed write wants.
    return new Response("write failed", { status: 500 });
  }
  return ok();
});
