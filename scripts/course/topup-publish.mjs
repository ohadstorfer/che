// `course:agent -- publish <slug> --topup` for many units at once: the same
// checks and selection, with the course loaded once, then one lessons rebuild
// for all of them. A unit whose folder has no scores.json is skipped.
//
//   npm run course:topup-publish -- <file with one unit slug per line> [--dry-run] [--no-lessons]
//
// --no-lessons: leave the lessons rebuild to a later `course:lessons --all`.
// --approved: save the sentences as approved, not published — for words still
// in draft (course:words --draft): the app must not get a sentence before it
// has the word. course:words --publish puts both live together. No lessons
// are rebuilt: they are planned from published sentences only.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { PRACTICE_QUOTA, checkCandidates, isPracticeUnit, selectCandidates, targetsFor } from './lib/generate.mjs';
import { saveCandidates } from './lib/pipeline.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const MODEL = 'claude-code-agent';
const [list, ...rest] = process.argv.slice(2);
if (!list) {
  console.error('usage: course:topup-publish -- <file of unit slugs> [--dry-run]');
  process.exit(1);
}
const dryRun = rest.includes('--dry-run');
const approved = rest.includes('--approved');
const noLessons = rest.includes('--no-lessons') || approved;
const slugs = readFileSync(list, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const outline = loadOutlineFromDb();
const done = [];
const pending = [];
function flush() {
  if (!pending.length) return;
  saveCandidates({
    selected: pending.flatMap((p) => p.selected),
    rejected: pending.flatMap((p) => p.rejected),
    known: pending.flatMap((p) => p.known),
    model: MODEL,
    status: approved ? 'approved' : 'published',
  });
  pending.length = 0;
}
let total = 0;

for (const slug of slugs) {
  const unit = outline.units.find((u) => u.slug === slug);
  const dir = new URL(`../../.course-work/${slug}-topup/`, import.meta.url).pathname;
  if (!unit || !existsSync(dir + 'scores.json')) {
    console.log(`${slug}: skipped (${unit ? 'not judged' : 'no such unit'})`);
    continue;
  }
  const read = (name) => JSON.parse(readFileSync(dir + name, 'utf8'));
  const known = read('known.json');
  const wanted = new Set(read('topup.json'));
  const targets = targetsFor(outline, unit).filter((t) => wanted.has(t.id));
  const existing = known.filter((s) => s.unit_id === unit.id).map((s) => s.es);
  const checked = [];
  for (let n = 0; existsSync(`${dir}batch-${n}.prompt.md`); n++) {
    if (!existsSync(`${dir}batch-${n}.json`)) continue;
    const { sentences } = read(`batch-${n}.json`);
    const results = checkCandidates({ outline, unit, candidates: sentences, existingEs: [...existing, ...checked.filter((c) => c.ok).map((c) => c.candidate.es)] });
    checked.push(...results);
  }
  const scores = new Map(read('scores.json').scores.map((s) => [s.id, s]));
  const { selected, rejected } = selectCandidates(checked, scores, isPracticeUnit(unit) ? PRACTICE_QUOTA : undefined);
  const standing = known.filter((s) => ['approved', 'published'].includes(s.status) && s.unit_id === unit.id);
  const count = (id) => selected.filter((s) => s.target.id === id).length + standing.filter((s) => s.target_form_id === id).length;
  const short = targets.filter((t) => count(t.id) < 4).map((t) => `${t.form} (${count(t.id)})`);
  console.log(`${slug}: +${selected.length}${short.length ? ` · still short: ${short.join(', ')}` : ''}`);
  total += selected.length;
  if (dryRun) continue;
  // Written in batches of units: each query pays the database login again,
  // and one per unit was most of the run.
  pending.push({ selected, rejected, known });
  done.push(slug);
  if (pending.length >= 25) flush();
}
flush();
console.log(`\n${total} sentence(s) across ${done.length} unit(s)`);
if (dryRun) {
  console.log('--dry-run: nothing written');
  process.exit(0);
}
if (done.length && !noLessons) {
  execFileSync('node', ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--import', new URL('../test/register.mjs', import.meta.url).pathname, new URL('./build-lessons.mjs', import.meta.url).pathname, ...done], { stdio: 'inherit' });
}
