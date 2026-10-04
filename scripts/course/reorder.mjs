#!/usr/bin/env node
// Lays the YAML's unit order over the database — the course doubling
// (docs/course/roadmap.md §Doubling). The seed only adds, so two things the
// doubling needs are done here instead:
//
//   1. Renumber: a unit the database has takes the ordinal and course_order
//      its place in the YAML gives it, so a new unit can go in beside it.
//   2. Move earlier: a word the YAML now teaches in an earlier unit than the
//      database has it in moves there. Only ever earlier: every sentence that
//      uses it stays sayable.
//
// Before either, it checks the new order against the database's words (which
// the admin has added to since the YAML was written): every new unit's sample
// must be sayable, and a new unit may not claim a word taught before it.
//
//   npm run course:reorder                       check, and list what would change
//   npm run course:reorder -- --lexicon <file>   the course's words in the new order
//   npm run course:reorder -- --sql <file>       write the renumber + move migration
//
// Run it twice: renumber, then course:seed adds the new units, then again for
// the words that move into them (a move needs its unit to exist).
import { writeFileSync } from 'node:fs';

import { checkSentence } from '../../src/lib/course-rules/check.ts';
import { drillable } from '../../src/lib/course-rules/vocabulary.ts';
import { loadOutline } from './lib/outline.mjs';
import { q } from './lib/sql.mjs';
import { loadCourseRows, outlineFromRows } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const argAfter = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const lexiconOut = argAfter('--lexicon');
const sqlOut = argAfter('--sql');

const { outline: yaml, errors: yamlErrors } = loadOutline();
if (!yaml) {
  console.error(yamlErrors.join('\n'));
  process.exit(1);
}
const rows = loadCourseRows();
const db = outlineFromRows(rows);

const errors = [];
const warnings = [];
const key = (lemma, pos, form) => `${lemma}|${pos}|${form.toLocaleLowerCase('es')}`;

// Units: the database's, placed where the YAML puts them, and the YAML's new ones.
const yamlBySlug = new Map(yaml.units.map((u) => [u.slug, u]));
const dbBySlug = new Map(db.units.map((u) => [u.slug, u]));
for (const u of db.units) if (!yamlBySlug.has(u.slug)) errors.push(`unit ${u.slug} is in the database but not in the YAML — the YAML must list every live unit`);
const units = yaml.units.map((y) => {
  const d = dbBySlug.get(y.slug);
  return d
    ? { ...d, section_id: y.section_id, ordinal: y.ordinal, course_order: y.course_order, old: d, isNew: false, sample: y.sample }
    : { ...y, isNew: true };
});
const unitBySlug = new Map(units.map((u) => [u.slug, u]));
const unitById = new Map(units.map((u) => [u.id, u]));
const yamlUnitById = new Map(yaml.units.map((u) => [u.id, u]));

// Words: the database's, each in its own unit unless the YAML teaches it earlier.
const yamlFormByKey = new Map(yaml.forms.map((f) => [key(f.lemma, f.pos, f.form), f]));
const dbKeys = new Set();
const moves = [];
const forms = db.forms.map((f) => {
  const k = key(f.lemma, f.pos, f.form);
  dbKeys.add(k);
  const home = unitById.get(f.unit_id);
  const y = yamlFormByKey.get(k);
  const yUnit = y && unitBySlug.get(yamlUnitById.get(y.unit_id)?.slug);
  if (!home || !yUnit || yUnit.id === home.id) return { ...f, unit_order: home?.course_order ?? f.unit_order };
  if (yUnit.course_order < home.course_order) {
    moves.push({ form: f, from: home, to: yUnit, position: y.position });
    return { ...f, unit_id: yUnit.id, unit_order: yUnit.course_order };
  }
  (yUnit.isNew ? errors : warnings).push(
    `"${f.form}" (${f.lemma}): the YAML teaches it in unit ${yUnit.course_order} ${yUnit.slug}, but the database already has it in ${home.course_order} ${home.slug}`,
  );
  return { ...f, unit_order: home.course_order };
});
for (const f of yaml.forms) {
  if (dbKeys.has(key(f.lemma, f.pos, f.form))) continue;
  const u = unitBySlug.get(yamlUnitById.get(f.unit_id).slug);
  forms.push({ ...f, unit_id: u.id, unit_order: u.course_order, isNew: true });
}
forms.sort((a, b) => a.unit_order - b.unit_order || a.position - b.position);
const merged = { sections: yaml.sections, units, forms };

