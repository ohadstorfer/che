#!/usr/bin/env node
// Gives a published unit more practice from what it already has: sentences the
// judge passed but `publish` left out ("not selected", kept as `retired`) are
// re-checked against today's lexicon and the best of them published, until each
// of the unit's words has `--per-word` sentences (default 8).
//
// Nothing is written that the gate wouldn't write today: every candidate is
// rebuilt by buildContent (fresh tokens, fresh accepted answers), British
// English is left out, and two sentences that fold to the same answer count
// once. The ids stay — they are the ids the judge scored.
//
//   npm run course:promote -- <unit-slug> [--per-word N] [--dry-run]
//
// Then `course:gloss` aligns the new sentences' glosses and `course:lessons`
// rebuilds the unit around them.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { answerKey } from '../../src/lib/course-rules/check.ts';
import { queryLinked } from './lib/db.mjs';
import { buildContent } from './lib/content.mjs';
import { MIN_SCORE } from './lib/generate.mjs';
import { sentencesOfUnits, unitFromArgs, writeReviews, writeSentences } from './lib/pipeline.mjs';

/** British English the course writes the US way, fixed word for word. */
const US = [
  [/\bshall we\b/gi, 'should we'],
  [/\bshall I\b/gi, 'should I'],
  [/\bneighbour/gi, 'neighbor'],
  [/\btravell(ed|ing|er|ers)\b/gi, 'travel$1'],
  [/\binstalment/gi, 'installment'],
  [/\bcolour/gi, 'color'],
  [/\bfavour/gi, 'favor'],
  [/\bmobile phone/gi, 'cell phone'],
  [/\bcoach(es)?\b/gi, 'bus$1'],
  [/\buni\b/gi, 'college'],
  [/\bon holiday\b/gi, 'on vacation'],
];
const toUS = (en) => US.reduce((t, [re, to]) => t.replace(re, (m, ...g) => keepCase(m, to.replace('$1', g[0] ?? ''))), en);
const keepCase = (from, to) => (from[0] === from[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to);
/** What's left that a US learner would trip on: the sentence is left out. */
const BRITISH = /\b(mum|trainers|flat|lift|queue|motorway|pavement|nil|match(es)? on)\b/i;

let ctx;
try {
  ctx = unitFromArgs();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { outline, unit, flags } = ctx;
const argv = process.argv.slice(2);
const perWord = Number(argv[argv.indexOf('--per-word') + 1]) || 8;
const dryRun = flags.has('--dry-run');

// What the writer marked as idiomatic (`loose`) lives only in the unit's
// working files, not in the database; without it an idiomatic English line
// fails the coverage check it passed when it was written.
const workDir = new URL(`../../.course-work/${unit.slug}/`, import.meta.url);
const looseOf = new Map();
if (existsSync(workDir)) {
  for (const f of readdirSync(workDir).filter((f) => /^batch-\d+\.json$/.test(f))) {
    for (const c of JSON.parse(readFileSync(new URL(f, workDir), 'utf8')).sentences ?? []) {
      if (c.loose?.length) looseOf.set(c.es.trim(), c.loose);
    }
  }
}

const published = sentencesOfUnits([unit.id], ['published']);
// The spares: retired by publish for "not selected", scores and all, and not
// failed by anything since.
const spares = queryLinked(`
  select s.id, s.es, s.en, s.en_alt, s.target_form_id, s.kind, s.difficulty, s.source, r.notes->'scores' as scores
  from public.sentences s
  join lateral (
    select notes from public.content_reviews r
    where r.table_name = 'sentences' and r.row_id = s.id
    order by r.created_at desc, r.id desc limit 1
  ) r on true
  where s.unit_id = '${unit.id}' and s.status = 'retired' and r.notes->>'reason' = 'not selected'`);

const passes = (sc) =>
  sc && ['naturalness', 'grammaticality', 'coherence', 'logic'].every((k) => sc[k] >= MIN_SCORE) && sc.porteno !== false && sc.register_ok !== false && sc.english_natural !== false;
const total = (sc) => sc.naturalness + sc.grammaticality + sc.coherence + sc.logic;

const have = new Map();
const taken = new Set(published.map((s) => answerKey(s.es)));
for (const s of published) have.set(s.target_form_id, (have.get(s.target_form_id) ?? 0) + 1);

const byTarget = new Map();
const skipped = [];
for (const s of spares) {
  if (!passes(s.scores)) continue;
  s.en = toUS(s.en);
  s.en_alt = (s.en_alt ?? []).map(toUS);
  if (BRITISH.test([s.en, ...s.en_alt].join(' '))) {
    skipped.push(`${s.es} — British English: "${s.en}"`);
    continue;
  }
  const target = outline.forms.find((f) => f.id === s.target_form_id);
  if (!target) continue;
  const same = outline.forms.filter((f) => f.unit_id === unit.id && f.form === target.form);
  const { sentences, errors } = buildContent(
    outline,
    {
      [unit.slug]: {
        sentences: {
          s: {
            es: s.es,
            en: s.en,
            en_alt: s.en_alt ?? [],
            loose: looseOf.get(s.es.trim()) ?? [],
            target: same.length > 1 ? `${target.form}/${target.lemma}` : target.form,
            difficulty: s.difficulty,
            kind: s.kind,
          },
        },
      },
    },
    { source: s.source, status: 'published' },
  );
  if (!sentences[0] || errors.length) {
    skipped.push(`${s.es} — ${errors.map((e) => e.replace(/^[^:]*: /, '')).join('; ')}`);
    continue;
  }
  if (!byTarget.has(target.id)) byTarget.set(target.id, []);
  byTarget.get(target.id).push({ spare: s, row: { ...sentences[0], id: s.id, status: 'published' } });
}

const chosen = [];
for (const [targetId, list] of byTarget) {
  const want = perWord - (have.get(targetId) ?? 0);
  if (want <= 0) continue;
  // Best first; among equals, a difficulty the word doesn't have yet.
  const ranked = list.sort((a, b) => total(b.spare.scores) - total(a.spare.scores) || a.spare.difficulty - b.spare.difficulty);
  const picked = [];
  const levels = new Set();
  for (const pass of [0, 1]) {
    for (const c of ranked) {
      if (picked.length >= want) break;
      const k = answerKey(c.row.es);
      if (taken.has(k) || picked.includes(c)) continue;
      if (pass === 0 && levels.has(c.spare.difficulty)) continue;
      picked.push(c);
      levels.add(c.spare.difficulty);
      taken.add(k);
    }
  }
  chosen.push(...picked);
}

const formName = (id) => outline.forms.find((f) => f.id === id)?.form ?? '?';
console.log(`${unit.slug}: ${published.length} published, ${spares.length} spare, promoting ${chosen.length}`);
for (const c of chosen) console.log(`  + [${formName(c.row.target_form_id)}] ${c.row.es} = ${c.row.en}`);
for (const s of skipped) console.log(`  · ${s}`);
const short = outline.forms
  .filter((f) => f.unit_id === unit.id && have.has(f.id))
  .map((f) => [f.form, (have.get(f.id) ?? 0) + chosen.filter((c) => c.row.target_form_id === f.id).length])
  .filter(([, n]) => n < perWord);
if (short.length) console.log(`  short of ${perWord}: ${short.map(([f, n]) => `${f} (${n})`).join(', ')}`);

if (dryRun) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}
writeSentences(chosen.map((c) => c.row));
writeReviews(chosen.map((c) => ({ row_id: c.row.id, stage: 'lint', verdict: 'pass', notes: { promoted: true, per_word: perWord } })));
console.log(`\n${chosen.length} published. Next: course:gloss, then course:lessons -- ${unit.slug}.`);
