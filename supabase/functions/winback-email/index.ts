// Edge function: POST /functions/v1/winback-email
// The win-back series (_shared/winback.ts): mails on days 1, 3, 7 and 30 after
// someone saved her account with Apple or Google, for as long as she hasn't
// bought. Called once an hour by the che-winback-email pg_cron job with the
// vault's cron_secret as bearer, like send-reminder.
//
// Who is asked is winback_candidates() (migration 20261019000020): no live
// premium, not opted out, the last mail not sent yet. Each mail is written to
// winback_emails before it goes, so (user, step) goes once even if two runs
// overlap; a failed send takes its row back and is tried next hour.
//
// Switches (supabase secrets):
//   WINBACK_EMAIL=on         sends. Anything else: only {"dryRun": true} answers.
//   WINBACK_APPLE_RELAY=on   also mails Apple's "Hide My Email" addresses. Leave
//                            off until postaspanish.com is registered in Apple
//                            Developer (Sign in with Apple for Email
//                            Communication), or Apple bounces them.
//   EMAIL_LINK_SECRET        signs the unsubscribe links (email-unsubscribe
//                            checks them). Required.
//   RESEND_API_KEY           _shared/email.ts.
//
// Body: {} sends what is due; {"dryRun": true} only counts it.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { buildMail, dueStep, SITE, type Step, unsubscribeToken } from "../_shared/winback.ts";

type Candidate = {
  user_id: string;
  email: string;
  name: string | null;
  saved_at: string;
  timezone: string;
  sent: number[];
  /** Has had a store subscription: no day-30 offer. */
  tried: boolean;
};

const PAGE = 1000; // PostgREST's row cap per request
// Resend takes 2 requests a second by default; what doesn't fit in one run
// goes the next hour, still inside its day's grace.
const MAX_PER_RUN = 80;
const GAP_MS = 600;
const APPLE_RELAY = /@privaterelay\.appleid\.com$/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const traceId = crypto.randomUUID().slice(0, 8);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const linkSecret = Deno.env.get("EMAIL_LINK_SECRET");
  if (!url || !serviceRole || !linkSecret) return json({ error: "function is not configured" }, { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  // Fails closed: no secret, no mail.
  const { data: secret } = await db.rpc("get_cron_secret");
  if (typeof secret !== "string" || !secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean };
  const dryRun = body.dryRun === true;
  if (!dryRun && Deno.env.get("WINBACK_EMAIL") !== "on") return json({ skipped: "WINBACK_EMAIL is off", traceId });
  const relayOn = Deno.env.get("WINBACK_APPLE_RELAY") === "on";

  const candidates: Candidate[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.rpc("winback_candidates").order("user_id").range(from, from + PAGE - 1);
    if (error) {
      console.error(`[winback-email ${traceId}] candidates`, error.message);
      return json({ error: error.message, traceId }, { status: 500 });
    }
    candidates.push(...((data ?? []) as Candidate[]));
    if (!data || data.length < PAGE) break;
  }

  const now = new Date();
  const due: { c: Candidate; step: Step }[] = [];
  let relaySkipped = 0;
  for (const c of candidates) {
    const step = dueStep(new Date(c.saved_at), now, c.timezone, c.sent ?? [], c.tried === true);
    if (!step) continue;
    if (APPLE_RELAY.test(c.email) && !relayOn) {
      relaySkipped++;
      continue;
    }
    due.push({ c, step });
  }

  const byStep = (list: { step: Step }[]) =>
    list.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.step]: (acc[d.step] ?? 0) + 1 }), {});

  if (dryRun) {
    return json({ dryRun: true, traceId, candidates: candidates.length, due: due.length, byStep: byStep(due), relaySkipped });
  }

  let sent = 0;
  const failed: { user_id: string; step: Step; error: string }[] = [];
  for (const { c, step } of due.slice(0, MAX_PER_RUN)) {
    // Claim the mail first: the key (user, step) lets one run through.
    const { data: claimed, error: claimErr } = await db
      .from("winback_emails")
      .upsert({ user_id: c.user_id, step, email: c.email }, { onConflict: "user_id,step", ignoreDuplicates: true })
      .select("user_id");
    if (claimErr) {
      failed.push({ user_id: c.user_id, step, error: claimErr.message });
      continue;
    }
    if (!claimed?.length) continue;

    const q = `u=${c.user_id}&t=${await unsubscribeToken(c.user_id, linkSecret)}`;
    const mail = buildMail(step, { name: c.name, unsubscribeUrl: `${SITE}/unsubscribe/?${q}` });
    const out = await sendEmail({
      to: c.email,
      ...mail,
      idempotencyKey: `winback-${c.user_id}-${step}`,
      headers: {
        // The mail app's own Unsubscribe button (RFC 8058): one POST, no page.
        "List-Unsubscribe": `<${url}/functions/v1/email-unsubscribe?${q}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (out.ok) {
      sent++;
      await db.from("winback_emails").update({ resend_id: out.id }).eq("user_id", c.user_id).eq("step", step);
    } else {
      failed.push({ user_id: c.user_id, step, error: out.error });
      await db.from("winback_emails").delete().eq("user_id", c.user_id).eq("step", step);
    }
    await sleep(GAP_MS);
  }

  const summary = {
    traceId,
    candidates: candidates.length,
    due: due.length,
    byStep: byStep(due),
    sent,
    failed: failed.length,
    deferred: Math.max(0, due.length - MAX_PER_RUN),
    relaySkipped,
  };
  console.log(`[winback-email ${traceId}]`, JSON.stringify(summary), failed.length ? JSON.stringify(failed) : "");
  return json(summary, { status: failed.length && !sent ? 502 : 200 });
});
