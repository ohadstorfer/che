#!/usr/bin/env node
// Proposes a unit's lesson slots from its approved and published sentences
// (docs/course-spec.md §4 "Assemble"), replacing the slots its lessons have.
// The proposal is checked against the lesson linters, and a reviewer reorders
// it in the dashboard.
//
//   npm run course:lessons -- <unit-slug> [--dry-run]
import { queryLinked } from './lib/db.mjs';
import { planLessons } from './lib/lessons.mjs';
import { sentencesOfUnits, unitFromArgs } from './lib/pipeline.mjs';
import { q, upsert } from './lib/sql.mjs';

let ctx;
try {
  ctx = unitFromArgs();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { outline, unit, flags } = ctx;
const sentences = sentencesOfUnits([unit.id], ['approved', 'published']);
const { slots, warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
if (!slots.length) {
  console.error(`${unit.slug}: nothing to propose — approve some sentences first.`);
  process.exit(1);
}

// The linters look at the proposal the way they look at hand-written lessons.
const lint = [];
const byLesson = new Map();
for (const s of slots) byLesson.set(s.lesson_id, [...(byLesson.get(s.lesson_id) ?? []), s]);
for (const l of unit.lessons) {
  const own = byLesson.get(l.id) ?? [];
  const teach = own.filter((s) => s.kind === 'teach').length;
  const min = l.ordinal === 1 ? 3 : 4;
  if (l.kind === 'lesson' && own.length && (teach < min || teach > 6)) lint.push(`lesson ${l.ordinal}: lesson.density — ${teach} new forms (want ${min}–6)`);
  console.log(`lesson ${l.ordinal} (${l.kind}): ${own.map((s) => s.kind + (s.mode ? `:${s.mode.replace('sentence_', '')}` : '')).join(' · ') || '—'}`);
}
for (const w of [...warnings, ...lint]) console.warn(`warn  ${w}`);

if (flags.has('--dry-run')) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}
const lessonIds = unit.lessons.map((l) => l.id);
queryLinked(
  `delete from public.lesson_slots where lesson_id in (${lessonIds.map(q).join(', ')});\n` +
    upsert(
      'lesson_slots',
      slots.map((s) => ({ ...s, id: crypto.randomUUID() })),
      ['id', 'lesson_id', 'ordinal', 'kind', 'form_id', 'sentence_id', 'tip_id', 'mode', 'review_count', 'scope'],
    ),
);
console.log(`\nwrote ${slots.length} slots across ${byLesson.size} lessons. Review them in the dashboard, then publish the unit.`);
