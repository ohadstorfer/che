#!/usr/bin/env node
// Brings the YAML outline's wording in line with the database, which is the
// source of truth (course:parity lists where they differ). Only text that
// both sides hold under the same id is rewritten, in place, comments and
// layout untouched: a unit's title, summary, grammar and register; a tip's
// title and body; a word's gloss and note; a form's gloss, note and bound.
// A form the database added to a word the YAML already lists in that unit
// (the chunk a bound form lives in: "me salvaste" beside "salvaste") is added.
//
// Not touched, because the YAML has no way to say them or they need a person:
// the order of a unit's words, its lessons, and other rows only one side has.
//
//   npm run course:sync-yaml [-- --dry-run]
import { readFileSync, writeFileSync } from 'node:fs';
import { parseDocument } from 'yaml';

import { ids } from './lib/ids.mjs';
import { SECTION_PATHS } from './lib/outline.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const dryRun = process.argv.includes('--dry-run');
const db = loadOutlineFromDb();
const unitById = new Map(db.units.map((u) => [u.id, u]));
const tipById = new Map(db.units.flatMap((u) => u.tips).map((t) => [t.id, t]));
const lemmaById = new Map(db.lemmas.map((l) => [l.id, l]));
const formById = new Map(db.forms.map((f) => [f.id, f]));

let changed = 0;
/** Sets `key` on a YAML map to the database's value; null or false removes it. */
const put = (map, key, value) => {
  const held = map.get(key) ?? null;
  const now = held !== null && typeof held === 'object' ? held.toJSON() : held;
  const next = value === false ? null : (value ?? null);
  if (JSON.stringify(now) === JSON.stringify(next)) return;
  if (next === null) map.delete(key);
  else map.set(key, next);
  changed++;
};

/** A form's features as the YAML writes them: "2sg.pret.ind.vos.clitic". */
const featureString = (f = {}) =>
  [
    f.person ? `${f.person}${f.number}` : null,
    f.tense,
    f.mood,
    f.verb_form,
    f.voseo ? 'vos' : null,
    f.clitic ? 'clitic' : null,
    f.gender,
    f.person ? null : f.number,
    f.irregular ? 'irregular' : null,
  ]
    .filter(Boolean)
    .join('.');

const docs = SECTION_PATHS.map((path) => ({ path, doc: parseDocument(readFileSync(path, 'utf8')) })).sort(
  (a, b) => a.doc.getIn(['section', 'id']) - b.doc.getIn(['section', 'id']),
);
const seenLemmas = new Set();
const inYaml = new Set();
for (const { doc } of docs) {
  for (const u of doc.get('units')?.items ?? []) {
    for (const w of u.get('words')?.items ?? []) {
      const entries = w.get('forms')?.items.map((f) => String(f.get('form'))) ?? [String(w.get('lemma'))];
      for (const form of entries) inYaml.add(ids.form(String(w.get('lemma')), w.get('pos'), form));
    }
  }
}
for (const { path, doc } of docs) {
  const before = changed;
  for (const u of doc.get('units')?.items ?? []) {
    const slug = u.get('slug');
    const unit = unitById.get(ids.unit(slug));
    if (unit) {
      put(u, 'title', unit.title_en);
      put(u, 'summary', unit.summary_en);
      put(u, 'grammar', unit.grammar_focus);
      // The YAML leaves the default out.
      if ((u.get('register_max') ?? 'neutral') !== unit.register_max) put(u, 'register_max', unit.register_max);
    }
    (u.get('tips')?.items ?? []).forEach((t, i) => {
      const tip = tipById.get(ids.tip(slug, i));
      if (!tip) return;
      put(t, 'title', tip.title_en);
      put(t, 'body', tip.body_md);
    });
    for (const w of u.get('words')?.items ?? []) {
      const lemma = String(w.get('lemma'));
      const pos = w.get('pos');
      const lemmaId = ids.lemma(lemma, pos);
      const row = lemmaById.get(lemmaId);
      // Only its first appearance defines a lemma; later ones are ignored.
      if (row && !seenLemmas.has(lemmaId)) {
        put(w, 'en', row.gloss_en);
        put(w, 'note', row.gloss_note_en);
      }
      seenLemmas.add(lemmaId);
      for (const f of w.get('forms')?.items ?? []) {
        const form = formById.get(ids.form(lemma, pos, String(f.get('form'))));
        if (!form) continue;
        put(f, 'en', form.gloss_en);
        put(f, 'note', form.gloss_note_en);
        put(f, 'bound', form.bound);
      }
      for (const form of unit && w.has('forms') ? db.forms : []) {
        if (form.lemma_id !== lemmaId || form.unit_id !== unit.id || inYaml.has(form.id)) continue;
        const entry = { form: form.form };
        if (featureString(form.features)) entry.f = featureString(form.features);
        if (form.gloss_en) entry.en = form.gloss_en;
        if (form.gloss_note_en) entry.note = form.gloss_note_en;
        if (form.bound) entry.bound = true;
        w.get('forms').add(doc.createNode(entry));
        inYaml.add(form.id);
        changed++;
        console.log(`  + ${slug}: ${form.form}`);
      }
    }
  }
  if (changed > before && !dryRun) writeFileSync(path, doc.toString({ lineWidth: 100, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' }));
  console.log(`${String(path).split('/').pop()}: ${changed - before} change(s)`);
}
console.log(dryRun ? `\n${changed} change(s) — --dry-run, nothing written` : `\n${changed} change(s) written`);
