// usage: node celeb-words.mjs <clip> [from] [to]
//   Prints every word said in a clip with the seconds it starts and ends, for the `say` times
//   of a celeb reel (src/celeb/reels.mjs). `from` and `to` keep only that part of the clip.
//   The transcript is kept next to the clip as <clip>.words.json, so a second run is free.
import fs from 'node:fs';
import path from 'node:path';

process.loadEnvFile(new URL('../.env', import.meta.url));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('ELEVENLABS_API_KEY is not set — see ../.env.example');
const [clip, from = 0, to = Infinity] = process.argv.slice(2);
if (!clip) throw new Error('usage: node celeb-words.mjs <clip> [from] [to]');

const kept = clip + '.words.json';
if (!fs.existsSync(kept)) {
  const form = new FormData();
  form.append('model_id', 'scribe_v1');
  form.append('language_code', 'es');
  form.append('timestamps_granularity', 'word');
  form.append('file', new Blob([fs.readFileSync(clip)]), path.basename(clip));
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': key}, body: form});
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  fs.writeFileSync(kept, JSON.stringify((await res.json()).words.filter(w => w.type === 'word').map(w => [w.start, w.end, w.text])));
}
for (const [start, end, text] of JSON.parse(fs.readFileSync(kept, 'utf8')))
  if (end >= Number(from) && start <= Number(to)) console.log(start.toFixed(2).padStart(7), end.toFixed(2).padStart(7), ' ' + text);
