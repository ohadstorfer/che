#!/usr/bin/env node
// Adds new words to units that already exist, from docs/course/new-words.yaml.
// The database is the source of truth and the YAML outline no longer mirrors
// it (units have been split since), so new words go to a unit by its slug,
// straight from this file. It only adds: a word the course already has is an
// error here, not an edit.
//
//   npm run course:words -- --units [--sections 1,2,3]   every unit, what it teaches and the room it has
//   npm run course:words -- --check [<file>]             checks the file, writes nothing
//   npm run course:words -- --sql <migration.sql> [--from <file>] [--draft]
//                                                        the migration, and docs/course/slang-lessons.yaml
//   npm run course:words -- --publish <migration.sql> [--from <file>]
//                                                        the migration that publishes words added with --draft
//
// --draft adds the words as drafts: the scripts see them (sentences can be
// written and checked against them) and the app does not, so a word with no
// lesson yet never turns up as a wrong answer in someone's round. --publish
// goes with the migration that gives them their lessons.
//
// The file, by unit slug:
//   units:
//     hola-che:
//       words:                      # taught in the unit's own lessons
//         - { lemma: "qué tal", pos: phrase, en: "how's it going?" }
//       slang:                      # the slang lesson's new words (lib/template.mjs says how many)
//         - { lemma: "joda", pos: noun, en: "party", register: informal,
//             forms: [{ form: "joda", f: "f.sg" }, { form: "jodas", f: "f.pl" }] }
// A word is written as the outline writes one (lemma, pos, en, note, register,
// forms with `f` features and their own `en`). `why` is for the reader: where
// the word was put and the reason. A word with no `forms` is its lemma alone.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { checkFormEntry } from '../../src/lib/course-rules/check.ts';
import { ids, lemmaKey } from './lib/ids.mjs';
import { drillable } from './lib/outline.mjs';
import { POS, REGISTERS, fold, parseFeatures } from './lib/rules.mjs';
import { jsonb, q } from './lib/sql.mjs';
import { lightForms, overflow, slangWordsFor } from './lib/template.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const WORDS = new URL('../../docs/course/new-words.yaml', import.meta.url);
const SLANG = new URL('../../docs/course/slang-lessons.yaml', import.meta.url);

const outline = loadOutlineFromDb();
const sectionOrdinal = new Map(outline.sections.map((s) => [s.id, s.ordinal]));
const published = outline.units.filter((u) => u.status === 'published');
const ownOf = (unit) => outline.forms.filter((f) => f.unit_id === unit.id);
const knownBefore = (unit) => new Set(outline.forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.lemma_id));

if (args.includes('--units')) {
  const wanted = new Set((flag('--sections') ?? [...sectionOrdinal.values()].join(',')).split(',').map(Number));
  for (const unit of published.filter((u) => wanted.has(sectionOrdinal.get(u.section_id)))) {
    const own = ownOf(unit).filter(drillable);
    const words = [...new Set(own.map((f) => f.lemma))];
    const kind = unit.review_form_ids.length ? ' [practice unit: no new words]' : ` · room for ${Math.max(0, 12 - words.length)} more word(s)`;
    console.log(`\n${sectionOrdinal.get(unit.section_id)}.${unit.ordinal} ${unit.slug} — ${unit.title_en} · "${unit.summary_en}"${kind}`);
    console.log(`  grammar: ${unit.grammar_focus.join(', ')}`);
    console.log(`  teaches: ${words.join(', ') || '—'}`);
    const others = own.filter((f) => fold(f.form) !== fold(f.lemma)).map((f) => f.form);
    if (others.length) console.log(`  forms: ${others.join(', ')}`);
  }
  process.exit(0);
}

const publishFile = flag('--publish');
const sqlFile = flag('--sql') ?? publishFile;
const status = args.includes('--draft') ? 'draft' : 'published';
if (!args.includes('--check') && !sqlFile) {
  console.error('usage: course:words -- --units [--sections 1,2,3] | --check [<file>] | --sql <migration.sql> [--from <file>]');
  process.exit(1);
}
const given = sqlFile ? flag('--from') : args[args.indexOf('--check') + 1];
const path = given && !given.startsWith('--') ? given : WORDS;
if (!existsSync(path)) {
  console.error(`no ${path}`);
  process.exit(1);
}
const doc = parse(readFileSync(path, 'utf8')) ?? {};

