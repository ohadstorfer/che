#!/usr/bin/env node
// Splits units too big for the fixed shape (lib/template.mjs) into two or
// three, as docs/course/splits.yaml says.
//
//   npm run course:split -- --list [--sections 1,2,3]     the units that want splitting, and their words
//   npm run course:split -- --check [<splits.yaml>]       what each split does: fits, sentences moved, words left thin
//   npm run course:split -- --sql <migration.sql> [--from <splits.yaml>]   the migration that makes the splits
//
// --snapshot <date> reads content/snapshots/<date> instead of the database.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { queryLinked } from './lib/db.mjs';
import { ids } from './lib/ids.mjs';
import { drillable } from './lib/outline.mjs';
import { evaluateSplit } from './lib/split.mjs';
import { q, textArray } from './lib/sql.mjs';
import { COST, costOf, lightForms, overflow } from './lib/template.mjs';
import { loadCourseRows, outlineFromRows } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const snapshot = flag('--snapshot');
const SPLITS = new URL('../../docs/course/splits.yaml', import.meta.url);

const snap = (name) => JSON.parse(readFileSync(new URL(`../../content/snapshots/${snapshot}/${name}.json`, import.meta.url), 'utf8'));
const rows = snapshot ? Object.fromEntries(['sections', 'units', 'lessons', 'tips', 'lemmas', 'forms'].map((t) => [t, snap(t)])) : loadCourseRows();
const outline = outlineFromRows(rows);
const sectionOrdinal = new Map(outline.sections.map((s) => [s.id, s.ordinal]));
const published = outline.units.filter((u) => u.status === 'published');
const sentencesOf = (() => {
  let all = null;
  return (unit) => {
    all ??= snapshot
      ? snap('sentences').filter((s) => s.status === 'published')
      : queryLinked(`select id, unit_id, es, tokens, target_form_id from public.sentences where status = 'published'`).map((s) => ({ ...s, tokens: typeof s.tokens === 'string' ? JSON.parse(s.tokens) : s.tokens }));
    return all.filter((s) => s.unit_id === unit.id);
  };
})();

if (args.includes('--list')) {
  const wanted = new Set((flag('--sections') ?? [...sectionOrdinal.values()].join(',')).split(',').map(Number));
  const known = new Set();
  for (const unit of published) {
    const own = outline.forms.filter((f) => f.unit_id === unit.id && drillable(f));
    const light = lightForms(own, known);
    const why = unit.review_form_ids.length ? null : overflow(own, light);
    if (why && wanted.has(sectionOrdinal.get(unit.section_id))) {
      console.log(`\n${sectionOrdinal.get(unit.section_id)}.${unit.ordinal} ${unit.slug} — ${unit.title_en} · "${unit.summary_en}" — ${why}`);
      console.log(`  grammar: ${unit.grammar_focus.join(', ')} · tips: ${unit.tips.map((t) => `"${t.title_en}"`).join(', ')}`);
      const byLemma = new Map();
      for (const f of own) byLemma.set(f.lemma_id, [...(byLemma.get(f.lemma_id) ?? []), f]);
      for (const fs of byLemma.values()) {
        console.log(`  ${fs[0].lemma} (${fs[0].pos}) cost ${costOf(fs, light)}: ${fs.map((f) => f.form).join(', ')}`);
      }
    }
    for (const f of own) known.add(f.lemma_id);
  }
  console.log(`\nA word's first form costs ${COST.full} screens to teach, another verb form ${COST.light}, a form that only agrees (alta, altos) ${COST.pattern}.`);
  process.exit(0);
}

