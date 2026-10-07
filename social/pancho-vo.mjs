// Records the lines of a Pancho reel in the app's `tomas` voice and writes
// src/pancho/<id>.json: each clip's file, length and a per-frame loudness curve
// (what makes Pancho bob while he talks).
//   node pancho-vo.mjs [--force]
import fs from 'node:fs';
import {REELS} from './src/pancho/reels.mjs';
import {say, envelope} from './vo-lib.mjs';

const force = process.argv.includes('--force');
const context = ['Estamos aprendiendo español de Argentina. ', ' Vamos a escucharla otra vez.'];

let cost = 0;
for (const reel of REELS) {
  const dir = `public/vo/${reel.id}`; fs.mkdirSync(dir, {recursive: true});
  const lines = {hook: reel.hook, outro: reel.outro};
  reel.pairs.forEach((p, i) => { lines[`t${i}`] = p.textbook; lines[`a${i}`] = p.argentine; });
  const clips = {};
  for (const [name, text] of Object.entries(lines)) {
    const file = `${dir}/${name}.mp3`;
    cost += await say('tomas', text, file, {force, context});
    clips[name] = {src: `vo/${reel.id}/${name}.mp3`, text, ...envelope(file)};
    console.log(name.padEnd(6), clips[name].seconds.toFixed(2) + 's', text);
  }
  fs.writeFileSync(`src/pancho/${reel.id}.json`, JSON.stringify(clips));
}
console.log(`billed ${cost} characters`);
