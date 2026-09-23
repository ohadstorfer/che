#!/usr/bin/env node
// The adversarial judge over a unit's linted sentences (docs/course-spec.md §4,
// rubric in docs/learning-engine-spec.md §13.3). It never approves: every
// sentence moves to `ai_reviewed` with its score card and any proposed rewrite,
// and the native reviewer decides.
//
//   npm run course:review -- <unit-slug>
import { JUDGE_MODEL } from './config.mjs';
import { judgePrompt, keptInSpanish, passes, styleSpec } from './lib/generate.mjs';
import { judgeSentences } from './lib/llm.mjs';
import { sentencesOfUnits, unitFromArgs, writeReviews, writeSentences } from './lib/pipeline.mjs';

let ctx;
try {
  ctx = unitFromArgs();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { unit, outline } = ctx;
const linted = sentencesOfUnits([unit.id], ['linted']);
if (!linted.length) {
  console.log(`${unit.slug}: nothing linted to review.`);
  process.exit(0);
}
const style = styleSpec();
const reviews = [];
for (let i = 0; i < linted.length; i += 30) {
  const chunk = linted.slice(i, i + 30);
  const { scores } = await judgeSentences(judgePrompt({ unit, style, kept: keptInSpanish(outline), items: chunk.map((s, j) => ({ id: i + j, es: s.es, en: s.en })) }));
  for (const card of scores) {
    const s = linted[card.id];
    if (!s) continue;
    const ok = passes(card);
    reviews.push({ row_id: s.id, stage: 'ai', verdict: ok ? 'pass' : 'flag', notes: { scores: card, model: JUDGE_MODEL } });
    console.log(`  ${ok ? '✔' : '⚑'} ${s.es}${card.issue ? `  — ${card.issue}` : ''}${card.rewrite ? `  → ${card.rewrite}` : ''}`);
  }
}
writeSentences(linted.map((s) => ({ ...s, attribution: null, audio_path: null, status: 'ai_reviewed' })));
writeReviews(reviews);
console.log(`\n${linted.length} sentences ready for native review.`);
