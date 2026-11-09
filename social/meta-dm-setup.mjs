// Turns on the comment-to-DM guides (functions/meta-comments) for Posta's
// Facebook page and its Instagram account.
//
//   node social/meta-dm-setup.mjs
//
// Asks for:
//   - a system user token (Business Suite → Usuarios del sistema → Generar token,
//     app Posta Scheduler, "Nunca") with pages_show_list, pages_read_engagement,
//     pages_manage_metadata, pages_messaging, pages_manage_engagement,
//     instagram_basic, instagram_manage_comments, instagram_manage_messages;
//   - the app secret (App → Configuración → Básica).
// Then it subscribes the page to the app (feed), stores META_DM_TOKEN,
// META_APP_SECRET and a new META_VERIFY_TOKEN as Supabase secrets, and prints
// the callback URL and verify token to paste in App → Webhooks. Prints no token.

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";

const GRAPH = "https://graph.facebook.com/v27.0";
const CALLBACK = "https://qbzjaseetusewxnfgpes.supabase.co/functions/v1/meta-comments";
const NEEDED = ["pages_messaging", "pages_manage_metadata", "instagram_manage_comments", "instagram_manage_messages"];

const rl = createInterface({ input: process.stdin, output: process.stdout });
const token = (await rl.question("System user token: ")).trim();
const appSecret = (await rl.question("App secret: ")).trim();
rl.close();

async function call(method, path, params) {
  const res = await fetch(`${GRAPH}/${path}?${new URLSearchParams(params)}`, { method });
  const out = await res.json();
  if (out.error) throw new Error(`${path}: ${out.error.message}`);
  return out;
}

const perms = (await call("GET", "me/permissions", { access_token: token })).data
  .filter((p) => p.status === "granted").map((p) => p.permission);
const missing = NEEDED.filter((p) => !perms.includes(p));
if (missing.length) throw new Error(`The token is missing: ${missing.join(", ")}. Generate it again with those ticked.`);

const { data: pages } = await call("GET", "me/accounts", { access_token: token, fields: "id,name,access_token" });
const page = pages.find((p) => /posta/i.test(p.name));
if (!page) throw new Error(`No Posta page among: ${pages.map((p) => p.name).join(", ") || "none"}`);

// The page sends its feed (Facebook comments) to the app; Instagram comments
// come through the same page subscription once the app's Instagram webhook is on.
await call("POST", `${page.id}/subscribed_apps`, { access_token: page.access_token, subscribed_fields: "feed" });

const verify = randomBytes(18).toString("base64url");
const set = spawnSync("npx", ["supabase@2", "secrets", "set",
  `META_DM_TOKEN=${page.access_token}`, `META_APP_SECRET=${appSecret}`, `META_VERIFY_TOKEN=${verify}`], { stdio: "inherit" });
if (set.status !== 0) process.exit(set.status ?? 1);

console.log(`
Subscribed "${page.name}" and saved the secrets.

Now in developers.facebook.com → Posta Scheduler → Webhooks:
  1. Object "Page":      Callback URL ${CALLBACK}
                         Verify token ${verify}
                         then subscribe the field "feed".
  2. Object "Instagram": same Callback URL and verify token, field "comments".
Then comment GUIDE on one of Posta's posts from another account.`);
