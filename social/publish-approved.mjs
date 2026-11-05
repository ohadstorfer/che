// Sends what's in approved/ to S3 (posta-audio/social/, served by its CloudFront) and to social_items, where social-queue takes it from.
// usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node publish-approved.mjs
// Slides go up as JPEGs (Instagram's format); a slide already in the bucket is skipped, an item keeps its place in the rotation.
import {execFileSync} from 'child_process';
import {createHash} from 'crypto';
import fs from 'fs'; import os from 'os'; import path from 'path';
import {CAROUSELS} from './src/carousel/carousels.mjs';
import {DRAKES} from './src/carousel/drakes.mjs';
import {DRAKE_HOOKS, REELS} from './approved/hooks.mjs';

const {SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key} = process.env;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const auth = {Authorization: `Bearer ${key}`, apikey: key};
const BUCKET = 'posta-audio';
const publicUrl = p => `https://d294le6kf791u9.cloudfront.net/social/${p}`;
const TAGS = '#learnspanish #argentina #spanishslang #argentinespanish';
// One ask per format, the one each feed rewards: saves for words, sends for Drake, real answers for reels.
// The app comes second, and only where it is: Google Play now, the App Store later.
const ASK = {
  words: ['Save this for your next trip to Argentina 🔖', 'Save this so it’s there when you need it 🔖', 'Which of these did you already know? Save it for later 🔖'],
  drake: ['Send this to a friend who still talks like a textbook 📩', 'Send this to the friend who’s going to Argentina 📩'],
  reel: ['What did you understand? Write it in the comments before you read them 👇', 'Did you get it on the first listen? Tell us in the comments 👇'],
};
const caption = (hook, kind, i) =>
  `${hook}\n\n${ASK[kind][i % ASK[kind].length]}\n\nLearn real Argentine Spanish with Posta, on Google Play now. Link in bio.\n\n${TAGS}`;

const inS3 = new Set(execFileSync('aws', ['--profile', 'posta', 's3', 'ls', `s3://${BUCKET}/social/`, '--recursive'], {encoding: 'utf8'})
  .split('\n').map(l => l.split(/\s+/)[3]).filter(Boolean));

async function upload(file, name, type) {
  if (inS3.has(`social/${name}`)) return publicUrl(name);
  for (let tries = 3; tries; tries--) {
    try {
      execFileSync('aws', ['--profile', 'posta', 's3', 'cp', file, `s3://${BUCKET}/social/${name}`, '--content-type', type, '--only-show-errors'], {stdio: 'inherit'});
      break;
    } catch (e) {
      if (tries === 1) throw e;
    }
  }
  return publicUrl(name);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
async function slides(id, dir, files) {
  const urls = [];
  for (const f of files) {
    // The slide's own hash in the name: a re-rendered slide gets a new address, so neither the skip above nor CloudFront serves the old one.
    const hash = createHash('md5').update(fs.readFileSync(path.join(dir, f))).digest('hex').slice(0, 8);
    const name = `slides/${id}/${f.replace('.png', '')}-${hash}.jpg`;
    if (inS3.has(`social/${name}`)) { urls.push(publicUrl(name)); continue; }
    const jpg = path.join(tmp, `${id}-${f}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', path.join(dir, f), '--out', jpg], {stdio: 'ignore'});
    urls.push(await upload(jpg, name, 'image/jpeg'));
  }
  return urls;
}

const items = [];
// Word carousels: the new ones first; car-01 already went out, so it comes last.
const words = [...CAROUSELS.slice(18), ...CAROUSELS.slice(1, 18), CAROUSELS[0]];
for (const [i, c] of words.entries()) {
  const dir = `approved/carousels/${c.id}`;
  const media = await slides(c.id, dir, fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort());
  items.push({id: c.id, kind: 'words', title: `${c.word}: Argentine Spanish`, captions: [caption(c.kicker, 'words', i)], yt_title: null, media, position: i, active: true});
  console.log(c.id);
}
// Drake: the "Stop saying" cover in place of 01; drake-01 and drake-03 already went out, so they come last.
const drakes = [...DRAKES.filter(d => !/drake-0[13]/.test(d.id)), ...DRAKES.filter(d => /drake-0[13]/.test(d.id))];
for (const [i, c] of drakes.entries()) {
  const dir = `approved/carousels-drake/${c.id}`;
  const media = await slides(c.id, dir, fs.readdirSync(dir).filter(f => f.endsWith('.png') && f !== '01.png').sort());
  items.push({id: c.id, kind: 'drake', title: `${c.topic}: Argentine Spanish`, captions: [caption(DRAKE_HOOKS[c.id], 'drake', i)], yt_title: null, media, position: i, active: true});
  console.log(c.id);
}
for (const [i, r] of REELS.entries()) {
  if (!fs.existsSync(`approved/reels/${r.id}.mp4`)) continue;
  const media = [await upload(`approved/reels/${r.id}.mp4`, `reels/${r.id}.mp4`, 'video/mp4')];
  items.push({id: r.id, kind: 'reel', title: r.title, captions: r.hooks.map((h, k) => caption(h, 'reel', i + k)), yt_title: `${r.title} #shorts`, media, position: i, active: r.active !== false});
  console.log(r.id);
}

const res = await fetch(`${url}/rest/v1/social_items`, {method: 'POST', headers: {...auth, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates'}, body: JSON.stringify(items)});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
console.log(items.length, 'items');
fs.rmSync(tmp, {recursive: true});
