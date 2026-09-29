// Edge function: POST /functions/v1/tester-premium
// Premium for testers, before Posta is in the stores. The paywall shows an
// "Unlock as a tester" button while this is switched on; pressing it writes the
// caller an `entitlements` row the premium lock (migration 20260928000004)
// honours, like a real purchase would.
//
// Switched on by `supabase secrets set TESTER_PREMIUM=on`; unset it before the
// store launch and the button goes away and this refuses. Grants already made
// stay; to take them back:
//   update public.entitlements set active = false where store = 'TESTER';
//
// Body: {} grants; {"check": true} only answers whether it is switched on.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const enabled = Deno.env.get("TESTER_PREMIUM") === "on";
  const body = (await req.json().catch(() => ({}))) as { check?: boolean };
  if (body.check) return json({ enabled });
  if (!enabled) return json({ error: "tester unlock is off" }, { status: 403 });

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

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  // A real subscription is left as it is: revoking testers later mustn't touch it.
  const { data: row } = await db.from("entitlements").select("active, store, expires_at").eq("user_id", userId).maybeSingle();
  const paid = !!row?.active && row.store !== "TESTER" && (!row.expires_at || new Date(row.expires_at) > new Date());
  if (paid) return json({ premium: true });

  const { error } = await db.from("entitlements").upsert({
    user_id: userId,
    active: true,
    product_id: "tester",
    store: "TESTER",
    period_type: null,
    expires_at: null,
    last_event: "TESTER",
    updated_at: new Date().toISOString(),
  });
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ premium: true });
});
