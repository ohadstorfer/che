#!/usr/bin/env node
// Offline Elo / IRT difficulty model (docs/learning-engine-spec.md §4.3):
// replays first-try answers in time order and reports whether the model
// predicts them better than each exercise type's running accuracy. Nothing is
// written; the online model is gated on ≥ 30 learners with ≥ 10 rounds each and
// a log-loss gain of ≥ 0.02.
//
//   node scripts/engine/fit-elo.mjs [--from export.json]
import { auc, calibration, logLoss, perModeBaseline, replayElo } from './lib/metrics.mjs';
import { parseArgs, rows } from './lib/source.mjs';

const args = parseArgs();
const logs = rows(
  'review_logs',
  `select user_id, form_id, mode, correct, is_retry, reviewed_at
   from public.review_logs where correct is not null order by reviewed_at`,
  args,
);

const { pairs, difficulty } = replayElo(logs);
const base = perModeBaseline(logs);
console.log(`\n${pairs.length} first-try answers\n`);
console.log(`per-mode baseline  log loss ${logLoss(base).toFixed(4)}   AUC ${auc(base).toFixed(3)}`);
console.log(`Elo                log loss ${logLoss(pairs).toFixed(4)}   AUC ${auc(pairs).toFixed(3)}`);
const gain = logLoss(base) - logLoss(pairs);
console.log(`gain ${gain.toFixed(4)} ${gain >= 0.02 ? '(clears the 0.02 bar)' : '(below the 0.02 bar)'}`);

console.log('\nCalibration (predicted → actual)');
for (const b of calibration(pairs)) {
  if (b.n) console.log(`  ${b.from.toFixed(1)}–${b.to.toFixed(1)}  n=${String(b.n).padStart(5)}  ${b.predicted.toFixed(2)} → ${b.actual.toFixed(2)}`);
}
const hardest = [...difficulty].filter(([k]) => k.startsWith('mode:')).sort((a, b) => b[1] - a[1]);
console.log('\nExercise types, hardest first');
for (const [k, v] of hardest) console.log(`  ${k.slice(5).padEnd(18)} ${v.toFixed(3)}`);
console.log('');
