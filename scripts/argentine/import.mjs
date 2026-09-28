#!/usr/bin/env node
// Writes docs/argentine/words.yaml from curated/judged JSON files (each an
// array of words, or { kept, dropped }), sorted by theme, level and word.
// Replaces the file: pass every source at once.
//
//   node scripts/argentine/import.mjs judged-1.json judged-2.json ...
import { readFileSync, writeFileSync } from 'node:fs';
import { stringify } from 'yaml';
import { THEMES } from './themes.mjs';
const words = process.argv.slice(2).flatMap((f) => { const d = JSON.parse(readFileSync(f, 'utf8')); return Array.isArray(d) ? d : d.kept; });
const order = THEMES.map((t) => t.slug);
words.sort((a, b) => order.indexOf(a.theme) - order.indexOf(b.theme) || a.level - b.level || a.es.localeCompare(b.es, 'es'));
const clean = words.map(({ es, pos, en, note, example, gap, theme, vulgar, level }) => ({ es, pos, en, note, example, gap, theme, vulgar, level }));
const head = `# Argentine vocabulary — the Words tab's "Argentine" packs.
# Curated from English Wiktionary (Rioplatense / Argentine / Lunfardo senses),
# then extended with everyday slang and expressions Wiktionary lacks, by writer
# and judge agents; published without native review, edits welcome.
# After editing: npm run argentine:build  (checks every word, writes src/lib/argentine.json)
# Fields: scripts/argentine/check.mjs · themes: scripts/argentine/themes.mjs
`;
writeFileSync(new URL('../../docs/argentine/words.yaml', import.meta.url), head + stringify({ words: clean }, { lineWidth: 0 }));
console.log(clean.length, 'words');
