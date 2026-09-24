// The generation pipeline without a model: prompts carry the hard constraints,
// candidates go through the same gate as hand-written content, and selection
// keeps the best intro and drills per word.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkCandidates, generationPrompt, selectCandidates, styleSpec, targetsFor } from '../lib/generate.mjs';
import { FORMS_PER_LESSON, LESSON_ITEMS, planLessons } from '../lib/lessons.mjs';
import { loadOutline } from '../lib/outline.mjs';

const RAMP = ['sentence_meaning', 'sentence_gap', 'sentence_build'];

const { outline } = loadOutline();
const unit = outline.units.find((u) => u.slug === 'hola-che');

test('the prompt lists the available words, marks the new ones, and carries the style spec', () => {
  const style = styleSpec();
  assert.ok(style.includes('vos'), 'Appendix B is in');
  const { system, user } = generationPrompt({ outline, unit, targets: targetsFor(outline, unit).slice(0, 2), examples: [{ es: 'Hola, che.', en: 'Hi there.' }], existing: ['Chau, che.'], style });
  assert.ok(system.includes('Appendix B'));
  assert.ok(user.includes('* hola'), 'new words are marked');
  assert.ok(user.includes('  café'), 'earlier words are available');
  assert.ok(!user.includes('tenés'), 'later words are not');
  assert.ok(user.includes('Chau, che.'));
});

