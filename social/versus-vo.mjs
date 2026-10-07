// Records the lines of each "X vs Y" reel, each side in its own voice, and writes
// src/versus/<id>.json (file, length, per-frame loudness and per-frame mouth shape of every clip).
//   node versus-vo.mjs [--force]
import fs from 'node:fs';
import {VERSUS} from './src/versus/reels.mjs';
import {say, envelope, mouths} from './vo-lib.mjs';

const force = process.argv.includes('--force');
let cost = 0;
for (const reel of VERSUS.filter(r => !r.veo)) { // a veo reel reuses another reel's lines
  const dir = `public/vo/${reel.id}`; fs.mkdirSync(dir, {recursive: true});
  const clips = {};
  for (const [i, p] of reel.pairs.entries()) for (const [side, text] of [['l', p.sayLeft], ['r', p.sayRight]]) {
    const name = side + i, file = `${dir}/${name}.mp3`;
    cost += await say(reel[side === 'l' ? 'left' : 'right'].voice, text, file, {force});
    const sound = envelope(file);
    clips[name] = {src: `vo/${reel.id}/${name}.mp3`, text, ...sound, mouth: mouths(file, sound.env.length)};
    console.log(name.padEnd(4), sound.seconds.toFixed(2) + 's', text.padEnd(14), clips[name].mouth);
  }
  fs.writeFileSync(`src/versus/${reel.id}.json`, JSON.stringify(clips));
  // Frames worth looking at before rendering: the middle of every line, then each screen of the ending.
  // (The same sums as timeline() in VersusReel.tsx and the wheel in EndCard.tsx.)
  let t = 26; const look = [12];
  reel.pairs.forEach((_, i) => { const l = clips['l' + i].env.length, r = clips['r' + i].env.length; look.push(t + 5 + (l >> 1), t + 5 + l + 8 + (r >> 1)); t += 5 + l + 8 + r + 22; });
  console.log(`${reel.id}: about ${t + 150} frames; check stills at ${[...look, t + 40, t + 70, t + 100, t + 130].join(',')}`);
}
console.log(`billed ${cost} characters`);
