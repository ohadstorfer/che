// Publishes one reel right now on Posta's Facebook page and Instagram, through
// functions/social-queue (outside the daily rotation).
//
//   node social/post-now.mjs <video.mp4 | https://…> "<caption>" [facebook,instagram]
//
// A local file goes up to S3 (posta-audio/social/reels/, served by CloudFront)
// first. Needs the aws "posta" profile and a linked Supabase CLI.
import { execFileSync } from "node:child_process";
import path from "node:path";

const [src, caption, list = "facebook,instagram"] = process.argv.slice(2);
if (!src || !caption) throw new Error('usage: node social/post-now.mjs <video> "<caption>" [facebook,instagram]');

let video = src;
if (!/^https:/.test(src)) {
  const name = `reels/${path.basename(src)}`;
  execFileSync("aws", ["--profile", "posta", "s3", "cp", src, `s3://posta-audio/social/${name}`, "--content-type", "video/mp4", "--only-show-errors"], { stdio: "inherit" });
  video = `https://d294le6kf791u9.cloudfront.net/social/${name}`;
}

const sql = "select name, decrypted_secret from vault.decrypted_secrets where name in ('functions_url', 'cron_secret')";
const out = execFileSync("npx", ["--yes", "supabase@2", "db", "query", "--linked", "-o", "json", sql], { encoding: "utf8" });
const rows = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1)).rows;
const secret = Object.fromEntries(rows.map((r) => [r.name, r.decrypted_secret]));

const res = await fetch(`${secret.functions_url}/social-queue`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret.cron_secret}`, "Content-Type": "application/json" },
  body: JSON.stringify({ now: { video, caption, channels: list.split(",") } }),
});
console.log(res.status, JSON.stringify(await res.json(), null, 2));