const errors = [];
const warnings = [];
const lemmaByKey = new Map(outline.lemmas.map((l) => [lemmaKey(l.lemma, l.pos), l]));
const surfaces = new Map(); // folded surface -> who has it
for (const f of outline.forms) if (!surfaces.has(fold(f.form))) surfaces.set(fold(f.form), `${f.lemma} (unit ${f.unit_order})`);
const seen = new Set();
const newLemmas = [];
const newForms = [];
const slangPlan = {};
let neutral = 0;
let slang = 0;

for (const [slug, entry] of Object.entries(doc.units ?? {})) {
  const unit = published.find((u) => u.slug === slug);
  if (!unit) {
    errors.push(`${slug}: no such published unit`);
    continue;
  }
  const section = sectionOrdinal.get(unit.section_id);
  const own = ownOf(unit);
  let position = Math.max(0, ...own.map((f) => f.position));
  const added = { words: [], slang: [] };
  for (const list of ['words', 'slang']) {
    for (const w of entry[list] ?? []) {
      const where = `${slug} · ${w.lemma}`;
      if (!w.lemma || !w.pos || !w.en) {
        errors.push(`${where}: a word needs "lemma", "pos" and "en"`);
        continue;
      }
      const lemma = String(w.lemma);
      if (!POS.includes(w.pos)) errors.push(`${where}: pos "${w.pos}" is not one of ${POS.join(', ')}`);
      const register = w.register ?? (list === 'slang' ? 'informal' : 'neutral');
      if (!REGISTERS.includes(register)) errors.push(`${where}: register "${register}" is not one of ${REGISTERS.join(', ')}`);
      if (list === 'slang' && register === 'neutral') warnings.push(`${where}: a slang-lesson word with register neutral — it gets no "slang" mark`);
      const key = lemmaKey(lemma, w.pos);
      if (lemmaByKey.has(key) && !publishFile) errors.push(`${where}: the course already has "${lemma}" (${w.pos}), taught in unit ${lemmaByKey.get(key).unit_order}`);
      if (seen.has(key)) errors.push(`${where}: listed twice in this file`);
      seen.add(key);
      const lemmaId = ids.lemma(lemma, w.pos);
      newLemmas.push({ id: lemmaId, lemma, pos: w.pos, gloss_en: w.en, gloss_note_en: w.note ?? null, register, is_glue: false, notes_en: null });
      for (const e of w.forms ?? [{ form: lemma }]) {
        const surface = String(e.form ?? '');
        let features = {};
        try {
          features = parseFeatures(e.f);
        } catch (err) {
          errors.push(`${where} · ${surface}: ${err.message}`);
        }
        for (const problem of checkFormEntry({ form: surface, pos: w.pos, features })) errors.push(`${where} · ${surface}: ${problem}`);
        // The same spelling as a word she already has is two meanings on one
        // tile: allowed (banco, banco), but worth a look.
        if (surfaces.has(fold(surface))) warnings.push(`${where}: "${surface}" is also a form of ${surfaces.get(fold(surface))}`);
        position += 1;
        const form = { id: ids.form(lemma, w.pos, surface), lemma_id: lemmaId, lemma, pos: w.pos, form: surface, features, gloss_en: e.en ?? null, gloss_note_en: e.note ?? null, unit_id: unit.id, position, is_glue: false, bound: e.bound === true };
        newForms.push(form);
        added[list].push(form);
      }
      if (list === 'slang') {
        slang += 1;
        slangPlan[slug] = [...(slangPlan[slug] ?? []), lemma];
      } else neutral += 1;
    }
  }
  const slangWords = new Set(added.slang.map((f) => f.lemma_id)).size;
  if (slangWords > slangWordsFor(section)) errors.push(`${slug}: ${slangWords} slang words (a slang lesson in section ${section} teaches ${slangWordsFor(section)})`);
  if (unit.review_form_ids.length && added.words.length) errors.push(`${slug}: a practice unit teaches no words of its own — put them in a teaching unit`);
  // The unit must still fit its three teaching lessons with the new words in.
  const teach = [...own.filter(drillable), ...added.words.filter(drillable)];
  const why = unit.review_form_ids.length ? null : overflow(teach, lightForms(teach, knownBefore(unit)));
  // (When publishing, the words are already in the unit: course:template --preview --staged is the check.)
  if (why && added.words.length && !publishFile) errors.push(`${slug}: with the new words, ${why}`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${Object.keys(doc.units ?? {}).length} units · ${neutral} new words for the lessons · ${slang} for the slang lessons · ${newForms.length} forms · ${errors.length} error(s)`);
if (errors.length) process.exit(1);
if (!sqlFile) process.exit(0);

if (publishFile) {
  writeFileSync(
    publishFile,
    `-- The words added as drafts from ${path === WORDS ? 'docs/course/new-words.yaml' : String(path).split('/').pop()} go live (scripts/course/add-words.mjs --publish).
update public.lemmas set status = 'published' where status = 'draft' and id in (${newLemmas.map((l) => q(l.id)).join(', ')});
update public.forms set status = 'published' where status = 'draft' and id in (${newForms.map((f) => q(f.id)).join(', ')});
-- Their sentences were kept as approved until the words were live (course:topup-publish --approved).
update public.sentences set status = 'published' where status = 'approved' and unit_id in (${[...new Set(newForms.map((f) => f.unit_id))].map(q).join(', ')});
`,
  );
  console.log(`wrote ${publishFile}`);
  process.exit(0);
}

const values = (rows, columns, cast = {}) => rows.map((r) => `  (${columns.map((c) => (cast[c] ? cast[c](r[c]) : q(r[c]))).join(', ')})`).join(',\n');
writeFileSync(
  sqlFile,
  `-- New words for units that already exist (scripts/course/add-words.mjs, from
-- ${path === WORDS ? 'docs/course/new-words.yaml' : String(path).split('/').pop()}): ${neutral} for the units' lessons, ${slang} for their slang lessons.
-- Adds only: a row already there is left as it is.${status === 'draft' ? `\n-- As drafts: the scripts write their sentences against them; the app sees them\n-- when they are published, with the lessons that teach them.` : ''}

insert into public.lemmas (id, lemma, pos, gloss_en, gloss_note_en, register, is_glue, notes_en, status) values
${values(newLemmas.map((l) => ({ ...l, status })), ['id', 'lemma', 'pos', 'gloss_en', 'gloss_note_en', 'register', 'is_glue', 'notes_en', 'status'])}
on conflict do nothing;

insert into public.forms (id, lemma_id, form, features, gloss_en, gloss_note_en, unit_id, position, bound, status) values
${values(newForms.map((f) => ({ ...f, status })), ['id', 'lemma_id', 'form', 'features', 'gloss_en', 'gloss_note_en', 'unit_id', 'position', 'bound', 'status'], { features: jsonb })}
on conflict do nothing;
`,
);
console.log(`wrote ${sqlFile}`);

// Which of those the slang lessons teach (lib/course-plan.mjs reads it), added to what is already listed.
const before = existsSync(SLANG) ? (parse(readFileSync(SLANG, 'utf8'))?.units ?? {}) : {};
const merged = { ...before };
for (const [slug, lemmas] of Object.entries(slangPlan)) merged[slug] = [...new Set([...(before[slug] ?? []), ...lemmas])];
const order = new Map(published.map((u, i) => [u.slug, i]));
const lines = Object.keys(merged)
  .sort((a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9))
  .map((slug) => `  ${slug}: [${merged[slug].map((l) => JSON.stringify(l)).join(', ')}]`);
writeFileSync(
  SLANG,
  `# The words each unit's slang lesson teaches: unit slug -> lemmas. They are
# course words of that unit like any other; this file only says which lesson
# meets them first (scripts/course/lib/course-plan.mjs). Written by
# course:words from docs/course/new-words.yaml.
units:
${lines.join('\n')}
`,
);
console.log(`wrote docs/course/slang-lessons.yaml (${Object.keys(merged).length} units)`);
