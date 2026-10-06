// The fixed unit shape (lib/template.mjs): how a unit's words are dealt over
// its three teaching lessons, how its lesson rows are reshaped, how its lessons
// are planned, and what a split does to a unit too big for it.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { uuid5 } from '../lib/ids.mjs';
import { LESSON_ITEMS, lintLessons, planLessons, screensOf } from '../lib/lessons.mjs';
import { loadOutline } from '../lib/outline.mjs';
import { evaluateSplit } from '../lib/split.mjs';
import { shapeUnit } from '../lib/template-rows.mjs';
import { COST, LESSON_COST, LESSON_COST_SLACK, LESSON_WORDS, TEMPLATE, costOf, dealWords, lightForms, overflow } from '../lib/template.mjs';

const { outline } = loadOutline();

const form = (lemma, n) => ({ id: `${lemma}${n}`, lemma_id: lemma });
const wordsIn = (chunk) => new Set(chunk.map((f) => f.lemma_id)).size;

test('another form of a word she has is light, in this unit or from an earlier one', () => {
  const forms = [form('a', 1), form('a', 2), form('b', 1), form('c', 1)];
  assert.deepEqual([...lightForms(forms).keys()], ['a2']);
  assert.deepEqual([...lightForms(forms, new Set(['c'])).keys()], ['a2', 'c1']);
  assert.equal(costOf(forms, lightForms(forms)), 3 * COST.full + COST.light);
  // A form that only agrees with its noun costs less than another verb form.
  const adj = [{ id: 'alto', lemma_id: 'alto', pos: 'adj', features: { gender: 'm', number: 'sg' } }, { id: 'alta', lemma_id: 'alto', pos: 'adj', features: { gender: 'f', number: 'sg' } }];
  const verb = [{ id: 'hablo', lemma_id: 'hablar', pos: 'verb', features: { tense: 'pres', person: 1 } }, { id: 'hablás', lemma_id: 'hablar', pos: 'verb', features: { tense: 'pres', person: 2 } }];
  assert.equal(lightForms(adj).get('alta'), COST.pattern);
  assert.equal(lightForms(verb).get('hablás'), COST.light);
});

test('words are dealt whole, in order, no lesson past four words or its screens', () => {
  const forms = [...'abcdefgh'].flatMap((l, i) => (i === 0 ? [form(l, 1), form(l, 2), form(l, 3)] : [form(l, 1)]));
  const light = lightForms(forms);
  const chunks = dealWords(forms, light);
  assert.equal(chunks.length, 3);
  assert.deepEqual(chunks.flat().map((f) => f.id), forms.map((f) => f.id), 'every form, in order');
  for (const chunk of chunks) {
    assert.ok(wordsIn(chunk) <= LESSON_WORDS.max);
    assert.ok(costOf(chunk, light) <= LESSON_COST + LESSON_COST_SLACK);
    for (const f of chunk) assert.ok(chunk.filter((x) => x.lemma_id === f.lemma_id).length === forms.filter((x) => x.lemma_id === f.lemma_id).length, 'a word is not cut in two');
  }
  assert.equal(overflow(forms, light), null);
});

