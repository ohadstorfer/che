// Edge function: POST /functions/v1/social-queue
// Keeps Buffer full. Once a day (the che-social-queue pg_cron job, with the
// vault's cron_secret as bearer, like cost-alert) it fills every open slot of
// the coming days, up to Buffer's free limit of 10 scheduled posts per channel:
// Instagram, Facebook, TikTok and X three a day, YouTube five, the kinds in turn
// (ROTATION). A new kind of content is a new slot.
// Facebook (Posta's page) gets them all straight from the Graph API, since
// Buffer's free plan has no fourth channel: scheduled on the page itself, only
// FB_DAYS ahead, and only when FB_PAGE_ID and FB_PAGE_TOKEN are set.
// Instagram goes the same way once IG_USER_ID is set too. Its API can't
// schedule, so the daily run leaves it out and the che-social-ig job calls
// {"publishDue": true} at each slot's time, which publishes it right then.
//
// Items run in order once; after that the best-scoring ones come back. Mails
// ALERT_EMAIL when a kind is about to run out or Buffer refuses or fails a post.
//
// Secrets:
//   BUFFER_KEY       Buffer's API key.
//   ALERT_EMAIL      where the alerts go.
//   RESEND_API_KEY   _shared/email.ts.
//   FB_PAGE_ID       optional: the Facebook page's id.
//   FB_PAGE_TOKEN    optional: a page access token with pages_manage_posts
//                    (social/fb-token.mjs makes one that doesn't expire),
//                    and instagram_content_publish for Instagram.
//   IG_USER_ID       optional: the Instagram account's id (fb-token.mjs).
//
// Body: {} fills; {"dryRun": true} says what it would post, without posting;
// {"limit": 1} stops after that many posts; {"unschedule": "drake"} (or "*",
// with an optional "after": ISO time and "channels": [...]) takes that kind's future posts off the Facebook page and forgets every future post of it
// here (delete its Buffer posts first), so the next fill posts it afresh, with
// the item's current media; {"publishDue": true} publishes the
// Instagram slots that are due (on every account); {"now": {"video": url, "caption": text,
// "channels": ["facebook", "instagram"]}} publishes one reel at once, outside
// the rotation (social/post-now.mjs).
//
// More accounts (ACCOUNTS, 2026-11-06): an extra Instagram or TikTok account
// posts only its own slots. Its rows carry channel 'instagram:<slug>' or
// 'tiktok:<slug>', and accounts that share a kind take turns over its items, so
// two accounts never post the same video on the same day.
//   IG_TOKEN_<SLUG>  optional: that account's token, when FB_PAGE_TOKEN can't
//                    reach it (SLUG in capitals, - as _).

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";
import { reported, reportError } from "../_shared/posthog.ts";

const ORG = "6ad7dee2eccf2c87113899a3";
// Instagram left Buffer on 2026-11-05 (Graph API now, see instagramPost).
const CHANNELS = {
  tiktok: "6ad88c44778b240e2f78a50a",
  youtube: "6ada376a778b240e2f8e5e44",
  twitter: "6aed00f5e29c69a171770212", // PostaSpanish on X, since 2026-11-05
} as const;
type BufferChannel = keyof typeof CHANNELS;
type Channel = BufferChannel | "facebook" | "instagram";
type Kind = string;
// `ai`: the video is made with AI, so TikTok gets its AI-generated label.
type Slot = { kind: Kind; hour: number; gap: number; cover?: number; ai?: boolean };
type Item = { id: string; kind: Kind; title: string; captions: string[]; yt_title: string | null; media: string[]; score: number };

