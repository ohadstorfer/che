// Edge function: POST /functions/v1/launch-email
// Launch day, once: tells the waitlist (public.waitlist) that Posta is in the
// stores. Only people who left an email get a mail (_shared/launch-email.ts);
// those who left a phone number come back in the answer, to message by hand.
// Each mailed row is stamped (launch_emailed_at, migration 20261020000040),
// so running it again only reaches whoever is left.
//
// Called with the vault's cron_secret as bearer, like cost-alert, so nobody
// else can set it off. Steps in che/docs/launch-day.md.
//
// Body: {} or {"dryRun": true} only counts and shows the mail;
//       {"send": true} sends.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { launchEmail } from "../_shared/launch-email.ts";
import { reported, reportError } from "../_shared/posthog.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Resend allows a couple of requests a second.
const PAUSE_MS = 600;

Deno.serve(reported("launch-email", async (req) => {
  const early = preflight(req);
  if (early) return early;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  // Fails closed: no secret, no answer.
  const { data: secret } = await db.rpc("get_cron_secret");
  if (typeof secret !== "string" || !secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { send?: boolean };
  const send = body.send === true;

  const { data: rows, error } = await db
    .from("waitlist")
    .select("id, name, contact")
    .is("launch_emailed_at", null)
    .order("id");
  if (error) {
    reportError("launch-email", new Error(error.message), { stage: "waitlist" });
    return json({ error: "could not read the waitlist" }, { status: 500 });
  }

  const mails = (rows ?? []).filter((r) => EMAIL.test(r.contact.trim()));
  const phones = (rows ?? []).filter((r) => !EMAIL.test(r.contact.trim())).map((r) => ({ name: r.name, phone: r.contact }));

  if (!send) {
    const sample = launchEmail(mails[0]?.name ?? "María");
    return json({ dryRun: true, toEmail: mails.length, phones, subject: sample.subject, text: sample.text });
  }

  let sent = 0;
  const failed: { id: number; error: string }[] = [];
  for (const row of mails) {
    const mail = launchEmail(row.name);
    const out = await sendEmail({
      to: row.contact.trim(),
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      idempotencyKey: `launch-email:${row.id}`,
    });
    if (out.ok) {
      sent++;
      const { error: stampError } = await db.from("waitlist").update({ launch_emailed_at: new Date().toISOString() }).eq("id", row.id);
      if (stampError) reportError("launch-email", new Error(stampError.message), { stage: "stamp", row: row.id });
    } else {
      failed.push({ id: row.id, error: out.error });
    }
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  return json({ sent, failed, phones });
}));
