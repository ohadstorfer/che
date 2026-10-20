// Edge function: POST /functions/v1/cost-alert
// The AI bill, watched. Once an hour (the che-cost-alert pg_cron job, with
// the vault's cron_secret as bearer, like winback-email) it sums what Claude
// and ElevenLabs cost today and yesterday (UTC) from hablar_usage
// (_shared/ai-cost.ts prices it), and mails ALERT_EMAIL when a day passes
// ALERT_DAILY_COST_USD. One mail per day at most: the day is written to
// ops_alerts before the mail goes, and taken back if it fails.
//
// Function errors are not counted here: they go to PostHog as $exception
// (_shared/posthog.ts reportError), and PostHog's own alert watches them.
//
// Secrets:
//   ALERT_EMAIL            where the alert goes. Unset: nothing is sent.
//   ALERT_DAILY_COST_USD   the line, default 5.
//   RESEND_API_KEY         _shared/email.ts.
//
// Body: {} checks and mails when over; {"dryRun": true} only answers the
// numbers; {"test": true} mails today's numbers whatever they are.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { dollars, estimateCost, type UsageTotal } from "../_shared/ai-cost.ts";
import { json, preflight } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { reported, reportError } from "../_shared/posthog.ts";

const DAY = 86_400_000;
const DEFAULT_LINE = 5;

Deno.serve(reported("cost-alert", async (req) => {
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

  const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean; test?: boolean };
  const line = Number(Deno.env.get("ALERT_DAILY_COST_USD")) || DEFAULT_LINE;
  const to = Deno.env.get("ALERT_EMAIL") ?? "";

  const today = new Date(Math.floor(Date.now() / DAY) * DAY);
  const days = [new Date(today.getTime() - DAY), today];
  const totals = [];
  for (const from of days) {
    const { data, error } = await db.rpc("hablar_usage_totals", {
      p_from: from.toISOString(),
      p_to: new Date(Math.min(from.getTime() + DAY, Date.now())).toISOString(),
    });
    if (error) {
      reportError("cost-alert", new Error(error.message), { stage: "usage_totals" });
      return json({ error: error.message }, { status: 500 });
    }
    totals.push({ day: from.toISOString().slice(0, 10), ...estimateCost((data ?? []) as UsageTotal[]) });
  }
  const [yesterday, now] = totals;
  const summary = { line, yesterday: round(yesterday.usd), today: round(now.usd) };
  if (body.dryRun) return json({ dryRun: true, ...summary, lines: now.lines, unknownModels: now.unknownModels });
  if (!to) return json({ ...summary, skipped: "ALERT_EMAIL is not set" });

  const sent: string[] = [];
  const failed: string[] = [];
  for (const day of body.test ? [now] : totals.filter((t) => t.usd >= line)) {
    if (!body.test) {
      // Claim the day first: (kind, day) lets one mail through.
      const { data: claimed, error } = await db
        .from("ops_alerts")
        .upsert({ kind: "ai_cost", day: day.day, value: round(day.usd) }, { onConflict: "kind,day", ignoreDuplicates: true })
        .select("day");
      if (error) {
        failed.push(`${day.day}: ${error.message}`);
        continue;
      }
      if (!claimed?.length) continue;
    }
    const out = await sendEmail({
      to,
      subject: `${body.test ? "[test] " : ""}Posta: AI cost ${dollars(day.usd)} on ${day.day} (line ${dollars(line)})`,
      text: mailText(day, yesterday, line),
    });
    if (out.ok) sent.push(day.day);
    else {
      failed.push(`${day.day}: ${out.error}`);
      if (!body.test) await db.from("ops_alerts").delete().eq("kind", "ai_cost").eq("day", day.day);
    }
  }
  if (failed.length) reportError("cost-alert", new Error(failed.join("; ")), { stage: "send" });
  return json({ ...summary, sent, failed }, { status: failed.length ? 500 : 200 });
}));

const round = (usd: number) => Math.round(usd * 100) / 100;

function mailText(
  day: { day: string; usd: number; lines: ReturnType<typeof estimateCost>["lines"]; unknownModels: string[] },
  yesterday: { day: string; usd: number },
  line: number,
): string {
  const rows = day.lines
    .filter((l) => l.usd >= 0.005)
    .map((l) => `  ${dollars(l.usd).padStart(10)}  ${l.provider} ${l.model ?? ""} ${l.stage} (${l.calls} calls)`);
  return [
    `AI cost on ${day.day} (UTC${day.day === new Date().toISOString().slice(0, 10) ? ", so far" : ""}): ${dollars(day.usd)}`,
    `The line: ${dollars(line)} a day (ALERT_DAILY_COST_USD).`,
    day.day !== yesterday.day ? `Yesterday (${yesterday.day}): ${dollars(yesterday.usd)}` : null,
    "",
    "Where it went:",
    ...(rows.length ? rows : ["  (nothing)"]),
    day.unknownModels.length ? `\nPriced as Opus, no price in _shared/ai-cost.ts: ${day.unknownModels.join(", ")}` : null,
    "",
    "Estimated from hablar_usage at list prices. Function errors: PostHog → Error tracking.",
  ].filter((l) => l !== null).join("\n");
}
