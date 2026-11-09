// Edge function: POST /functions/v1/free-guide
// Body: {"email": "...", "guide": "slang" | "vos" | "learn", "source": "ig-dm", "bot-field": ""}
//
// The email form on postaspanish.com/free/<guide> (scripts/site/free/free.js).
// Saves the lead in public.guide_leads and mails the PDF once (Resend). Public:
// no account, so verify_jwt is off. A filled honeypot gets a quiet 200 and
// nothing is saved. Asking twice for the same guide is a success and sends no
// second mail.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { GUIDES, guideEmail, type GuideSlug } from "../_shared/free-guides.ts";
import { reported } from "../_shared/posthog.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(reported("free-guide", async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body["bot-field"] === "string" && body["bot-field"]) return json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const guide = body.guide as GuideSlug;
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 120) || null : null;
  if (!EMAIL.test(email)) return json({ error: "a valid email is required" }, { status: 400 });
  if (!(guide in GUIDES)) return json({ error: "unknown guide" }, { status: 400 });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { data: row, error } = await db.from("guide_leads").insert({
    email,
    guide,
    source,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  }).select("id").single();
  // 23505: this email already has this guide (and its mail).
  if (error?.code === "23505") return json({ ok: true });
  if (error || !row) return json({ error: "could not save" }, { status: 500 });

  const mail = guideEmail(guide);
  const sent = await sendEmail({ to: email, ...mail, idempotencyKey: `guide-${row.id}` });
  if (sent.ok) await db.from("guide_leads").update({ emailed_at: new Date().toISOString() }).eq("id", row.id);
  else console.error("free-guide mail failed:", sent.error);
  // The page unlocks either way; a failed mail is in the logs and emailed_at stays empty.
  return json({ ok: true });
}));
