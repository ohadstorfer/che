// `course:agent -- check <slug> --topup` for many units at once, with the course
// loaded once: runs the checks on each unit's writer batches and writes its
// judge.prompt.md (and failures.txt). A unit with a batch not yet written is
// skipped.
//
//   node --import ./scripts/test/register.mjs scripts/course/topup-check.mjs <file of unit slugs>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { checkCandidates, judgePrompt, keptInSpanish, styleSpec } from './lib/generate.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const JUDGE_SCHEMA =
  'Answer with ONLY a JSON object: {"scores":[{"id":int,"naturalness":1-5,"grammaticality":1-5,"coherence":1-5,"logic":1-5,"porteno":bool,"register_ok":bool,"english_natural":bool,"issue":string,"rewrite":string}]} — one entry per sentence.';
const asFile = ({ system, user }, schema) => `# SYSTEM\n${system}\n\n# TASK\n${user}\n\n${schema}\n`;

const list = process.argv[2];
if (!list) {
  console.error('usage: topup-check.mjs <file of unit slugs>');
  process.exit(1);
}
const slugs = readFileSync(list, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const outline = loadOutlineFromDb();
const style = styleSpec();
const kept = keptInSpanish(outline);

for (const slug of slugs) {
  const unit = outline.units.find((u) => u.slug === slug);
  const dir = new URL(`../../.course-work/${slug}-topup/`, import.meta.url).pathname;
  if (!unit || !existsSync(dir + 'known.json')) {
    console.log(`${slug}: skipped (no prompts)`);
    continue;
  }
  const known = JSON.parse(readFileSync(dir + 'known.json', 'utf8'));
  const existing = known.filter((s) => s.unit_id === unit.id).map((s) => s.es);
  const checked = [];
  let missing = false;
  for (let n = 0; existsSync(`${dir}batch-${n}.prompt.md`); n++) {
    if (!existsSync(`${dir}batch-${n}.json`)) {
      missing = true;
      break;
    }
    const { sentences } = JSON.parse(readFileSync(`${dir}batch-${n}.json`, 'utf8'));
    checked.push(...checkCandidates({ outline, unit, candidates: sentences, existingEs: [...existing, ...checked.filter((c) => c.ok).map((c) => c.candidate.es)] }));
  }
  if (missing) {
    console.log(`${slug}: skipped (a batch is not written)`);
    continue;
  }
  const failing = checked.filter((c) => !c.ok).map((c) => `${c.candidate.es} = ${c.candidate.en}\n  ${c.problems.join('\n  ')}`);
  writeFileSync(dir + 'failures.txt', failing.join('\n') + (failing.length ? '\n' : ''));
  // Ids are positions in `checked`, as topup-publish counts them.
  const items = checked.map((c, i) => ({ c, i })).filter(({ c }) => c.ok).map(({ c, i }) => ({ id: i, es: c.candidate.es, en: c.candidate.en }));
  writeFileSync(dir + 'judge.prompt.md', asFile(judgePrompt({ unit, style, items, kept }), JUDGE_SCHEMA));
  console.log(`${slug}: ${checked.length} candidates, ${items.length} pass`);
}
