import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tokenIndexOf } from '../../../src/lib/answers.ts';
import { arPacks, buildPackRound, decoyWords, toGapForm, toSentence } from '../../../src/lib/argentine.ts';
import { weakness } from '../../../src/lib/session.ts';

const state = (over) => ({
  id: 's',
  form_id: 'f',
  user_id: 'u',
  state: 'review',
  ease_factor: 2.5,
  interval_days: 6,
  repetitions: 2,
  lapses: 0,
  due_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  introduced_on: '2026-09-01',
  ...over,
});

test('weakness: overdue, lapsed and low-ease words come first', () => {
  const fresh = weakness(state({}));
  assert.ok(weakness(state({ due_at: new Date(Date.now() - 6 * 86_400_000).toISOString() })) > fresh);
  assert.ok(weakness(state({ lapses: 3 })) > fresh);
  assert.ok(weakness(state({ ease_factor: 1.7 })) > fresh);
});

const words = arPacks.flatMap((p) => p.words);

test('every Argentine example has its word as one gradable token', () => {
  for (const w of words) {
    const s = toSentence(w);
    const i = tokenIndexOf(s, `ar:${w.id}`);
    assert.ok(i >= 0, `${w.es}: "${w.gap}" not found in "${w.example.es}"`);
  }
});

test('a blank option never keeps its sentence-start capital', () => {
  const w = words.find((x) => x.gap === 'Atenti' || /^[A-ZÁÉÍÓÚ]/.test(x.gap) && /^[a-záéíóú]/.test(x.es));
  if (w) assert.equal(toGapForm(w).form.charAt(0), w.gap.charAt(0).toLocaleLowerCase('es'));
});

test('a first play teaches every word, then blanks each one', () => {
  const pack = arPacks[0];
  const round = buildPackRound(pack.words, true);
  assert.equal(round.filter((i) => i.kind === 'intro').length, pack.words.length);
  const gaps = round.filter((i) => i.kind === 'exercise' && i.item.mode === 'sentence_gap');
  assert.equal(gaps.length, pack.words.length);
});

test('a replay has no intro cards and asks about every word', () => {
  const pack = arPacks[0];
  const round = buildPackRound(pack.words, false);
  assert.equal(round.filter((i) => i.kind === 'intro').length, 0);
  const asked = new Set(
    round.flatMap((i) => (i.kind === 'exercise' ? (i.item.group ?? [i.item.form]).map((f) => f.id) : [])),
  );
  for (const w of pack.words) assert.ok(asked.has(`ar:${w.id}`), w.es);
});

test('clean packs never offer a rude word as a wrong answer', () => {
  const rude = new Set(arPacks.filter((p) => p.vulgar).flatMap((p) => p.words.map((w) => w.id)));
  for (const pack of arPacks.filter((p) => !p.vulgar)) {
    for (const w of decoyWords(pack)) assert.ok(!rude.has(w.id), `${pack.slug} offers ${w.es}`);
  }
});