test('candidates pass or fail the same gate as hand-written sentences', () => {
  const checked = checkCandidates({
    outline,
    unit,
    existingEs: ['Hola, che.'],
    candidates: [
      { target: 'hola', role: 'intro', es: 'Hola, Sofi.', en: 'Hi, Sofi.', en_alt: [], difficulty: 1, loose: [] },
      { target: 'hola', role: 'drill', es: 'Hola, che.', en: 'Hi there.', en_alt: [], difficulty: 1, loose: [] },
      { target: 'chau', role: 'drill', es: 'Chau, ¿tienes café?', en: 'Bye, do you have coffee?', en_alt: [], difficulty: 2, loose: [] },
      { target: 'chau', role: 'drill', es: 'Chau, Martín.', en: 'Bye, Martín.', en_alt: [], difficulty: 1, loose: [] },
      { target: 'tenés', role: 'drill', es: 'Hola.', en: 'Hi.', en_alt: [], difficulty: 1, loose: [] },
    ],
  });
  assert.deepEqual(checked.map((c) => c.ok), [true, false, false, true, false]);
  assert.ok(checked[1].problems.some((p) => p.includes('duplicates')));
  assert.ok(checked[2].problems.some((p) => /tuteo|isn't taught|lexicon/.test(p)), checked[2].problems.join('; '));
  assert.ok(checked[4].problems.some((p) => p.includes('not a word this unit introduces')));
  assert.equal(checked[0].row.status, 'draft');
  assert.equal(checked[0].row.source, 'ai');
});

test('selection keeps one intro and three drills per word, and only above the bar', () => {
  const mk = (target, role, es, difficulty) => ({ target, role, es, en: 'x', en_alt: [], difficulty, loose: [] });
  const form = outline.forms.find((f) => f.unit_id === unit.id && f.form === 'hola');
  const row = (i) => ({ id: `r${i}`, tokens: [{}, {}] });
  const checked = [
    mk('hola', 'intro', 'a', 1), mk('hola', 'intro', 'b', 1),
    mk('hola', 'drill', 'c', 1), mk('hola', 'drill', 'd', 2), mk('hola', 'drill', 'e', 3), mk('hola', 'drill', 'f', 2), mk('hola', 'drill', 'g', 1),
  ].map((candidate, i) => ({ candidate, row: row(i), target: form, ok: true, problems: [], flags: [] }));
  const good = (n) => ({ naturalness: n, grammaticality: 5, coherence: 5, logic: 5, porteno: true, register_ok: true, english_natural: true });
  const scores = new Map([[0, good(4)], [1, good(5)], [2, good(5)], [3, good(4)], [4, good(4)], [5, good(5)], [6, { ...good(5), porteno: false }]]);
  const { selected, rejected } = selectCandidates(checked, scores);
  assert.deepEqual(selected.map((s) => s.candidate.es).sort(), ['b', 'c', 'e', 'f']);
  assert.equal(rejected.find((r) => r.candidate.es === 'g').reason, 'below the judge bar');
  assert.equal(new Set(selected.filter((s) => s.candidate.role === 'drill').map((s) => s.candidate.difficulty)).size, 3, 'drills spread over difficulties');
});

test('the lesson plan teaches every word, ramps meaning → gap → tiles, and ends on a check', () => {
  const content = outline.forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn');
  const earlier = outline.forms.filter((f) => f.unit_order < unit.course_order && !f.is_glue && f.pos !== 'propn');
  // Three sentences per word: the word alone, with an earlier word, with a second.
  const sentences = content.flatMap((f, i) =>
    [[f.id], [f.id, earlier[i % earlier.length].id], [f.id, earlier[(i + 1) % earlier.length].id]].map((ids, k) => ({
      id: `${f.id}-${k}`,
      target_form_id: f.id,
      difficulty: k + 1,
      tokens: ids.map((id) => ({ form_ids: [id] })),
    })),
  );
  const { slots, warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  const taught = slots.filter((s) => s.kind === 'teach').map((s) => s.form_id);
  assert.deepEqual(new Set(taught), new Set(content.map((f) => f.id)));
  const check = unit.lessons.find((l) => l.kind === 'review');
  assert.ok(slots.some((s) => s.lesson_id === check.id && s.kind === 'recap' && s.review_count >= 6));
  for (const l of unit.lessons.filter((x) => x.kind === 'lesson')) {
    const own = slots.filter((s) => s.lesson_id === l.id);
    assert.deepEqual(own.map((s) => s.ordinal), own.map((_, i) => i + 1), 'ordinals run 1..n');
    const firstDrill = own.find((s) => s.kind === 'drill');
    assert.equal(firstDrill.mode, 'sentence_meaning', 'meaning first');
    assert.ok(own.some((s) => s.mode === 'sentence_build'), 'a build in every lesson');
  }
  assert.deepEqual(warnings, []);
});

/** Screens a slot stands for: one, unless it stands for several. */
const screensOf = (own) => own.reduce((n, s) => n + (s.kind === 'review' || s.kind === 'recap' ? (s.review_count ?? 0) : 1), 0);

/** A unit with `count` sentences per word, optionally recorded. */
const unitSentences = (unit, forms, { per = 3, audio = false } = {}) => {
  const content = forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn');
  const earlier = forms.filter((f) => f.unit_order < unit.course_order && !f.is_glue && f.pos !== 'propn');
  const filler = (i, w) => (earlier.length ? [{ form_ids: [earlier[(i + w) % earlier.length].id] }] : []);
  return content.flatMap((f, i) =>
    Array.from({ length: per }, (_, k) => ({
      id: `${f.id}-${k}`,
      target_form_id: f.id,
      difficulty: (k % 4) + 1,
      audio_path: audio ? `audio/${f.id}-${k}.mp3` : null,
      tokens: [{ form_ids: [f.id] }, ...Array.from({ length: k }, (_, w) => filler(i, w)).flat()],
    })),
  );
};

test('every lesson runs one sitting — never over 16 screens, and under 12 only when it says why', () => {
  for (const unit of outline.units.slice(0, 12)) {
    const sentences = unitSentences(unit, outline.forms, { per: 6 });
    const { slots, warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
    const byLesson = new Map();
    for (const s of slots) byLesson.set(s.lesson_id, [...(byLesson.get(s.lesson_id) ?? []), s]);
    for (const [id, own] of byLesson) {
      const screens = screensOf(own);
      const lesson = unit.lessons.find((l) => l.id === id);
      const where = `${unit.slug} lesson ${lesson.ordinal}`;
      assert.ok(screens <= LESSON_ITEMS.max, `${where}: ${screens} screens, over ${LESSON_ITEMS.max}`);
      if (screens < LESSON_ITEMS.min) {
        assert.ok(warnings.some((w) => w.startsWith(`${where}:`)), `${where}: ${screens} screens and no warning`);
      }
      // However crowded the unit, no lesson teaches more than its share.
      const teach = own.filter((s) => s.kind === 'teach').length;
      if (lesson.kind === 'lesson') assert.ok(teach <= FORMS_PER_LESSON + 2, `${where}: ${teach} new words`);
    }
  }
});

test('a thin unit is filled by taking its own sentences a rung higher, not by running short', () => {
  const unit = outline.units.find((u) => u.course_order > 1);
  const sentences = unitSentences(unit, outline.forms, { per: 2 });
  const { slots } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  const teachingIds = new Set(unit.lessons.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint').map((l) => l.id));
  for (const id of teachingIds) {
    const own = slots.filter((s) => s.lesson_id === id);
    if (!own.length) continue;
    assert.ok(screensOf(own) >= LESSON_ITEMS.min, `${screensOf(own)} screens`);
    // A sentence repeated inside the lesson always climbs: meaning, then gap, then tiles.
    const seen = new Map();
    for (const s of own.filter((x) => x.kind === 'drill' && RAMP.includes(x.mode))) {
      if (seen.has(s.sentence_id)) assert.ok(RAMP.indexOf(s.mode) > seen.get(s.sentence_id), 'a repeat is a rung up');
      seen.set(s.sentence_id, RAMP.indexOf(s.mode));
    }
  }
});

test('a unit too thin to fill a lesson says so instead of shipping a short one', () => {
  const unit = outline.units.find((u) => u.course_order > 1);
  const sentences = unitSentences(unit, outline.forms, { per: 1 });
  const { warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  assert.ok(warnings.some((w) => /screens, wants/.test(w)), warnings.join('; '));
});

test('a lesson listens only to what it has already shown, and only where there is a recording', () => {
  const unit = outline.units.find((u) => u.course_order > 1);
  const forms = outline.forms;
  for (const audio of [false, true]) {
    const sentences = unitSentences(unit, forms, { per: 4, audio });
    const { slots } = planLessons({ unit, forms, sentences, tips: unit.tips });
    const listens = slots.filter((s) => s.mode === 'sentence_listen');
    if (!audio) {
      assert.equal(listens.length, 0, 'no recordings, no listening screens');
      continue;
    }
    assert.ok(listens.length > 0, 'recordings are heard');
    for (const l of listens) {
      const own = slots.filter((s) => s.lesson_id === l.lesson_id);
      const before = own.slice(0, own.indexOf(l));
      assert.ok(
        before.some((s) => s.sentence_id === l.sentence_id && s.mode !== 'sentence_listen'),
        'the sentence was read before it was heard',
      );
      assert.ok(sentences.find((s) => s.id === l.sentence_id).audio_path, 'only a recorded sentence');
    }
    for (const id of new Set(listens.map((l) => l.lesson_id))) {
      assert.ok(listens.filter((l) => l.lesson_id === id).length <= 2, 'at most two a lesson');
    }
  }
});

test('practice lessons come after the teaching, teach nothing new, and push sentences to the gap and the tiles', () => {
  const unit = outline.units.find((u) => u.slug === 'me-pregunto');
  const kinds = unit.lessons.map((l) => l.kind);
  assert.deepEqual(kinds.slice(-3), ['practice', 'practice', 'review'], 'two practice lessons, then the check');
  const sentences = unitSentences(unit, outline.forms, { per: 8 });
  const { slots, warnings } = planLessons({ unit, forms: outline.forms, sentences, tips: unit.tips });
  for (const l of unit.lessons.filter((x) => x.kind === 'practice')) {
    const own = slots.filter((s) => s.lesson_id === l.id);
    assert.ok(!own.some((s) => s.kind === 'teach'), 'nothing new');
    assert.equal(own[0].kind, 'review', 'opens on earlier units');
    assert.ok(own.some((s) => s.mode === 'sentence_gap') && own.some((s) => s.mode === 'sentence_build'));
    assert.ok(!own.some((s) => s.mode === 'sentence_meaning'), 'practice starts at the gap');
    const screens = screensOf(own);
    assert.ok(screens >= LESSON_ITEMS.min && screens <= LESSON_ITEMS.max, `${screens} screens`);
  }
  assert.deepEqual(warnings.filter((w) => /Practice/.test(w)), []);
});
