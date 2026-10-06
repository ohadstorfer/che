#!/usr/bin/env node
// Gives units the fixed shape (lib/template.mjs): Lesson · Lesson · Slang ·
// Lesson · Practice · Culture · Speaking · Unit check.
//
//   npm run course:template -- --preview [--sections 1,2,3]
//       plans the lessons of those sections as if they had the shape, from the
//       database, and says what doesn't fit. Nothing is written.
//       --staged plans the words still in draft (course:words --draft) and
//       their approved sentences too, as they will be once published.
//       --splits <splits.yaml> plans it with those units split first
//       (course:split), as they will be once that migration is in.
//   npm run course:template -- --sql <migration.sql> [--sections 1,2,3]
//       writes the migration that reshapes their lesson rows.
//
// Without --sections it takes the sections template.mjs lists. After the
// migration: npm run course:lessons -- --all fills the slots.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { exposureReport, loadPublishedSentences, loadSlangPlan, planCourse } from './lib/course-plan.mjs';
import { lintLessons } from './lib/lessons.mjs';
import { drillable } from './lib/outline.mjs';
import { ids } from './lib/ids.mjs';
import { applySplits } from './lib/split.mjs';
import { q } from './lib/sql.mjs';
import { shapeUnit, shapedLessons } from './lib/template-rows.mjs';
import { TEMPLATE, TEMPLATE_SECTIONS, lightForms, overflow } from './lib/template.mjs';
import { loadCourseRows, outlineFromRows } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const sqlFile = flag('--sql');
const preview = args.includes('--preview');
const wanted = new Set((flag('--sections') ?? [...TEMPLATE_SECTIONS].join(',')).split(',').filter(Boolean).map(Number));
if ((!preview && !sqlFile) || !wanted.size) {
  console.error('usage: course:template -- --preview | --sql <migration.sql>  [--sections 1,2,3]');
  process.exit(1);
}

const splitsFile = flag('--splits');
let rows = loadCourseRows();
let sentencesByUnit = null;
if (splitsFile) {
  if (sqlFile) {
    console.error('--splits is for --preview: apply the split migration, then write this one from the database');
    process.exit(1);
  }
  const split = applySplits({
    rows,
    outline: outlineFromRows(rows),
    sentencesByUnit: loadPublishedSentences(),
    splits: parse(readFileSync(splitsFile, 'utf8')) ?? {},
    unitId: (slug) => ids.unit(slug),
  });
  for (const e of split.errors) console.error(`split: ${e}`);
  rows = split.rows;
  sentencesByUnit = split.sentencesByUnit;
  console.log(`with ${splitsFile.split('/').pop()}: ${rows.units.filter((u) => u.status === 'published').length} units`);
}
const sectionOrdinal = new Map(rows.sections.map((s) => [s.id, s.ordinal]));
const road = rows.units
  .filter((u) => u.status === 'published')
  .sort((a, b) => a.course_order - b.course_order);
const units = road.filter((u) => wanted.has(sectionOrdinal.get(u.section_id)));

// Culture: a class for each unit from the start of the road, while they last
// (course:culture-plan deals them into src/lib/unit-extras.json, which the app
// ships with), and the swearing classes with the unit they were planned for.
const extras = JSON.parse(readFileSync(new URL('../../src/lib/unit-extras.json', import.meta.url), 'utf8'));
const classes = extras.culture_units ?? 0;
const withCulture = new Set([
  ...road.slice(0, classes).map((u) => u.id),
  ...road.filter((u) => extras.units[u.slug]?.culture?.section === 'puteadas').map((u) => u.id),
]);
const hasCulture = (u) => withCulture.has(u.id);
if (!classes) console.warn('warn  no culture plan: run course:culture-plan first');

const shapes = units.map((unit) => ({ unit, ...shapeUnit({ unit, lessons: rows.lessons, culture: hasCulture(unit) }) }));
const fresh = shapes.flatMap((s) => s.rows.filter((r) => !r.was || r.was.status !== 'published'));
const changed = shapes.flatMap((s) => s.rows.filter((r) => r.was && r.was.status === 'published' && (r.was.kind !== r.kind || r.was.title_en !== r.title_en)));
const retired = shapes.flatMap((s) => s.retired);
const tally = (list, key) => Object.entries(list.reduce((m, x) => ({ ...m, [key(x)]: (m[key(x)] ?? 0) + 1 }), {})).map(([k, n]) => `${n} ${k}`).join(' · ') || 'none';

console.log(`sections ${[...wanted].join(', ')}: ${units.length} units → ${TEMPLATE.join(' · ')}`);
console.log(`  lessons added     ${fresh.length} (${tally(fresh, (r) => r.kind)})`);
console.log(`  lessons retired   ${retired.length} (${tally(retired, (r) => (r.kind === 'practice' && r.title_en === 'Grammar practice' ? 'grammar practice' : r.kind))})`);
console.log(`  kind or title changed  ${changed.length} (${tally(changed, (r) => `${r.was.kind}→${r.kind}`)})`);
console.log(`  culture in ${units.filter(hasCulture).length} of them (${classes} classes, from the start of the road)`);