// The kinds of content, each with its own hour (Argentina time) and the
// channels it can go to. X posts every kind every day at its hour; the other
// channels take the kinds in turn (ROTATION). The che-social-ig job runs every
// half hour, so any hour works for Instagram. `gap`: days before an item repeats;
// `cover`: the moment of the video (ms) Instagram, TikTok and YouTube show as its
// cover (Facebook and X always take the first frame).
const IMAGES: Channel[] = ["instagram", "facebook", "twitter", "tiktok"];
const VIDEOS: Channel[] = ["instagram", "youtube", "facebook", "twitter", "tiktok"];
const DAILY: Channel[] = []; // every channel rotates since 2026-11-11 (X too)
const TWEET_HOURS = [10, 18]; // text-only X posts, social/approved/tweets.mjs, sent exactly as written
const SLOTS: (Slot & { channels: Channel[] })[] = [
  { kind: "words", hour: 9, channels: IMAGES, gap: 30 },
  { kind: "versus-es", hour: 11, channels: VIDEOS, gap: 30, cover: 2500 },
  { kind: "literal", hour: 12, channels: VIDEOS, gap: 30 }, // "literally vs really" Drake-Pancho reels, frame 0 is the first word
  { kind: "drake", hour: 13, channels: VIDEOS, gap: 30 },
  { kind: "wotd", hour: 15, channels: VIDEOS, gap: 30 }, // Argentinian Word of the Day quiz reels, frame 0 is the cover
  { kind: "versus-mx", hour: 16, channels: VIDEOS, gap: 30, cover: 2500 },
  { kind: "box", hour: 18, channels: VIDEOS, gap: 30 }, // the boxing reels (Spain / Mexico / Chile vs Argentina), frame 0 is the hook
  { kind: "versus-tour", hour: 19, channels: VIDEOS, gap: 30, cover: 2500 },
  { kind: "reel", hour: 21, channels: VIDEOS, gap: 7 }, // the celeb reels
];

// Extra accounts. `instagram`: the account's Instagram user id (fb-token.mjs
// lists it once the bot can reach it); `tiktok`: its Buffer channel id (a paid
// Buffer plan: the free one holds 3 channels). The slug goes into the channel.
const ACCOUNTS: { slug: string; instagram?: string; tiktok?: string; slots: Slot[] }[] = [
  // { slug: "ugc-1", instagram: "17841…", tiktok: "6a…", slots: [{ kind: "ugc", hour: 18, gap: 21, ai: true }] },
];

/** One slot on one channel: what the fill and publishDue loops walk. `plan` keys social_plan. */
type Lane = { slot: Slot; plan: string; channel: string; platform: Channel; buffer?: string; ig?: string; slug?: string };
const LANES: Lane[] = [
  ...SLOTS.flatMap((slot) => slot.channels.filter((c) => DAILY.includes(c)).map((platform): Lane => ({
    slot, plan: slot.kind, channel: platform, platform, buffer: (CHANNELS as Record<string, string>)[platform],
  }))),
  ...ACCOUNTS.flatMap((a) => a.slots.flatMap((slot): Lane[] => [
    ...(a.instagram ? [{ slot, plan: `${slot.kind}@${a.slug}`, channel: `instagram:${a.slug}`, platform: "instagram" as const, ig: a.instagram, slug: a.slug }] : []),
    ...(a.tiktok ? [{ slot, plan: `${slot.kind}@${a.slug}`, channel: `tiktok:${a.slug}`, platform: "tiktok" as const, buffer: a.tiktok, slug: a.slug }] : []),
  ])),
  // Text-only posts on X (2026-11-11), outside the rotation: TWEET_HOURS a day,
  // each hour its own plan so the two take turns over the same pool of items.
  ...TWEET_HOURS.map((hour): Lane => ({
    slot: { kind: "tweet", hour, gap: 30 }, plan: `tweet@${hour}`, channel: "twitter", platform: "twitter", buffer: CHANNELS.twitter,
  })),
];
const KINDS = [...new Set([...LANES.map((l) => l.slot.kind), ...SLOTS.map((s) => s.kind)])];

