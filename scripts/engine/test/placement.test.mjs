import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  TEST_MAX_ITEMS,
  jumpAllowed,
  jumpMissesAllowed,
  nextStage,
  placedStage,
  placementMaxStages,
  placementOutcome,
  placementSections,
  planTest,
  sampleUnits,
  sectionPassed,
  stageQuestions,
  startStage,
  testOutcome,
} from '../../../src/lib/placement.ts';
import { learner, units } from './fixture.mjs';

const published = units.filter((u) => u.status === 'published');
const [u1, u2, u3] = units;

test('a test samples units: two questions each, four for a single unit, at most twenty', () => {
  const data = learner();
  const short = published.slice(0, 6);
  const items = planTest(data, short);
  assert.ok(items.length > 0);
  for (const u of short) {
    const own = items.filter((i) => i.placementUnit === u.id);
    assert.ok(own.length >= 1 && own.length <= 2, `${u.slug}: ${own.length}`);
  }
  assert.ok(items.every((i) => ['sentence_build', 'sentence_gap', 'typing', 'word_build'].includes(i.mode)));
  const single = planTest(data, [published[0]]);
  assert.ok(single.length >= 3 && single.length <= 4, `single unit asks ${single.length}`);
  // A long span is sampled, not cut off: its questions reach the far end.
  const long = planTest(data, units);
  assert.ok(long.length <= TEST_MAX_ITEMS);
  const asked = new Set(long.map((i) => i.placementUnit));
  assert.ok(asked.size <= 10);
  assert.ok(units.slice(-5).some((u) => asked.has(u.id)), 'the end of the span is sampled');
});

test('sampleUnits spreads evenly, in order, without repeats', () => {
  const list = Array.from({ length: 23 }, (_, i) => i);
  assert.deepEqual(sampleUnits(list, 3), [3, 11, 19]);
  assert.deepEqual(sampleUnits([1, 2], 3), [1, 2]);
  const ten = sampleUnits(list, 10);
  assert.equal(new Set(ten).size, 10);
  assert.deepEqual(ten, [...ten].sort((a, b) => a - b));
});

test('placement lands on the first unit with a miss; a clean run lands past the span', () => {
  const a = (unitId, correct, formIds = []) => ({ unitId, correct, formIds });
  let o = testOutcome('placement', [a(u1.id, true, ['x']), a(u1.id, true), a(u2.id, false, ['y']), a(u2.id, true)], [u1, u2, u3], u3.course_order + 1);
  assert.equal(o.throughOrder, u2.course_order);
  assert.ok(o.passed);
  assert.deepEqual(o.passedFormIds, ['x']);
  assert.deepEqual(o.failedFormIds, ['y']);
  o = testOutcome('placement', [a(u1.id, false)], [u1, u2], u2.course_order + 1);
  assert.equal(o.passed, false, 'a miss in the first unit skips nothing');
  o = testOutcome('placement', [a(u1.id, true), a(u2.id, true)], [u1, u2], u2.course_order + 1);
  assert.equal(o.throughOrder, u2.course_order + 1);
});

test('a jump passes at about 85% and lands on its target', () => {
  const a = (unitId, correct) => ({ unitId, correct, formIds: [] });
  let o = testOutcome('jump', [a(u1.id, true), a(u1.id, false), a(u2.id, true), a(u2.id, true)], [u1, u2], u3.course_order);
  assert.deepEqual([o.passed, o.throughOrder], [true, u3.course_order]);
  o = testOutcome('jump', [a(u1.id, false), a(u1.id, true), a(u2.id, false), a(u2.id, true)], [u1, u2], u3.course_order);
  assert.deepEqual([o.passed, o.tripped?.id], [false, u1.id]);

  assert.deepEqual([4, 12, 14, 20].map(jumpMissesAllowed), [1, 1, 2, 3]);
  const twenty = (misses) => Array.from({ length: 20 }, (_, i) => a(u1.id, i >= misses));
  assert.ok(testOutcome('jump', twenty(3), [u1], u2.course_order).passed, '3 misses in 20 pass');
  assert.ok(!testOutcome('jump', twenty(4), [u1], u2.course_order).passed, '4 misses in 20 do not');
  assert.ok(!testOutcome('jump', [], [u1], u2.course_order).passed, 'nothing answered is not a pass');
});

test('a jump may be short anywhere, or long inside one section', () => {
  const s1 = units.filter((u) => u.section_id === units[0].section_id);
  const s2 = units.filter((u) => u.section_id !== units[0].section_id);
  // Fake a long section: 23 units, then the next section's first.
  const long = Array.from({ length: 23 }, (_, i) => ({ ...u1, id: `a${i}`, section_id: 1, course_order: i + 1 }));
  const after = [0, 1].map((i) => ({ ...u1, id: `b${i}`, section_id: 2, course_order: 24 + i }));
  const all = [...long, ...after];
  assert.ok(jumpAllowed(all, 1, after[0]), 'a whole section, to the start of the next');
  assert.ok(jumpAllowed(all, 1, long[20]), 'a later unit of her own section');
  assert.ok(!jumpAllowed(all, 1, after[1]), 'past the start of the next section is too far');
  assert.ok(jumpAllowed(all, 20, after[1]), 'a short hop may cross sections');
  assert.ok(!jumpAllowed(all, 5, long[4]), 'nothing to skip');
  assert.ok(!jumpAllowed(all, 5, long[2]), 'never backwards');
  assert.ok(jumpAllowed(units, s1[0].course_order, s2[0]));
});

