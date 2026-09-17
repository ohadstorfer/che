// The database as the source of truth (docs/superplan-admin-palabras.md §7.2):
// the outline the pipeline builds from database rows is the YAML's outline, and
// the seed only ever adds.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { ids } from '../lib/ids.mjs';
import { SECTION_PATHS, loadOutline } from '../lib/outline.mjs';
import { buildRows } from '../lib/rows.mjs';
import { describeDiff, planSeed } from '../lib/seed.mjs';
import { diffOutlines, outlineFromRows } from '../lib/vocabulary.mjs';

const built = buildRows({ publishThrough: 2 });
/** The database right after the course went in: exactly the rows the YAML makes. */
const asDatabase = ({ rows }) => ({
  sections: rows.sections,
  units: rows.units,
  lessons: rows.lessons,
  tips: rows.tips,
  lemmas: rows.lemmas,
  forms: rows.forms,
  sentences: rows.sentences,
  lesson_slots: rows.lesson_slots,
  story_lines: rows.story_lines,
  unit_phrases: rows.unit_phrases,
});
const clone = (x) => structuredClone(x);
const inserted = (plan) => Object.values(plan.insert).reduce((n, rows) => n + rows.length, 0);

test('the outline built from database rows is the YAML outline, in every unit', () => {
  const { outline } = loadOutline();
  const fromRows = outlineFromRows(asDatabase(built));
  assert.deepEqual(diffOutlines(outline, fromRows), { added: [], changed: [], missing: [] });
  assert.equal(fromRows.units.length, outline.units.length);
  // Lessons are built in the order a unit lists its words.
  for (const unit of outline.units) {
    const order = (o) => o.forms.filter((f) => f.unit_id === unit.id).map((f) => f.id);
    assert.deepEqual(order(fromRows), order(outline), unit.slug);
    assert.deepEqual(fromRows.units.find((u) => u.id === unit.id).tips.map((t) => t.id), unit.tips.map((t) => t.id), unit.slug);
    assert.deepEqual(
      fromRows.units.find((u) => u.id === unit.id).lessons.map((l) => [l.id, l.kind]),
      unit.lessons.map((l) => [l.id, l.kind]),
      unit.slug,
    );
  }
});

test('what the admin retired is not in the outline', () => {
  const db = clone(asDatabase(built));
  const mate = db.forms.find((f) => f.form === 'mate');
  mate.status = 'retired';
  assert.equal(outlineFromRows(db).forms.some((f) => f.id === mate.id), false);
});

test('seeding the same course again adds nothing and reports no difference', () => {
  const plan = planSeed(built, asDatabase(built));
  assert.equal(inserted(plan), 0);
  assert.deepEqual(plan.skipped, []);
  assert.deepEqual(describeDiff(plan.diff), []);
});

test('an edit made in the admin is kept, and shown as a difference', () => {
  const db = clone(asDatabase(built));
  const lemma = db.lemmas.find((l) => l.lemma === 'medialuna');
  lemma.gloss_en = 'medialuna';
  const plan = planSeed(built, db);
  assert.equal(inserted(plan), 0);
  const lines = describeDiff(plan.diff);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /medialuna.*gloss_en is "medialuna" in the database/);
});

test('a spelling fixed in the admin and copied into the YAML is not a new word', () => {
  // The admin keeps the id when it fixes a spelling; the YAML, fixed the same
  // way, computes another id for it.
  const db = clone(asDatabase(built));
  const form = db.forms.find((f) => f.form === 'medialunas') ?? db.forms.find((f) => f.form === 'medialuna');
  const fixed = clone(built);
  const yamlForm = fixed.rows.forms.find((f) => f.id === form.id);
  form.form = `${form.form}x`;
  yamlForm.form = form.form;
  yamlForm.id = ids.form('medialuna', 'noun', form.form);
  fixed.outline.forms.find((f) => f.id === form.id).id = yamlForm.id;
  const plan = planSeed(fixed, db);
  assert.equal(plan.insert.forms.length, 0);
  assert.ok(plan.skipped.some((s) => s.includes('already exists, fixed in the admin')), plan.skipped.join('\n'));
});

test('a new unit in a new section file is added, and nothing else', () => {
  const dir = mkdtempSync(join(tmpdir(), 'che-seed-'));
  const path = join(dir, 'section-4.yaml');
  writeFileSync(
    path,
    `section: {id: 4, slug: prueba, title: Test, cefr: A2.1}
units:
  - ordinal: 1
    slug: prueba-pileta
    title: At the pool
    summary: La pileta
    grammar: [g]
    register_max: informal
    tips: [{title: Pools, body: "In Argentina it's *la pileta*."}]
    words:
      - {lemma: pileta, pos: noun, en: swimming pool, forms: [{form: pileta, f: f.sg}]}
      - {lemma: nadar, pos: verb, en: to swim, forms: [{form: nado, f: 1sg.pres.ind}]}
`,
  );
  const withNew = buildRows({ publishThrough: 2, paths: [...SECTION_PATHS, path] });
  const plan = planSeed(withNew, asDatabase(built));
  assert.deepEqual(plan.insert.sections.map((s) => s.id), [4]);
  assert.deepEqual(plan.insert.units.map((u) => u.slug), ['prueba-pileta']);
  assert.equal(plan.insert.units[0].status, 'draft');
  assert.deepEqual(plan.insert.forms.map((f) => f.form).sort(), ['nado', 'pileta']);
  assert.deepEqual(plan.insert.lemmas.map((l) => l.lemma).sort(), ['nadar', 'pileta']);
  assert.equal(plan.insert.tips.length, 1);
  assert.ok(plan.insert.lessons.length >= 2);
  assert.deepEqual([plan.insert.sentences, plan.insert.lesson_slots, plan.insert.story_lines, plan.insert.unit_phrases].map((r) => r.length), [0, 0, 0, 0]);
  assert.deepEqual(describeDiff(plan.diff), []);
});

test('a new unit whose place in the course is taken is skipped, with its words', () => {
  const db = clone(asDatabase(built));
  const last = db.units.at(-1);
  db.units.push({ ...last, id: 'other', slug: 'made-in-admin', course_order: last.course_order + 1, ordinal: last.ordinal + 1 });
  const dir = mkdtempSync(join(tmpdir(), 'che-seed-'));
  const path = join(dir, 'section-4.yaml');
  writeFileSync(
    path,
    `section: {id: 4, slug: dup, title: Dup, cefr: A2.1}
units:
  - {ordinal: 1, slug: late, title: Late, summary: Late, grammar: [g], register_max: informal, tips: [{title: T, body: B}], words: [{lemma: pileta, pos: noun, en: pool}]}
`,
  );
  const withNew = buildRows({ publishThrough: 2, paths: [...SECTION_PATHS, path] });
  const plan = planSeed(withNew, db);
  assert.equal(plan.insert.units.length, 0);
  assert.equal(plan.insert.forms.length, 0);
  assert.ok(plan.skipped.some((s) => s.startsWith('unit late:')), plan.skipped.join('\n'));
});
