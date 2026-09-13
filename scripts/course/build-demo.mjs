#!/usr/bin/env node
// Builds src/lib/demo-course.json — the whole section-1 outline plus the
// hand-written demo content for units 1–2 — which the demo backend serves in
// place of the database (src/lib/demo.ts, EXPO_PUBLIC_DEMO=1).
//
//   npm run course:demo
//
// Everything is published here, because the demo has no reviewer.

import { writeFileSync } from 'node:fs';

import { buildRows } from './lib/rows.mjs';

const OUT = new URL('../../src/lib/demo-course.json', import.meta.url);

let built;
try {
  built = buildRows();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
const { rows, formEntries, warnings } = built;
for (const w of warnings) console.warn(`warn  ${w}`);

const data = {
  sections: rows.sections,
  units: rows.units,
  lessons: rows.lessons,
  tips: rows.tips,
  form_entries: formEntries,
  sentences: rows.sentences,
  lesson_slots: rows.lesson_slots,
};

writeFileSync(OUT, JSON.stringify(data));
console.log(
  `wrote src/lib/demo-course.json: ${data.units.length} units, ${data.lessons.length} lessons, ` +
    `${data.form_entries.length} forms, ${data.sentences.length} sentences, ${data.lesson_slots.length} slots`,
);
