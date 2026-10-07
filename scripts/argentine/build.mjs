#!/usr/bin/env node
// Builds src/lib/argentine.json — the Words tab's Argentine packs — from
// docs/argentine/words.yaml.
//
//   npm run argentine:build
//
// Recordings come from docs/argentine/audio.json (npm run argentine:tts).
//
// Words are grouped by theme, most useful first (level 1 → 3, then `rank` 1 → 3
// with unranked words after them, then alphabetical), and each theme is dealt
// into packs of about PACK_SIZE words:
// a theme of 30 becomes three packs of 10, not 12 + 12 + 6. A pack is named
// for how common its words are (Essentials, Everyday, Going deeper, Rare gems). Any word failing
// check.mjs stops the build.

import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { loadManifest } from '../course/lib/clips.mjs';
import { MANIFEST, clipsOf } from './audio.mjs';
import { checkWord } from './check.mjs';
import { PACK_SIZE, THEMES } from './themes.mjs';

const ROOT = new URL('../../', import.meta.url);
const SOURCE = new URL('docs/argentine/words.yaml', ROOT);
const OUT = new URL('src/lib/argentine.json', ROOT);

const slugOf = (s) =>
  s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const { words } = parse(readFileSync(SOURCE, 'utf8'));
const fails = [];
const ids = new Set();
for (const w of words) {
  for (const e of checkWord(w)) fails.push(`${w.es}: ${e}`);
  let id = slugOf(w.es);
  if (ids.has(id)) fails.push(`${w.es}: listed twice`);
  ids.add(id);
  w.id = id;
}
if (fails.length) {
  for (const f of fails) console.error(f);
  console.error(`${fails.length} failures — nothing written`);
  process.exit(1);
}

/** What a pack is called, from how common its words are: a learner picks
 *  "Essentials" before "Going deeper" without reading a word list. */
const STEPS = [
  { upTo: 1.2, name: 'Essentials' },
  { upTo: 1.8, name: 'Everyday' },
  { upTo: 2.4, name: 'Going deeper' },
  { upTo: Infinity, name: 'Rare gems' },
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

/** Where a word with no `rank` sorts within its level: after every ranked one. */
const UNRANKED = 9;

/** The clips that exist (argentine:tts). A word not recorded yet ships silent. */
const recorded = loadManifest(MANIFEST);
const heard = (path) => (recorded[path] ? { audio: path } : {});

const packs = [];
for (const theme of THEMES) {
  const list = words
    .filter((w) => w.theme === theme.slug)
    .sort((a, b) => a.level - b.level || (a.rank ?? UNRANKED) - (b.rank ?? UNRANKED) || a.es.localeCompare(b.es, 'es'));
  if (!list.length) continue;
  const count = Math.ceil(list.length / PACK_SIZE);
  const dealt = Array.from({ length: count }, (_, i) =>
    list.slice(Math.round((i * list.length) / count), Math.round(((i + 1) * list.length) / count)),
  );
  const steps = dealt.map((ws) => {
    const avg = ws.reduce((n, w) => n + w.level, 0) / ws.length;
    return STEPS.find((st) => avg <= st.upTo).name;
  });
  dealt.forEach((ws, i) => {
    // "Essentials I, II, III" when a step runs over several packs.
    const same = steps.filter((st) => st === steps[i]).length;
    const nth = steps.slice(0, i).filter((st) => st === steps[i]).length;
    const name = same > 1 ? `${steps[i]} ${ROMAN[nth]}` : steps[i];
    packs.push({
      slug: count > 1 ? `${theme.slug}-${i + 1}` : theme.slug,
      theme: theme.slug,
      name,
      title: count > 1 ? `${theme.title} · ${name}` : theme.title,
      emoji: theme.emoji,
      about: theme.about,
      vulgar: !!theme.vulgar,
      words: ws.map((w) => {
        const clips = clipsOf(w);
        return {
          id: w.id,
          es: w.es,
          pos: w.pos,
          en: w.en,
          note: w.note,
          ...(w.tag ? { tag: w.tag } : {}),
          example: { es: w.example.es, en: w.example.en, ...heard(clips.example) },
          gap: w.gap,
          level: w.level,
          ...heard(clips.word),
          ...(recorded[clips.word] || recorded[clips.example] ? { voice: clips.voice.id } : {}),
        };
      }),
    });
  });
}

const themes = THEMES.filter((t) => packs.some((p) => p.theme === t.slug)).map(({ slug, title, emoji, about, vulgar }) => ({
  slug,
  title,
  emoji,
  about,
  vulgar: !!vulgar,
}));
writeFileSync(OUT, `${JSON.stringify({ themes, packs }, null, 1)}\n`);
console.log(`${words.length} words → ${packs.length} packs in ${themes.length} themes → src/lib/argentine.json`);