if (preview) {
  const outline = outlineFromRows(
    { ...rows, lessons: shapedLessons({ units, lessons: rows.lessons, hasCulture }) },
    { template: (ordinal) => wanted.has(ordinal) },
  );
  const staged = args.includes('--staged');
  const planned = planCourse({ outline, sentencesByUnit: sentencesByUnit ?? loadPublishedSentences({ staged }), staged });
  const { result, formById, sentenceById, levelByUnit, levelOfSentence } = planned;
  const known = new Set();
  const byRule = new Map();
  const big = [];
  let problems = 0;
  const slangPlan = loadSlangPlan();
  for (const unit of outline.units.filter((u) => u.status === 'published')) {
    // The slang lesson's words are its own: the three teaching lessons don't carry them.
    const slang = slangPlan.get(unit.slug) ?? new Set();
    const own = outline.forms.filter((f) => f.unit_id === unit.id && drillable(f) && !slang.has(f.lemma.toLocaleLowerCase('es')));
    if (unit.template) {
      const why = overflow(own, lightForms(own, known));
      if (why && !unit.review_form_ids.length) big.push(`${unit.slug}: ${why}`);
      const { slots, warnings } = result.get(unit.id);
      const lint = lintLessons({ unit, slots, sentenceById, formById, level: levelByUnit.get(unit.id), levelOfSentence });
      for (const w of [...warnings, ...lint]) if (args.includes('--verbose')) console.warn(`warn  ${unit.slug}: ${w}`);
      for (const w of lint) {
        const rule = /(lesson\.\w+|empty)/.exec(w)[1];
        byRule.set(rule, (byRule.get(rule) ?? 0) + 1);
      }
      problems += lint.length;
    }
    for (const f of own) known.add(f.lemma_id);
  }
  console.log(`\n${big.length} unit(s) too big for the shape (they want splitting):`);
  for (const b of big) console.log(`  ${b}`);
  console.log(`\nLint problems in the reshaped units: ${problems}${problems ? ` — ${[...byRule].map(([rule, n]) => `${rule} ${n}`).join(' · ')}` : ''}`);
  console.log('\nWords drilled again in later units, by the section that taught them:');
  for (const r of exposureReport(planned)) {
    console.log(`  section ${r.section}: ${r.forms} words · median ${r.median} later units · ${r.neverAgain}% never again`);
  }
}

if (sqlFile) {
  writeFileSync(sqlFile, migration());
  console.log(`wrote ${sqlFile}`);
}

function migration() {
  // Written by id from the rows as they are now: generate it right before it is applied.
  const lines = [];
  for (const s of shapes) {
    const u = s.unit;
    lines.push(`-- ${u.slug}`);
    const ids = [...s.rows.map((r) => r.id), ...s.retired.map((r) => r.id)];
    // Out of the way first: (unit_id, ordinal) is unique at every step.
    lines.push(`update public.lessons set ordinal = -5000 - ordinal where unit_id = ${q(u.id)} and ordinal > 0 and ordinal < 1000;`);
    for (const r of s.retired) lines.push(`update public.lessons set status = 'retired', ordinal = 31000 + abs(ordinal) where id = ${q(r.id)};`);
    for (const r of s.rows) {
      if (r.was) lines.push(`update public.lessons set kind = ${q(r.kind)}, title_en = ${q(r.title_en)}, ordinal = ${r.ordinal}, status = 'published' where id = ${q(r.id)};`);
      else lines.push(`insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values (${q(r.id)}, ${q(u.id)}, ${r.ordinal}, ${q(r.title_en)}, ${q(r.kind)}, 'published');`);
    }
    // Rows the shape didn't name (drafts, old retired ones) go past the end.
    lines.push(`update public.lessons set ordinal = 32000 + abs(ordinal) where unit_id = ${q(u.id)} and ordinal < 0 and id not in (${ids.map(q).join(', ')});`);
  }
  return `-- The fixed unit shape for sections ${[...wanted].join(', ')} (scripts/course/template-lessons.mjs):
-- ${TEMPLATE.join(' · ')}.
-- ${units.length} units · ${fresh.length} lessons added · ${retired.length} retired · ${changed.length} changed kind or title.
-- Nothing is deleted and kept rows keep their ids. Then: npm run course:lessons -- --all

create temporary table template_fresh (lesson_id uuid primary key) on commit drop;
insert into template_fresh values
${fresh.map((r) => `  (${q(r.id)})`).join(',\n')};

${lines.join('\n')}

-- A learner already past a unit keeps her place: the lessons new to it count
-- as done (as sync-lessons.mjs does it).
insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
select x.user_id, n.id, null::smallint, 0::smallint, true, 'placement'
from template_fresh f
join public.lessons n on n.id = f.lesson_id and n.status = 'published'
join public.units nu on nu.id = n.unit_id
join public.sections ns on ns.id = nu.section_id
cross join (select distinct user_id from public.lesson_progress) x
where exists (
    select 1
    from public.lesson_progress p
    join public.lessons pl on pl.id = p.lesson_id
    where p.user_id = x.user_id and p.passed
      and pl.unit_id = n.unit_id and pl.kind = 'review' and pl.status = 'published'
      and pl.id not in (select lesson_id from template_fresh)
  )
  or exists (
    select 1
    from public.lesson_progress p
    join public.lessons pl on pl.id = p.lesson_id and pl.status = 'published'
    join public.units pu on pu.id = pl.unit_id and pu.status = 'published'
    join public.sections ps on ps.id = pu.section_id
    where p.user_id = x.user_id and p.passed
      and pl.kind not in ('speak', 'slang', 'culture', 'story')
      and (ps.ordinal, pu.ordinal) > (ns.ordinal, nu.ordinal)
  )
on conflict (user_id, lesson_id) do nothing;
`;
}
