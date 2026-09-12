#!/usr/bin/env node
// Builds src/lib/demo-course.json — the whole section-1 outline plus the
// hand-written demo content for units 1–2 — which the demo backend serves in
// place of the database (src/lib/demo.ts).
//
//   npm run course:demo
//
// Everything is marked published here, because the demo has no reviewer; the
// real pipeline starts every row as a draft.

import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { buildContent } from './lib/content.mjs';
import { loadOutline } from './lib/outline.mjs';

const OUT = new URL('../../src/lib/demo-course.json', import.meta.url);
const FIXTURE = new URL('./fixtures/demo.yaml', import.meta.url);

const { outline, errors: outlineErrors } = loadOutline();
if (outlineErrors.length) {
  for (const e of outlineErrors) console.error(`outline: ${e}`);
  process.exit(1);
}

const { sentences, slots, errors, warnings } = buildContent(outline, parse(readFileSync(FIXTURE, 'utf8')), {
  source: 'human',
  status: 'published',
});
for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\n${errors.length} error(s) — demo not written`);
  process.exit(1);
}

const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));
const published = { status: 'published' };

const data = {
  sections: [{ ...outline.section, ...published }],
  units: outline.units.map(({ sample, lessons, tips, ...u }) => ({ ...u, ...published })),
  lessons: outline.units.flatMap((u) => u.lessons.map((l) => ({ ...l, ...published }))),
  tips: outline.units.flatMap((u) => u.tips.map((t) => ({ ...t, ...published }))),
  // The `form_entries` view, precomputed: lemma facts and unit position folded in.
  form_entries: outline.forms.map((f) => ({
    id: f.id,
    lemma_id: f.lemma_id,
    lemma: f.lemma,
    pos: f.pos,
    form: f.form,
    gloss_en: f.gloss_en ?? lemmaById.get(f.lemma_id).gloss_en,
    features: f.features,
    unit_id: f.unit_id,
    unit_ordinal: f.unit_ordinal,
    section_id: outline.section.id,
    is_glue: f.is_glue,
    register: f.register,
    audio_path: null,
    ...published,
  })),
  sentences,
  lesson_slots: slots,
};

writeFileSync(OUT, JSON.stringify(data));
console.log(
  `wrote ${OUT.pathname.split('/').slice(-3).join('/')}: ${data.units.length} units, ${data.lessons.length} lessons, ` +
    `${data.form_entries.length} forms, ${sentences.length} sentences, ${slots.length} slots`,
);
