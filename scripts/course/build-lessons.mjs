#!/usr/bin/env node
// Proposes lesson slots from the published sentences (docs/course-spec.md §4
// "Assemble"), replacing the slots the lessons have. The whole course is
// planned in order every time — a unit's practice brings back words the units
// before it left behind, so it has to know what they drilled — and only the
// units asked for are written. The proposal is checked against the lesson
// linters, and a reviewer reorders it in the dashboard.
//
//   npm run course:lessons -- <unit-slug> [--dry-run]
//   npm run course:lessons -- --all [--dry-run]
import { exposureReport, planCourse } from './lib/course-plan.mjs';
import { queryLinked } from './lib/db.mjs';
import { FORMS_PER_LESSON, LESSON_ITEMS } from './lib/lessons.mjs';
import { q, upsert } from './lib/sql.mjs';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const slug = argv.find((a) => !a.startsWith('--'));
if (!slug && !flags.has('--all')) {
  console.error('usage: course:lessons -- <unit-slug> | --all [--dry-run]');
  process.exit(1);
}

const planned = planCourse({ include: slug ? [slug] : [] });
const { result, units } = planned;
const wanted = flags.has('--all') ? units : units.filter((u) => u.slug === slug);
if (!wanted.length) {
  console.error(`no published unit ${slug}`);
  process.exit(1);
}

// The linters look at the proposal the way they look at hand-written lessons.
// Length is counted in screens, not slots: a review slot stands for several.
const screensOf = (own) => own.reduce((n, s) => n + (s.kind === 'review' || s.kind === 'recap' ? (s.review_count ?? 0) : 1), 0);
const verbose = wanted.length === 1;
let problems = 0;
for (const unit of wanted) {
  const { slots, warnings } = result.get(unit.id);
  const lint = [];
  for (const l of unit.lessons) {
    const own = slots.filter((s) => s.lesson_id === l.id);
    const teach = own.filter((s) => s.kind === 'teach').length;
    const screens = screensOf(own);
    if (l.kind === 'lesson' && own.length && teach > FORMS_PER_LESSON) {
      lint.push(`lesson ${l.ordinal}: lesson.density — ${teach} new forms (the ceiling is ${FORMS_PER_LESSON})`);
    }
    if (own.length && (screens < LESSON_ITEMS.min || screens > LESSON_ITEMS.max)) {
      lint.push(`lesson ${l.ordinal}: lesson.length — ${screens} screens (want ${LESSON_ITEMS.min}–${LESSON_ITEMS.max})`);
    }
    if (!own.length) lint.push(`lesson ${l.ordinal} (${l.title_en}): empty`);
    if (verbose) {
      const body = own.map((s) => s.kind + (s.mode ? `:${s.mode.replace('sentence_', '')}` : '')).join(' · ') || '—';
      console.log(`lesson ${l.ordinal} (${l.title_en}, ${screens} screens): ${body}`);
    }
  }
  for (const w of [...warnings, ...lint]) console.warn(`warn  ${unit.slug}: ${w}`);
  problems += lint.length;
}

console.log('\nWords drilled again in later units, by the section that taught them:');
for (const r of exposureReport(planned)) {
  console.log(`  section ${r.section}: ${r.forms} words · median ${r.median} later units · ${r.neverAgain}% never again`);
}

if (flags.has('--dry-run')) {
  console.log(`\n--dry-run: nothing written. ${problems} lint problem(s).`);
  process.exit(0);
}

// One unit at a time, so a statement stays a reasonable size.
let written = 0;
for (const unit of wanted) {
  const { slots } = result.get(unit.id);
  if (!slots.length) continue;
  const lessonIds = unit.lessons.map((l) => l.id);
  queryLinked(
    `begin;\ndelete from public.lesson_slots where lesson_id in (${lessonIds.map(q).join(', ')});\n` +
      upsert(
        'lesson_slots',
        slots.map((s) => ({ ...s, id: crypto.randomUUID() })),
        ['id', 'lesson_id', 'ordinal', 'kind', 'form_id', 'sentence_id', 'tip_id', 'mode', 'review_count', 'scope'],
      ) +
      '\ncommit;',
  );
  written += slots.length;
  if (!verbose) process.stdout.write('.');
}
console.log(`\nwrote ${written} slots across ${wanted.length} unit(s).`);
