#!/usr/bin/env node
// Writes the migration that gives the course the lessons and tips
// docs/course/grammar-practice.yaml asks for: Grammar practice lessons and
// their pattern tip for the units it lists, and practice lessons for the
// teaching units of the sections seeded before practice existed.
//
//   npm run course:grammar -- supabase/migrations/<ts>_grammar_practice.sql
//
// Only adds rows, apart from two things adding them needs: the unit's lesson
// ordinals are renumbered so the new lessons sit before its check (ids stay,
// so no progress moves), and a learner already past a unit gets its new
// lessons marked done, so the path doesn't send her back to unit 1.
// Then `npm run course:lessons -- --all` fills every unit's slots.
import { writeFileSync } from 'node:fs';

import { grammarIds, loadGrammarPlan } from './lib/course-plan.mjs';
import { GRAMMAR_TITLE } from './lib/lessons.mjs';
import { q } from './lib/sql.mjs';
import { loadCourseRows } from './lib/vocabulary.mjs';

const out = process.argv[2];
if (!out || out.startsWith('--')) {
  console.error('usage: course:grammar -- <migration.sql>');
  process.exit(1);
}

const plan = loadGrammarPlan();
const rows = loadCourseRows();
const units = rows.units.filter((u) => u.status === 'published').sort((a, b) => a.course_order - b.course_order);
const bySlug = new Map(units.map((u) => [u.slug, u]));
const lessonsOf = (u) => rows.lessons.filter((l) => l.unit_id === u.id && l.status !== 'retired').sort((a, b) => a.ordinal - b.ordinal);

const newLessons = []; // {id, unit_id, title_en, kind}
const newTips = [];
const errors = [];

for (const entry of plan.units) {
  const unit = bySlug.get(entry.unit);
  if (!unit) {
    errors.push(`grammar-practice.yaml: no published unit ${entry.unit}`);
    continue;
  }
  for (let k = 1; k <= entry.lessons; k++) {
    newLessons.push({ id: grammarIds.lesson(unit.slug, k), unit_id: unit.id, title_en: GRAMMAR_TITLE });
  }
  newTips.push({ id: grammarIds.tip(unit.slug), unit_id: unit.id, title_en: entry.tip.title, body_md: entry.tip.body.trim() });
}

for (const unit of units.filter((u) => plan.practice_sections.includes(u.section_id))) {
  const lessons = lessonsOf(unit);
  const practiceUnit = (unit.review_form_ids ?? []).length > 0;
  const checkpoint = lessons.some((l) => l.kind === 'checkpoint');
  if (practiceUnit || checkpoint) continue;
  const have = lessons.filter((l) => l.kind === 'practice' && l.title_en !== GRAMMAR_TITLE).length;
  for (let k = have + 1; k <= plan.practice_per_unit; k++) {
    newLessons.push({ id: grammarIds.practice(unit.slug, k), unit_id: unit.id, title_en: 'Practice' });
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

// Each touched unit's lessons, in their new order: what it teaches (stories
// where they were), grammar practice, practice, the check.
const touched = units.filter((u) => newLessons.some((l) => l.unit_id === u.id));
const known = new Set(rows.lessons.map((l) => l.id));
const order = [];
for (const unit of touched) {
  const all = [
    ...lessonsOf(unit),
    ...newLessons.filter((l) => l.unit_id === unit.id && !known.has(l.id)).map((l) => ({ ...l, kind: 'practice', ordinal: 9999 })),
  ];
  const rank = (l) => (l.kind === 'review' ? 3 : l.kind !== 'practice' ? 0 : l.title_en === GRAMMAR_TITLE ? 1 : 2);
  const sorted = all.map((l, i) => ({ l, i })).sort((a, b) => rank(a.l) - rank(b.l) || a.i - b.i).map((x) => x.l);
  sorted.forEach((l, i) => order.push({ id: l.id, ordinal: i + 1 }));
}

const fresh = newLessons.filter((l) => !known.has(l.id));
const unitIds = touched.map((u) => q(u.id)).join(', ');
const sql = `-- Grammar practice and practice lessons (docs/course/grammar-practice.yaml),
-- written by scripts/course/grammar-seed.mjs. ${fresh.length} lessons, ${newTips.length} pattern tips.

${fresh.length ? `insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values
${fresh.map((l, i) => `  (${q(l.id)}, ${q(l.unit_id)}, ${2000 + i}, ${q(l.title_en)}, 'practice', 'published')`).join(',\n')}
on conflict (id) do nothing;` : ''}

-- New lessons sit before each unit's check. Shifted out of the way first,
-- because (unit_id, ordinal) is unique at every step.
update public.lessons set ordinal = ordinal + 5000 where unit_id in (${unitIds});
update public.lessons l set ordinal = v.ordinal from (values
${order.map((o) => `  (${q(o.id)}::uuid, ${o.ordinal})`).join(',\n')}
) as v(id, ordinal) where l.id = v.id;

insert into public.tips (id, unit_id, title_en, body_md, status) values
${newTips.map((t) => `  (${q(t.id)}, ${q(t.unit_id)}, ${q(t.title_en)}, ${q(t.body_md)}, 'published')`).join(',\n')}
on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, status = excluded.status;

-- A learner already past a unit keeps her place: its new lessons count as done.
${fresh.length ? `insert into public.lesson_progress (user_id, lesson_id, score, passed, passed_by)
select distinct p.user_id, n.id, 100, true, 'placement'
from public.lesson_progress p
join public.lessons pl on pl.id = p.lesson_id
join public.units pu on pu.id = pl.unit_id
join public.lessons n on n.id in (${fresh.map((l) => q(l.id)).join(', ')})
join public.units nu on nu.id = n.unit_id
where pu.course_order > nu.course_order or (pl.unit_id = n.unit_id and pl.kind = 'review')
on conflict (user_id, lesson_id) do nothing;` : ''}

-- Review logs refused every mode added after the first schema: the tile and
-- typed gaps and the tile meaning were never logged.
alter table public.review_logs drop constraint if exists review_logs_mode_check;
alter table public.review_logs add constraint review_logs_mode_check check (mode in (
  'flashcard', 'multiple_choice', 'listen', 'typing', 'matching', 'word_build', 'true_false',
  'listen_build', 'sentence_intro', 'sentence_meaning', 'sentence_meaning_tiles', 'sentence_gap',
  'sentence_gap_tiles', 'sentence_gap_typed', 'sentence_build', 'sentence_listen'));
`;

writeFileSync(out, sql);
console.log(`${out}: ${fresh.length} new lessons in ${touched.length} units, ${newTips.length} pattern tips.`);
