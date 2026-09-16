// The generation pipeline without a model: prompts carry the hard constraints,
// candidates go through the same gate as hand-written content, and selection
// keeps the best intro and drills per word.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkCandidates, generationPrompt, selectCandidates, styleSpec, targetsFor } from '../lib/generate.mjs';
import { planLessons } from '../lib/lessons.mjs';
import { loadOutline } from '../lib/outline.mjs';

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
