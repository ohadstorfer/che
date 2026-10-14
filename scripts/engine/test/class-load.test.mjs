// Opening a class (docs/class-loading.md): what is worked out from the course
// alone is worked out once and kept. Keeping it may not change what comes out,
// and nothing kept may carry one class's record into the next.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { clearContentCache, onContentCleared, setContentDisk, stampHash } from '../../../src/lib/content-cache.ts';
import { resolveSlots } from '../../../src/lib/lesson.ts';
import { clearMeaningMemos, closeness, senseBehind, standsAlone, withMeanings } from '../../../src/lib/meanings.ts';
import { glueSeen, hasLockedGlue, loadSentenceRowsInReach, sentencesOf, toSentence } from '../../../src/lib/sentences.ts';
import { course, formById, forms, state, units } from './fixture.mjs';

// The demo course's tokens say nothing of what they mean there, so each is
// given a rendering of its word's gloss the way sentences give them: as it
// stands, behind an article, as a question, and with a word too many.
const RENDER = [(s) => s, (s) => `the ${s}`, (s) => `do ${s}`, (s) => `${s} not`, (s) => s.split(' ').reverse().join(' ')];
let nth = 0;
const rows = course.sentences
  .filter((s) => s.status === 'published')
  .map((s) => ({
    ...s,
    tokens: s.tokens.map((t) => {
      const sense = formById.get(t.form_ids[0])?.gloss_en.split(/[,;(]/)[0].trim();
      return sense ? { ...t, gloss: RENDER[nth++ % RENDER.length](sense) } : t;
    }),
  }));
const shownRow = (r, n) => ({ sentence_id: r.id, shown_count: n, correct_count: n, last_shown_at: '2026-10-01T00:00:00Z' });

/** A copy of meanings.ts that has kept nothing yet. */
let copies = 0;
const freshMeanings = () => import(`../../../src/lib/meanings.ts?fresh=${++copies}`);

test('a kept answer is the answer: meanings come out as from a module that kept nothing', async () => {
  // Two learners one after the other through the same module, so the second
  // is answered from what the first left behind.
  const learners = [
    { shown: rows.map((r, i) => shownRow(r, i % 3)), reached: 4 },
    { shown: rows.map((r, i) => shownRow(r, (i * 7) % 5)), reached: 30 },
  ];
  for (const { shown, reached } of learners) {
    const sentences = sentencesOf(rows, forms, shown);
    const fresh = await freshMeanings();
    assert.deepEqual(withMeanings(forms, sentences, reached), fresh.withMeanings(forms, sentences, reached));
  }
});

test('the helpers answer the same warm, cold, and after a clear', async () => {
  const fresh = await freshMeanings();
  const pairs = rows.flatMap((r) =>
    r.tokens.flatMap((t) => (t.gloss ? t.form_ids.map((id) => [t.gloss, formById.get(id).gloss_en]) : [])),
  );
  assert.ok(pairs.length > 50);
  // Not all one answer, or the comparison proves little.
  assert.equal(new Set(pairs.map(([m, g]) => closeness(m, g))).size, 3);
  for (const round of [0, 1, 2]) {
    if (round === 2) clearMeaningMemos();
    for (const [meaning, gloss] of pairs) {
      assert.equal(standsAlone(meaning, gloss), fresh.standsAlone(meaning, gloss));
      assert.equal(senseBehind(meaning, gloss), fresh.senseBehind(meaning, gloss));
      assert.equal(closeness(meaning, gloss), fresh.closeness(meaning, gloss));
    }
  }
  // An answer is kept for the pair, not for either half of it.
  assert.equal(closeness('you are', 'you are'), 2);
  assert.equal(closeness('you are', 'to go'), 0);
  assert.equal(closeness('are you', 'you are'), 1);
  assert.equal(standsAlone('you know', 'you know'), true);
  assert.equal(standsAlone('you know', 'to park'), false);
  assert.equal(standsAlone("you don't know", 'you know'), false);
  assert.equal(senseBehind('he came', 'came (he/she came), arrived'), 'came (he/she came)');
  assert.equal(senseBehind('he came', 'arrived'), null);
});

test('a sentence is shaped once, and each class gets its own record on it', () => {
  const first = sentencesOf(rows, forms, [shownRow(rows[0], 2)]);
  const second = sentencesOf(rows, forms, []);
  // As toSentence has always made them.
  assert.deepEqual(first, rows.map((r, i) => toSentence(r, formById, i === 0 ? shownRow(r, 2) : undefined)));
  // The shape is kept…
  assert.equal(first[0].tokens, second[0].tokens);
  // …the sentence and her record are not.
  assert.notEqual(first[0], second[0]);
  assert.equal(first[0].shown.shown_count, 2);
  assert.equal(second[0].shown, null);
  // What a round writes on its sentence (recordShown) stays in that round.
  first[1].shown = { shown_count: 9, correct_count: 9, last_shown_at: null };
  first[0].shown.shown_count = 5;
  const third = sentencesOf(rows, forms, [shownRow(rows[0], 2)]);
  assert.equal(third[1].shown, null);
  assert.equal(third[0].shown.shown_count, 2);
});

test('building a lesson changes nothing of a kept shape', () => {
  const deepFreeze = (o) => {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      for (const v of Object.values(o)) deepFreeze(v);
    }
    return o;
  };
  const sentences = sentencesOf(rows, forms, rows.map((r) => shownRow(r, 1)));
  // Everything shared between classes, frozen: a write to it throws.
  for (const s of sentences) for (const key of ['tokens', 'form_ids', 'en_alt', 'es_alt']) deepFreeze(s[key]);
  const states = forms.filter((f) => !f.is_glue).map((f) => state(f, { due_at: '2026-01-01T00:00:00Z' }));
  const withThem = withMeanings(forms, sentences, 30);
  const data = {
    forms: withThem,
    formById: new Map(withThem.map((f) => [f.id, f])),
    states,
    stateByForm: new Map(states.map((s) => [s.form_id, s])),
    sentences,
  };
  let built = 0;
  for (const lesson of course.lessons) {
    const unit = units.find((u) => u.id === lesson.unit_id);
    const slots = course.lesson_slots.filter((s) => s.lesson_id === lesson.id).sort((a, b) => a.ordinal - b.ordinal);
    if (!unit || !slots.length) continue;
    built += resolveSlots(data, unit, slots, course.tips, false).items.length;
  }
  assert.ok(built > 0);
});

