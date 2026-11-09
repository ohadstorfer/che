// Edge function: GET|POST /functions/v1/meta-comments
//
// Meta's webhook for comments on Posta's Instagram and Facebook posts. When a
// comment has a keyword ("GUIDE", "VOS", "LEARN": _shared/free-guides.ts), the
// commenter gets a private reply (a DM) with the guide's link, and the comment
// gets a short public answer so others see it works. Each comment is handled
// once (public.comment_dms, keyed by comment id), however often Meta resends it.
//
//   GET   Meta's subscription check: echoes hub.challenge when hub.verify_token
//         is META_VERIFY_TOKEN.
//   POST  the events, signed with the app secret (X-Hub-Signature-256).
//
// Subscriptions (social/meta-dm-setup.mjs sets them up and prints what to paste):
//   App → Webhooks → Instagram: comments;  Page: feed
//
// Secrets:
//   META_APP_SECRET    the Posta Scheduler app's secret (checks the signature)
//   META_VERIFY_TOKEN  any random string, also pasted in the app's webhook form
//   META_DM_TOKEN      a page token with pages_messaging, instagram_manage_messages,
//                      instagram_manage_comments, pages_manage_engagement;
//                      falls back to FB_PAGE_TOKEN
//   FB_PAGE_ID, IG_USER_ID  Posta's own ids, so its own comments are skipped
//
// Meta allows one private reply per comment, within 7 days of it. verify_jwt is
// off: Meta can't send a Supabase token; the signature is the check.

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { guideForComment, guideUrl, GUIDES, type GuideSlug } from "../_shared/free-guides.ts";
import { reported } from "../_shared/posthog.ts";

const GRAPH = "https://graph.facebook.com/v27.0";

// A few wordings, so a post full of "GUIDE" doesn't get 200 identical answers.
const PUBLIC_REPLIES = [
  "Sent! Check your DMs 📩",
  "¡Listo! It's in your DMs 🧉",
  "Done ✅ Check your DMs (or message requests)",
  "On its way to your DMs 📩",
  "¡Dale! Sent you a DM 🙌",
];

function dmText(guide: GuideSlug, url: string): string {
  const g = GUIDES[guide];
  return [
    `¡Hola! 🧉 Here's your free guide: ${g.title}.`,
    "",
    `It's ${g.blurb}.`,
    "",
    `👉 ${url}`,
    "",
    "Read it right there or download the PDF. ¡Que lo disfrutes!",
  ].join("\n");
}

type Event = {
  platform: "instagram" | "facebook";
  commentId: string;
  mediaId: string | null;
  fromId: string | null;
  fromName: string | null;
  text: string;
};

Deno.serve(reported("meta-comments", async (req) => {
  const u = new URL(req.url);

  if (req.method === "GET") {
    const expected = Deno.env.get("META_VERIFY_TOKEN");
    if (expected && u.searchParams.get("hub.mode") === "subscribe" && u.searchParams.get("hub.verify_token") === expected) {
      return new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200 });
    }
    return new Response("forbidden", { status: 403 });
  }
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const raw = await req.text();
  const secret = Deno.env.get("META_APP_SECRET");
  if (!secret || !(await signed(raw, req.headers.get("x-hub-signature-256"), secret))) {
    return new Response("bad signature", { status: 401 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = Deno.env.get("META_DM_TOKEN") ?? Deno.env.get("FB_PAGE_TOKEN");
  if (!url || !serviceRole || !token) return new Response("not configured", { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  const own = new Set([Deno.env.get("FB_PAGE_ID"), Deno.env.get("IG_USER_ID")].filter(Boolean) as string[]);
  const events = parse(JSON.parse(raw || "{}")).filter((e) => !e.fromId || !own.has(e.fromId));
  for (const e of events) await handle(db, token, e);
  // Always 200 once signed: a non-200 makes Meta resend, and comment_dms already keeps the outcome.
  return new Response("ok", { status: 200 });
}));

/** X-Hub-Signature-256 is "sha256=" + HMAC-SHA256(app secret, raw body) in hex. */
async function signed(raw: string, header: string | null, secret: string): Promise<boolean> {
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  const got = header.slice(7);
  if (got.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

// deno-lint-ignore no-explicit-any
function parse(body: any): Event[] {
  const out: Event[] = [];
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const v = change?.value ?? {};
      if (body.object === "instagram" && change.field === "comments" && v.id && typeof v.text === "string") {
        out.push({ platform: "instagram", commentId: String(v.id), mediaId: v.media?.id ?? null, fromId: v.from?.id ?? null, fromName: v.from?.username ?? null, text: v.text });
      }
      if (body.object === "page" && change.field === "feed" && v.item === "comment" && v.verb === "add" && v.comment_id && typeof v.message === "string") {
        out.push({ platform: "facebook", commentId: String(v.comment_id), mediaId: v.post_id ?? null, fromId: v.from?.id ?? null, fromName: v.from?.name ?? null, text: v.message });
      }
    }
  }
  return out;
}

async function handle(db: SupabaseClient, token: string, e: Event) {
  const match = guideForComment(e.text);
  if (!match) return;

  // Claim the comment first: a resent webhook finds the row and stops here.
  const { data: claimed, error } = await db.from("comment_dms").upsert({
    comment_id: e.commentId,
    platform: e.platform,
    media_id: e.mediaId,
    from_id: e.fromId,
    from_name: e.fromName,
    comment: e.text.slice(0, 500),
    keyword: match.keyword,
    guide: match.guide,
  }, { onConflict: "comment_id", ignoreDuplicates: true }).select("comment_id");
  if (error) { console.error("comment_dms:", error.message); return; }
  if (!claimed?.length) return;

  const src = e.platform === "instagram" ? "ig-dm" : "fb-dm";
  const dm = await graph("me/messages", token, {
    recipient: { comment_id: e.commentId },
    message: { text: dmText(match.guide, guideUrl(match.guide, src)) },
  });
  // Instagram answers a comment at /replies, Facebook at /comments.
  const reply = PUBLIC_REPLIES[Math.floor(Math.random() * PUBLIC_REPLIES.length)];
  const pub = await graph(`${e.commentId}/${e.platform === "instagram" ? "replies" : "comments"}`, token, { message: reply });

  const errors = [dm.error && `dm: ${dm.error}`, pub.error && `reply: ${pub.error}`].filter(Boolean).join("; ");
  if (errors) console.error(`meta-comments ${e.platform} ${e.commentId}:`, errors);
  await db.from("comment_dms").update({ dm_ok: !dm.error, reply_ok: !pub.error, error: errors || null }).eq("comment_id", e.commentId);
}

async function graph(path: string, token: string, body: unknown): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${GRAPH}/${path}?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.error) return { error: out.error?.message ?? `HTTP ${res.status}` };
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