test('a thin unit leaves lessons with nothing to teach, and a big one says it wants splitting', () => {
  assert.deepEqual(dealWords([form('a', 1)]).map((c) => c.length), [1, 0, 0]);
  assert.deepEqual(dealWords([form('a', 1), form('b', 1)]).map((c) => c.length), [1, 1, 0]);
  assert.deepEqual(dealWords([]).map((c) => c.length), [0, 0, 0]);
  // Five words of three forms each: inside a unit's total, and no way to deal them.
  const lumpy = [...'abcd'].flatMap((l) => [1, 2, 3, 4].map((n) => form(l, n)));
  assert.match(overflow(lumpy, lightForms(lumpy)), /don't divide/);
  const many = [...'abcdefghijklm'].map((l) => form(l, 1));
  assert.match(overflow(many), /13 words/);
  const heavy = [...'abcdef'].flatMap((l) => [1, 2, 3, 4].map((n) => form(l, n)));
  assert.match(overflow(heavy, lightForms(heavy)), /screens to teach/);
  assert.deepEqual(dealWords(many).flat().length, many.length, 'still taught: the last lesson takes the rest');
});

// ── Lesson rows ──────────────────────────────────────────────────────────────

const row = (unit, ordinal, kind, title_en, status = 'published') => ({ id: `${kind}-${ordinal}`, unit_id: unit.id, ordinal, kind, title_en, status });

test('a unit takes the shape keeping the rows it can: three lessons, its practice, its check', () => {
  const unit = { id: 'u', slug: 'una-unidad', review_form_ids: [] };
  const lessons = [
    row(unit, 1, 'lesson', 'Lesson 1'),
    row(unit, 2, 'lesson', 'Lesson 2'),
    row(unit, 3, 'lesson', 'Lesson 3'),
    row(unit, 4, 'culture', 'Culture'),
    row(unit, 5, 'lesson', 'Lesson 4'),
    row(unit, 6, 'practice', 'Grammar practice'),
    row(unit, 7, 'practice', 'Practice'),
    row(unit, 8, 'speak', 'Speaking'),
    row(unit, 9, 'review', 'Unit check'),
  ];
  const { rows, retired } = shapeUnit({ unit, lessons, culture: true });
  assert.deepEqual(rows.map((r) => r.kind), TEMPLATE);
  assert.deepEqual(rows.map((r) => r.ordinal), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(rows.filter((r) => r.kind === 'lesson').map((r) => r.id), ['lesson-1', 'lesson-2', 'lesson-3']);
  assert.equal(rows.find((r) => r.kind === 'practice').id, 'practice-7', 'the plain practice, not the grammar one');
  assert.equal(rows.find((r) => r.kind === 'slang').id, uuid5('lesson:una-unidad:slang'), 'a new slang lesson');
  assert.equal(rows.find((r) => r.kind === 'slang').was, null);
  assert.deepEqual(retired.map((r) => r.id).sort(), ['lesson-5', 'practice-6']);
});

test('without a culture class the unit has seven lessons, and a short unit gets the lessons it lacks', () => {
  const unit = { id: 'u', slug: 'otra-unidad', review_form_ids: [] };
  const lessons = [row(unit, 1, 'lesson', 'Lesson 1'), row(unit, 2, 'lesson', 'Lesson 2'), row(unit, 3, 'culture', 'Culture'), row(unit, 4, 'review', 'Unit check')];
  const { rows, retired } = shapeUnit({ unit, lessons, culture: false });
  assert.deepEqual(rows.map((r) => r.kind), TEMPLATE.filter((k) => k !== 'culture'));
  assert.equal(rows.filter((r) => !r.was).length, 4, 'a lesson, slang, practice and the chat are new');
  assert.deepEqual(retired.map((r) => r.id), ['culture-3']);
  // A new unit (a split's second half) has no rows at all: seven new ones, no two the same.
  const bare = shapeUnit({ unit: { id: 'n', slug: 'nueva', review_form_ids: [] }, lessons: [], culture: false });
  assert.equal(new Set(bare.rows.map((r) => r.id)).size, 7);
});

test('a practice unit keeps its four practice lessons: three as its lessons, one as its practice', () => {
  const unit = { id: 'u', slug: 'practica', review_form_ids: ['x'] };
  const lessons = [1, 2, 3, 4].map((n) => row(unit, n, 'practice', 'Practice')).concat(row(unit, 5, 'review', 'Unit check'));
  const { rows, retired } = shapeUnit({ unit, lessons, culture: false });
  assert.deepEqual(rows.filter((r) => r.kind === 'lesson').map((r) => r.id), ['practice-1', 'practice-2', 'practice-3']);
  assert.equal(rows.find((r) => r.kind === 'practice').id, 'practice-4');
  assert.deepEqual(retired, []);
});

// ── Lessons planned in the shape ─────────────────────────────────────────────

/** `per` sentences for each of a unit's words: the word, then earlier words. */
const sentencesFor = (unit, forms, per = 6) => {
  const content = forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn');
  const earlier = forms.filter((f) => f.unit_order < unit.course_order && !f.is_glue && f.pos !== 'propn');
  return content.flatMap((f, i) =>
    Array.from({ length: per }, (_, k) => ({
      id: `${f.id}-${k}`,
      unit_id: unit.id,
      target_form_id: f.id,
      difficulty: (k % 4) + 1,
      audio_path: null,
      tokens: [{ form_ids: [f.id] }, ...Array.from({ length: k }, (_, w) => (earlier.length ? [{ form_ids: [earlier[(i + w) % earlier.length].id] }] : [])).flat()],
    })),
  );
};

/** An outline unit given the shape's lessons. */
const shaped = (unit) => ({
  ...unit,
  template: true,
  lessons: TEMPLATE.filter((k) => k !== 'culture' && k !== 'speak').map((kind, i) => ({ id: `${unit.id}-${i + 1}`, ordinal: i + 1, kind, title_en: kind })),
});

/** The first units that fit the shape, each with enough earlier material to recycle. */
const fitting = outline.units
  .filter((u) => !u.review_form_ids.length && u.course_order > 3)
  .filter((u) => {
    const own = outline.forms.filter((f) => f.unit_id === u.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
    const known = new Set(outline.forms.filter((f) => f.unit_order < u.course_order).map((f) => f.lemma_id));
    return own.length && !overflow(own, lightForms(own, known));
  })
  .slice(0, 12);

test('a unit with the shape teaches every word in three lessons, each one sitting, and lints clean', () => {
  assert.ok(fitting.length >= 8);
  for (const base of fitting) {
    const unit = shaped(base);
    const sentences = sentencesFor(unit, outline.forms);
    const earlier = outline.units.filter((u) => u.course_order < unit.course_order).flatMap((u) => sentencesFor(u, outline.forms, 3));
    const { slots, warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips, earlier, debt: () => 1 });
    const own = outline.forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
    assert.deepEqual(new Set(slots.filter((s) => s.kind === 'teach').map((s) => s.form_id)), new Set(own.map((f) => f.id)), `${unit.slug}: every word taught`);
    for (const l of unit.lessons) {
      const mine = slots.filter((s) => s.lesson_id === l.id);
      const screens = screensOf(mine);
      assert.ok(screens >= LESSON_ITEMS.min && screens <= LESSON_ITEMS.max, `${unit.slug} ${l.kind} ${l.ordinal}: ${screens} screens`);
      const words = new Set(mine.filter((s) => s.kind === 'teach').map((s) => outline.forms.find((f) => f.id === s.form_id).lemma_id)).size;
      assert.ok(words <= LESSON_WORDS.max, `${unit.slug} lesson ${l.ordinal}: ${words} new words`);
    }
    const sentenceById = new Map([...sentences, ...earlier].map((s) => [s.id, s]));
    const formById = new Map(outline.forms.map((f) => [f.id, f]));
    assert.deepEqual(lintLessons({ unit, slots, sentenceById, formById }), [], unit.slug);
    assert.deepEqual(warnings, [], unit.slug);
  }
});

test('a light form gets one screen to be shown and goes straight to its gap', () => {
  const base = fitting.find((u) => {
    const own = outline.forms.filter((f) => f.unit_id === u.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
    return [...lightForms(own, new Set()).values()].includes(COST.light);
  });
  const unit = shaped(base);
  const sentences = sentencesFor(unit, outline.forms);
  const { slots } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  const own = outline.forms.filter((f) => f.unit_id === unit.id);
  const how = lightForms(own.filter((f) => !f.is_glue && f.pos !== 'propn' && !f.bound), new Set(outline.forms.filter((f) => f.unit_order < unit.course_order).map((f) => f.lemma_id)));
  const light = slots.filter((s) => s.kind === 'teach' && s.light && how.get(s.form_id) === COST.light);
  assert.ok(light.length > 0);
  for (const t of light) {
    const next = slots.find((s) => s.lesson_id === t.lesson_id && s.ordinal === t.ordinal + 1);
    assert.equal(next.kind, 'drill');
    assert.notEqual(next.mode, 'sentence_meaning', 'no meaning screen: the app shows it in a sentence');
    assert.ok(sentences.find((s) => s.id === next.sentence_id).tokens.some((tok) => tok.form_ids.includes(t.form_id)), 'its gap is a sentence that uses it');
  }
});

test('the slang lesson teaches the words named for it and reviews the slang she knows', () => {
  const unit = shaped(fitting[2]);
  const own = outline.forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
  const slang = new Set(own.slice(-2).map((f) => f.id));
  const sentences = sentencesFor(unit, outline.forms);
  const { slots } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips, slang });
  const lesson = unit.lessons.find((l) => l.kind === 'slang');
  const mine = slots.filter((s) => s.lesson_id === lesson.id);
  assert.deepEqual(new Set(mine.filter((s) => s.kind === 'teach').map((s) => s.form_id)), slang);
  assert.ok(!slots.some((s) => s.kind === 'teach' && slang.has(s.form_id) && s.lesson_id !== lesson.id), 'and nowhere else');
  const recap = mine.at(-1);
  assert.equal(recap.kind, 'recap');
  assert.equal(recap.scope, 'slang');
  const screens = screensOf(mine);
  assert.ok(screens >= LESSON_ITEMS.min && screens <= LESSON_ITEMS.max, `${screens} screens`);
  // A unit with no slang word of its own: the lesson is the review alone.
  const plain = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  const alone = plain.slots.filter((s) => s.lesson_id === lesson.id);
  assert.deepEqual(alone.map((s) => [s.kind, s.scope, s.review_count]), [['recap', 'slang', LESSON_ITEMS.min]]);
});

test('a lesson with nothing to teach practises, and a practice unit practises in every lesson', () => {
  const thin = outline.units.find((u) => {
    const own = outline.forms.filter((f) => f.unit_id === u.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
    return !u.review_form_ids.length && u.course_order > 20 && own.length >= 1 && new Set(own.map((f) => f.lemma_id)).size <= 2;
  });
  const unit = shaped(thin);
  const sentences = sentencesFor(unit, outline.forms, 8);
  const earlier = outline.units.filter((u) => u.course_order < unit.course_order).flatMap((u) => sentencesFor(u, outline.forms, 2));
  const { slots } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips, earlier, debt: () => 1 });
  const lessons = unit.lessons.filter((l) => l.kind === 'lesson');
  const last = slots.filter((s) => s.lesson_id === lessons[2].id);
  assert.ok(!last.some((s) => s.kind === 'teach'), 'nothing left to teach');
  assert.ok(screensOf(last) >= LESSON_ITEMS.min, 'and still a full lesson');

  const practice = outline.units.find((u) => u.review_form_ids.length);
  const punit = shaped(practice);
  const reviewed = outline.forms.filter((f) => practice.review_form_ids.includes(f.id));
  const psentences = reviewed.flatMap((f) => Array.from({ length: 6 }, (_, k) => ({ id: `${f.id}-${k}`, unit_id: punit.id, target_form_id: f.id, difficulty: 1, audio_path: null, tokens: [{ form_ids: [f.id] }] })));
  const planned = planLessons({ unit: punit, forms: outline.forms, sentences: psentences, tips: punit.tips, earlier, debt: () => 1 });
  assert.ok(!planned.slots.some((s) => s.kind === 'teach'));
  for (const l of punit.lessons.filter((x) => x.kind === 'lesson' || x.kind === 'practice')) {
    assert.ok(planned.slots.some((s) => s.lesson_id === l.id && s.kind === 'drill'), `lesson ${l.ordinal} practises`);
  }
});