test('the rows in reach are put together once, and again when the content is cleared', async () => {
  const blockUnits = units.slice(0, 2).map((u) => ({ id: u.id, course_order: u.course_order }));
  const ids = [...blockUnits].sort((a, b) => a.course_order - b.course_order).map((u) => u.id);
  const block = rows.slice(0, 6).map((r) => ({ ...r, unit_id: ids[0] }));
  const files = new Map([[`sentences-${stampHash(ids)}`, JSON.stringify({ format: 1, version: 'v', data: block })]]);
  setContentDisk({ read: async (name) => files.get(name) ?? null, write: async () => {} });
  clearContentCache();
  const reach = { throughOrder: blockUnits[0].course_order, units: blockUnits };

  const first = await loadSentenceRowsInReach(reach);
  assert.deepEqual(first.map((r) => r.id), block.map((r) => r.id).sort());
  assert.equal(await loadSentenceRowsInReach(reach), first);
  // Ids that aren't to be had change nothing.
  assert.equal(await loadSentenceRowsInReach({ ...reach, ids: ['nowhere'] }), first);

  let told = 0;
  onContentCleared(() => told++);
  clearContentCache();
  assert.equal(told, 1);
  const again = await loadSentenceRowsInReach(reach);
  assert.notEqual(again, first);
  assert.deepEqual(again, first);
  setContentDisk(null);
});

test('glue is counted from the sentences she has passed, and only those', () => {
  const withGlue = rows.filter((r) => r.tokens.some((t) => t.form_ids.some((id) => formById.get(id)?.is_glue)));
  assert.ok(withGlue.length > 2);
  const [passed, failed] = withGlue;
  const sentences = sentencesOf(rows, forms, [
    shownRow(passed, 3),
    { ...shownRow(failed, 4), correct_count: 0 },
  ]);
  const seen = glueSeen(sentences);
  const glueOf = (r) => sentences.find((s) => s.id === r.id).tokens.flatMap((t) => (t.glue ? [t.glue] : []));
  for (const g of glueOf(passed)) assert.ok(seen.get(g) >= 3);
  // Every count in it comes from a pass: shown and failed, or never shown, adds none.
  assert.equal([...seen.values()].reduce((n, c) => n + c, 0), new Set(glueOf(passed)).size * 3);
  // A glue word that isn't there is one she hasn't seen: still locked.
  const never = sentences.find((s) => s.tokens.some((t) => t.glue && !seen.has(t.glue)));
  assert.ok(never && hasLockedGlue(never, seen));
});

// --- read ahead, behind the road (learner-ready.ts, slices.ts) ---------------

