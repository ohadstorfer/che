// Pure measurement helpers for the engine scripts (docs/learning-engine-spec.md
// §2, §4.3, §11.2). No I/O, so the tests can hold them to exact numbers.

const EPS = 1e-6;
const clampP = (p) => Math.min(1 - EPS, Math.max(EPS, p));

/** Mean binary log loss of predictions `p` against outcomes `y` (0/1). */
export function logLoss(pairs) {
  if (!pairs.length) return NaN;
  return -pairs.reduce((s, { p, y }) => s + (y ? Math.log(clampP(p)) : Math.log(1 - clampP(p))), 0) / pairs.length;
}

/** Area under the ROC curve (ties counted half). NaN without both classes. */
export function auc(pairs) {
  const pos = pairs.filter((x) => x.y).map((x) => x.p);
  const neg = pairs.filter((x) => !x.y).map((x) => x.p);
  if (!pos.length || !neg.length) return NaN;
  let wins = 0;
  for (const a of pos) for (const b of neg) wins += a > b ? 1 : a === b ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}

/** Predicted vs actual in `bins` equal-width buckets of predicted probability. */
export function calibration(pairs, bins = 10) {
  const out = Array.from({ length: bins }, (_, i) => ({ from: i / bins, to: (i + 1) / bins, n: 0, predicted: 0, actual: 0 }));
  for (const { p, y } of pairs) {
    const b = out[Math.min(bins - 1, Math.floor(clampP(p) * bins))];
    b.n += 1;
    b.predicted += p;
    b.actual += y ? 1 : 0;
  }
  return out.map((b) => ({ ...b, predicted: b.n ? b.predicted / b.n : null, actual: b.n ? b.actual / b.n : null }));
}

/**
 * Review logs grouped the way half-life regression reads them: one row per
 * (round, form), with how often the form was seen and got right in that round
 * and over everything before it.
 */
export function sessionsFromLogs(logs) {
  const sorted = [...logs].sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
  const rounds = new Map();
  for (const l of sorted) {
    if (!l.round_id || l.correct == null) continue;
    const key = `${l.user_id}|${l.form_id}|${l.round_id}`;
    const r = rounds.get(key) ?? { user_id: l.user_id, form_id: l.form_id, round_id: l.round_id, at: l.reviewed_at, seen: 0, correct: 0 };
    r.seen += 1;
    if (l.correct) r.correct += 1;
    rounds.set(key, r);
  }
  const history = new Map();
  const out = [];
  for (const r of [...rounds.values()].sort((a, b) => a.at.localeCompare(b.at))) {
    const hk = `${r.user_id}|${r.form_id}`;
    const h = history.get(hk) ?? { seen: 0, correct: 0, last: null };
    out.push({
      ...r,
      history_seen: h.seen,
      history_correct: h.correct,
      delta_days: h.last ? (Date.parse(r.at) - Date.parse(h.last)) / 86_400_000 : null,
      p_recall: r.correct / r.seen,
    });
    history.set(hk, { seen: h.seen + r.seen, correct: h.correct + r.correct, last: r.at });
  }
  return out;
}

/** SM-2 has no model of recall; this proxy assumes 90% at the due date and the
 *  same exponential curve on either side of it. */
export const sm2Recall = (elapsedDays, intervalDays) =>
  intervalDays > 0 ? Math.pow(0.9, elapsedDays / intervalDays) : 0.9;

/**
 * Elo / IRT learner-and-difficulty model (Birdbrain V1 as described):
 * P(correct) = σ(θ_user − Σ d_k / n) over an exercise's components, one SGD
 * step per first-try answer. Returns the prediction made *before* each update,
 * so the pairs measure the model honestly.
 */
export function replayElo(logs, { etaUser = 0.1, etaDifficulty = 0.05 } = {}) {
  const theta = new Map();
  const d = new Map();
  const pairs = [];
  const sorted = [...logs].filter((l) => !l.is_retry && l.correct != null).sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
  for (const l of sorted) {
    const components = [`mode:${l.mode}`, `form:${l.form_id}`];
    const t = theta.get(l.user_id) ?? 0;
    const sumD = components.reduce((s, c) => s + (d.get(c) ?? 0), 0) / components.length;
    const p = 1 / (1 + Math.exp(-(t - sumD + 2)));
    const y = l.correct ? 1 : 0;
    pairs.push({ p, y, mode: l.mode });
    const e = y - p;
    theta.set(l.user_id, t + etaUser * e);
    for (const c of components) d.set(c, (d.get(c) ?? 0) - (etaDifficulty * e) / components.length);
  }
  return { pairs, theta, difficulty: d };
}

/** The baseline a model has to beat: each mode's running mean accuracy. */
export function perModeBaseline(logs) {
  const tally = new Map();
  const pairs = [];
  const sorted = [...logs].filter((l) => !l.is_retry && l.correct != null).sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
  for (const l of sorted) {
    const t = tally.get(l.mode) ?? { n: 1, right: 0.85 };
    pairs.push({ p: t.right / t.n, y: l.correct ? 1 : 0 });
    tally.set(l.mode, { n: t.n + 1, right: t.right + (l.correct ? 1 : 0) });
  }
  return pairs;
}
