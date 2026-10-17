// Edge function: POST /functions/v1/waitlist
// Body: {"name": "...", "contact": "<email or phone>", "bot-field": ""}
//
// The postaspanish.com waitlist form (posta-site/script.js, its endpoint in
// posta-site/config.js). Public: no account, so verify_jwt is off. A filled
// honeypot gets a quiet 200 and nothing is saved; signing up twice with the
// same contact is a success too.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body["bot-field"] === "string" && body["bot-field"]) return json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
  if (!name || !(EMAIL.test(contact) || PHONE.test(contact))) {
    return json({ error: "a name and an email or phone number are required" }, { status: 400 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { error } = await db.from("waitlist").insert({
    name,
    contact,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });
  // 23505: this contact is already on the list.
  if (error && error.code !== "23505") return json({ error: "could not save" }, { status: 500 });
  return json({ ok: true });
});
