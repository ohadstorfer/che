// Edge function: POST /functions/v1/email-unsubscribe?u=<user id>&t=<token>
// No more win-back mail for this person (winback-email skips everyone in
// email_optouts). Two ways in, both a POST, so a link scanner opening the URL
// unsubscribes nobody:
//   - the mail app's own Unsubscribe button (List-Unsubscribe-Post, RFC 8058),
//     with u and t in the query and "List-Unsubscribe=One-Click" as the body;
//   - postaspanish.com/unsubscribe, the page the link in the mail opens, which
//     posts {u, t} here.
// The token is an HMAC of the user id with EMAIL_LINK_SECRET (_shared/winback.ts),
// so nobody can unsubscribe someone else. No sign-in: it works from any device.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { validToken } from "../_shared/winback.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const linkSecret = Deno.env.get("EMAIL_LINK_SECRET");
  if (!url || !serviceRole || !linkSecret) return json({ error: "function is not configured" }, { status: 500 });

  const query = new URL(req.url).searchParams;
  const raw = await req.text().catch(() => "");
  const oneClick = raw.includes("List-Unsubscribe=One-Click");
  let body: { u?: unknown; t?: unknown } = {};
  if (!oneClick) {
    try {
      body = JSON.parse(raw || "{}");
    } catch {
      body = {};
    }
  }
  const u = String(body.u ?? query.get("u") ?? "");
  const t = String(body.t ?? query.get("t") ?? "");
  if (!UUID.test(u) || !(await validToken(u, t, linkSecret))) {
    return json({ error: "invalid link" }, { status: 400 });
  }

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { error } = await db
    .from("email_optouts")
    .upsert({ user_id: u, source: oneClick ? "one-click" : "link" }, { onConflict: "user_id", ignoreDuplicates: true });
  // The account may be gone (deleted): nothing to mail anyway.
  if (error && error.code !== "23503") return json({ error: error.message }, { status: 500 });
  return json({ ok: true });
});
