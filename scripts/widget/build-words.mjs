// The widget's word of the day: one bundled list, so the widget needs nothing
// from the app or the network to show today's word. Built from the Argentine
// packs (src/lib/argentine.json): everyday single words short enough for a
// small widget, out of the rude packs. The order is shuffled once with a fixed
// seed, so every phone shows the same word on the same day.
//   npm run widget:words
import { readFileSync, writeFileSync } from 'node:fs';

const { packs } = JSON.parse(readFileSync(new URL('../../src/lib/argentine.json', import.meta.url), 'utf8'));

const seen = new Set();
const words = [];
for (const pack of packs) {
  if (pack.vulgar) continue;
  for (const w of pack.words) {
    if (w.level !== 1 || w.pos === 'phrase' || /\s/.test(w.es)) continue;
    if (w.es.length > 10 || w.en.length > 22 || w.example.es.length > 40) continue;
    if (seen.has(w.id)) continue;
    seen.add(w.id);
    words.push({ id: w.id, es: w.es, en: w.en, ex: w.example.es });
  }
}

// mulberry32: small, seeded, the same on every machine.
let seed = 0x9057a;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
for (let i = words.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [words[i], words[j]] = [words[j], words[i]];
}

const json = JSON.stringify(words);
writeFileSync(new URL('../../targets/widget/assets/words.json', import.meta.url), json);
writeFileSync(new URL('../../src/lib/widget-words.json', import.meta.url), json);
console.log(`${words.length} words`);
