#!/usr/bin/env node
// Validates the course outline (docs/course/section-*.yaml) and prints what
// each unit introduces.
//
//   npm run course:validate
//
// Exits non-zero on any error, so it can gate the seed script and CI.

import { loadOutline } from './lib/outline.mjs';

const { outline, errors, warnings } = loadOutline();

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
    `${outline.sections.length} sections · ${outline.units.length} units · ${outline.lemmas.length} lemmas · ` +
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
