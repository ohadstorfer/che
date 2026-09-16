#!/usr/bin/env node
// Offline scheduler evaluation (docs/learning-engine-spec.md §11.2): how well
// SM-2 (as a recall proxy) and FSRS-6 with default parameters predict whether
// a form was recalled, replaying every learner's srs_commits in order.
//
//   node scripts/engine/eval-scheduler.mjs [--from export.json]
//
// Switch criterion: ≥ 5,000 commits from ≥ 30 learners and fitted FSRS beating
// the SM-2 proxy by ≥ 0.02 log loss on held-out learners. Fitting FSRS needs
// its optimizer; until there is that much data, the default parameters say
// enough.
import { Rating, createEmptyCard, fsrs } from 'ts-fsrs';

import { auc, calibration, logLoss, sm2Recall } from './lib/metrics.mjs';
import { parseArgs, rows } from './lib/source.mjs';

const args = parseArgs();
const commits = rows(
  'srs_commits',
  `select user_id, form_id, seen, wrong, rating, elapsed_days, prev_interval, created_at
   from public.srs_commits order by user_id, form_id, created_at`,
  args,
);

const learners = new Set(commits.map((c) => c.user_id)).size;
console.log(`\n${commits.length} scheduling decisions from ${learners} learners\n`);

const scheduler = fsrs();
const cards = new Map();
const sm2 = [];
const fs = [];
const mean = [];
let recalled = 0;
let observed = 0;
for (const c of [...commits].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
  const key = `${c.user_id}|${c.form_id}`;
  const at = new Date(c.created_at);
  const y = c.wrong === 0 ? 1 : 0;
  const card = cards.get(key);
  // A first meeting predicts nothing: there was nothing to remember yet.
  if (card && c.elapsed_days != null) {
    sm2.push({ p: sm2Recall(c.elapsed_days, c.prev_interval ?? 0), y });
    fs.push({ p: scheduler.get_retrievability(card, at, false), y });
    mean.push({ p: observed ? recalled / observed : 0.85, y });
    recalled += y;
    observed += 1;
  }
  const grade = c.rating === 0 ? Rating.Again : c.rating === 1 ? Rating.Hard : c.rating === 3 ? Rating.Easy : Rating.Good;
  cards.set(key, scheduler.next(card ?? createEmptyCard(at), at, grade).card);
}

const line = (name, pairs) =>
  console.log(`${name.padEnd(22)} log loss ${logLoss(pairs).toFixed(4)}   AUC ${auc(pairs).toFixed(3)}   n=${pairs.length}`);
line('constant (running mean)', mean);
line('SM-2 proxy', sm2);
line('FSRS-6 default', fs);

console.log('\nCalibration (predicted → actual), FSRS-6 default');
for (const b of calibration(fs)) {
  if (b.n) console.log(`  ${b.from.toFixed(1)}–${b.to.toFixed(1)}  n=${String(b.n).padStart(5)}  ${b.predicted.toFixed(2)} → ${b.actual.toFixed(2)}`);
}
const ready = commits.length >= 5000 && learners >= 30;
console.log(
  `\n${ready ? 'Enough data to fit FSRS parameters and apply the switch criterion.' : 'Not enough data yet for the switch criterion (5,000 decisions, 30 learners).'}\n`,
);
