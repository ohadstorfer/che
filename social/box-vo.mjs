// Voices of the boxing reels (src/box/reels.mjs). Writes src/box/<id>.json for each reel.
//   node box-vo.mjs [id-prefix] [--force]
// Every line is recorded once (ElevenLabs, shouted) to public/vo/box/<voice>-<slug>.mp3 and reused by every reel
// that says it. A round with `db` (box-01-spain) uses the app's own recording in public/vo/<id>/r<i>.mp3 instead:
// those clips have no letter times, so their mouths are laid out from the spoken vowels over the loud frames.
import fs from 'node:fs';
import {BOX} from './src/box/reels.mjs';
import {say, envelope, mouths} from './vo-lib.mjs';

const args = process.argv.slice(2), force = args.includes('--force');
const only = args.find(a => !a.startsWith('--')) || '';
const VOWEL = {a: 'a', á: 'a', e: 'e', é: 'e', i: 'i', í: 'i', o: 'o', ó: 'o', u: 'u', ú: 'u'};
const CONTEXT = ['Le grita, furioso, a la cara:', ''];

function guessMouths(text, env) {
  const vowels = [...text.toLowerCase()].map(c => VOWEL[c]).filter(Boolean);
  const loud = env.map((v, i) => v > 0.12 ? i : -1).filter(i => i >= 0);
  const out = env.map(() => 'c');
  if (!loud.length || !vowels.length) return out.join('');
  const [a, b] = [loud[0], loud[loud.length - 1] + 1], per = (b - a) / vowels.length;
  for (let f = a; f < b; f++) {
    const k = Math.min(vowels.length - 1, Math.floor((f - a) / per)), into = (f - a) - k * per;
    out[f] = env[f] < 0.06 ? 'h' : into < per * 0.3 ? 'h' : vowels[k];
  }
  return out.join('');
}
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let cost = 0;
const made = new Map(); // file -> clip, so a line said by many reels is read once
async function line(voice, text) {
  const file = `public/vo/box/${voice}-${slug(text)}.mp3`;
  if (made.has(file)) return made.get(file);
  cost += await say(voice, text, file, {force, context: CONTEXT});
  const sound = envelope(file);
  const clip = {src: file.replace(/^public\//, ''), text, ...sound, mouth: mouths(file, sound.env.length)};
  made.set(file, clip);
  console.log(voice.padEnd(7), clip.seconds.toFixed(2) + 's', text.padEnd(36), clip.mouth);
  return clip;
}

fs.mkdirSync('public/vo/box', {recursive: true});
for (const reel of BOX.filter(r => r.id.startsWith(only))) {
  const clips = {};
  for (const [i, r] of reel.rounds.entries()) {
    clips['l' + i] = await line(reel.left.voice, r.say);
    if (r.db) {
      const rf = `public/vo/${reel.id}/r${i}.mp3`;
      if (!fs.existsSync(rf)) throw new Error(`missing ${rf}: copy the app's ${r.db} there`);
      const rs = envelope(rf);
      clips['r' + i] = {src: `vo/${reel.id}/r${i}.mp3`, text: r.ar, ...rs, mouth: guessMouths(r.ar, rs.env)};
    } else clips['r' + i] = await line(reel.right.voice, r.ar);
  }
  fs.writeFileSync(`src/box/${reel.id}.json`, JSON.stringify(clips));
}
console.log(`billed ${cost} characters`);
