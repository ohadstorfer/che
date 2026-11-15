// Posta Radar — fresh Reddit threads about Argentine Spanish (public RSS, no login).
// Usage: node scripts/radar/reddit.mjs [hours=48]  → prints JSON array of new candidates.
// Remembers what it already showed in ~/.posta-radar/seen.json so each thread appears once.
const sleep = ms => new Promise(r => setTimeout(r, ms));
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const HOURS = Number(process.argv[2] || 48);
const dir = path.join(os.homedir(), '.posta-radar'); fs.mkdirSync(dir, { recursive: true });
const seenFile = path.join(dir, 'seen.json');
const seen = new Set(fs.existsSync(seenFile) ? JSON.parse(fs.readFileSync(seenFile, 'utf8')) : []);

// Site-wide searches (any subreddit).
const SEARCHES = [
  'argentinian spanish', 'argentine spanish', 'rioplatense', 'voseo', 'lunfardo',
  'learn spanish buenos aires', 'spanish argentina app', 'moving to buenos aires spanish',
  'argentine slang', 'castellano argentino',
];
// Newest posts in these subs, kept only if they match KEYWORDS.
const SUBS = ['argentina', 'BuenosAires', 'Spanish', 'learnspanish', 'languagelearning', 'expats', 'digitalnomad', 'travel', 'solotravel', 'Mendoza', 'Cordoba'];
const KEYWORDS = /argentin|buenos aires|porteñ|rioplatense|\bvos\b|voseo|lunfardo|che\b|boludo|mendoza|patagonia|bariloche/i;
const LEARN = /spanish|español|castellano|learn|language|idioma|accent|slang|app|understand|speak/i;

const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x200B;/gi, '').replace(/&amp;/g, '&');
const strip = s => decode(decode(s)).replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
async function feed(url, retry = true) {
  const r = await fetch(url, { headers: { 'User-Agent': 'posta-radar/0.1 (personal research)' } });
  if (r.status === 429 && retry) { await sleep(45000); return feed(url, false); }
  if (!r.ok) { console.error('reddit', r.status, url); return []; }
  const x = await r.text();
  return [...x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    url: (e.match(/<link href="([^"]+)"/) || [])[1],
    title: strip((e.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]),
    sub: (e.match(/<category term="([^"]+)"/) || [])[1],
    date: (e.match(/<published>([^<]+)/) || e.match(/<updated>([^<]+)/) || [])[1],
    text: strip((e.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [, ''])[1]).slice(0, 600),
  }));
}
const q = '(' + SEARCHES.map(x => `"${x}"`).join(' OR ') + ')';
const urls = [
  `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=new&t=week&limit=100`,
  `https://www.reddit.com/r/${SUBS.join('+')}/new.rss?limit=100`,
];
const out = new Map(); const cutoff = Date.now() - HOURS * 3600e3;
for (const u of urls) {
  const fromSub = u.includes('/new.rss');
  for (const p of await feed(u)) {
    if (!p.url || seen.has(p.url) || out.has(p.url)) continue;
    if (p.date && Date.parse(p.date) < cutoff) continue;
    const blob = p.title + ' ' + p.text;
    if (fromSub && !(KEYWORDS.test(blob) && LEARN.test(blob))) continue;
    out.set(p.url, { platform: 'reddit', ...p });
  }
  await sleep(15000); // Reddit rate-limits unauthenticated feeds hard
}
const list = [...out.values()];
if (!process.env.DRY) fs.writeFileSync(seenFile, JSON.stringify([...seen, ...list.map(p => p.url)].slice(-5000)));
console.log(JSON.stringify(list, null, 1));
