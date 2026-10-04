#!/usr/bin/env node
// Checks curated Argentine vocabulary before it is merged into
// docs/argentine/words.yaml.
//
//   node scripts/argentine/check.mjs <curated.json> [<chunk.json>]
//
// curated.json is { kept: Word[], dropped: { word, reason }[] }. With a chunk
// (the Wiktionary entries the curator was given, or the words a judge was
// given), every one of them must be
// either kept or dropped. Prints one line per failure and exits 1 on any.

import { readFileSync } from 'node:fs';

import { POS, THEME_SLUGS } from './themes.mjs';

const fold = (s) =>
  String(s)
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Whether `needle` appears in `text` as whole words. */
export function hasWhole(text, needle) {
  const esc = fold(needle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}])${esc}($|[^\\p{L}])`, 'u').test(fold(text));
}

export function checkWord(w) {
  const errs = [];
  const need = (cond, msg) => cond || errs.push(msg);
  need(typeof w.es === 'string' && w.es.trim().length > 0, 'es missing');
  need(POS.includes(w.pos), `pos must be one of ${POS.join(', ')}`);
  need(typeof w.en === 'string' && w.en.trim().length > 0 && w.en.length <= 40, 'en must be 1–40 chars');
  need(String(w.en ?? '').split(/\s+/).length <= 6, 'en must be at most 6 words');
  need(!/[()]/.test(w.en ?? ''), 'en must not contain parentheses: put the aside in note');
  if (w.es && w.en && fold(w.es).length > 2) need(!hasWhole(w.en, w.es), 'en must not contain the Spanish word');
  need(typeof w.note === 'string' && w.note.length >= 10 && w.note.length <= 170, 'note must be 10–170 chars');
  if (w.tag !== undefined)
    need(typeof w.tag === 'string' && w.tag.length > 0 && w.tag.length <= 24 && w.tag.split(/\s+/).length <= 3, 'tag must be 1–3 words, at most 24 chars');
  need(w.example && typeof w.example.es === 'string' && typeof w.example.en === 'string', 'example {es, en} missing');
  if (w.example?.es) {
    need(w.example.es.split(/\s+/).length <= 16, 'example.es must be at most 16 words');
    need(typeof w.gap === 'string' && w.gap.length > 0, 'gap missing');
    if (w.gap) need(hasWhole(w.example.es, w.gap), `gap "${w.gap}" not found as whole word(s) in example.es`);
  }
  need(THEME_SLUGS.includes(w.theme), `theme must be one of ${THEME_SLUGS.join(', ')}`);
  need(typeof w.vulgar === 'boolean', 'vulgar must be true/false');
  need((w.theme === 'puteadas') === (w.vulgar === true), 'vulgar words go in puteadas, and only they do');
  need([1, 2, 3].includes(w.level), 'level must be 1, 2 or 3');
  // How soon it comes within its level: 1 said every day · 2 very common · 3 common. Absent: after those.
  if (w.rank !== undefined) need([1, 2, 3].includes(w.rank), 'rank must be 1, 2 or 3 (or left out)');
  return errs;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, chunkFile] = process.argv.slice(2);
  const cur = JSON.parse(readFileSync(file, 'utf8'));
  const fails = [];
  const seen = new Set();
  for (const w of cur.kept ?? []) {
    for (const e of checkWord(w)) fails.push(`${w.es}: ${e}`);
    if (seen.has(fold(w.es))) fails.push(`${w.es}: kept twice (one entry per word — pick its main Argentine sense)`);
    seen.add(fold(w.es));
  }
  if (chunkFile) {
    const input = JSON.parse(readFileSync(chunkFile, 'utf8'));
    const accounted = new Set([
      ...(cur.kept ?? []).flatMap((w) => [w.es, w.source]),
      ...(cur.dropped ?? []).map((d) => d.word),
    ]);
    for (const e of input) {
      const word = e.word ?? e.es;
      if (!accounted.has(word) && !accounted.has(e.source)) fails.push(`${word}: neither kept nor dropped`);
    }
  }
  for (const f of fails) console.log(f);
  console.log(`${(cur.kept ?? []).length} kept, ${(cur.dropped ?? []).length} dropped, ${fails.length} failures`);
  process.exit(fails.length ? 1 : 0);
}
