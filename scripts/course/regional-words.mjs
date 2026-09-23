#!/usr/bin/env node
// Builds src/lib/course-rules/regional-words.ts from docs/course/regional-words.yaml:
// every inflected form of every blocked lemma, so the linter's token check
// catches "piscinas" and "me enfadé" as well as "piscina" and "enfadarse".
//
//   npm run course:regional                 downloads Wiktionary's Spanish
//                                           entries (kaikki.org, ~1 GB) once
//   npm run course:regional -- <file.jsonl> uses a copy already on disk
//
// Forms come from English Wiktionary. A form is only blocked when every word
// it can be is blocked too: `rentas` is "you rent" and also the noun "rents",
// which Argentina uses, so it stays out.

import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';

const ROOT = new URL('../../', import.meta.url);
const SOURCE = new URL('docs/course/regional-words.yaml', ROOT);
const OUT = new URL('src/lib/course-rules/regional-words.ts', ROOT);
const DUMP_URL = 'https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl';
// Subtitle word frequencies: a clash with a word nobody says (`fresar`, to
// mill) shouldn't let `fresas` through.
const FREQ_URL = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt';
const COMMON = 30000;

const dump = process.argv[2] ?? join(tmpdir(), 'kaikki-spanish.jsonl');
if (!existsSync(dump)) {
  console.log(`downloading ${DUMP_URL} → ${dump}`);
  execFileSync('curl', ['-sSfL', '-o', dump, DUMP_URL], { stdio: 'inherit' });
}

const freqFile = join(tmpdir(), 'es_50k.txt');
if (!existsSync(freqFile)) execFileSync('curl', ['-sSfL', '-o', freqFile, FREQ_URL], { stdio: 'inherit' });
const rank = new Map();
readFileSync(freqFile, 'utf8').split('\n').forEach((line, i) => {
  const w = line.split(' ')[0];
  if (w && !rank.has(w)) rank.set(w, i + 1);
});
const common = (w) => (rank.get(w) ?? Infinity) <= COMMON;

const fold = (s) => s.toLocaleLowerCase('es');
const { words } = parse(readFileSync(SOURCE, 'utf8'));

// Phrases are matched whole by checkPhrases; only a leading verb is inflected
// ("echar de menos" → "te echo de menos").
const single = new Map(); // lemma → instead
const phrases = [];
for (const w of words) {
  const es = String(w.es).trim();
  if (es.includes(' ')) phrases.push(w);
  else single.set(fold(es), String(w.ar));
}
const phraseVerbs = new Set(phrases.map((p) => fold(p.es.split(' ')[0])));

async function* entries() {
  const lines = createInterface({ input: createReadStream(dump), crlfDelay: Infinity });
  for await (const line of lines) {
    const d = JSON.parse(line);
    if (d.lang_code === 'es') yield d;
  }
}
const formsOf = (d) =>
  (d.forms ?? [])
    .filter((f) => f.form && !f.form.includes(' ') && !(f.tags ?? []).some((t) => ['table-tags', 'inflection-template', 'class'].includes(t)))
    .map((f) => fold(f.form));
/** The lemma an entry stands for: itself, or what it is a form of. */
const lemmasOf = (d) => {
  const of = (d.senses ?? []).flatMap((s) => (s.form_of ?? []).map((f) => fold(f.word)));
  return of.length ? of : [fold(d.word)];
};

// Pass 1: the forms of every blocked lemma (and of a phrase's leading verb).
const lemmaOfSurface = new Map(); // surface → blocked lemma it belongs to
const verbForms = new Map(); // phrase verb → its surfaces
for await (const d of entries()) {
  const w = fold(d.word);
  if (single.has(w)) {
    for (const s of [w, ...formsOf(d)]) if (!lemmaOfSurface.has(s)) lemmaOfSurface.set(s, w);
  }
  if (phraseVerbs.has(w) && d.pos === 'verb') {
    verbForms.set(w, new Set([...(verbForms.get(w) ?? []), w, ...formsOf(d)]));
  }
}
for (const lemma of single.keys()) if (!lemmaOfSurface.has(lemma)) lemmaOfSurface.set(lemma, lemma);

// Pass 2: which other common words share each surface. `enfadado` is its own
// entry but a form of `enfadar`, so it counts as blocked; `renta` is also the
// noun "income", known only through its plural's entry, so both it and the
// entry's own forms are checked.
const clash = new Map(); // surface → a word it also is
for await (const d of entries()) {
  const own = lemmasOf(d);
  const sameWord = own.every((l) => single.has(l) || (d.pos !== 'noun' && lemmaOfSurface.has(l)));
  if (sameWord || !own.some(common)) continue;
  for (const s of [fold(d.word), ...formsOf(d), ...own]) {
    if (lemmaOfSurface.has(s) && !single.has(s) && !clash.has(s)) clash.set(s, own[0]);
  }
}

// The words we tell people to use are never blocked, whatever Wiktionary says
// they are a form of: `computadora` is also the feminine of `computador`.
const instead = new Set(words.flatMap((w) => fold(String(w.ar)).split(/[\s/]+/)));
const table = {};
for (const [surface, lemma] of [...lemmaOfSurface].sort(([a], [b]) => a.localeCompare(b, 'es'))) {
  if (surface === '-' || clash.has(surface) || instead.has(surface)) continue;
  table[surface] = single.get(lemma);
}
const phraseTable = [];
for (const p of phrases) {
  const [verb, ...rest] = p.es.split(' ');
  const heads = p.pos === 'verb' || p.pos === 'phrase' ? verbForms.get(fold(verb)) : null;
  for (const head of heads ?? [fold(verb)]) phraseTable.push([[head, ...rest].join(' '), String(p.ar)]);
}

writeFileSync(
  OUT,
  `// Generated by \`npm run course:regional\` from docs/course/regional-words.yaml.
// Do not edit by hand: edit the YAML and rebuild.

/** Every form of a word the course never uses → the rioplatense word instead. */
export const REGIONAL_WORDS: Record<string, string> = ${JSON.stringify(table, null, 0).replace(/","/g, '",\n  "').replace(/^\{/, '{\n  ').replace(/\}$/, ',\n}')};

/** Set phrases from other Spanishes → what a porteño says instead. */
export const REGIONAL_PHRASE_LIST: [string, string][] = ${JSON.stringify(phraseTable).replace(/\],\[/g, '],\n  [').replace(/^\[\[/, '[\n  [').replace(/\]\]$/, '],\n]')};
`,
);
const dropped = [...clash].map(([s, other]) => `${s} (${other})`);
console.log(`wrote ${Object.keys(table).length} forms of ${single.size} words, ${phraseTable.length} phrases`);
console.log(`left out ${dropped.length} forms that are also other words: ${dropped.slice(0, 40).join(', ')}${dropped.length > 40 ? ', …' : ''}`);
