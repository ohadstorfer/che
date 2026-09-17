#!/usr/bin/env node
// Checks the course's vocabulary and prints what each unit introduces.
//
//   npm run course:validate            the database — the source of truth
//   npm run course:validate -- --yaml  docs/course/section-*.yaml, before
//                                      course:seed loads a new unit from it
//
// Exits non-zero on any error, so it can gate the seed script and CI.

import { checkFormEntry, glossRepeats, meaningOverlaps } from '../../src/lib/course-rules/check.ts';
import { loadOutline } from './lib/outline.mjs';
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
}

if (outline) {
  const sectionOf = new Map(outline.sections.map((s) => [s.id, s]));
  const rows = outline.units.map((u) => {
    const own = outline.forms.filter((f) => f.unit_order === u.course_order);
    const drillable = own.filter((f) => !f.is_glue && f.pos !== 'propn');
    const lemmas = outline.lemmas.filter((l) => l.unit_order === u.course_order).length;
    return {
      section: sectionOf.get(u.section_id)?.ordinal ?? '?',
      unit: String(u.ordinal).padStart(2),
      title: u.title_en,
      lemmas,
      forms: own.length,
      drillable: drillable.length,
      voseo: own.filter((f) => f.features.voseo).length,
      lessons: u.lessons.length,
      tips: u.tips.length,
    };
  });
  console.table(rows);
  const cumulative = outline.forms.filter((f) => !f.is_glue && f.pos !== 'propn').length;
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
