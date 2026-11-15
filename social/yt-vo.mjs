// usage: node yt-vo.mjs <video id>   Records Pancho (Tomás) for one YouTube video in src/yt/videos.mjs, one mp3 per
//   chapter in public/vo/<video.vo>/, and writes src/yt/timing/<id>.json: each chapter's length, Pancho's mouths, and when each cue's
//   phrase is said. Chapters already recorded are kept (move the mp3 away to re-record one).
//   Same accent trick as celeb-pancho-vo.mjs: Spanish in “…” gets an Argentine accent, the rest a strong American one.
import fs from 'node:fs';
import {say, mouths, FPS} from './vo-lib.mjs';
import {video} from './src/yt/videos.mjs';
const V = video(process.argv[2]);

const US = '[strong American accent] ', AR = '[Argentine Spanish accent] ';
const tagged = text => US + text.replace(/“[^”]*”[,.…:;!?]*/g, q => AR + q + ' ' + US).replace(/\s+/g, ' ').trim()
  .replace(/\s*\[strong American accent\]$/, '');
function untag(file) {
  const al = JSON.parse(fs.readFileSync(file + '.json', 'utf8')), keep = [];
  let inTag = false;
  al.characters.forEach((c, i) => { if (c === '[') inTag = true; if (!inTag) keep.push(i); if (c === ']') inTag = false; });
  const out = {}; for (const k of Object.keys(al)) out[k] = keep.map(i => al[k][i]);
  fs.writeFileSync(file + '.json', JSON.stringify(out));
}
// When `phrase` starts, in seconds: matched without spaces, after `from` seconds.
function when(al, phrase, from = 0) {
  const idx = [], s = [];
  al.characters.forEach((c, i) => { if (!/\s/.test(c)) { idx.push(i); s.push(c); } });
  const hay = s.join(''), needle = phrase.replace(/\s+/g, '');
  let at = hay.indexOf(needle);
  while (at >= 0 && al.character_start_times_seconds[idx[at]] < from) at = hay.indexOf(needle, at + 1);
  if (at < 0) throw new Error('phrase not found: ' + phrase);
  return Math.round(al.character_start_times_seconds[idx[at]] * 100) / 100;
}

fs.mkdirSync(`public/vo/${V.vo}`, {recursive: true});
const timing = {};
let billed = 0;
for (const ch of V.chapters) {
  const file = `public/vo/${V.vo}/${ch.id}.mp3`;
  const cost = await say('tomas', tagged(ch.text), file, {lang: null, stability: 0.5});
  if (cost) untag(file);
  billed += cost;
  const al = JSON.parse(fs.readFileSync(file + '.json', 'utf8'));
  const seconds = al.character_end_times_seconds.at(-1);
  let last = 0;
  const cues = ch.cues.map(c => {
    const at = when(al, c.at, Math.max(0, last - 0.01)); last = at;
    return {at, then: c.then ? when(al, c.then, at) : undefined, marks: c.marks?.map(m => when(al, m, at))};
  });
  timing[ch.id] = {seconds: Math.round(seconds * 100) / 100, mouth: mouths(file, Math.ceil(seconds * FPS) + 6), cues};
  console.log(ch.id, timing[ch.id].seconds, 's', cues.map(c => c.at).join(' '));
}
fs.writeFileSync(`src/yt/timing/${V.id}.json`, JSON.stringify(timing));
console.log('characters billed', billed);
