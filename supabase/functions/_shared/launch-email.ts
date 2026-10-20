// The one mail the waitlist gets: Posta is out, here is where to get it.
// Sent by functions/launch-email on launch day. Same look as the win-back
// mails (_shared/winback.ts); English with a little Spanish, like the app.

export const SITE = "https://postaspanish.com";
/** The site's own redirect: iPhones to the App Store, Androids to Google Play. */
export const GET_URL = `${SITE}/get`;
export const STORE_LINKS = {
  ios: "https://apps.apple.com/app/id6817374310",
  android: "https://play.google.com/store/apps/details?id=app.posta.android",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "maría josé  " → "María": the first word, capitalised. Empty when there is none. */
export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first ? first[0].toLocaleUpperCase() + first.slice(1) : "";
}

export function launchEmail(name: string): { subject: string; html: string; text: string } {
  const who = firstName(name);
  const subject = "Posta is out. ¿Arrancamos?";
  const preview = "You joined the waitlist, so you hear it first: Posta is on the App Store and Google Play.";
  const title = who ? `${who}, Posta is out` : "Posta is out";
  const body = [
    "You joined the Posta waitlist, so you hear it first: the app is now on the App Store and Google Play.",
    "It teaches the Spanish Argentina actually speaks: vos instead of tú, the slang every conversation runs on, and out-loud chats with Pancho, a capybara who talks like a porteño.",
    "A few minutes a day is enough. Start with a free week.",
  ];
  const button = "Get Posta";

  const text = [
    title,
    "",
    ...body.flatMap((p) => [p, ""]),
    `${button}: ${GET_URL}`,
    `App Store: ${STORE_LINKS.ios}`,
    `Google Play: ${STORE_LINKS.android}`,
    "",
    "Abrazo,",
    "Posta",
    "",
    "You're getting this one mail because you joined the Posta waitlist at postaspanish.com. We won't write about the waitlist again.",
  ].join("\n");

  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;";
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7EFE6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7EFE6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;">
<img src="${SITE}/assets/favicon-96.png" width="48" height="48" alt="Posta" style="display:block;border-radius:12px;">
</td></tr>
<tr><td style="background:#FFFFFF;border:2px solid #3A2A20;border-radius:20px;padding:28px 24px;${font}color:#3A2A20;">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">${esc(title)}</h1>
${body.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;">${esc(p)}</p>`).join("\n")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 14px;"><tr>
<td style="background:#B44A60;border-radius:14px;">
<a href="${GET_URL}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;">${esc(button)}</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#7A6556;">Or go straight to the <a href="${STORE_LINKS.ios}" style="color:#B44A60;">App Store</a> or <a href="${STORE_LINKS.android}" style="color:#B44A60;">Google Play</a>.</p>
<p style="margin:20px 0 0;font-size:16px;line-height:1.55;">Abrazo,<br>Posta</p>
</td></tr>
<tr><td style="padding:18px 4px 0;${font}font-size:12px;line-height:1.5;color:#7A6556;">
You're getting this one mail because you joined the Posta waitlist at postaspanish.com. We won't write about the waitlist again.<br>
PICAWAVE, LLC · <a href="${SITE}/privacy" style="color:#7A6556;">Privacy</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
