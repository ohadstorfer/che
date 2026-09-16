import assert from 'node:assert/strict';
import { test } from 'node:test';

import { recapItems } from '../../../src/lib/lesson.ts';
import { glueSeen } from '../../../src/lib/sentences.ts';
import { earnedTail, mistakeFormIds, promoteTail, promotedMode } from '../../../src/lib/session.ts';
import { ladderFor } from '../../../src/lib/sentences.ts';
import { conceptScores, conceptsOf, weakestConcept } from '../../../src/lib/concepts.ts';
import { forms, formById, formOf, iso, learner, state, unitBySlug } from './fixture.mjs';

const PRODUCTION = ['word_build', 'typing', 'listen_build', 'sentence_build', 'sentence_listen'];

test('the tail promotes one step, and leaves intros, re-asks and the top step alone', () => {
  const data = learner();
  const cafe = formOf('café');
  const sentence = data.sentences.find((s) => s.form_ids.includes(cafe.id));
  const st = state(cafe);
  const queue = [
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en' },
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en' },
    { form: cafe, state: st, mode: 'word_build', direction: 'en_to_es' },
    { form: cafe, state: null, mode: 'word_build', direction: 'en_to_es' },
    { form: cafe, state: st, mode: 'sentence_meaning', direction: 'en_to_es', sentence },
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en', isRetry: true },
    { form: cafe, state: null, mode: 'multiple_choice', direction: 'es_to_en', isIntro: true },
    { form: cafe, state: st, mode: 'typing', direction: 'en_to_es' },
  ];
  const { queue: next, promoted } = promoteTail(queue, 1, new Map());
  assert.deepEqual(
    next.map((i) => i.mode),
    ['multiple_choice', 'word_build', 'typing', 'word_build', 'sentence_gap', 'multiple_choice', 'multiple_choice', 'typing'],
  );
  assert.equal(promoted, 3);
  assert.equal(next[1].direction, 'en_to_es');
  assert.equal(promotedMode({ ...queue[4], mode: 'sentence_build' }, new Map()), null, 'no audio, no listening step');
});

test('the tail is earned by the first N first tries all right', () => {
  const ladder = ladderFor(0);
  assert.ok(earnedTail([true, true, true, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, false, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, true, true, true, true], ladderFor(-1)), 'an easier ladder has no tail');
});

test('a unit recap asks its weakest forms once each, half of them to produce', () => {
  const unit = unitBySlug('un-cafe-por-favor');
  const unitForms = forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn');
  assert.ok(unitForms.length >= 6);
  const states = unitForms.map((f, i) => state(f, { lapses: i % 3, ease_factor: 2.5 - (i % 4) / 10, due_at: i % 2 ? iso(-1) : iso(3) }));
  const data = learner(states);
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn' && f.unit_order <= unit.course_order);
  for (let run = 0; run < 20; run++) {
    const items = recapItems(data, unit, 'unit', 6, deck, glueSeen(data.sentences), new Date().toISOString());
    assert.ok(items.length > 0 && items.length <= 6);
    const ids = items.flatMap((i) => (i.mode === 'sentence_gap' || !i.sentence ? [i.form.id] : []));
    assert.equal(new Set(ids).size, ids.length, 'no form asked twice on its own');
    assert.ok(items.every((i) => i.mode !== 'sentence_meaning'), 'never below the gap');
    const production = items.filter((i) => PRODUCTION.includes(i.mode)).length;
    assert.ok(production >= Math.ceil(items.length / 2) || items.every((i) => i.mode === 'sentence_gap'), items.map((i) => i.mode).join());
    for (const item of items.filter((i) => !i.sentence)) {
      const st = states.find((s) => s.form_id === item.form.id);
      assert.equal(!!item.filler, !(st.due_at <= new Date().toISOString()), 'not-due words are filler');
    }
  }
});

test('mistakes are the forms whose latest commit in two weeks was a miss', () => {
  const rows = [
    { form_id: 'a', rating: 0, created_at: iso(-1) },
    { form_id: 'b', rating: 1, created_at: iso(-3) },
    { form_id: 'b', rating: 2, created_at: iso(-2) },
    { form_id: 'c', rating: 1, created_at: iso(-5) },
    { form_id: 'd', rating: 0, created_at: iso(-20) },
  ];
  assert.deepEqual(mistakeFormIds(rows), ['a', 'c']);
});

test('concepts come from features; weak ones need enough tries', () => {
  const soy = formOf('soy');
  assert.ok(conceptsOf(soy).includes('ser'));
  assert.deepEqual(conceptsOf({ lemma: 'mirar', pos: 'verb', features: { mood: 'imp', voseo: true } }), ['verbo.imperativo.vos']);
  const logs = Array.from({ length: 10 }, (_, i) => ({ form_id: soy.id, correct: i < 6 }));
  const scores = conceptScores(logs, formById);
  assert.equal(weakestConcept(scores)?.concept, scores[0].concept);
  assert.ok(scores[0].accuracy < 0.8);
  assert.equal(conceptScores(logs.slice(0, 5), formById).length, 0);
});
