// Email through Resend (https://resend.com/docs/api-reference/emails/send-email).
// winback-email sends with it. The key is the RESEND_API_KEY secret, a
// sending-only key; it never goes in the app.
//
// Mail goes out from postaspanish.com, which has to be verified in Resend
// first (Domains), or Resend refuses anything not sent to the account's own
// address.

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Posta <hola@postaspanish.com>";

export interface Email {
  to: string | string[];
  subject: string;
  /** At least one of html and text. */
  html?: string;
  text?: string;
  /** Defaults to Posta <hola@postaspanish.com>. */
  from?: string;
  replyTo?: string;
  /** Resend keeps a key for 24 h and sends a retried request only once. */
  idempotencyKey?: string;
  /** Extra mail headers, e.g. List-Unsubscribe. */
  headers?: Record<string, string>;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(email: Email): Promise<SendResult> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  if (!email.html && !email.text) return { ok: false, error: "html or text is required" };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (email.idempotencyKey) headers["Idempotency-Key"] = email.idempotencyKey;

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: email.from ?? DEFAULT_FROM,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
        headers: email.headers,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !body.id) return { ok: false, error: body.message ?? `Resend answered ${res.status}` };
    return { ok: true, id: body.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
