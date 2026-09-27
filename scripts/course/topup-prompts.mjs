// `course:agent -- prompts <slug> --topup` for many units at once: loads the
// course once instead of once per unit. Writes the same work folders
// (.course-work/<slug>-topup/), so `check` and `publish` with `--topup` carry on
// from there, one unit at a time.
//
//   npm run course:topup-prompts -- <file with one unit slug per line> [--focus <file>]
//
// --focus: a JSON file {slug: {focus, focus_words}} — for units whose filler
// was retired: the writers are told what every sentence must practice, and the
// focus words get sentences too, however many they have.
//
// --lean: only words with fewer than 4 sentences, each asked for what it lacks
// plus one; older words listed bare; all of a unit's targets in one prompt.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { DRAFT_SCHEMA, FORMS_PER_REQUEST, generationPrompt, styleSpec, targetsFor } from './lib/generate.mjs';
import { sentencesOfUnits } from './lib/pipeline.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const list = process.argv[2];
const focusAt = process.argv.indexOf('--focus');
const lean = process.argv.includes('--lean');
const focusBy = focusAt > 0 ? JSON.parse(readFileSync(process.argv[focusAt + 1], 'utf8')) : {};
if (!list) {
  console.error('usage: course:topup-prompts -- <file of unit slugs>');
  process.exit(1);
}
const slugs = readFileSync(list, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const outline = loadOutlineFromDb();
const style = styleSpec();
const live = ['approved', 'published'];

// Every sentence the prompts need, in one query: one per unit was the slow part.
const nearbyOf = (unit) => outline.units.filter((u) => u.course_order <= unit.course_order && u.course_order >= unit.course_order - 3);
const wantedUnits = new Set(slugs.flatMap((slug) => {
  const unit = outline.units.find((u) => u.slug === slug);
  return unit ? nearbyOf(unit).map((u) => u.id) : [];
}));
const byUnit = new Map();
for (const s of wantedUnits.size ? sentencesOfUnits([...wantedUnits]) : []) {
  if (!byUnit.has(s.unit_id)) byUnit.set(s.unit_id, []);
  byUnit.get(s.unit_id).push(s);
}

for (const slug of slugs) {
  const unit = outline.units.find((u) => u.slug === slug);
  if (!unit) {
    console.log(`${slug}: no such unit`);
    continue;
  }
  const known = nearbyOf(unit).flatMap((u) => byUnit.get(u.id) ?? []);
  const have = new Map();
  for (const s of known) {
    if (s.unit_id === unit.id && live.includes(s.status)) have.set(s.target_form_id, (have.get(s.target_form_id) ?? 0) + 1);
  }
  const focus = focusBy[slug] ?? null;
  const extra = new Set(lean ? [] : (focus?.focus_words ?? []));
  const targets = targetsFor(outline, unit).filter((t) => (have.get(t.id) ?? 0) < 4 || extra.has(t.form));
  const dir = new URL(`../../.course-work/${slug}-topup/`, import.meta.url).pathname;
  rmSync(dir, { recursive: true, force: true });
  if (!targets.length) {
    console.log(`${slug}: nothing short`);
    continue;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + 'known.json', JSON.stringify(known));
  writeFileSync(dir + 'topup.json', JSON.stringify(targets.map((t) => t.id)));
  const examples = known
    .filter((s) => live.includes(s.status))
    .sort((a, b) => Number(b.unit_id === unit.id) - Number(a.unit_id === unit.id))
    .slice(0, lean ? 10 : 30);
  const existing = known.filter((s) => s.unit_id === unit.id).map((s) => s.es);
  let n = 0;
  const perRequest = lean ? 12 : FORMS_PER_REQUEST;
  const counts = new Map(targets.map((t) => [t.id, Math.max(2, 4 - (have.get(t.id) ?? 0) + 1)]));
  for (let i = 0; i < targets.length; i += perRequest, n++) {
    const { system, user } = generationPrompt({ outline, unit, targets: targets.slice(i, i + perRequest), examples, existing, style, focus: focus?.focus ?? null, lean: lean ? { counts } : null });
    writeFileSync(`${dir}batch-${n}.prompt.md`, `# SYSTEM\n${system}\n\n# TASK\n${user}\n\n${DRAFT_SCHEMA}\n`);
  }
  console.log(`${slug}: ${targets.length} word(s) short — ${targets.map((t) => t.form).join(', ')}`);
}
