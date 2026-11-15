// usage: node pancho-mouths.mjs <clip in public/celeb> ...
//   Writes src/celeb/pancho-mouths.json: one mouth letter per video frame of each clip (see mouths() in vo-lib.mjs),
//   so Pancho can lip-sync to a voice we already have. Word times come from celeb-words.mjs; each word's letters share its time evenly.
import fs from 'node:fs';
import {mouths} from './vo-lib.mjs';
const OUT = 'src/celeb/pancho-mouths.json', FPS = 30;
const all = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const clip of process.argv.slice(2)) {
  const words = JSON.parse(fs.readFileSync(`public/celeb/${clip}.words.json`, 'utf8'));
  const al = {characters: [], character_start_times_seconds: [], character_end_times_seconds: []};
  for (const [from, to, text] of words) [...text].forEach((ch, i, all) => {
    al.characters.push(ch);
    al.character_start_times_seconds.push(from + (to - from) * i / all.length);
    al.character_end_times_seconds.push(from + (to - from) * (i + 1) / all.length);
  });
  const tmp = `/tmp/pancho-${clip}`;
  fs.writeFileSync(tmp + '.json', JSON.stringify(al));
  all[clip] = mouths(tmp, Math.ceil(words.at(-1)[1] * FPS) + 6);
  fs.rmSync(tmp + '.json');
}
fs.writeFileSync(OUT, JSON.stringify(all));
