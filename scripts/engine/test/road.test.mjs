// The road when what she has finished is not one unbroken stretch: a reshaped
// course, or a credit from a migration, leaves finished lessons ahead of her
// step. They are drawn done, and the road walks past them.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assemble, currentIndex, doneCount, sectionSummaries, stepDone } from '../../../src/lib/course.ts';

const KINDS = ['lesson', 'lesson', 'culture', 'lesson', 'slang', 'practice', 'speak', 'review'];
const sections = [1, 2].map((n) => ({ id: n, ordinal: n, status: 'published' }));
const units = [1, 2, 3].map((n) => ({ id: `u${n}`, section_id: n < 3 ? 1 : 2, ordinal: n, course_order: n, status: 'published' }));
const lessons = units.flatMap((u) =>
  KINDS.map((kind, k) => ({ id: `${u.id}-${k + 1}`, unit_id: u.id, ordinal: k + 1, kind, status: 'published' })),
);
const course = assemble(sections, units, lessons, []);
const at = (id) => course.path.find((l) => l.id === id);
const phases = (current, done) =>
  course.path.map((l) => (l.index === current ? 'C' : stepDone(l, current, done) ? 'd' : '.')).join('');

test('walked in order, the done are the stretch behind her', () => {
  const done = new Set(['u1-1', 'u1-2', 'u1-3']);
  const current = currentIndex(course.path, done);
  assert.equal(current, 3);
  assert.equal(phases(current, done), 'dddC' + '.'.repeat(20));
});

test('a finished lesson ahead of her step is drawn done, not locked', () => {
  // Unit 1 with its classes credited and its lessons still to play.
  const done = new Set(['u1-1', 'u1-3', 'u1-5', 'u1-6', 'u1-7']);
  const current = currentIndex(course.path, done);
  assert.equal(current, at('u1-2').index);
  assert.equal(phases(current, done).slice(0, 8), 'dCd.ddd.');
});

test('finishing a step lands on the next open one, past steps already shown done', () => {
  const before = new Set(['u1-1', 'u1-3', 'u1-5', 'u1-6', 'u1-7']);
  const after = new Set([...before, 'u1-2']);
  assert.equal(currentIndex(course.path, after), at('u1-4').index);
  // Then the unit check: everything between was done before she got there.
  after.add('u1-4');
  assert.equal(currentIndex(course.path, after), at('u1-8').index);
  // Nothing that turns done on arrival was drawn locked the moment before.
  const was = phases(at('u1-4').index, new Set([...before, 'u1-2']));
  assert.equal(was.slice(0, 8), 'dddCddd.');
});

test('her own step stays hers until the move has played', () => {
  // The lesson she just finished is among the done; the road still shows her on it.
  const done = new Set(['u1-1', 'u1-2']);
  assert.equal(phases(1, done).slice(0, 3), 'dC.');
  assert.equal(stepDone(at('u1-2'), 1, done), false);
});

test('a road drawn before her progress is read has nothing done ahead', () => {
  assert.equal(phases(2, undefined).slice(0, 4), 'ddC.');
});

test('sections count what is finished, wherever in them it sits', () => {
  // Her step is in section 1; a lesson of section 2 is already credited.
  const done = new Set(['u1-1', 'u1-3', 'u3-2']);
  const current = currentIndex(course.path, done);
  const [first, second] = sectionSummaries(course, current, done);
  assert.deepEqual([first.state, first.done, first.lessons], ['current', 2, 16]);
  assert.deepEqual([second.state, second.done, second.lessons], ['locked', 1, 8]);
  assert.equal(doneCount(course.path, done), 3);
});

test('a finished course stands past its last step', () => {
  const done = new Set(course.path.map((l) => l.id));
  const current = currentIndex(course.path, done);
  assert.equal(current, course.path.length);
  assert.ok(sectionSummaries(course, current, done).every((s) => s.state === 'done' && s.done === s.lessons));
});