test('what was read ahead is handed over once, for the same class, while it is fresh', async (t) => {
  const { holdLearner, takeLearner, learnerChanged } = await import('../../../src/lib/learner-ready.ts?handover');
  t.mock.timers.enable({ apis: ['Date'], now: 1_000_000 });

  holdLearner('her|unit 3', Promise.resolve('data'));
  assert.equal(await takeLearner('her|unit 4'), null, 'another class is not this one');
  // …and asking for it took nothing from the class it was read for.
  assert.equal(await takeLearner('her|unit 3'), 'data');
  assert.equal(await takeLearner('her|unit 3'), null, 'taken once');

  // Still on its way when she taps: the class gets the same read to wait on.
  let arrive;
  holdLearner('her|unit 3', new Promise((ok) => (arrive = ok)));
  const taken = takeLearner('her|unit 3');
  arrive('late');
  assert.equal(await taken, 'late');

  holdLearner('her|unit 3', Promise.resolve('data'));
  learnerChanged();
  assert.equal(await takeLearner('her|unit 3'), null, 'not after something of hers was written');

  holdLearner('her|unit 3', Promise.resolve('data'));
  t.mock.timers.tick(2 * 60 * 1000);
  assert.equal(await takeLearner('her|unit 3'), null, 'not once it has gone stale');

  const failed = Promise.reject(new Error('offline'));
  holdLearner('her|unit 3', failed);
  await failed.catch(() => {});
  await Promise.resolve();
  assert.equal(await takeLearner('her|unit 3'), null, 'a read that failed is not held');

  // One that fails after it was taken is the taker's to hear of.
  let fail;
  holdLearner('her|unit 3', new Promise((_, no) => (fail = no)));
  const doomed = takeLearner('her|unit 3');
  fail(new Error('offline'));
  await assert.rejects(doomed, /offline/);
});

test('a class opened while the read ahead is being set up waits for it', async () => {
  const { holdLearner, takeLearner, learnerComing, learnerAsked } = await import('../../../src/lib/learner-ready.ts?early');
  let found;
  const setup = new Promise((ok) => (found = ok)).then(() => {
    if (!learnerAsked()) holdLearner('her|unit 3', Promise.resolve('data'));
  });
  learnerComing(setup);
  const tapped = takeLearner('her|unit 3');
  found();
  assert.equal(await tapped, 'data');
  assert.equal(learnerAsked(), false);
});

test('a class that read for itself first is not read for again', async () => {
  const { takeLearner, learnerAsked } = await import('../../../src/lib/learner-ready.ts?first');
  assert.equal(learnerAsked(), false);
  assert.equal(await takeLearner('her|unit 3'), null);
  assert.equal(learnerAsked(), true);
});

test('work in slices does all of it, in order, and lets go in between', async () => {
  const { inSlices, hurrySlices } = await import('../../../src/lib/slices.ts?paced');
  const done = [];
  let turns = 0;
  const watching = setInterval(() => turns++, 0);
  await inSlices(Array.from({ length: 40 }, (_, i) => i), (i) => {
    const until = Date.now() + 2;
    while (Date.now() < until);
    done.push(i);
  });
  clearInterval(watching);
  assert.deepEqual(done, Array.from({ length: 40 }, (_, i) => i));
  assert.ok(turns >= 3, `the rest of the app got ${turns} turns in 80 ms of work`);

  // With someone waiting on it, it runs straight through.
  hurrySlices();
  let stops = 0;
  const counting = setInterval(() => stops++, 0);
  await inSlices(Array.from({ length: 20 }, (_, i) => i), () => {
    const until = Date.now() + 2;
    while (Date.now() < until);
  });
  clearInterval(counting);
  assert.equal(stops, 0);
});

test('warming ahead leaves the class nothing to work out, and changes no answer', async () => {
  const { warmMeanings, withMeanings: fresh } = await freshMeanings();
  const { warmShapes } = await import('../../../src/lib/sentences.ts');
  const each = async (items, work) => items.forEach(work);
  const tallies = Object.fromEntries(
    forms.map((f) => [f.id, rows.flatMap((r) => r.tokens.filter((t) => t.gloss && t.form_ids.includes(f.id)).map((t) => [t.gloss, 1, 0, 1]))]),
  );
  const lexicon = forms.map((f) => ({ ...f }));
  await warmShapes(rows, lexicon, each);
  await warmMeanings(lexicon, tallies, each);
  const sentences = sentencesOf(rows, lexicon, []);
  assert.deepEqual(sentences, sentencesOf(rows, forms, []));
  assert.deepEqual(fresh(lexicon, sentences, 30, tallies), withMeanings(forms, sentencesOf(rows, forms, []), 30, tallies));
});
