// Edge function: POST /functions/v1/redeem-code
// Android's half of discount codes: she types a code on the paywall, this
// says which Play offer it opens, and the app buys the plan with that offer.
// What she pays is still Play's to charge and verify-purchase's to check.
// (On iOS Apple's own sheet takes the code; this isn't asked.)
//
// Body: { "code": "posta50" }
// Answers { ok: true, productId, offerTag }
//      or { ok: true, granted: true } for an access code (below)
//      or { ok: false, reason: "unknown" | "expired" | "used" }.
//
// Codes live in `promo_codes` (migration 20261019000002); a code with
// max_uses counts the people who opened it, in `promo_redemptions`.
// An access code (grants_days set, migration 20261020000030) buys nothing:
// it writes her an `entitlements` row (store 'CODE') that ends by itself after
// that many days. Store reviewers get in this way, since they can't pay.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

const normalize = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

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

  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? normalize(body.code) : "";
  if (!code || code.length > 40) return json({ ok: false, reason: "unknown" });

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: row, error } = await db
    .from("promo_codes")
    .select("code, product_id, google_offer_tag, active, expires_at, max_uses, grants_days")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("redeem-code: lookup", error.message);
    return json({ error: "could not check the code" }, { status: 500 });
  }
  if (!row || !row.active) return json({ ok: false, reason: "unknown" });
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return json({ ok: false, reason: "expired" });

  if (row.max_uses != null) {
    const { data: mine } = await db.from("promo_redemptions").select("user_id").eq("code", code).eq("user_id", userId).maybeSingle();
    if (!mine) {
      const { count } = await db.from("promo_redemptions").select("user_id", { count: "exact", head: true }).eq("code", code);
      if ((count ?? 0) >= row.max_uses) return json({ ok: false, reason: "used" });
    }
  }
  await db.from("promo_redemptions").upsert({ code, user_id: userId }, { onConflict: "code,user_id", ignoreDuplicates: true });

  if (row.grants_days) {
    // A real subscription, or the days this code already gave her, are left
    // as they are: typing it again doesn't start the clock over.
    const { data: ent } = await db.from("entitlements").select("active, store, expires_at").eq("user_id", userId).maybeSingle();
    const live = !!ent?.active && (!ent.expires_at || new Date(ent.expires_at) > new Date());
    if (live && ent.store !== "TESTER") return json({ ok: true, granted: true });
    const { error: grantError } = await db.from("entitlements").upsert({
      user_id: userId,
      active: true,
      product_id: `code:${code}`,
      store: "CODE",
      store_ref: null,
      store_signed_at: null,
      period_type: null,
      expires_at: new Date(Date.now() + row.grants_days * 86_400_000).toISOString(),
      last_event: "CODE",
      updated_at: new Date().toISOString(),
    });
    if (grantError) {
      console.error("redeem-code: grant", grantError.message);
      return json({ error: "could not apply the code" }, { status: 500 });
    }
    return json({ ok: true, granted: true });
  }

  return json({ ok: true, productId: row.product_id, offerTag: row.google_offer_tag });
});
