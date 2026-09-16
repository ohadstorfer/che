import assert from 'node:assert/strict';
import { test } from 'node:test';

import { auc, calibration, logLoss, perModeBaseline, replayElo, sessionsFromLogs, sm2Recall } from '../lib/metrics.mjs';

test('log loss and AUC on known pairs', () => {
  const pairs = [
    { p: 0.9, y: 1 },
    { p: 0.8, y: 1 },
    { p: 0.3, y: 0 },
    { p: 0.6, y: 0 },
  ];
  assert.equal(auc(pairs), 1);
  assert.ok(Math.abs(logLoss(pairs) - 0.4004) < 1e-3);
  assert.ok(Number.isNaN(auc([{ p: 0.5, y: 1 }])));
});

test('calibration buckets by predicted probability', () => {
  const bins = calibration([{ p: 0.05, y: 0 }, { p: 0.95, y: 1 }, { p: 0.91, y: 0 }], 10);
  assert.equal(bins[0].n, 1);
  assert.equal(bins[9].n, 2);
  assert.equal(bins[9].actual, 0.5);
});

test('logs group into HLR sessions with history and lag', () => {
  const at = (d, h = 0) => new Date(Date.UTC(2026, 8, d, h)).toISOString();
  const logs = [
    { user_id: 'u', form_id: 'f', round_id: 'r1', correct: true, reviewed_at: at(1) },
    { user_id: 'u', form_id: 'f', round_id: 'r1', correct: false, reviewed_at: at(1, 1) },
    { user_id: 'u', form_id: 'f', round_id: 'r2', correct: true, reviewed_at: at(3) },
    { user_id: 'u', form_id: 'g', round_id: 'r2', correct: true, reviewed_at: at(3) },
  ];
  const s = sessionsFromLogs(logs).filter((x) => x.form_id === 'f');
  assert.deepEqual(
    s.map(({ seen, correct, history_seen, history_correct, p_recall }) => ({ seen, correct, history_seen, history_correct, p_recall })),
    [
      { seen: 2, correct: 1, history_seen: 0, history_correct: 0, p_recall: 0.5 },
      { seen: 1, correct: 1, history_seen: 2, history_correct: 1, p_recall: 1 },
    ],
  );
  assert.equal(s[1].delta_days, 2);
});

test('the SM-2 proxy is 90% at the due date', () => {
  assert.ok(Math.abs(sm2Recall(7, 7) - 0.9) < 1e-9);
  assert.ok(sm2Recall(1, 7) > 0.9 && sm2Recall(14, 7) < 0.9);
});

test('Elo learns that a hard exercise is hard and beats the constant on it', () => {
  const logs = [];
  for (let i = 0; i < 400; i++) {
    const hard = i % 2 === 0;
    logs.push({
      user_id: `u${i % 5}`,
      form_id: hard ? 'hard' : 'easy',
      mode: hard ? 'typing' : 'multiple_choice',
      correct: hard ? i % 4 === 0 : true,
      is_retry: false,
      reviewed_at: new Date(Date.UTC(2026, 8, 1) + i * 60_000).toISOString(),
    });
  }
  const { pairs, difficulty } = replayElo(logs);
  assert.ok(difficulty.get('mode:typing') > difficulty.get('mode:multiple_choice'));
  const tail = pairs.slice(200);
  const constant = tail.map(({ y }) => ({ p: 0.85, y }));
  assert.ok(logLoss(tail) < logLoss(constant), `${logLoss(tail)} vs ${logLoss(constant)}`);
  assert.equal(perModeBaseline(logs).length, 400);
});
