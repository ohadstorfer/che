// Email through Amazon SES (SESv2 SendEmail,
// https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html).
// The second provider next to Resend: _shared/email.ts picks it when
// EMAIL_PROVIDER=ses, or when a call passes provider: "ses".
//
// Secrets (an IAM user that can only call ses:SendEmail for postaspanish.com):
//   SES_AWS_ACCESS_KEY_ID, SES_AWS_SECRET_ACCESS_KEY, SES_REGION (us-east-1)
//
// postaspanish.com is verified in SES with Easy DKIM (3 CNAMEs at Namecheap).
// No custom MAIL FROM: Namecheap only allows MX records on Custom MX, which
// would end the hola@ forwarding. DMARC still passes through DKIM.
//
// SES has no idempotency key; callers that retry already dedupe in the DB.

import { AwsClient } from "npm:aws4fetch@1.0.20";
import type { Email, SendResult } from "./email.ts";

let client: AwsClient | null = null;

function ses(): AwsClient | null {
  if (client) return client;
  const accessKeyId = Deno.env.get("SES_AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("SES_AWS_SECRET_ACCESS_KEY");
  if (!accessKeyId || !secretAccessKey) return null;
  client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: Deno.env.get("SES_REGION") ?? "us-east-1",
    service: "ses",
  });
  return client;
}

const list = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

export async function sendViaSes(email: Email, from: string): Promise<SendResult> {
  const aws = ses();
  if (!aws) return { ok: false, error: "SES_AWS_ACCESS_KEY_ID / SES_AWS_SECRET_ACCESS_KEY are not set" };
  const region = Deno.env.get("SES_REGION") ?? "us-east-1";

  const body: Record<string, unknown> = {
    FromEmailAddress: from,
    Destination: { ToAddresses: list(email.to) },
    Content: {
      Simple: {
        Subject: { Data: email.subject, Charset: "UTF-8" },
        Body: {
          ...(email.html ? { Html: { Data: email.html, Charset: "UTF-8" } } : {}),
          ...(email.text ? { Text: { Data: email.text, Charset: "UTF-8" } } : {}),
        },
        ...(email.headers
          ? { Headers: Object.entries(email.headers).map(([Name, Value]) => ({ Name, Value })) }
          : {}),
      },
    },
  };
  if (email.replyTo) body.ReplyToAddresses = [email.replyTo];
  const configSet = Deno.env.get("SES_CONFIGURATION_SET");
  if (configSet) body.ConfigurationSetName = configSet;

  try {
    const req = new Request(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const res = await aws.fetch(req);
    const out = (await res.json().catch(() => ({}))) as { MessageId?: string; message?: string; Message?: string };
    if (!res.ok || !out.MessageId) return { ok: false, error: out.message ?? out.Message ?? `SES answered ${res.status}` };
    return { ok: true, id: out.MessageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
