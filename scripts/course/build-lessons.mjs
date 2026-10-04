#!/usr/bin/env node
// Proposes lesson slots from the published sentences (docs/course-spec.md §4
// "Assemble"), replacing the slots the lessons have. The whole course is
// planned in order every time — a unit's practice brings back words the units
// before it left behind, so it has to know what they drilled — and only the
// units asked for are written. The proposal is checked against the lesson
// linters, and a reviewer reorders it in the dashboard.
//
//   npm run course:lessons -- <unit-slug> [<unit-slug> …] [--dry-run]
//   npm run course:lessons -- --all [--dry-run]
import { exposureReport, planCourse } from './lib/course-plan.mjs';
import { queryLinked } from './lib/db.mjs';
import { lintLessons, screensOf } from './lib/lessons.mjs';
import { q, upsert } from './lib/sql.mjs';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const slugs = argv.filter((a) => !a.startsWith('--'));
const slug = slugs[0];
if (!slug && !flags.has('--all')) {
  console.error('usage: course:lessons -- <unit-slug> | --all [--dry-run]');
  process.exit(1);
}

const planned = planCourse({ include: slugs });
const { result, units, formById, sentenceById, levelByUnit, levelOfSentence } = planned;
const wanted = flags.has('--all') ? units : units.filter((u) => slugs.includes(u.slug));
if (!wanted.length) {
  console.error(`no published unit ${slug}`);
  process.exit(1);
}

// The linters look at the proposal the way they look at hand-written lessons
// (`lintLessons`).
const verbose = wanted.length === 1;
let problems = 0;
const byRule = new Map();
for (const unit of wanted) {
  const { slots, warnings } = result.get(unit.id);
  const lint = lintLessons({ unit, slots, sentenceById, formById, level: levelByUnit.get(unit.id), levelOfSentence });
  for (const l of verbose ? unit.lessons : []) {
    const own = slots.filter((s) => s.lesson_id === l.id);
    const body = own.map((s) => s.kind + (s.mode ? `:${s.mode.replace('sentence_', '')}` : '')).join(' · ') || '—';
    console.log(`lesson ${l.ordinal} (${l.title_en}, ${screensOf(own)} screens): ${body}`);
  }
  for (const w of [...warnings, ...lint]) console.warn(`warn  ${unit.slug}: ${w}`);
  for (const w of lint) {
    const rule = /(lesson\.\w+|empty)/.exec(w)[1];
    byRule.set(rule, (byRule.get(rule) ?? 0) + 1);
  }
  problems += lint.length;
}
if (problems) console.log(`\nLint problems by rule: ${[...byRule].map(([rule, n]) => `${rule} ${n}`).join(' · ')}`);

console.log('\nWords drilled again in later units, by the section that taught them:');
for (const r of exposureReport(planned)) {
  console.log(`  section ${r.section}: ${r.forms} words · median ${r.median} later units · ${r.neverAgain}% never again`);
}

if (flags.has('--dry-run')) {
  console.log(`\n--dry-run: nothing written. ${problems} lint problem(s).`);
  process.exit(0);
}

// Each unit in its own transaction, many units to a request: every request
// pays the database login again, and one per unit made --all take an hour.
let written = 0;
let batch = '';
const send = () => {
  if (batch) queryLinked(batch);
  batch = '';
};
for (const unit of wanted) {
  const { slots } = result.get(unit.id);
  if (!slots.length) continue;
  const lessonIds = unit.lessons.map((l) => l.id);
  const statement =
    `begin;\ndelete from public.lesson_slots where lesson_id in (${lessonIds.map(q).join(', ')});\n` +
    upsert(
      'lesson_slots',
      slots.map((s) => ({ ...s, id: crypto.randomUUID() })),
      ['id', 'lesson_id', 'ordinal', 'kind', 'form_id', 'sentence_id', 'tip_id', 'mode', 'review_count', 'scope'],
    ) +
    '\ncommit;\n';
  if (batch.length + statement.length > 800_000) send();
  batch += statement;
  written += slots.length;
  if (!verbose) process.stdout.write('.');
}
send();
console.log(`\nwrote ${written} slots across ${wanted.length} unit(s).`);