// ── Splitting ────────────────────────────────────────────────────────────────

test('a split names every word once, and says which sentences move and which words are left thin', () => {
  const unit = outline.units.find((u) => u.slug === 'hola-che');
  const own = outline.forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn' && !f.bound);
  const lemmas = [...new Set(own.map((f) => f.lemma))];
  const half = Math.ceil(lemmas.length / 2);
  const [first, second] = [lemmas.slice(0, half), lemmas.slice(half)];
  const a = own.find((f) => f.lemma === first[0]);
  const b = own.find((f) => f.lemma === second[0]);
  const sentences = [
    { id: 's1', es: 'uno', target_form_id: a.id, tokens: [{ form_ids: [a.id] }] },
    { id: 's2', es: 'dos', target_form_id: a.id, tokens: [{ form_ids: [a.id] }, { form_ids: [b.id] }] },
  ];
  const result = evaluateSplit({ unit, forms: outline.forms, sentences, parts: [{ words: first }, { words: second }] });
  assert.deepEqual(result.errors.filter((e) => !/holds/.test(e)), []);
  assert.deepEqual(result.parts[0].moved.map((s) => s.id), ['s2'], 'a sentence that uses a later part\'s word goes there');
  assert.equal(result.partOfSentence.get('s2'), 1);
  assert.ok(result.parts[0].thin.some((x) => x.form.id === a.id && x.has === 1));

  const bad = evaluateSplit({ unit, forms: outline.forms, sentences, parts: [{ words: first }, { words: [...second.slice(1), first[0], 'no-such-word'] }] });
  assert.ok(bad.errors.some((e) => /already in part 1/.test(e)));
  assert.ok(bad.errors.some((e) => /not a word of/.test(e)));
  assert.ok(bad.errors.some((e) => /no part takes/.test(e)));
});