// ROTATION (2026-11-11; TikTok alone since 2026-11-09, when nine posts a day got
// it cut off the For You feed): these channels post only a few times a day, at
// their own hours (Argentina time), taking the kinds they can carry in turn, so
// every kind still gets its go every few days. Each post is that day's item of
// its kind, the same one the other channels get.
const ROTATION: { platform: Channel; hours: number[] }[] = [
  { platform: "instagram", hours: [12, 16, 21] },
  { platform: "facebook", hours: [12, 16, 21] },
  { platform: "tiktok", hours: [12, 16, 21] },
  { platform: "twitter", hours: [12, 16, 21] },
  { platform: "youtube", hours: [11, 13, 16, 19, 21] },
];
function rotatedLanes(day: Date): Lane[] {
  const d = Math.round(day.getTime() / DAY);
  return ROTATION.flatMap(({ platform, hours }) => {
    const pool = SLOTS.filter((s) => s.channels.includes(platform));
    return hours.map((hour, i): Lane => {
      const slot = { ...pool[(d * hours.length + i) % pool.length], hour };
      return { slot, plan: slot.kind, channel: platform, platform, buffer: (CHANNELS as Record<string, string>)[platform] };
    });
  });
}
const GRAPH = "https://graph.facebook.com/v27.0";
const FB_DAYS = 3; // Facebook has no queue limit; a short horizon keeps few posts waiting.
const ART_OFFSET_HOURS = 3; // Argentina is UTC-3 all year.
const BUFFER_LIMIT = 10;
const HORIZON_DAYS = 12; // YouTube's 10 posts, one a day, plus slack.
const LOW_STOCK_DAYS = 14;
const DAY = 86_400_000;

