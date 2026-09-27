#!/usr/bin/env node
// Re-derives every published sentence's accepted answers (`es_alt`) with the
// current rules (src/lib/course-rules/accept.ts), for when the rules changed:
//
// - What the rules made before ("Yo soy…", "…cansada") is dropped and made
//   again, so a variant the old rules got wrong ("estudio inglesa", "vos… vos",
//   "Ella se le cayó") goes, and one they missed ("Estaba re cansado") comes.
// - What an author or agent wrote is kept, unless it has one of those same
//   mistakes, and gets the rules' variants too.
// - Sentences with the very same English accept each other: "Of course I'll
//   help you" is "Obvio que te ayudo" and "Claro que te ayudo" both.
//
//   node --import ./scripts/test/register.mjs scripts/course/regen-answers.mjs [--dry-run]
import { queryLinked } from './lib/db.mjs';
import { q, textArray } from './lib/sql.mjs';
import { availableForms } from './lib/outline.mjs';
import { buildIndex, tokenize } from './lib/tokenize.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';
import { generateVariants } from '../../src/lib/course-rules/accept.ts';
import { answerKey } from '../../src/lib/course-rules/check.ts';

const dryRun = process.argv.includes('--dry-run');
/** Past this many, alternatives are noise. */
const MAX_ALTS = 40;

const outline = loadOutlineFromDb();
const unitById = new Map(outline.units.map((u) => [u.id, u]));
const indexes = new Map();
const indexFor = (unit) => {
  if (!indexes.has(unit.id)) indexes.set(unit.id, buildIndex(availableForms(outline, unit.course_order)));
  return indexes.get(unit.id);
};

const sentences = queryLinked(
  `select id, unit_id, es, en, es_alt from public.sentences where status = 'published' order by id`,
).filter((s) => unitById.has(s.unit_id));

const PRONOUNS = new Set(['yo', 'vos', 'él', 'ella', 'usted', 'nosotros', 'nosotras', 'ellos', 'ellas', 'ustedes']);
const words = (s) => s.toLocaleLowerCase('es').split(/[^\p{L}]+/u).filter(Boolean);
/** The sentence with what the rules change taken out: pronouns, "che", and gender endings. */
const skeleton = (s) =>
  words(s)
    .filter((w) => !PRONOUNS.has(w) && w !== 'che')
    .map((w) => w.replace(/a(s?)$/, 'o$1'))
    .join(' ');
const count = (s, w) => words(s).filter((x) => x === w).length;
const LANGUAGES = [['inglés', 'inglesa'], ['francés', 'francesa'], ['portugués', 'portuguesa'], ['alemán', 'alemana'], ['japonés', 'japonesa']];

/** Why an authored alternative is broken, or null. */
function broken(alt, es) {
  for (const p of PRONOUNS) if (count(alt, p) >= 2 && count(alt, p) > count(es, p)) return `second "${p}"`;
  for (const p of ['él', 'ella', 'ellos', 'ellas']) {
    const before = new RegExp(`(^|[^\\p{L}])${p} (se (me|te|le|nos|les)|me|te|le|nos|les) (gust|encant|parec|duel|import|molest|interes|falt|qued|toc|preocup|conv|alcanz|sobr|cuest|pas|ca[yíe]|olvid|romp|perd)`, 'iu');
    if (before.test(alt) && !before.test(es)) return 'pronoun before a dative verb';
  }
  if ((alt.match(/¿/g) ?? []).length > (alt.match(/\?/g) ?? []).length) return 'unclosed ¿';
  for (const [lang, wrong] of LANGUAGES) if (es.includes(lang) && alt.includes(wrong)) return `"${wrong}" for the language`;
  return null;
}
/** A capital where a new sentence starts: "¿Enojado? no, …" → "¿Enojado? No, …". */
const recapitalize = (s) => s.replace(/([.?!…]["»”)]*\s+[¿¡—]*)(\p{Ll})/gu, (_, a, b) => a + b.toLocaleUpperCase('es'));

const variantsOf = (text, s) => generateVariants(tokenize(text, indexFor(unitById.get(s.unit_id))), s.en ?? '', outline);

// Pass 1: each sentence on its own.
const own = new Map();
const stats = { dropped: 0, reasons: {} };
const droppedExamples = [];
for (const s of sentences) {
  const kept = [];
  for (const alt of s.es_alt ?? []) {
    // One that only moves a word ("¿Él cómo se llama?") is an author's. One
    // with the other gender is the rules', made again below if they still
    // allow it. One that only adds or drops a pronoun stays, unless broken.
    const sorted = (x) => words(x).sort().join(' ');
    const bareWords = (x) => words(x).filter((w) => !PRONOUNS.has(w) && w !== 'che').join(' ');
    if (skeleton(alt) === skeleton(s.es) && sorted(alt) !== sorted(s.es) && bareWords(alt) !== bareWords(s.es)) continue;
    const why = broken(alt, s.es);
    if (why) {
      stats.dropped++;
      stats.reasons[why.replace(/".*"/, '"…"')] = (stats.reasons[why.replace(/".*"/, '"…"')] ?? 0) + 1;
      if (droppedExamples.length < 12) droppedExamples.push(`${s.es} ✗ ${alt} (${why})`);
      continue;
    }
    kept.push(recapitalize(alt));
  }
  const all = [...kept, ...variantsOf(s.es, s), ...kept.flatMap((a) => variantsOf(a, s))];
  own.set(s.id, all);
}

// Pass 2: the same English accepts the same answers.
const enKey = (en) => (en ?? '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const byEn = new Map();
for (const s of sentences) {
  const k = enKey(s.en);
  if (!byEn.has(k)) byEn.set(k, []);
  byEn.get(k).push(s);
}

let changed = 0;
let crossed = 0;
const updates = [];
const examples = [];
for (const s of sentences) {
  const twins = byEn.get(enKey(s.en)).filter((t) => answerKey(t.es) !== answerKey(s.es));
  const cross = twins.flatMap((t) => [t.es, ...own.get(t.id)]);
  const taken = new Set([answerKey(s.es)]);
  const next = [];
  for (const alt of [...own.get(s.id), ...cross]) {
    const k = answerKey(alt);
    if (taken.has(k) || next.length >= MAX_ALTS) continue;
    taken.add(k);
    next.push(alt);
  }
  if (twins.length) crossed++;
  const before = s.es_alt ?? [];
  if (JSON.stringify(before) === JSON.stringify(next)) continue;
  changed++;
  if (examples.length < 15 && twins.length)
    examples.push(`${s.es} | ${s.en}\n    was: ${before.join(' · ') || '—'}\n    now: ${next.join(' · ') || '—'}`);
  updates.push(`update public.sentences set es_alt = ${textArray(next)} where id = ${q(s.id)} and es = ${q(s.es)};`);
}

console.log(`${sentences.length} sentences · ${changed} change · ${crossed} share their English with another`);
console.log(`dropped ${stats.dropped} broken authored answers:`, stats.reasons);
console.log(droppedExamples.join('\n'));
console.log('\n' + examples.join('\n'));
if (dryRun) {
  console.log('\n--dry-run: nothing written');
  process.exit(0);
}
let chunk = [];
let size = 0;
for (const u of updates) {
  if (chunk.length && (size + u.length > 900_000 || chunk.length >= 500)) {
    queryLinked(chunk.join('\n'));
    chunk = [];
    size = 0;
  }
  chunk.push(u);
  size += u.length;
}
if (chunk.length) queryLinked(chunk.join('\n'));
console.log(`\nwrote ${updates.length} sentence(s)`);