// ---------------------------------------------------------------------------
// The placement walk
// ---------------------------------------------------------------------------

/** Walks a course of `count` sections for a learner who knows the first `knows`. */
function walk(count, start, knows, maxStages) {
  const results = new Map();
  const asked = [];
  for (let at = nextStage(count, start, results, maxStages); at != null; at = nextStage(count, start, results, maxStages)) {
    assert.ok(!results.has(at), `section ${at} asked twice`);
    asked.push(at);
    results.set(at, at < knows);
  }
  return { asked, placed: placedStage(count, results) };
}

test('a section passes with at most one miss and at least two right', () => {
  assert.ok(sectionPassed([true, true, true]));
  assert.ok(sectionPassed([true, false, true]));
  assert.ok(!sectionPassed([true, false, false]));
  assert.ok(sectionPassed([true, true]));
  assert.ok(!sectionPassed([true, false]), 'one right of two proves nothing');
  assert.ok(!sectionPassed([true]));
  assert.ok(!sectionPassed([]));
});

test('the walk goes up while she passes and stops at the first section she fails', () => {
  assert.deepEqual(walk(15, 0, 0), { asked: [0], placed: 0 });
  assert.deepEqual(walk(15, 0, 3), { asked: [0, 1, 2, 3], placed: 3 });
  assert.deepEqual(walk(15, 3, 6), { asked: [3, 4, 5, 6], placed: 6 });
});

test('a first section failed walks down to one she passes', () => {
  assert.deepEqual(walk(15, 7, 5), { asked: [7, 6, 5, 4], placed: 5 });
  assert.deepEqual(walk(15, 3, 0), { asked: [3, 2, 1, 0], placed: 0 });
  // From the highest start, the walk down still reaches the beginning inside the cap.
  assert.deepEqual(walk(15, 7, 0).asked.length, placementMaxStages());
});

test('the walk is capped, ends with the course, and never places past the last section', () => {
  const capped = walk(15, 0, 15);
  assert.equal(capped.asked.length, placementMaxStages());
  assert.equal(capped.placed, placementMaxStages(), 'placed after the last section she passed');
  assert.deepEqual(walk(15, 7, 15), { asked: [7, 8, 9, 10, 11, 12, 13, 14], placed: 14 });
  assert.deepEqual(walk(3, 9, 3), { asked: [2], placed: 2 }, 'a start past the course is pulled in');
  assert.equal(nextStage(0, 0, new Map()), null);
});

test('stopping early places her with what she has passed; an unfinished walk down places her at the start', () => {
  assert.equal(placedStage(15, new Map()), 0);
  assert.equal(placedStage(15, new Map([[2, true], [3, true]])), 4);
  assert.equal(placedStage(15, new Map([[7, false], [6, false]])), 0);
  assert.equal(placedStage(15, new Map([[7, false], [6, true]])), 7);
});

test('the walk starts at the level she gave', () => {
  const cefr = ['A1.1', 'A1.2', 'A1.3', 'A2.1', 'A2.2', 'A2.3', 'A2.4', 'B1.1', 'B1.2'].map((c) => ({ cefr: c }));
  assert.deepEqual(['none', 'basics', 'spanish', 'conversational', null].map((l) => startStage(cefr, l)), [0, 1, 3, 7, 0]);
  const bare = [{}, {}, {}];
  assert.deepEqual(['none', 'basics', 'spanish', 'conversational'].map((l) => startStage(bare, l)), [0, 1, 2, 2]);
  assert.equal(startStage([], 'spanish'), 0);
});

test('the outcome lands on the first unit of the section she is placed in', () => {
  const sections = placementSections({ sections: [], units }).map((s) => s.units);
  assert.equal(sections.length, 3);
  const a = (unitId, correct, formIds = []) => ({ unitId, correct, formIds });
  const answers = [a(sections[0][0].id, true, ['x']), a(sections[1][0].id, false, ['y'])];
  let o = placementOutcome(sections, new Map([[0, true], [1, false]]), answers);
  assert.deepEqual([o.passed, o.throughOrder], [true, sections[1][0].course_order]);
  assert.deepEqual([o.passedFormIds, o.failedFormIds], [['x'], ['y']]);
  o = placementOutcome(sections, new Map([[0, false]]), answers);
  assert.deepEqual([o.passed, o.throughOrder], [false, sections[0][0].course_order]);
  o = placementOutcome(sections, new Map([[0, true], [1, true], [2, true]]), answers);
  assert.equal(o.throughOrder, sections[2][0].course_order, 'the last section is still hers to walk');
});

test('a section is asked three questions, from units spread across it', () => {
  const data = learner();
  for (const s of placementSections({ sections: [], units })) {
    const items = stageQuestions(data, s.units);
    assert.equal(items.length, 3);
    const own = new Set(s.units.map((u) => u.id));
    assert.ok(items.every((i) => own.has(i.placementUnit) && i.filler));
    assert.equal(new Set(items).size, 3);
  }
  // With no sentences on the phone a section is still asked, through its words.
  const bare = stageQuestions({ ...data, sentences: [] }, placementSections({ sections: [], units })[2].units);
  assert.equal(bare.length, 3);
  assert.ok(bare.every((i) => !i.sentence));
});
