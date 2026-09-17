#!/usr/bin/env node
// Drafts a unit's sentences (docs/course-spec.md §4, docs/learning-engine-spec.md
// §13): asks for three candidates per sentence the unit needs, runs every one
// through the same checks hand-written content passes, has a separate judge
// score the survivors, and keeps the best intro and three best drills per new
// word. Kept sentences land as `ai_reviewed` for a native reviewer; the rest
// are recorded as `retired` with the reason, so the prompts can be tuned.
//
//   npm run course:generate -- <unit-slug> [--dry-run]
//
// --dry-run makes the model calls and prints what would be written, writing
// nothing. The calls cost money either way.
import { draftSentences, judgeSentences } from './lib/llm.mjs';
import {
  FORMS_PER_REQUEST,
  checkCandidates,
  generationPrompt,
  judgePrompt,
  promptHash,
  selectCandidates,
  styleSpec,
  targetsFor,
} from './lib/generate.mjs';
import { saveCandidates, sentencesOfUnits, unitFromArgs } from './lib/pipeline.mjs';
import { GENERATOR_MODEL } from './config.mjs';

let ctx;
try {
  ctx = unitFromArgs();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { outline, unit, flags } = ctx;
const dryRun = flags.has('--dry-run');
const style = styleSpec();

// Grounding: approved sentences from this unit and the three before it.
const nearby = outline.units.filter((u) => u.course_order <= unit.course_order && u.course_order >= unit.course_order - 3);
const known = sentencesOfUnits(nearby.map((u) => u.id));
const examples = known
  .filter((s) => ['approved', 'published'].includes(s.status))
  .sort((a, b) => Number(b.unit_id === unit.id) - Number(a.unit_id === unit.id))
  .slice(0, 30);
const existing = known.filter((s) => s.unit_id === unit.id).map((s) => s.es);

const targets = targetsFor(outline, unit);
console.log(`${unit.slug}: ${targets.length} new words, ${examples.length} example sentences, ${existing.length} already written`);

const checked = [];
const usage = { input: 0, output: 0 };
for (let i = 0; i < targets.length; i += FORMS_PER_REQUEST) {
  const batch = targets.slice(i, i + FORMS_PER_REQUEST);
  const prompt = generationPrompt({ outline, unit, targets: batch, examples, existing: [...existing, ...checked.filter((c) => c.ok).map((c) => c.candidate.es)], style });
  const hash = promptHash(prompt.system + prompt.user);
  process.stdout.write(`  drafting ${batch.map((f) => f.form).join(', ')} … `);
  const { candidates, usage: u } = await draftSentences(prompt);
  usage.input += u.input_tokens;
  usage.output += u.output_tokens;
  const results = checkCandidates({ outline, unit, candidates, existingEs: [...existing, ...checked.filter((c) => c.ok).map((c) => c.candidate.es)] });
  for (const r of results) checked.push({ ...r, hash });
  console.log(`${candidates.length} candidates, ${results.filter((r) => r.ok).length} pass the checks`);
}

// The judge sees only the sentences that passed, never the generator's prompt.
const scores = new Map();
const passing = checked.map((c, i) => ({ c, i })).filter(({ c }) => c.ok);
for (let i = 0; i < passing.length; i += 30) {
  const chunk = passing.slice(i, i + 30);
  const { scores: s, usage: u } = await judgeSentences(
    judgePrompt({ unit, style, items: chunk.map(({ c, i: idx }) => ({ id: idx, es: c.candidate.es, en: c.candidate.en })) }),
  );
  usage.input += u.input_tokens;
  usage.output += u.output_tokens;
  for (const card of s) scores.set(card.id, card);
}

const { selected, rejected } = selectCandidates(checked, scores);
console.log(`\nselected ${selected.length}, rejected ${rejected.length} · tokens in ${usage.input}, out ${usage.output}`);
for (const s of selected) console.log(`  ✔ [${s.target.form}] ${s.candidate.es} = ${s.candidate.en}`);

const reasons = new Map();
for (const r of rejected) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
for (const [reason, n] of reasons) console.log(`  ✖ ${n} ${reason}`);
for (const r of rejected.filter((x) => x.problems.length).slice(0, 8)) console.log(`     ${r.candidate.es}: ${r.problems[0]}`);

if (dryRun) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}

const { kept, dropped } = saveCandidates({ selected, rejected, known, model: GENERATOR_MODEL, status: 'ai_reviewed' });
console.log(`\nwrote ${kept} sentences for review and ${dropped} discarded candidates. Next: review them in the dashboard.`);
