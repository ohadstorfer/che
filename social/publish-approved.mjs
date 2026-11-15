// Sends what's in approved/ to S3 (posta-audio/social/, served by its CloudFront) and to social_items, where social-queue takes it from.
// usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node publish-approved.mjs
// Slides go up as JPEGs (Instagram's format); a slide already in the bucket is skipped, an item keeps its place in the rotation.
import {execFileSync} from 'child_process';
import {createHash} from 'crypto';
import fs from 'fs'; import os from 'os'; import path from 'path';
import {CAROUSELS} from './src/carousel/carousels.mjs';
import {DRAKES} from './src/carousel/drakes.mjs';
import * as approved from './approved/hooks.mjs';
import {VERSUS} from './src/versus/reels.mjs';
import {BOX} from './src/box/reels.mjs';
import {LITERAL} from './src/literal/reels.mjs';
import {WORD_QUIZZES} from './src/carousel/wordquiz.mjs';

const {SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key} = process.env;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const auth = {Authorization: `Bearer ${key}`, apikey: key};
const BUCKET = 'posta-audio';
const publicUrl = p => `https://d294le6kf791u9.cloudfront.net/social/${p}`;
const {DRAKE_HOOKS, REELS} = approved;
const TAGS = '#learnspanish #argentina #spanishslang #argentinespanish';
// One ask per format, the one each feed rewards: saves for words, sends for Drake, real answers for reels.
// The app comes second, and only where it is: Google Play now, the App Store later.
const ASK = {
  words: ['Save this for your next trip to Argentina 🔖', 'Save this so it’s there when you need it 🔖', 'Which of these did you already know? Save it for later 🔖'],
  drake: ['How many did you get? Comment your score 👇', 'Be honest: how many did you get? Comment your score 👇'],
  versus: ['Which one did you already know? Tell me in the comments 👇', 'Did you know all four? Tell me in the comments 👇'],
  reel: ['What did you understand? Write it in the comments before you read them 👇', 'Did you get it on the first listen? Tell us in the comments 👇'],
  wotd: ['How many did you get right? Comment your score 👇', 'Did you get all three? Comment your score 👇'],
  literal: ['Which one surprised you the most? Tell me in the comments 👇', 'How many did you guess before the timer? Comment your score 👇'],
  box: ['Who won? Tell me in the comments 👇', 'Which insult hit harder? Tell me in the comments 👇'],
  ugc: ['Would you try it? Tell me in the comments 👇', 'What word should I learn next? Comments 👇'],
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
// Drake: since 2026-11-06 the Drake slot posts the quiz reel ("Guess before Drake", QuizReel.tsx) instead of the carousel.
// Same item ids, so the rotation keeps its place. drake-01 and drake-03 already went out (as carousels), so they come last.
const drakes = [...DRAKES.filter(d => !/drake-0[13]/.test(d.id)), ...DRAKES.filter(d => /drake-0[13]/.test(d.id))];
for (const [i, c] of drakes.entries()) {
  const file = `approved/reels-quiz/quiz-${c.id}.mp4`;
  const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const media = [await upload(file, `reels/quiz-${c.id}-${hash}.mp4`, 'video/mp4')];
  items.push({id: c.id, kind: 'drake', title: `${c.topic}: Argentine Spanish`, captions: [caption(DRAKE_HOOKS[c.id], 'drake', i)], yt_title: null, media, position: i, active: true});
  console.log(c.id);
}
for (const [i, r] of REELS.entries()) {
  if (!fs.existsSync(`approved/reels/${r.id}.mp4`)) continue;
  // The file's hash in the name, so a re-mixed reel (the cumbia under the Pancho reels, 2026-11-07) gets a fresh address past CloudFront.
  const hash = createHash('md5').update(fs.readFileSync(`approved/reels/${r.id}.mp4`)).digest('hex').slice(0, 8);
  const media = [await upload(`approved/reels/${r.id}.mp4`, `reels/${r.id}-${hash}.mp4`, 'video/mp4')];
  items.push({id: r.id, kind: 'reel', title: r.title, captions: r.hooks.map((h, k) => caption(h, 'reel', i + k)), yt_title: `${r.title} #shorts`, media, position: i, active: r.active !== false});
  console.log(r.id);
}

// Versus: one kind per series, so each gets its own daily slot. The renders live in posta-videos (the newest -vN of each);
// the feeds get them from approved/versus, with the soft cumbia under them (mix-music.mjs, 2026-11-06).
const SERIES = [
  {kind: 'versus-es', ids: /^versus-(0[3-7]|es-)/, left: 'Spain says', right: 'Argentina says', vs: 'Spain vs Argentina'},
  {kind: 'versus-mx', ids: /^versus-(0[89]|10|mx-)/, left: 'Mexico says', right: 'Argentina says', vs: 'Mexico vs Argentina'},
  {kind: 'versus-tour', ids: /^versus-(11|tour-)/, left: 'Tourists say', right: 'Argentinians say', vs: 'Tourist vs Argentinian'},
];
const low = w => w.replace(/\n/g, ' ').toLocaleLowerCase('es');
for (const s of SERIES) {
  const reels = VERSUS.filter(r => s.ids.test(r.id) && !r.veo);
  for (const [i, r] of reels.entries()) {
    const file = `approved/versus/${r.id}.mp4`;
    if (!fs.existsSync(file)) { console.log('not in approved/versus:', r.id); continue; }
    const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
    const media = [await upload(file, `reels/${r.id}-${hash}.mp4`, 'video/mp4')];
    const [a, b] = r.pairs;
    const hooks = [`${s.left} “${low(a.left)}”. ${s.right} “${low(a.right)}”.`, `${b.english}: ${s.vs}. Which one would you say?`];
    items.push({id: r.id, kind: s.kind, title: `${a.english}: ${s.vs}`, captions: hooks.map((h, k) => caption(h, 'versus', i + k)),
      yt_title: `${s.vs} Spanish: ${low(a.left)} vs ${low(a.right)} #shorts`, media, position: i, active: true});
    console.log(r.id);
  }
}

// Boxing (2026-11-07): one kind 'box', one a day, Spain / Mexico / Chile taking turns (box-01-spain first).
// The renders live in posta-videos/versus/box (newest -vN); approved/box holds the feed copies with the soft cumbia.
// Captions never spell the insults: the video bleeps them on screen and the feeds' filters read captions.
const byCountry = ['es', 'mx', 'cl'].map(c => BOX.filter(r => r.id.startsWith(`box-${c}-`)));
const boxes = [BOX.find(r => r.id === 'box-01-spain'), ...byCountry[0].flatMap((_, k) => byCountry.map(list => list[k]).filter(Boolean))];
for (const [i, r] of boxes.entries()) {
  const file = `approved/box/${r.id}.mp4`;
  if (!fs.existsSync(file)) { console.log('not in approved/box:', r.id); continue; }
  const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const media = [await upload(file, `reels/${r.id}-${hash}.mp4`, 'video/mp4')];
  const country = r.left.name[0] + r.left.name.slice(1).toLowerCase();
  const hooks = [`How ${country} swears vs how Argentina swears 🥊`, `${country} vs Argentina: three rounds of insults. Who wins? 🥊`];
  items.push({id: r.id, kind: 'box', title: `How ${country} swears vs Argentina`, captions: hooks.map((h, k) => caption(h, 'box', i + k)),
    yt_title: `How ${country} swears vs Argentina 🥊 #shorts`, media, position: i, active: true});
  console.log(r.id);
}

// Literally vs really (2026-11-09): kind 'literal', one a day. Reels 1–13 are insults, 14–30 everyday expressions;
// they alternate (literal-01, "forro", first). approved/literal holds the newest render of each (music already inside).
// Insult captions never spell the words (the feeds' filters read captions); expression captions name the first one.
const lit = LITERAL.filter(r => +r.id.slice(8) <= 13), exp = LITERAL.filter(r => +r.id.slice(8) > 13);
const literals = Array.from({length: Math.max(lit.length, exp.length)}, (_, k) => [lit[k], exp[k]]).flat().filter(Boolean);
for (const [i, r] of literals.entries()) {
  const file = `approved/literal/${r.id}.mp4`;
  if (!fs.existsSync(file)) { console.log('not in approved/literal:', r.id); continue; }
  const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const media = [await upload(file, `reels/${r.id}-${hash}.mp4`, 'video/mp4')];
  const rude = +r.id.slice(8) <= 13, w = r.items[0].w;
  const hooks = rude
    ? ['Argentine insults, translated literally 💀 Guess the real meaning before the timer runs out ⏱️', 'We translated Argentine swear words word for word. It did not go well 💀']
    : [`What does “${w}” really mean in Argentina? Guess before the timer runs out ⏱️`, `Argentine Spanish, translated literally 💀 Starting with “${w}”`];
  items.push({id: r.id, kind: 'literal', title: rude ? 'Argentine insults, translated literally' : `“${w}” translated literally`, captions: hooks.map((h, k) => caption(h, 'literal', i + k)),
    yt_title: rude ? 'Argentine insults translated literally 💀 #shorts' : `“${w}” in Argentina, translated literally 💀 #shorts`, media, position: i, active: true});
  console.log(r.id);
}

// Argentinian Word of the Day (2026-11-07): kind 'wotd', one a day in carousel order (day 1 = posta), 47 words ("mal" left out).
// Renders: comps wotd-<word> (src/carousel/WordQuizReel.tsx, music already inside); approved/wotd holds the mp4s.
for (const [i, q] of [...WORD_QUIZZES].sort((a, b) => a.day - b.day).entries()) {
  const file = `approved/wotd/${q.id}.mp4`;
  if (!fs.existsSync(file)) { console.log('not in approved/wotd:', q.id); continue; }
  const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const media = [await upload(file, `reels/${q.id}-${hash}.mp4`, 'video/mp4')];
  const W = q.word.toUpperCase();
  const hooks = [`Argentinian word of the day: ${W} 🇦🇷 Guess what it means before the timer runs out ⏱️`, `Do you know what “${q.word}” means in Argentina? 3 rounds, 3 seconds each ⏱️`];
  items.push({id: q.id, kind: 'wotd', title: `Word of the day: ${W}`, captions: hooks.map((h, k) => caption(h, 'wotd', i + k)),
    yt_title: `Argentinian Word of the Day: ${W} #shorts`, media, position: i, active: true});
  console.log(q.id);
}

// Hook + demo (AI UGC, 2026-11-06): kind 'ugc', for the extra accounts in social-queue's ACCOUNTS.
// approved/hooks.mjs exports UGC = [{id, hooks: [two first lines], active}], the file is approved/ugc/<id>.mp4.
// The caption says it's an AI video; TikTok also gets its AI-generated label (the slot's `ai`).
for (const [i, r] of (approved.UGC ?? []).entries()) {
  const file = `approved/ugc/${r.id}.mp4`;
  if (!fs.existsSync(file)) { console.log('not in approved/ugc:', r.id); continue; }
  const hash = createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const media = [await upload(file, `reels/${r.id}-${hash}.mp4`, 'video/mp4')];
  const captions = r.hooks.map((h, k) => `${h}\n\n${ASK.ugc[(i + k) % ASK.ugc.length]}\n\nThe app is Posta, on Google Play now. Link in bio.\n\n${TAGS} #aigenerated`);
  items.push({id: r.id, kind: 'ugc', title: r.hooks[0], captions, yt_title: null, media, position: i, active: r.active !== false});
  console.log(r.id);
}

const res = await fetch(`${url}/rest/v1/social_items`, {method: 'POST', headers: {...auth, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates'}, body: JSON.stringify(items)});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
console.log(items.length, 'items');
fs.rmSync(tmp, {recursive: true});
