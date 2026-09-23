#!/usr/bin/env node
// Checks the course's vocabulary and prints what each unit introduces.
//
//   npm run course:validate            the database — the source of truth
//   npm run course:validate -- --yaml  docs/course/section-*.yaml, before
//                                      course:seed loads a new unit from it
//
// Exits non-zero on any error, so it can gate the seed script and CI.

import { boundCandidates, chePlacement, checkFormEntry, checkPhrases, glossRepeats, meaningOverlaps } from '../../src/lib/course-rules/check.ts';
import { drillable } from '../../src/lib/course-rules/vocabulary.ts';
import { checkShape } from '../../src/lib/course-rules/shape.ts';
import { loadOutline } from './lib/outline.mjs';
import { sentencesOfUnits } from './lib/pipeline.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const fromYaml = process.argv.includes('--yaml');
let outline;
let errors = [];
let warnings = [];
if (fromYaml) {
  ({ outline, errors, warnings } = loadOutline());
} else {
  // The file checks that concern words, run over what the database holds now.
  outline = loadOutlineFromDb();
  for (const f of outline.forms) {
    for (const p of checkFormEntry(f)) errors.push(`unit ${f.unit_order} · ${f.lemma} · ${f.form}: ${p}`);
  }
  for (const f of glossRepeats(outline)) {
    warnings.push(`"${f.form}" (unit ${f.unit_order}): gloss repeats the Spanish word — move the explanation to the note`);
  }
  for (const { a, b, shared } of meaningOverlaps(outline)) {
    warnings.push(`"${a.form}" (unit ${a.unit_order}) and "${b.form}" (unit ${b.unit_order}) share the meaning "${shared.join(', ')}"`);
  }
  // The shape and arrangement rules over everything already live. `course:lint`
  // only ever sees drafts, so without this sweep a sentence approved before a
  // rule existed would never meet it — which is exactly how a three-clause
  // greeting chain sat in unit 3, and how "Mal, che." was published.
  const unitOf = new Map(outline.units.map((u) => [u.id, u]));
  const live = sentencesOfUnits([...unitOf.keys()]).filter((r) => r.status !== 'retired');

  // Words the course only ever says with the same little word in front of them.
  // A card for one asks a question with no answer — "llamo / name is" — so the
  // chunk has to be the form, and the bare one marked `bound`
  // (docs/course-spec.md §1.5). An error, not a warning: this shipped once.
  for (const { form, seen, after } of boundCandidates(outline, live)) {
    errors.push(
      `unit ${form.unit_order} · "${form.form}": never said without "${after}" in front of it (${seen} sentences) — ` +
        `teach "${after} ${form.form}" as a form of its own and mark "${form.form}" bound`,
    );
  }

  for (const row of live) {
    const unit = unitOf.get(row.unit_id);
    const where = `unit ${unit?.ordinal ?? '?'} ${unit?.slug ?? ''} · ${row.status} · "${row.es}"`;
    const shape = checkShape(row.es, row.difficulty ?? 1);
    for (const p of shape.problems) errors.push(`${where}: ${p}`);
    for (const w of shape.warnings) warnings.push(`${where}: ${w}`);
    // An accepted answer is a sentence a learner may write, so it is held to
    // the same rules as the one on screen.
    for (const es of [row.es, ...(row.es_alt ?? [])]) {
      const tag = es === row.es ? where : `${where} · es_alt "${es}"`;
      for (const p of [...checkPhrases(es), ...chePlacement(es)]) errors.push(`${tag}: ${p}`);
    }
  }
}

if (outline) {
  const sectionOf = new Map(outline.sections.map((s) => [s.id, s]));
  const rows = outline.units.map((u) => {
    const own = outline.forms.filter((f) => f.unit_order === u.course_order);
    const drilled = own.filter(drillable);
    const lemmas = outline.lemmas.filter((l) => l.unit_order === u.course_order).length;
    return {
      section: sectionOf.get(u.section_id)?.ordinal ?? '?',
      unit: String(u.ordinal).padStart(2),
      title: u.title_en,
      lemmas,
      forms: own.length,
      drillable: drilled.length,
      voseo: own.filter((f) => f.features.voseo).length,
      lessons: u.lessons.length,
      tips: u.tips.length,
    };
  });
  console.table(rows);
  const cumulative = outline.forms.filter(drillable).length;
  console.log(
    `${fromYaml ? 'YAML' : 'database'}: ${outline.sections.length} sections · ${outline.units.length} units · ${outline.lemmas.length} lemmas · ` +
      `${outline.forms.length} forms (${cumulative} drillable) · ` +
      `${outline.units.reduce((n, u) => n + u.lessons.length, 0)} lessons`,
  );
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}`);
  process.exit(1);
}
console.log(warnings.length ? `\nvalid, ${warnings.length} warning(s)` : '\nvalid');
