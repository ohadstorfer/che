#!/usr/bin/env node
// generate-unit.mjs without the API: Claude Code agents draft and judge, this
// script does everything else — the same prompts, the same checks, the same
// selection. Generated content goes live straight away; a native reviewer
// edits or removes it later in the dashboard.
//
//   npm run course:agent -- prompts <unit-slug>
//       writes .course-work/<slug>/batch-N.prompt.md and prints the agent task
//   (a writer agent per batch → batch-N.json)
//   npm run course:agent -- check <unit-slug>
//       runs the checks, writes judge.prompt.md
//   (one judge agent, fresh, sees only judge.prompt.md → scores.json)
//   npm run course:agent -- publish <unit-slug> [--dry-run]
//       selects, writes the sentences as published, builds the lessons,
//       publishes the unit
//
// The work folder is git-ignored and keeps the sentences the course had when
// `prompts` ran, so every stage checks against the same course.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { FORMS_PER_REQUEST, checkCandidates, generationPrompt, judgePrompt, keptInSpanish, promptHash, selectCandidates, styleSpec, targetsFor } from './lib/generate.mjs';
import { publishUnit, saveCandidates, sentencesOfUnits, unitFromArgs } from './lib/pipeline.mjs';

const MODEL = 'claude-code-agent';

