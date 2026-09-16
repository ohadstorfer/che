#!/usr/bin/env node
// Re-checks a unit's draft sentences in the database — the ones a reviewer sent
// back or edited — with the same gate as everything else: re-tokenized,
// accepted answers regenerated, and moved to `linted` when they pass. What
// fails stays a draft, with the findings recorded for the dashboard.
//
//   npm run course:lint -- <unit-slug>
import { buildContent } from './lib/content.mjs';
import { sentencesOfUnits, unitFromArgs, writeReviews, writeSentences } from './lib/pipeline.mjs';

let ctx;
try {
  ctx = unitFromArgs();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const { outline, unit } = ctx;
const drafts = sentencesOfUnits([unit.id], ['draft']);
if (!drafts.length) {
  console.log(`${unit.slug}: no drafts to lint.`);
  process.exit(0);
}

const updates = [];
const reviews = [];
for (const s of drafts) {
  const target = outline.forms.find((f) => f.id === s.target_form_id);
  const same = outline.forms.filter((f) => f.unit_id === unit.id && target && f.form === target.form);
  const { sentences, errors } = buildContent(
    outline,
    {
      [unit.slug]: {
        sentences: {
          s: {
            es: s.es,
            en: s.en,
            en_alt: s.en_alt ?? [],
            target: target ? (same.length > 1 ? `${target.form}/${target.pos}` : target.form) : '?',
            difficulty: s.difficulty,
            kind: s.kind,
          },
        },
      },
    },
    { source: s.source, status: 'draft' },
  );
  const row = sentences[0];
  const problems = errors.map((e) => e.replace(/^[^:]*: /, ''));
  if (row && !problems.length) {
    // Keep the id the row already has — learners' records point at it.
    updates.push({ ...row, id: s.id, status: 'linted' });
    reviews.push({ row_id: s.id, stage: 'lint', verdict: 'pass', notes: {} });
    console.log(`  ✔ ${s.es}`);
  } else {
    reviews.push({ row_id: s.id, stage: 'lint', verdict: 'fail', notes: { problems } });
    console.log(`  ✖ ${s.es}\n      ${problems.join('\n      ')}`);
  }
}
writeSentences(updates);
writeReviews(reviews);
console.log(`\n${updates.length} linted, ${drafts.length - updates.length} still drafts.`);
