// The win-back series: mails for people who saved their account and haven't
// bought, by day since they saved it. Pure (no database, no clock, no network)
// so winback_test.ts can run every case; functions/winback-email does the rest.
//
//   day 1   come back to your plan; the free week's unit
//   day 3   Hablar: the free week's chat with Pancho
//   day 7   the free week is over: what Premium opens
//
// The days count from saving the account, which with the hard paywall is when
// she takes the free week (migration 20261019000040), so they follow it.
//   day 30  40% off the first year, for OFFER_DAYS: the app asks the server
//           (winback_offer()) whether she may have it, so the mail itself opens
//           nothing. Not for anyone who has had a store subscription: her free
//           week was Apple's one introductory price, so she couldn't get it.
//
// Only the latest mail whose day has come is ever due, and only within GRACE_DAYS
// of its day: a mail the cron missed is dropped, not sent late next to the
// next one, and turning this on doesn't mail everyone at once.

export const STEPS = [1, 3, 7, 30] as const;
export type Step = (typeof STEPS)[number];

const DAY = 24 * 60 * 60 * 1000;
export const GRACE_DAYS = 2;
/** How long the day-30 offer stays open after the mail. winback_offer() agrees. */
export const OFFER_DAYS = 7;
/** Local hours a mail may go out: from 10:00 to 19:59. */
export const SEND_FROM = 10;
export const SEND_UNTIL = 20;

export function localHour(now: Date, timezone: string): number {
  const hour = (tz: string) =>
    Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now));
  try {
    return hour(timezone);
  } catch {
    return hour("UTC");
  }
}

/** The mail due now for someone who saved her account at `savedAt`, or null.
 *  `tried`: she has had a store subscription, so the day-30 offer isn't hers. */
export function dueStep(savedAt: Date, now: Date, timezone: string, sent: readonly number[], tried = false): Step | null {
  const age = (now.getTime() - savedAt.getTime()) / DAY;
  const step = [...STEPS].reverse().find((s) => age >= s);
  if (!step || sent.includes(step) || age > step + GRACE_DAYS) return null;
  if (step === 30 && tried) return null;
  const h = localHour(now, timezone);
  return h >= SEND_FROM && h < SEND_UNTIL ? step : null;
}

// --- links ------------------------------------------------------------------

export const SITE = "https://postaspanish.com";

/** Who an unsubscribe link is for, signed so nobody can opt out someone else. */
export async function unsubscribeToken(userId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`unsubscribe:${userId}`)));
  return btoa(String.fromCharCode(...mac.slice(0, 18))).replaceAll("+", "-").replaceAll("/", "_");
}

export async function validToken(userId: string, token: string, secret: string): Promise<boolean> {
  const expected = await unsubscribeToken(userId, secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

// --- the mails --------------------------------------------------------------

export interface Mail {
  subject: string;
  html: string;
  text: string;
}

interface Copy {
  subject: string;
  preview: string;
  title: string;
  body: string[];
  button: string;
  /** Where the button goes in the app: postaspanish.com/open sends it on. */
  to: "home" | "hablar" | "offer";
}

const COPY: Record<Step, (hi: string) => Copy> = {
  1: (hi) => ({
    subject: "Your Argentine Spanish plan is waiting",
    preview: "Five minutes today and you're one lesson closer to sounding like a porteño.",
    title: `${hi}your plan is ready.`,
    body: [
      "You built your Posta plan, and your next lesson is right where you left it. It takes about five minutes.",
      "Your first unit is free this week: the phrases Argentines really use every day, with vos and all the music of Buenos Aires.",
    ],
    button: "Continue my plan",
    to: "home",
  }),
  3: (hi) => ({
    subject: "Pancho wants to talk to you",
    preview: "A free chat with Pancho, out loud, in Argentine Spanish.",
    title: `${hi}ready for a real conversation?`,
    body: [
      "In Hablar you talk with Pancho, our capybara from Buenos Aires, out loud. He answers like a friend would, and at the end you see what to fix.",
      "Your free week comes with one chat. Pick a topic and say hola.",
    ],
    button: "Talk with Pancho",
    to: "hablar",
  }),
  7: (hi) => ({
    subject: "One week in: here's what Posta Premium opens",
    preview: "The whole course, more chats with Pancho, and practice that makes it stick.",
    title: `${hi}one week since you started.`,
    body: [
      "Your free week is over. Premium opens the whole course, unit by unit, from your first che to telling stories like a local.",
      "You also get more chats with Pancho, out loud, and practice that brings back what you learned so it sticks.",
    ],
    button: "See Premium",
    to: "home",
  }),
  30: (hi) => ({
    subject: "40% off your first year of Posta",
    preview: "A one-time offer: Posta Premium for 40% less in the first year.",
    title: `${hi}40% off, just for you.`,
    body: [
      "It's been a month since you made your Posta plan. If you still want to sound Argentine, here's a push: 40% off your first year of Premium.",
      `The offer is yours for the next ${OFFER_DAYS} days. Open Posta with the account you made and it's waiting for you.`,
      "This is the last mail in this series. After this we'll leave your inbox alone.",
    ],
    button: "Get 40% off",
    to: "offer",
  }),
};

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** First name only, and only one that looks like a name. */
export function greeting(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first || first.length > 24 || /[@<>/\\:]/.test(first)) return "";
  return `${first[0].toUpperCase()}${first.slice(1)}, `;
}

export function buildMail(step: Step, opts: { name: string | null; unsubscribeUrl: string }): Mail {
  const c = COPY[step](greeting(opts.name));
  // A title that starts with the name keeps the comma; without one it needs a capital.
  const title = c.title[0].toUpperCase() + c.title.slice(1);
  const button = `${SITE}/open/?to=${c.to}`;

  const text = [
    title,
    "",
    ...c.body.flatMap((p) => [p, ""]),
    `${c.button}: ${button}`,
    "",
    "Abrazo,",
    "Posta",
    "",
    `Don't want these mails? Unsubscribe: ${opts.unsubscribeUrl}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7EFE6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7EFE6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;">
<img src="${SITE}/assets/favicon-96.png" width="48" height="48" alt="Posta" style="display:block;border-radius:12px;">
</td></tr>
<tr><td style="background:#FFFFFF;border:2px solid #3A2A20;border-radius:20px;padding:28px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3A2A20;">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">${esc(title)}</h1>
${c.body.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;">${esc(p)}</p>`).join("\n")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;"><tr>
<td style="background:#B44A60;border-radius:14px;">
<a href="${esc(button)}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;">${esc(c.button)}</a>
</td></tr></table>
<p style="margin:20px 0 0;font-size:16px;line-height:1.55;">Abrazo,<br>Posta</p>
</td></tr>
<tr><td style="padding:18px 4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#7A6556;">
You're getting this because you made a Posta account. <a href="${esc(opts.unsubscribeUrl)}" style="color:#7A6556;">Unsubscribe</a>.<br>
PICAWAVE, LLC · <a href="${SITE}/privacy" style="color:#7A6556;">Privacy</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: c.subject, html, text };
}
