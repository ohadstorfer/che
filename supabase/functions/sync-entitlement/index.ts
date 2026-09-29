// Edge function: POST /functions/v1/sync-entitlement
// Asks RevenueCat about the caller and writes her `entitlements` row, for when
// the store says she paid but the webhook (revenuecat-webhook) hasn't reached
// us yet — late, failed, or never set up. The lesson lock (migration
// 20260928000004) reads only that row, so without this a paying account would
// sit in front of the paywall until the webhook turned up.
//
// Only ever grants: an expiry is the webhook's to report. Needs
// REVENUECAT_SECRET_KEY (as delete-account does); without it, answers false.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

// billing-shared.ts ENTITLEMENT.
const ENTITLEMENT = "premium";

interface RcEntitlement {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
  product_identifier: string;
}

interface RcSubscription {
  store?: string;
  period_type?: string;
}

Deno.serve(async (req) => {
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

  const rcKey = Deno.env.get("REVENUECAT_SECRET_KEY");
  if (!rcKey) return json({ premium: false });

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${rcKey}` },
  }).catch(() => null);
  if (!res?.ok) return json({ premium: false });
  const { subscriber } = (await res.json()) as {
    subscriber?: { entitlements?: Record<string, RcEntitlement>; subscriptions?: Record<string, RcSubscription> };
  };

  const ent = subscriber?.entitlements?.[ENTITLEMENT];
  const until = ent ? (ent.grace_period_expires_date ?? ent.expires_date) : null;
  const active = !!ent && (!until || new Date(until).getTime() > Date.now());
  if (!ent || !active) return json({ premium: false });

  const sub = subscriber?.subscriptions?.[ent.product_identifier];
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { error } = await db.from("entitlements").upsert({
    user_id: userId,
    active: true,
    product_id: ent.product_identifier,
    // The REST API spells these in lower case; the webhook, in upper.
    store: sub?.store?.toUpperCase() ?? null,
    period_type: sub?.period_type?.toUpperCase() ?? null,
    expires_at: until,
    last_event: "SYNC",
    updated_at: new Date().toISOString(),
  });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ premium: true });
});
