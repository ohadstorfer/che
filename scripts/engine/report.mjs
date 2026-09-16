#!/usr/bin/env node
// The engine's accuracy report (docs/learning-engine-spec.md §2): how rounds
// land against the 85–92% first-try band, which exercises fail, and where
// people quit. Read-only.
//
//   npm run engine:report                     the linked project, last 8 weeks
//   npm run engine:report -- --since 2026-09-01
//   npm run engine:report -- --from export.json
import { parseArgs, rows } from './lib/source.mjs';

const args = parseArgs();
const since = args.since ?? new Date(Date.now() - 56 * 86_400_000).toISOString().slice(0, 10);

const rounds = rows(
  'rounds',
  `select kind, score, finished_at, started_at, planned_items, answered, ladder_offset, promoted
   from public.rounds where started_at >= '${since}'`,
  args,
);
const logs = rows(
  'review_logs',
  `select mode, correct, is_retry, promoted, latency_ms, item_index, round_id
   from public.review_logs where correct is not null and reviewed_at >= '${since}'`,
  args,
);

const pct = (n) => (n == null || Number.isNaN(n) ? '   –' : `${(100 * n).toFixed(0).padStart(3)}%`);
const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

console.log(`\nRounds since ${since}\n`);
console.log('kind         finished abandoned  avg score  in band  above  below');
const kinds = [...new Set(rounds.map((r) => r.kind))].sort();
for (const k of kinds) {
  const own = rounds.filter((r) => r.kind === k);
  const done = own.filter((r) => r.finished_at && r.score != null);
  const avg = done.length ? done.reduce((s, r) => s + r.score, 0) / done.length : null;
  const inBand = done.filter((r) => r.score >= 85 && r.score <= 92).length;
  const above = done.filter((r) => r.score > 92).length;
  const below = done.filter((r) => r.score < 85).length;
  console.log(
    `${k.padEnd(12)} ${String(done.length).padStart(8)} ${String(own.length - done.length).padStart(9)}  ${
      avg == null ? '      –' : avg.toFixed(1).padStart(7)
    }  ${pct(done.length ? inBand / done.length : null)}   ${pct(done.length ? above / done.length : null)}  ${pct(
      done.length ? below / done.length : null,
    )}`,
  );
}

console.log('\nFirst-try accuracy by exercise\n');
console.log('mode               tries  right  median ms  promoted right');
const RUNG = { sentence_meaning: 'rung: meaning', sentence_gap: 'rung: gap', sentence_build: 'rung: build', sentence_listen: 'rung: build' };
for (const mode of [...new Set(logs.map((l) => l.mode))].sort()) {
  const first = logs.filter((l) => l.mode === mode && !l.is_retry);
  const promoted = first.filter((l) => l.promoted);
  console.log(
    `${mode.padEnd(18)} ${String(first.length).padStart(5)}  ${pct(first.filter((l) => l.correct).length / first.length)}  ${String(
      median(first.map((l) => l.latency_ms)) ?? '–',
    ).padStart(9)}  ${promoted.length ? pct(promoted.filter((l) => l.correct).length / promoted.length) : '   –'}   ${RUNG[mode] ?? ''}`,
  );
}

console.log('\nWhere abandoned rounds stopped (last answered item)\n');
const lastIndex = new Map();
for (const l of logs) lastIndex.set(l.round_id, Math.max(lastIndex.get(l.round_id) ?? -1, l.item_index ?? -1));
const abandoned = rounds.filter((r) => !r.finished_at);
const buckets = new Map();
for (const r of abandoned) {
  const at = lastIndex.get(r.id) ?? -1;
  const bucket = at < 0 ? 'before the first' : at < 6 ? '1–6' : at < 12 ? '7–12' : '13+';
  buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
}
for (const [b, n] of buckets) console.log(`${b.padEnd(18)} ${n}`);
if (!abandoned.length) console.log('none');

console.log('\nTuning table: docs/learning-engine-spec.md §2.3 — move one constant at a time, wait two weeks.\n');
