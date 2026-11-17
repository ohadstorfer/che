// Edge function: POST /functions/v1/ses-events?t=<SES_EVENTS_TOKEN>
// Amazon SNS posts here the Bounce and Complaint events of SES configuration
// set "posta" (topic posta-ses-events). A permanent bounce or any complaint
// goes to public.ses_suppress: recorded in email_suppressions, and the
// matching user is opted out of win-back mail. SES's account-level
// suppression list already stops the mail itself.
//
// Auth: the secret token in the subscription URL, plus the topic ARN.
// SubscriptionConfirmation is confirmed by opening its SubscribeURL, only when
// it points at SNS.

import { createClient } from "jsr:@supabase/supabase-js@2";

const TOPIC_ARN = "arn:aws:sns:us-east-1:128009599743:posta-ses-events";

type SnsEnvelope = {
  Type?: string;
  TopicArn?: string;
  Message?: string;
  SubscribeURL?: string;
};

type SesEvent = {
  eventType?: string;
  bounce?: { bounceType?: string; bounceSubType?: string; bouncedRecipients?: { emailAddress?: string }[] };
  complaint?: { complaintFeedbackType?: string; complainedRecipients?: { emailAddress?: string }[] };
  mail?: { messageId?: string; commonHeaders?: { subject?: string } };
};

function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const token = Deno.env.get("SES_EVENTS_TOKEN");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !url || !serviceRole) return new Response("not configured", { status: 500 });
  if (!equalStrings(new URL(req.url).searchParams.get("t") ?? "", token)) {
    return new Response("forbidden", { status: 403 });
  }

  let msg: SnsEnvelope;
  try {
    msg = JSON.parse(await req.text());
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (msg.TopicArn !== TOPIC_ARN) return new Response("wrong topic", { status: 403 });

  if (msg.Type === "SubscriptionConfirmation") {
    const sub = new URL(msg.SubscribeURL ?? "");
    if (sub.protocol !== "https:" || !/^sns\.[a-z0-9-]+\.amazonaws\.com$/.test(sub.hostname)) {
      return new Response("bad subscribe url", { status: 400 });
    }
    const res = await fetch(sub);
    return new Response(res.ok ? "confirmed" : "confirm failed", { status: res.ok ? 200 : 502 });
  }
  if (msg.Type !== "Notification") return new Response("ignored");

  let event: SesEvent;
  try {
    event = JSON.parse(msg.Message ?? "{}");
  } catch {
    return new Response("bad message", { status: 400 });
  }

  let reason: "bounce" | "complaint" | null = null;
  let emails: string[] = [];
  if (event.eventType === "Bounce" && event.bounce?.bounceType === "Permanent") {
    reason = "bounce";
    emails = (event.bounce.bouncedRecipients ?? []).map((r) => r.emailAddress ?? "");
  } else if (event.eventType === "Complaint") {
    reason = "complaint";
    emails = (event.complaint?.complainedRecipients ?? []).map((r) => r.emailAddress ?? "");
  }
  // Transient bounces (mailbox full, etc.): SES retries; nothing to record.
  if (!reason) return new Response("ignored");

  const detail = {
    messageId: event.mail?.messageId,
    subject: event.mail?.commonHeaders?.subject,
    type: event.bounce?.bounceSubType ?? event.complaint?.complaintFeedbackType,
  };
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  for (const email of emails.filter(Boolean)) {
    const { error } = await db.rpc("ses_suppress", { p_email: email, p_reason: reason, p_detail: detail });
    // Non-200 makes SNS retry, which is what we want on a DB error.
    if (error) return new Response(error.message, { status: 500 });
  }
  return new Response("ok");
});
