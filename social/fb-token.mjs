// Gives functions/social-queue a Facebook page token that doesn't expire.
//
//   node social/fb-token.mjs
//
// Paste either token:
//   - a system user's token (Business Suite → Usuarios del sistema → Generar
//     token, app Posta Scheduler, "Nunca", with pages_show_list,
//     pages_read_engagement and pages_manage_posts): it never expires, so leave
//     the app secret empty;
//   - a short-lived user token from the Graph API Explorer: then give the app
//     secret too, and it is traded for a long-lived one first.
// Picks Posta's page and stores FB_PAGE_ID and FB_PAGE_TOKEN as Supabase
// secrets. Nothing is printed but the page's name.

import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const GRAPH = "https://graph.facebook.com/v27.0";
const rl = createInterface({ input: process.stdin, output: process.stdout });
const APP_ID = "2321489838639248"; // Posta Scheduler
const token = (await rl.question("Token: ")).trim();
const appSecret = (await rl.question("App secret (Enter to skip for a system user token): ")).trim();
rl.close();

async function get(path, params) {
  const res = await fetch(`${GRAPH}/${path}?${new URLSearchParams(params)}`);
  const out = await res.json();
  if (out.error) throw new Error(out.error.message);
  return out;
}

const longToken = appSecret
  ? (await get("oauth/access_token", { grant_type: "fb_exchange_token", client_id: APP_ID, client_secret: appSecret, fb_exchange_token: token })).access_token
  : token;
const { data: pages } = await get("me/accounts", { access_token: longToken, fields: "id,name,access_token,tasks" });
const page = pages.find((p) => /posta/i.test(p.name));
if (!page) throw new Error(`No Posta page among: ${pages.map((p) => p.name).join(", ") || "none"}`);
if (!page.tasks?.includes("CREATE_CONTENT")) throw new Error(`${page.name}: the token can't post (tasks ${page.tasks})`);

// The Instagram account linked to the page, if the token may see it.
const ig = (await get(page.id, { access_token: page.access_token, fields: "instagram_business_account{id,username}" }).catch(() => ({}))).instagram_business_account;

const secrets = [`FB_PAGE_ID=${page.id}`, `FB_PAGE_TOKEN=${page.access_token}`, ...(ig ? [`IG_USER_ID=${ig.id}`] : [])];
const set = spawnSync("npx", ["supabase@2", "secrets", "set", ...secrets], { stdio: "inherit" });
if (set.status !== 0) process.exit(set.status ?? 1);
console.log(`Saved FB_PAGE_ID and FB_PAGE_TOKEN for "${page.name}"${ig ? ` and IG_USER_ID for @${ig.username}` : " (no Instagram account visible: Instagram stays on Buffer)"}.`);