// Every new unit teaches something and can say its sample.
for (const u of units.filter((x) => x.isNew)) {
  const own = forms.filter((f) => f.unit_id === u.id);
  if (!u.review_form_ids?.length && !own.some(drillable)) errors.push(`new unit ${u.course_order} ${u.slug}: teaches no drillable word`);
  if (u.sample) for (const p of checkSentence(merged, u, u.sample.es)) errors.push(`new unit ${u.course_order} ${u.slug} sample "${u.sample.es}": ${p}`);
}

const renumbered = units.filter((u) => !u.isNew && (u.old.section_id !== u.section_id || u.old.ordinal !== u.ordinal || u.old.course_order !== u.course_order));
const newUnits = units.filter((u) => u.isNew);
console.log(`${units.length} units (${newUnits.length} new, ${renumbered.length} renumbered) · ${forms.filter((f) => f.isNew).length} new words · ${moves.length} moved earlier`);
for (const m of moves) console.log(`  move "${m.form.form}" (${m.form.lemma}): ${m.from.course_order} ${m.from.slug} → ${m.to.course_order} ${m.to.slug}`);

if (lexiconOut) {
  const lines = [];
  for (const u of units) {
    lines.push(`\n## ${u.course_order} · s${u.section_id} u${u.ordinal} · ${u.slug}${u.isNew ? ' (new)' : ''} — ${u.title_en}${u.review_form_ids?.length ? ' [practice]' : ''}`);
    const byLemma = new Map();
    for (const f of forms.filter((x) => x.unit_id === u.id)) {
      const k = `${f.lemma} (${f.pos})`;
      if (!byLemma.has(k)) byLemma.set(k, []);
      byLemma.get(k).push(f.form);
    }
    for (const [k, fs] of byLemma) lines.push(`${k}: ${fs.join(', ')}`);
  }
  const lemmaOf = new Map(rows.lemmas.map((l) => [l.id, l]));
  const retired = rows.forms.filter((f) => f.status === 'retired' || lemmaOf.get(f.lemma_id)?.status === 'retired');
  lines.push(`\n## Retired — taken out of the course; never bring these back\n${retired.map((f) => f.form).sort().join(', ')}`);
  writeFileSync(lexiconOut, `${lines.join('\n').trim()}\n`);
  console.log(`wrote ${lexiconOut}`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}

if (sqlOut) {
  const out = [
    `-- ---------------------------------------------------------------------------
-- Course doubling: the database's units take their place in the YAML's order,
-- and words the YAML teaches earlier move there. Generated by
-- scripts/course/reorder.mjs. Do not edit by hand; regenerate.
-- ---------------------------------------------------------------------------
`,
  ];
  if (renumbered.length) {
    const values = renumbered.map((u) => `(${q(u.id)}::uuid, ${u.section_id}, ${u.ordinal}, ${u.course_order}, ${u.old.course_order})`).join(',\n  ');
    const places = units.filter((u) => !u.isNew).map((u) => `(${u.old.course_order}, ${u.course_order})`).join(', ');
    out.push(`create temporary table reorder_units (id uuid, section_id smallint, ordinal smallint, course_order smallint, old_order smallint) on commit drop;
insert into reorder_units values
  ${values};

-- Through a free range first: ordinals and course places are unique. The course
-- place is the free ordinal too: a unit changing section may land on an ordinal
-- another unit of its old section is also headed for.
update public.units u set ordinal = 20000 + r.course_order, course_order = 20000 + r.course_order from reorder_units r where u.id = r.id;
update public.units u set section_id = r.section_id, ordinal = r.ordinal, course_order = r.course_order from reorder_units r where u.id = r.id;

-- A placement or jump test is remembered as a course place. A place no unit
-- holds any more (its unit was merged into another and retired) falls to the
-- unit before it, so what she tested out of stays skipped.
update public.profiles p set placed_through = coalesce((
  select m.course_order from (values
    ${places}
  ) as m (old_order, course_order)
  where m.old_order <= p.placed_through order by m.old_order desc limit 1
), 0)
where p.placed_through > 0;
`);
  }
  const ready = moves.filter((m) => !m.to.isNew);
  if (ready.length) {
    out.push(`-- Words taught earlier now.`);
    for (const m of ready) out.push(`update public.forms set unit_id = ${q(m.to.id)}, position = ${m.position} where id = ${q(m.form.id)}; -- ${m.form.form}`);
  }
  const waiting = moves.length - ready.length;
  if (waiting) console.log(`${waiting} move(s) wait for their new unit: seed it, then run this again`);
  if (!renumbered.length && !ready.length) {
    console.log('nothing to renumber or move — no migration written');
    process.exit(0);
  }
  writeFileSync(sqlOut, `${out.join('\n')}\n`);
  console.log(`wrote ${sqlOut}`);
}
