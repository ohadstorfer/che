// The free guides that comment-to-DM posts give away. Pages and PDFs are built
// by scripts/site/build-free.mjs into postaspanish.com/free/<slug>; keep the
// slugs in step with it.
//
// Keywords: see guideForComment. "GUIDE" is the one the posts say most.

export const SITE = "https://postaspanish.com";

export type GuideSlug = "slang" | "vos" | "learn";

export const GUIDES: Record<GuideSlug, { title: string; blurb: string }> = {
  slang: { title: "The Argentine Slang Pack", blurb: "the 50 Argentine words you’ll hear every day, with what they mean and a real example for each" },
  vos: { title: "The Vos Cheat Sheet", blurb: "everything you need to switch from tú to vos, plus the 50 verbs you’ll use most" },
  learn: { title: "How to Learn Argentine Spanish", blurb: "the 5 steps that actually work and a 30-day plan you can tick off" },
};

export const KEYWORDS: Record<string, GuideSlug> = {
  guide: "slang",
  guia: "slang",
  slang: "slang",
  vos: "vos",
  learn: "learn",
};

/**
 * The guide a comment asks for, or null. Whole words only ("vos" yes,
 * "vosotros" no), and only when the keyword is the point of the comment: a
 * short comment (up to 3 words, emoji aside) or the keyword in capitals. So
 * "GUIDE 🙏" and "vos please" match, but an Argentine writing "vos sos un capo"
 * doesn't get a DM.
 */
export function guideForComment(text: string): { keyword: string; guide: GuideSlug } | null {
  const plain = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const words = plain.split(/[^A-Za-z]+/).filter(Boolean);
  const short = words.length <= 3;
  for (const w of words) {
    const k = w.toLowerCase();
    if (KEYWORDS[k] && (short || w === w.toUpperCase())) return { keyword: k, guide: KEYWORDS[k] };
  }
  return null;
}

/** The guide's page, tagged with where the visitor came from. */
export function guideUrl(guide: GuideSlug, src: string): string {
  return `${SITE}/free/${guide}?src=${encodeURIComponent(src)}`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The one mail a guide lead gets: the PDF and the page. */
export function guideEmail(guide: GuideSlug): { subject: string; html: string; text: string } {
  const g = GUIDES[guide];
  const pdf = `${SITE}/free/pdf/${guide}.pdf`;
  const page = `${SITE}/free/${guide}?src=email`;
  const get = `${SITE}/get?utm_source=guide-email&utm_medium=email&utm_campaign=${guide}`;
  const subject = `Your free guide: ${g.title}`;
  const body = [
    `Here it is: ${g.blurb}.`,
    "Save the PDF, or read it on the page anytime.",
    "And when you want to practice it out loud, Pancho is waiting in the Posta app.",
  ];
  const text = [
    `¡Acá está! ${g.title}`, "", ...body.flatMap((p) => [p, ""]),
    `Download the PDF: ${pdf}`, `Read it online: ${page}`, `Get Posta: ${get}`, "",
    "Abrazo,", "Posta", "",
    "You're getting this one mail because you asked for this guide at postaspanish.com.",
  ].join("\n");
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F7EFE6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(body[0])}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7EFE6;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;"><img src="${SITE}/assets/favicon-96.png" width="48" height="48" alt="Posta" style="display:block;border-radius:12px;"></td></tr>
<tr><td style="background:#FFF9F3;border:2px solid #3A2A20;border-radius:20px;padding:28px 24px;${font}color:#3A2A20;">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">¡Acá está! ${esc(g.title)}</h1>
${body.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;">${esc(p)}</p>`).join("\n")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 14px;"><tr>
<td style="background:#B44A60;border-radius:14px;"><a href="${pdf}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;">Download the PDF</a></td>
</tr></table>
<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#7A6556;">Or <a href="${page}" style="color:#B44A60;">read it online</a>. Want to practice? <a href="${get}" style="color:#B44A60;">Get Posta</a>.</p>
<p style="margin:20px 0 0;font-size:16px;line-height:1.55;">Abrazo,<br>Posta</p>
</td></tr>
<tr><td style="padding:18px 4px 0;${font}font-size:12px;line-height:1.5;color:#7A6556;">You're getting this one mail because you asked for this guide at postaspanish.com.<br>PICAWAVE, LLC · <a href="${SITE}/privacy" style="color:#7A6556;">Privacy</a></td></tr>
</table></td></tr></table>
</body></html>`;
  return { subject, html, text };
}
