import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BUILD_TILES_MAX,
  BUILD_TILES_MIN,
  DEFAULT_LADDER,
  buildTileCeiling,
  buildTilesOf,
  buildableClause,
  clauseCountOf,
  hasLockedGlue,
  ladderFor,
  ladderOffset,
  rungFor,
  sentenceCap,
  tooLongToBuild,
} from '../../../src/lib/sentences.ts';
import { clauseOf } from '../../../src/lib/answers.ts';
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

// --- how much a build may ask for ------------------------------------------

/** A sentence with the tokens spelled out, past the rung where tiles begin. */
const built = (es) => ({
  id: 'x',
  unit_id: 'u',
  unit_order: 1,
  es,
  en: '',
  en_alt: [],
  es_alt: [],
  audio_path: null,
  voice_id: null,
  target_form_id: 'f0',
  difficulty: 3,
  tokens: es.split(/\s+/).map((surface, i) => ({ surface, form_ids: [`f${i}`] })),
  form_ids: es.split(/\s+/).map((_, i) => `f${i}`),
  shown: { shown_count: 9, correct_count: 9, last_shown_at: null },
});

test('the tile ceiling grows with what she has already rebuilt', () => {
  assert.equal(buildTileCeiling(0), BUILD_TILES_MIN);
  assert.equal(buildTileCeiling(20), BUILD_TILES_MIN + 2);
  assert.equal(buildTileCeiling(20, 1), BUILD_TILES_MIN + 3, 'a good run adds a tile');
  assert.equal(buildTileCeiling(20, -1), BUILD_TILES_MIN + 1, 'a bad one takes it away');
  assert.equal(buildTileCeiling(9999), BUILD_TILES_MAX, 'and it stops somewhere');
});

test('a sentence in three pieces is never rebuilt whole, however far along she is', () => {
  const chain = built('Che, ¿sos vos? ¡Hola! ¿Todo bien?');
  const far = ladderFor(0, { passed: 9999 });
  assert.equal(buildTilesOf(chain), 6);
  assert.equal(clauseCountOf(chain), 3);
  assert.ok(!tooLongToBuild(built('¿Sos vos?'), far));
  assert.ok(tooLongToBuild(chain, far), 'six tiles are within the ceiling; three clauses never are');
});

test('over the ceiling, the build asks for the clause the drilled word is in', () => {
  const chain = built('Che, ¿sos vos? ¡Hola! ¿Todo bien?');
  const start = ladderFor(0, { passed: 0 });
  // "vos" is the third token, so the first clause — "Che, ¿sos vos?".
  assert.equal(buildableClause(chain, 'f2', start), 0);
  assert.equal(buildableClause(chain, 'f3', start), 1, 'and "¡Hola!" is the second');
  assert.equal(rungFor(chain, new Map(), start), 'build', 'a clause it can ask for keeps it on tiles');
});

test('a long sentence with nothing smaller to ask for stays at the gap', () => {
  const long = built('Yo soy de Buenos Aires y ella no es de acá');
  const start = ladderFor(0, { passed: 0 });
  assert.equal(clauseCountOf(long), 1);
  assert.ok(tooLongToBuild(long, start));
  assert.equal(buildableClause(long, 'f0', start), null);
  assert.equal(rungFor(long, new Map(), start), 'gap');
  // Far enough along, the whole thing is hers to build.
  assert.equal(rungFor(long, new Map(), ladderFor(0, { passed: 9999 })), 'build');
});

test('a clause narrows the sentence it is cut from', () => {
  const chain = built('Che, ¿sos vos? ¡Hola! ¿Todo bien?');
  const first = clauseOf(chain, 0);
  assert.equal(first.es, 'Che, ¿sos vos?');
  assert.deepEqual(first.tokens.map((t) => t.surface), ['Che,', '¿sos', 'vos?']);
  assert.deepEqual(first.form_ids, ['f0', 'f1', 'f2']);
  assert.equal(clauseOf(chain, 2).es, '¿Todo bien?');
  // An alternative that cuts the same way lends its matching piece.
  const alt = { ...chain, es_alt: ['Che, ¿vos sos? ¡Hola! ¿Todo bien?', '¿Sos vos?'] };
  assert.deepEqual(clauseOf(alt, 0).es_alt, ['Che, ¿vos sos?']);
});