const [stage, ...args] = process.argv.slice(2);
if (!['prompts', 'check', 'publish'].includes(stage)) {
  console.error('usage: course:agent -- prompts|check|publish <unit-slug> [--dry-run]');
  process.exit(1);
}
let ctx;
try {
  ctx = unitFromArgs(args);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { outline, unit, flags } = ctx;
const dir = new URL(`../../.course-work/${unit.slug}/`, import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const file = (name) => dir + name;
const readJson = (name) => {
  if (!existsSync(file(name))) {
    console.error(`missing ${file(name)} — run the agent for it first`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(file(name), 'utf8'));
};

const style = styleSpec();
if (stage === 'prompts') {
  const nearby = outline.units.filter((u) => u.course_order <= unit.course_order && u.course_order >= unit.course_order - 3);
  writeFileSync(file('known.json'), JSON.stringify(sentencesOfUnits(nearby.map((u) => u.id))));
}
const known = readJson('known.json');
// Grounding: approved sentences from this unit and the three before it.
const examples = known
  .filter((s) => ['approved', 'published'].includes(s.status))
  .sort((a, b) => Number(b.unit_id === unit.id) - Number(a.unit_id === unit.id))
  .slice(0, 30);
const existing = known.filter((s) => s.unit_id === unit.id).map((s) => s.es);
const targets = targetsFor(outline, unit);
const batches = [];
for (let i = 0; i < targets.length; i += FORMS_PER_REQUEST) batches.push(targets.slice(i, i + FORMS_PER_REQUEST));

const DRAFT_SCHEMA =
  'Answer with ONLY a JSON object: {"sentences":[{"target":string (the target word exactly as listed),"role":"intro"|"drill","es":string,"en":string,"en_alt":string[],"difficulty":1-4,"loose":string[] (Spanish words the English renders idiomatically rather than word for word; usually empty)}]}';
const JUDGE_SCHEMA =
  'Answer with ONLY a JSON object: {"scores":[{"id":int,"naturalness":1-5,"grammaticality":1-5,"coherence":1-5,"logic":1-5,"porteno":bool,"register_ok":bool,"english_natural":bool,"issue":string,"rewrite":string}]} — one entry per sentence.';
const asFile = ({ system, user }, schema) => `# SYSTEM\n${system}\n\n# TASK\n${user}\n\n${schema}\n`;

if (stage === 'prompts') {
  // Writers run in parallel, so each sees only what the course already has;
  // duplicates across batches are caught by `check`.
  batches.forEach((batch, n) => writeFileSync(file(`batch-${n}.prompt.md`), asFile(generationPrompt({ outline, unit, targets: batch, examples, existing, style }), DRAFT_SCHEMA)));
  console.log(`${unit.slug}: ${targets.length} new words, ${batches.length} batch(es), ${examples.length} example sentences, ${existing.length} already written\n`);
  console.log('Writer agent task, one per batch N:');
  console.log(`  Read ${file('batch-N.prompt.md')} in full: "# SYSTEM" is your role and style guide, "# TASK" the job. Use ONLY the listed words plus people's names; any other word fails an automatic check. Voseo only. Write the JSON to ${file('batch-N.json')} and check it parses.`);
  process.exit(0);
}

const checked = [];
for (let n = 0; n < batches.length; n++) {
  const { sentences } = readJson(`batch-${n}.json`);
  const hash = promptHash(readFileSync(file(`batch-${n}.prompt.md`), 'utf8'));
  const results = checkCandidates({ outline, unit, candidates: sentences, existingEs: [...existing, ...checked.filter((c) => c.ok).map((c) => c.candidate.es)] });
  checked.push(...results.map((r) => ({ ...r, hash })));
}
const passing = checked.map((c, i) => ({ c, i })).filter(({ c }) => c.ok);

if (stage === 'check') {
  console.log(`${checked.length} candidates, ${passing.length} pass the checks`);
  const why = new Map();
  for (const p of checked.flatMap((c) => c.problems)) {
    const key = p.replace(/"[^"]*"/g, '…');
    why.set(key, (why.get(key) ?? 0) + 1);
  }
  for (const [p, k] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${k}× ${p}`);
  // Which candidate failed and why, for the writer fixing them.
  const failing = checked.filter((c) => !c.ok).map((c) => `${c.candidate.es} = ${c.candidate.en}\n  ${c.problems.join('\n  ')}`);
  writeFileSync(file('failures.txt'), failing.join('\n') + (failing.length ? '\n' : ''));
  if (failing.length) console.log(`  each one, with its reasons: ${file('failures.txt')}`);
  // The judge sees only the sentences that passed, never the writer's prompt.
  const items = passing.map(({ c, i }) => ({ id: i, es: c.candidate.es, en: c.candidate.en }));
  writeFileSync(file('judge.prompt.md'), asFile(judgePrompt({ unit, style, items, kept: keptInSpanish(outline) }), JUDGE_SCHEMA));
  console.log('\nJudge agent task:');
  console.log(`  Read ${file('judge.prompt.md')} in full and score every sentence strictly, as a demanding porteño editor. Read no other file in that folder. Write the JSON to ${file('scores.json')} and check it parses.`);
  process.exit(0);
}

const scores = new Map(readJson('scores.json').scores.map((s) => [s.id, s]));
const { selected, rejected } = selectCandidates(checked, scores);
console.log(`selected ${selected.length}, rejected ${rejected.length}`);
for (const s of selected) console.log(`  ✔ [${s.target.form}] ${s.candidate.es} = ${s.candidate.en}`);
// Both tallies below count what the unit *will have*, not what this run added.
// A run that fills one gap — the empty batches trick — otherwise reports every
// other word as missing, and a warning that cries wolf is one you learn to skip.
const standing = known.filter((s) => ['approved', 'published'].includes(s.status) && s.unit_id === unit.id);
const count = new Map(targets.map((t) => [t.form, 0]));
const bump = (id) => {
  const form = targets.find((t) => t.id === id);
  if (form) count.set(form.form, count.get(form.form) + 1);
};
for (const s of selected) bump(s.target.id);
for (const s of standing) bump(s.target_form_id);
const short = [...count].filter(([, k]) => k < 4);
if (short.length) console.log(`  short of 4 sentences: ${short.map(([f, k]) => `${f} (${k})`).join(', ')}`);
// A word can be introduced by a unit and then never said in it — proper nouns
// especially, since nothing drills them. The prompt asks the writer to work
// them in; this is what checks that it did.
const spoken = new Set([...selected.map((s) => s.row), ...standing].flatMap((s) => (s.tokens ?? []).flatMap((t) => t.form_ids)));
const unsaid = outline.forms.filter((f) => f.unit_id === unit.id && !spoken.has(f.id));
if (unsaid.length) console.log(`  introduced but never said: ${unsaid.map((f) => f.form).join(', ')}`);
const reasons = new Map();
for (const r of rejected) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
for (const [reason, k] of reasons) console.log(`  ✖ ${k} ${reason}`);
for (const r of rejected.filter((x) => x.reason === 'below the judge bar').slice(0, 12)) console.log(`     ${r.candidate.es} — ${r.score.issue}`);

if (flags.has('--dry-run')) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}
const { kept, dropped } = saveCandidates({ selected, rejected, known, model: MODEL, status: 'published' });
console.log(`\nwrote ${kept} published sentences and ${dropped} discarded candidates`);
execFileSync('node', ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--import', new URL('../test/register.mjs', import.meta.url).pathname, new URL('./build-lessons.mjs', import.meta.url).pathname, unit.slug], { stdio: 'inherit' });
publishUnit(unit.id);
console.log(`${unit.slug} is published.`);