if (args.includes('--check')) {
  const file = args[args.indexOf('--check') + 1];
  const path = file && !file.startsWith('--') ? file : SPLITS;
  if (!existsSync(path)) {
    console.error(`no ${path}`);
    process.exit(1);
  }
  const splits = parse(readFileSync(path, 'utf8')) ?? {};
  let bad = 0;
  let moved = 0;
  let thin = 0;
  for (const [slug, parts] of Object.entries(splits)) {
    const unit = published.find((u) => u.slug === slug);
    if (!unit) {
      console.log(`${slug}: no such published unit`);
      bad += 1;
      continue;
    }
    const sentences = sentencesOf(unit);
    const result = evaluateSplit({ unit, forms: outline.forms, sentences, parts });
    console.log(`\n${slug}: ${result.parts.map((p) => `${p.words} words, cost ${p.cost}`).join(' | ')}`);
    for (const e of result.errors) console.log(`  ERROR ${e}`);
    bad += result.errors.length;
    result.parts.forEach((p, i) => {
      moved += p.moved.length;
      thin += p.thin.length;
      if (p.moved.length) console.log(`  part ${i + 1}: ${p.moved.length} sentence(s) move to a later part, e.g. ${p.moved.slice(0, 3).map((s) => `"${s.es}"`).join(' · ')}`);
      if (p.thin.length) console.log(`  part ${i + 1}: left under 3 sentences: ${p.thin.map((x) => `${x.form.form} (${x.has})`).join(', ')}`);
    });
    // What every new unit needs to be a unit.
    parts.forEach((part, i) => {
      if (i === 0) return;
      for (const k of ['slug', 'title', 'summary']) if (!part[k]) console.log(`  ERROR part ${i + 1}: missing "${k}"`), (bad += 1);
      if (!(part.tips ?? []).length && !(part.new_tips ?? []).length) console.log(`  ERROR part ${i + 1}: needs a tip`), (bad += 1);
    });
  }
  console.log(`\n${Object.keys(splits).length} units split · ${moved} sentences move · ${thin} words left thin · ${bad} error(s)`);
  process.exit(bad ? 1 : 0);
}

