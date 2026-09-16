import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DEFAULT_LADDER,
  hasLockedGlue,
  ladderFor,
  ladderOffset,
  rungFor,
  sentenceCap,
} from '../../../src/lib/sentences.ts';
import { exercisesFor } from '../../../src/lib/session.ts';
import { initialEase } from '../../../src/lib/srs.ts';
import { forms, formOf, learner, state, unitBySlug } from './fixture.mjs';

test('the offset follows recent scores, and needs three rounds to say anything', () => {
  assert.equal(ladderOffset([100, 100]), 0);
  assert.equal(ladderOffset([100, 96, 95]), 1);
  assert.equal(ladderOffset([70, 80, 70, 60]), -1);
  assert.equal(ladderOffset([90, 88, 85]), 0);
  assert.equal(ladderOffset([100, 100, 100, 100, 100, 0]), 1, 'only the last five count');
});

test('a harder ladder climbs sooner; an easier one later', () => {
  const s = learner().sentences.find((x) => x.form_ids.length > 0);
  const seen = new Map();
  const passes = (n) => ({ ...s, shown: { shown_count: n, correct_count: n, last_shown_at: null } });
  const unlocked = ladderFor(1, { placedThrough: 99, glue: forms.filter((f) => f.is_glue) });
  assert.equal(rungFor(passes(0), seen, ladderFor(0)), 'meaning');
  assert.equal(rungFor(passes(1), { ...seen }, { ...ladderFor(1), unlockedGlue: unlocked.unlockedGlue }), 'build');
  assert.equal(rungFor(passes(2), seen, { ...ladderFor(-1), unlockedGlue: unlocked.unlockedGlue }), 'gap');
});

test('placement unlocks glue and starts skipped sentences at the gap', () => {
  const data = learner();
  const withGlue = data.sentences.find((s) => s.tokens.some((t) => t.glue));
  assert.ok(withGlue, 'the demo course has a sentence with glue');
  const seen = new Map();
  assert.ok(hasLockedGlue(withGlue, seen, DEFAULT_LADDER));
  const placed = ladderFor(0, { placedThrough: withGlue.unit_order, glue: forms.filter((f) => f.is_glue) });
  assert.ok(!hasLockedGlue(withGlue, seen, placed));
  assert.equal(rungFor(withGlue, seen, placed), 'gap');
  assert.equal(sentenceCap([], 0, DEFAULT_LADDER), 2);
  assert.equal(sentenceCap([], 0, placed), 4);
  assert.equal(sentenceCap([], 0, ladderFor(-1)), 1);
});

test('typing arrives with settledDays, which the ladder moves', () => {
  const cafe = formOf('café');
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn').slice(0, 10);
  const at = (days, ladder) => exercisesFor(cafe, state(cafe, { interval_days: days }), deck, ladder);
  let typedWhenHarder = false;
  for (let i = 0; i < 40; i++) {
    assert.ok(!at(5, ladderFor(0)).includes('typing'), 'not settled at 5 days by default');
    if (at(5, ladderFor(1)).includes('typing')) typedWhenHarder = true;
  }
  assert.ok(typedWhenHarder, 'settled at 5 days on a harder ladder');
});

test('the ease prior only lowers gerunds, imperatives and irregulars, and only when on', () => {
  assert.equal(initialEase({ features: { verb_form: 'ger' } }, true), 2.3);
  assert.equal(initialEase({ features: { mood: 'imp' } }, true), 2.3);
  assert.equal(initialEase({ features: { irregular: true } }, true), 2.3);
  assert.equal(initialEase({ features: { person: 1 } }, true), 2.5);
  assert.equal(initialEase({ features: { verb_form: 'ger' } }, false), 2.5);
  assert.ok(unitBySlug('hola-che'));
});