Deno.serve(reported("social-queue", async (req) => {
  const early = preflight(req);
  if (early) return early;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const key = Deno.env.get("BUFFER_KEY");
  if (!url || !serviceRole || !key) return json({ error: "function is not configured" }, { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  // Fails closed: no secret, no answer.
  const { data: secret } = await db.rpc("get_cron_secret");
  if (typeof secret !== "string" || !secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    dryRun?: boolean; limit?: number; publishDue?: boolean; unschedule?: Kind | "*"; after?: string; channels?: string[];
    now?: { video: string; caption: string; channels: ("facebook" | "instagram")[] };
  };
  const buffer = bufferClient(key);
  const fbPage = Deno.env.get("FB_PAGE_ID");
  const fbToken = Deno.env.get("FB_PAGE_TOKEN");
  const fb = fbPage && fbToken ? { page: fbPage, token: fbToken } : null;
  const igUser = Deno.env.get("IG_USER_ID");
  const ig = fb && igUser ? { user: igUser, token: fb.token } : null;
  const problems: string[] = [];

  if (body.now) {
    const item: Item = { id: "now", kind: "reel", title: "", captions: [body.now.caption], yt_title: null, media: [body.now.video], score: 0 };
    const out: Record<string, unknown> = {};
    for (const channel of body.now.channels) {
      if (channel === "facebook") out.facebook = fb ? await facebookPost(fb, item, null, 0) : { error: "FB_PAGE_ID/FB_PAGE_TOKEN not set" };
      if (channel === "instagram") out.instagram = ig ? await instagramPost(ig, item, 0, undefined) : { error: "IG_USER_ID not set" };
    }
    return json(out);
  }

  if (body.unschedule) {
    let q = db.from("social_posts").select("channel, due_at, item_id, buffer_post_id, social_items!inner(kind)")
      .gt("due_at", body.after ?? new Date().toISOString());
    if (body.unschedule !== "*") q = q.eq("social_items.kind", body.unschedule);
    if (body.channels?.length) q = q.in("channel", body.channels);
    const { data: rows, error: e } = await q;
    if (e) return json({ error: e.message }, { status: 500 });
    const dropped: string[] = [];
    for (const r of rows ?? []) {
      if (r.channel === "facebook") {
        if (!fb) { problems.push(`facebook ${r.item_id}: FB_PAGE_ID/FB_PAGE_TOKEN not set`); continue; }
        try { await graphCall(fb.token)(String(r.buffer_post_id), {}, GRAPH, {}, "DELETE"); }
        catch (err) { problems.push(`facebook ${r.item_id}: ${err instanceof Error ? err.message : String(err)}`); continue; }
      }
      const { error: gone } = await db.from("social_posts").delete().eq("buffer_post_id", r.buffer_post_id);
      if (gone) problems.push(`${r.channel} ${r.item_id}: ${gone.message}`);
      else dropped.push(`${r.channel} ${r.item_id} ${r.due_at}`);
    }
    return json({ dropped, problems });
  }

  if (body.publishDue) {
    const posted = await publishDueInstagram(db, igFor(ig, fbToken), problems);
    await alert(db, "social_problem", problems.join("\n"));
    if (problems.length) reportError("social-queue", new Error(problems.join("; ")), { stage: "instagram" });
    return json({ posted, problems });
  }

  if (!body.dryRun) await syncResults(db, buffer, problems);

  const free: Record<string, number> = { ...(await freeSpots(buffer)), facebook: fb ? Infinity : 0 };
  const { data: taken, error } = await db.from("social_posts").select("channel, due_at").gte("due_at", new Date().toISOString());
  if (error) return json({ error: error.message }, { status: 500 });
  const filled = new Set((taken ?? []).map((p) => `${p.channel}|${new Date(p.due_at).getTime()}`));

  const posted: { channel: string; dueAt: string; item: string }[] = [];
  const today = Math.floor((Date.now() - ART_OFFSET_HOURS * 3_600_000) / DAY) * DAY;
  fill: for (let d = 0; d < HORIZON_DAYS; d++) {
    const day = new Date(today + d * DAY);
    for (const lane of [...LANES, ...rotatedLanes(day)]) {
      const { slot, channel } = lane;
      const due = new Date(day.getTime() + (slot.hour + ART_OFFSET_HOURS) * 3_600_000);
      if (due.getTime() < Date.now() + 1_800_000) continue;
      if (lane.platform === "instagram") continue; // published at its time by publishDue
      if (filled.has(`${channel}|${due.getTime()}`) || !(free[channel] > 0)) continue;
      if (lane.platform === "facebook" && d >= FB_DAYS) continue;
      const item = await itemFor(db, day, slot, lane.plan, Boolean(body.dryRun));
      if (!item) {
        problems.push(`No ${slot.kind} item for ${lane.plan} on ${day.toISOString().slice(0, 10)}`);
        continue;
      }
      if (body.dryRun) {
        free[channel]--;
        posted.push({ channel, dueAt: due.toISOString(), item: item.id });
        continue;
      }
      const used = await timesUsed(db, item.id, channel);
      const out = lane.platform === "facebook" ? await facebookPost(fb!, item, due, used) : await createPost(buffer, lane, item, due, used);
      if ("error" in out) {
        problems.push(`${channel} ${item.id}: ${out.error}`);
        continue;
      }
      const { error: saved } = await db.from("social_posts").insert({
        channel, due_at: due.toISOString(), item_id: item.id, buffer_post_id: out.id,
      });
      if (saved) problems.push(`${channel} ${item.id} saved to Buffer but not here: ${saved.message}`);
      free[channel]--;
      filled.add(`${channel}|${due.getTime()}`);
      posted.push({ channel, dueAt: due.toISOString(), item: item.id });
      if (body.limit && posted.length >= body.limit) break fill;
    }
  }

  const left = await stockLeft(db);
  const low = (Object.entries(left) as [Kind, number][]).filter(([, n]) => n <= LOW_STOCK_DAYS);
  if (body.dryRun) return json({ dryRun: true, free, posted, left, problems });
  await alert(db, "social_low_stock", low.length ? `Running low on new carousels: ${low.map(([k, n]) => `${k} ${n} days left`).join(", ")}.` : "");
  await alert(db, "social_problem", problems.join("\n"));
  if (problems.length) reportError("social-queue", new Error(problems.join("; ")), { stage: "fill" });
  return json({ posted: posted.length, left, problems });
}));

/**
 * Today's item of a lane: already planned, else the next new one, else the best that hasn't run lately.
 * `plan` is the kind on Posta's own channels and kind@slug on an extra account; "new" and "lately" count
 * every plan of the kind's items, so accounts that share a kind take turns.
 */
async function itemFor(db: SupabaseClient, day: Date, slot: Slot, planKey: string, dryRun: boolean): Promise<Item | null> {
  const iso = day.toISOString().slice(0, 10);
  const { data: planned } = await db.from("social_plan").select("item_id").eq("day", iso).eq("kind", planKey).maybeSingle();
  if (planned) return (await db.from("social_items").select("*").eq("id", planned.item_id).single()).data as Item;

  const { data: items } = await db.from("social_items").select("*").eq("kind", slot.kind).eq("active", true).order("position");
  if (!items?.length) return null;
  const { data: plan } = await db.from("social_plan").select("item_id, day").in("item_id", items.map((i) => i.id)).order("day", { ascending: false });
  const last = new Map<string, number>();
  for (const p of plan ?? []) if (!last.has(p.item_id)) last.set(p.item_id, new Date(p.day).getTime());

  const fresh = (items ?? []).find((i) => !last.has(i.id));
  const rested = (items ?? [])
    .filter((i) => day.getTime() - (last.get(i.id) ?? 0) >= slot.gap * DAY)
    .sort((a, b) => b.score - a.score)[0];
  const item = (fresh ?? rested) as Item | undefined;
  if (!item) return null;
  if (!dryRun) await db.from("social_plan").insert({ day: iso, kind: planKey, item_id: item.id });
  return item;
}

/** A video post (every reel, and the Drake quiz reels since 2026-11-06) or a carousel of slides. */
const isVideo = (item: Item) => item.kind === "reel" || /\.mp4($|\?)/.test(item.media[0] ?? "");

async function timesUsed(db: SupabaseClient, itemId: string, channel: string) {
  const { count } = await db.from("social_posts").select("*", { count: "exact", head: true }).eq("item_id", itemId).eq("channel", channel);
  return count ?? 0;
}

async function stockLeft(db: SupabaseClient) {
  const { data: items } = await db.from("social_items").select("id, kind").eq("active", true);
  const { data: plan } = await db.from("social_plan").select("item_id");
  const used = new Set((plan ?? []).map((p) => p.item_id));
  const left: Record<Kind, number> = Object.fromEntries(KINDS.map((k) => [k, 0]));
  for (const i of items ?? []) if (!used.has(i.id) && i.kind in left) left[i.kind]++;
  return left;
}

/** One mail a day per kind of alert. */
async function alert(db: SupabaseClient, kind: string, text: string) {
  const to = Deno.env.get("ALERT_EMAIL");
  if (!text || !to) return;
  const day = new Date().toISOString().slice(0, 10);
  const { data: claimed } = await db.from("ops_alerts").upsert({ kind, day, value: 0 }, { onConflict: "kind,day", ignoreDuplicates: true }).select("day");
  if (!claimed?.length) return;
  const out = await sendEmail({ to, subject: "Posta social queue", text });
  if (!out.ok) await db.from("ops_alerts").delete().eq("kind", kind).eq("day", day);
}

type Buffer = (query: string, variables?: Record<string, unknown>) => Promise<Record<string, any>>;

function bufferClient(key: string): Buffer {
  return async (query, variables) => {
    const res = await fetch("https://api.buffer.com", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const out = await res.json();
    if (out.errors?.length) throw new Error(out.errors[0].message);
    return out.data;
  };
}

/** Free spots of every Buffer channel a lane uses, keyed by the lane's channel. */
async function freeSpots(buffer: Buffer) {
  const free: Record<string, number> = {};
  for (const lane of [...LANES, ...rotatedLanes(new Date())]) {
    if (!lane.buffer || lane.channel in free) continue;
    const data = await buffer(`query($input: PostsInput!) { posts(input: $input, first: 100) { edges { node { id } } } }`, {
      input: { organizationId: ORG, filter: { channelIds: [lane.buffer], status: ["scheduled"] } },
    });
    free[lane.channel] = BUFFER_LIMIT - data.posts.edges.length;
  }
  return free;
}

async function createPost(buffer: Buffer, lane: Lane, item: Item, due: Date, used: number) {
  const reel = isVideo(item);
  const caption = item.captions[used % item.captions.length];
  const cover = lane.slot.cover;
  // X: 280 characters and 4 images at most, so only the hook, the app and the first slides.
  const x = lane.platform === "twitter";
  const text = item.kind === "tweet" ? caption
    : x ? `${caption.split("\n\n")[0]}\n\nLearn real Argentine Spanish with Posta 👉 postaspanish.com` : caption;
  const metadata = lane.platform === "youtube"
    ? { youtube: { title: item.yt_title ?? item.title, categoryId: "27", privacy: "public", madeForKids: false, ...(lane.slot.ai ? { isAiGenerated: true } : {}) } }
    : lane.platform === "tiktok" && lane.slot.ai && reel ? { tiktok: { isAiGenerated: true } }
    : undefined;
  const assets = reel
    ? [{ video: { url: item.media[0], ...(cover !== undefined && !x ? { metadata: { thumbnailOffset: cover } } : {}) } }]
    : item.media.slice(0, x ? 4 : undefined).map((url, i) => ({ image: { url, metadata: { altText: `${item.title}, slide ${i + 1}` } } }));
  try {
    const data = await buffer(
      `mutation($input: CreatePostInput!) { createPost(input: $input) {
        ... on PostActionSuccess { post { id } }
        ... on NotFoundError { message } ... on UnauthorizedError { message } ... on UnexpectedError { message }
        ... on RestProxyError { message } ... on LimitReachedError { message } ... on InvalidInputError { message }
      } }`,
      { input: { channelId: lane.buffer, text, assets, metadata, mode: "customScheduled", dueAt: due.toISOString(), schedulingType: "automatic", needsApproval: false } },
    );
    const id = data.createPost.post?.id;
    return id ? { id: id as string } : { error: String(data.createPost.message) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Schedules the item on the Facebook page. A reel goes up as a page reel (Meta
 * fetches the file from its URL); a carousel becomes one post with every slide,
 * uploaded first as unpublished photos. The id saved is the reel's video id or
 * the post's id. Facebook takes scheduled times 10 minutes to 30 days ahead.
 */
async function facebookPost(fb: { page: string; token: string }, item: Item, due: Date | null, used: number) {
  const text = item.captions[used % item.captions.length];
  const when: Record<string, string> = due ? { scheduled_publish_time: String(Math.floor(due.getTime() / 1000)) } : {};
  const call = graphCall(fb.token);
  try {
    if (isVideo(item)) {
      const { video_id } = await call(`${fb.page}/video_reels`, { upload_phase: "start" });
      await call(String(video_id), {}, "https://rupload.facebook.com/video-upload/v27.0", { file_url: item.media[0] });
      await call(`${fb.page}/video_reels`, {
        upload_phase: "finish", video_id: String(video_id), video_state: due ? "SCHEDULED" : "PUBLISHED", ...when, description: text,
      });
      return { id: String(video_id) };
    }
    const photos: string[] = [];
    for (const url of item.media) {
      const { id } = await call(`${fb.page}/photos`, { url, published: "false", temporary: "true" });
      photos.push(String(id));
    }
    const params: Record<string, string> = due ? { message: text, published: "false", ...when } : { message: text };
    photos.forEach((id, i) => (params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })));
    const { id } = await call(`${fb.page}/feed`, params);
    return { id: String(id) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

function graphCall(token: string) {
  return async (path: string, params: Record<string, string>, base = GRAPH, headers: Record<string, string> = {}, method = "POST") => {
    const query = method === "GET" ? `?${new URLSearchParams(params)}` : "";
    const res = await fetch(`${base}/${path}${query}`, {
      method,
      headers: { Authorization: `OAuth ${token}`, ...headers },
      body: method === "GET" ? undefined : new URLSearchParams(params),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.error) throw new Error(out.error?.error_user_msg ?? out.error?.message ?? `HTTP ${res.status}`);
    return out as Record<string, any>;
  };
}

/**
 * Publishes the item on Instagram right away (its API has no scheduling): a
 * reel container, or one container per slide and a carousel over them; waits
 * until Instagram has fetched and processed the media, then publishes. Returns
 * the published media's id.
 */
async function instagramPost(ig: { user: string; token: string }, item: Item, used: number, cover: number | undefined) {
  const call = graphCall(ig.token);
  const ready = async (id: string) => {
    for (let i = 0; i < 40; i++) {
      const { status_code, status } = await call(id, { fields: "status_code,status" }, GRAPH, {}, "GET");
      if (status_code === "FINISHED") return;
      if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram media ${status_code}: ${status ?? ""}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error("Instagram took too long to process the media");
  };
  try {
    const caption = item.captions[used % item.captions.length];
    let container: string;
    if (isVideo(item)) {
      container = String((await call(`${ig.user}/media`, { media_type: "REELS", video_url: item.media[0], caption, share_to_feed: "true", ...(cover !== undefined ? { thumb_offset: String(cover) } : {}) })).id);
    } else {
      const children: string[] = [];
      for (const url of item.media.slice(0, 10)) {
        children.push(String((await call(`${ig.user}/media`, { image_url: url, is_carousel_item: "true" })).id));
      }
      for (const c of children) await ready(c);
      container = String((await call(`${ig.user}/media`, { media_type: "CAROUSEL", children: children.join(","), caption })).id);
    }
    await ready(container);
    const { id } = await call(`${ig.user}/media_publish`, { creation_id: container });
    return { id: String(id) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Each Instagram lane's account and token: Posta's own from IG_USER_ID, an extra one from ACCOUNTS. */
function igFor(own: { user: string; token: string } | null, fbToken: string | undefined) {
  return (lane: Lane) => {
    if (!lane.slug) return own;
    const token = Deno.env.get(`IG_TOKEN_${lane.slug.toUpperCase().replace(/-/g, "_")}`) ?? fbToken;
    return lane.ig && token ? { user: lane.ig, token } : null;
  };
}

/** Publishes the Instagram slots of the last two hours that aren't posted yet, on every account. */
async function publishDueInstagram(db: SupabaseClient, igOf: (lane: Lane) => { user: string; token: string } | null, problems: string[]) {
  const posted: { channel: string; dueAt: string; item: string }[] = [];
  const now = Date.now();
  const today = Math.floor((now - ART_OFFSET_HOURS * 3_600_000) / DAY) * DAY;
  for (const lane of [...LANES, ...rotatedLanes(new Date(today))]) {
    if (lane.platform !== "instagram") continue;
    const { slot, channel } = lane;
    const ig = igOf(lane);
    if (!ig) continue; // that account isn't set up yet
    const day = new Date(today);
    const due = new Date(today + (slot.hour + ART_OFFSET_HOURS) * 3_600_000);
    if (due.getTime() > now + 300_000 || due.getTime() < now - 2 * 3_600_000) continue;
    const { data: held } = await db.from("social_posts").select("item_id").eq("channel", channel).eq("due_at", due.toISOString()).maybeSingle();
    if (held) continue;
    const item = await itemFor(db, day, slot, lane.plan, false);
    if (!item) {
      problems.push(`No ${slot.kind} item for ${lane.plan} on ${day.toISOString().slice(0, 10)}`);
      continue;
    }
    const out = await instagramPost(ig, item, await timesUsed(db, item.id, channel), slot.cover);
    if ("error" in out) {
      problems.push(`${channel} ${item.id}: ${out.error}`);
      continue;
    }
    const { error } = await db.from("social_posts").insert({ channel, due_at: due.toISOString(), item_id: item.id, buffer_post_id: `ig:${out.id}` });
    if (error) problems.push(`${channel} ${item.id} published but not saved: ${error.message}`);
    posted.push({ channel, dueAt: due.toISOString(), item: item.id });
  }
  return posted;
}

/** Reads the last posts back: their numbers rank the repeats, and a failed one raises an alert. */
async function syncResults(db: SupabaseClient, buffer: Buffer, problems: string[]) {
  const data = await buffer(
    `query($input: PostsInput!) { posts(input: $input, first: 100) { edges { node { id status error { message } metrics { name value } } } } }`,
    { input: { organizationId: ORG, filter: { status: ["sent", "error"] } } },
  );
  const { data: ours } = await db.from("social_posts").select("buffer_post_id, item_id");
  const items = new Map((ours ?? []).map((p) => [p.buffer_post_id, p.item_id]));
  for (const { node } of data.posts.edges) {
    const item = items.get(node.id);
    if (!item) continue;
    if (node.status === "error") problems.push(`Buffer failed ${item}: ${node.error?.message ?? "no reason given"}`);
    const metric = (name: string) => (node.metrics ?? []).find((m: { name: string }) => m.name === name)?.value ?? 0;
    const score = Math.round(metric("Video Views") + metric("Reach") + 10 * (metric("Shares") + metric("Saves")));
    await db.from("social_posts").update({ score }).eq("buffer_post_id", node.id);
  }
  const { data: scores } = await db.from("social_posts").select("item_id, score");
  const best = new Map<string, number>();
  for (const s of scores ?? []) best.set(s.item_id, Math.max(best.get(s.item_id) ?? 0, s.score));
  for (const [id, score] of best) await db.from("social_items").update({ score }).eq("id", id);
}