if (args.includes('--sql')) {
  const sqlFile = flag('--sql');
  const file = flag('--from');
  const path = file ?? SPLITS;
  const splits = parse(readFileSync(path, 'utf8')) ?? {};
  const taken = new Set(outline.units.map((u) => u.slug));
  const errors = [];
  const out = [];
  const newUnits = []; // { after: unit, part index, row }
  const partsOf = new Map(); // unit id -> new unit rows, in order
  let movedForms = 0;
  let movedSentences = 0;

  for (const [slug, parts] of Object.entries(splits)) {
    const unit = published.find((u) => u.slug === slug);
    if (!unit) {
      errors.push(`${slug}: no such published unit`);
      continue;
    }
    const sentences = sentencesOf(unit);
    const result = evaluateSplit({ unit, forms: outline.forms, sentences, parts });
    for (const e of result.errors) errors.push(`${slug}: ${e}`);
    const rows = parts.map((part, i) => {
      if (i === 0) return unit;
      if (!part.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(part.slug)) errors.push(`${slug} part ${i + 1}: slug "${part.slug}" must be kebab-case`);
      if (taken.has(part.slug)) errors.push(`${slug} part ${i + 1}: slug "${part.slug}" is taken`);
      taken.add(part.slug);
      for (const k of ['title', 'summary']) if (!part[k]) errors.push(`${slug} part ${i + 1}: missing "${k}"`);
      if ((part.summary ?? '').length > 52) errors.push(`${slug} part ${i + 1}: summary is ${part.summary.length} characters (the path banner fits 52)`);
      return { id: ids.unit(part.slug), slug: part.slug, title_en: part.title, summary_en: part.summary, section_id: unit.section_id, grammar_focus: unit.grammar_focus, register_max: unit.register_max };
    });
    partsOf.set(unit.id, rows.slice(1));

    out.push(`-- ${slug} → ${rows.map((r) => r.slug).join(' · ')}`);
    const first = parts[0];
    if (first.title || first.summary) {
      out.push(`update public.units set title_en = ${q(first.title ?? unit.title_en)}, summary_en = ${q(first.summary ?? unit.summary_en)} where id = ${q(unit.id)};`);
    }
    // Words: every part's forms numbered in the order the part teaches them;
    // the forms no part names (glue, bound) stay with the first, after its words.
    const own = outline.forms.filter((f) => f.unit_id === unit.id);
    result.parts.forEach((p, i) => {
      const rest = i === 0 ? own.filter((f) => !result.parts.some((x) => x.forms.includes(f))).sort((a, b) => a.position - b.position) : [];
      [...p.forms, ...rest].forEach((f, k) => {
        if (i > 0) movedForms += 1;
        if (i > 0 || f.position !== k + 1) out.push(`update public.forms set unit_id = ${q(rows[i].id)}, position = ${k + 1} where id = ${q(f.id)}; -- ${f.form}`);
      });
    });
    for (const s of sentences) {
      const to = result.partOfSentence.get(s.id);
      if (to > 0) {
        movedSentences += 1;
        out.push(`update public.sentences set unit_id = ${q(rows[to].id)} where id = ${q(s.id)};`);
      }
    }
    // Tips: each existing tip to the part that names it; a part's new tips after them.
    const placed = new Set();
    parts.forEach((part, i) => {
      for (const title of part.tips ?? []) {
        // A title can be on two rows (a draft beside the published one): they go together.
        const named = unit.tips.filter((t) => t.title_en === title && !placed.has(t.id));
        if (!named.length) {
          errors.push(`${slug} part ${i + 1}: no tip "${title}" in the unit (it has ${unit.tips.map((t) => `"${t.title_en}"`).join(', ')})`);
          continue;
        }
        for (const tip of named) {
          placed.add(tip.id);
          if (i > 0) out.push(`update public.tips set unit_id = ${q(rows[i].id)} where id = ${q(tip.id)}; -- ${title}`);
        }
      }
      (part.new_tips ?? []).forEach((t, k) => {
        if (!t.title || !t.body) errors.push(`${slug} part ${i + 1}: a new tip needs a title and a body`);
        // Past the ids the outline gives a unit's own tips, so neither can land on the other.
        const id = ids.tip(rows[i].slug, 32 + k);
        out.push(`insert into public.tips (id, unit_id, title_en, body_md, status) values (${q(id)}, ${q(rows[i].id)}, ${q(t.title)}, ${q(String(t.body ?? '').trim())}, 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;`);
      });
      if (!(part.tips ?? []).length && !(part.new_tips ?? []).length) errors.push(`${slug} part ${i + 1}: needs a tip`);
    });
    const unplaced = unit.tips.filter((t) => !placed.has(t.id));
    if (unplaced.length) errors.push(`${slug}: no part takes the tip(s) ${unplaced.map((t) => `"${t.title_en}"`).join(', ')}`);
    out.push('');
  }

  // The road with the new units in: each right after the unit it came from.
  const road = [];
  for (const u of outline.units.filter((x) => x.status !== 'retired')) {
    road.push({ ...u, old: u });
    for (const n of partsOf.get(u.id) ?? []) road.push({ ...n, isNew: true, from: u });
  }
  const ordinalIn = new Map();
  road.forEach((u, i) => {
    u.course_order = i + 1;
    ordinalIn.set(u.section_id, (ordinalIn.get(u.section_id) ?? 0) + 1);
    u.ordinal = ordinalIn.get(u.section_id);
  });
  // The outline's course_order counts live units from 1; the database's may not.
  const dbUnit = new Map(rows.units.map((u) => [u.id, u]));
  const base = Math.min(...road.filter((u) => !u.isNew).map((u) => dbUnit.get(u.id).course_order)) - 1;
  for (const u of road) u.course_order += base;
  const baseOrdinal = new Map();
  for (const u of road.filter((x) => !x.isNew)) {
    const d = dbUnit.get(u.id);
    baseOrdinal.set(u.section_id, Math.min(baseOrdinal.get(u.section_id) ?? Infinity, d.ordinal));
  }
  for (const u of road) u.ordinal += baseOrdinal.get(u.section_id) - 1;

  for (const e of errors) console.error(`error ${e}`);
  if (errors.length) {
    console.error(`\n${errors.length} error(s) — no migration written`);
    process.exit(1);
  }

  const renumbered = road.filter((u) => !u.isNew && (dbUnit.get(u.id).ordinal !== u.ordinal || dbUnit.get(u.id).course_order !== u.course_order));
  // A learner placed through a unit is placed through all of it: its last part.
  const lastPart = (u) => road.filter((x) => x.id === u.id || x.from?.id === u.id).at(-1);
  const places = road.filter((u) => !u.isNew).map((u) => `(${dbUnit.get(u.id).course_order}, ${lastPart(u).course_order})`);
  const fresh = road.filter((u) => u.isNew);
  const header = `-- ---------------------------------------------------------------------------
-- Units too big for the fixed shape are split (scripts/course/split-units.mjs,
-- from ${path === SPLITS ? 'docs/course/splits.yaml' : String(path).split('/').pop()}): ${Object.keys(splits).length} units become ${Object.keys(splits).length + fresh.length}.
-- The first part keeps the unit: its id, its lessons, what a learner did in it.
-- Each later part is a new unit right after it, with the words named for it,
-- the sentences that use those words (${movedSentences} move), and its tips.
-- ${movedForms} forms move. Nothing is deleted.
-- Then: course:sync-lessons (the new units' lessons), course:extras, course:lessons -- --all.
-- ---------------------------------------------------------------------------
`;
  const renumber = `create temporary table reorder_units (id uuid, section_id smallint, ordinal smallint, course_order smallint, old_order smallint) on commit drop;
insert into reorder_units values
  ${renumbered.map((u) => `(${q(u.id)}::uuid, ${u.section_id}, ${u.ordinal}, ${u.course_order}, ${dbUnit.get(u.id).course_order})`).join(',\n  ')};

-- Through a free range first: ordinals and course places are unique.
update public.units u set ordinal = 20000 + r.course_order, course_order = 20000 + r.course_order from reorder_units r where u.id = r.id;
update public.units u set section_id = r.section_id, ordinal = r.ordinal, course_order = r.course_order from reorder_units r where u.id = r.id;

-- A placement or jump test is remembered as a course place: the same unit's
-- new place, and for a unit that was split, its last part.
update public.profiles p set placed_through = coalesce((
  select m.course_order from (values
    ${places.join(', ')}
  ) as m (old_order, course_order)
  where m.old_order <= p.placed_through order by m.old_order desc limit 1
), 0)
where p.placed_through > 0;
`;
  const inserts = `-- The new units, in the places just made for them.
insert into public.units (id, section_id, ordinal, course_order, slug, title_en, summary_en, grammar_focus, register_max, review_form_ids, status) values
${fresh.map((u) => `  (${q(u.id)}, ${u.section_id}, ${u.ordinal}, ${u.course_order}, ${q(u.slug)}, ${q(u.title_en)}, ${q(u.summary_en)}, ${textArray(u.grammar_focus)}, ${q(u.register_max)}, '{}'::uuid[], 'published')`).join(',\n')}
on conflict (id) do nothing;
`;
  const scenes = `-- A chat scene written for a unit that has since lost half its words is written again when it is next opened.
delete from public.unit_scenarios where unit_id in (${[...partsOf.keys()].map(q).join(', ')});
`;
  writeFileSync(sqlFile, [header, renumber, inserts, out.join('\n'), scenes].join('\n'));
  console.log(`${Object.keys(splits).length} units split into ${Object.keys(splits).length + fresh.length} · ${movedForms} forms and ${movedSentences} sentences move · ${renumbered.length} units renumbered`);
  console.log(`wrote ${sqlFile}`);
  process.exit(0);
}

console.error('usage: course:split -- --list [--sections 1,2,3] | --check [<splits.yaml>] | --sql <migration.sql> [--from <splits.yaml>]  [--snapshot <date>]');
process.exit(1);
