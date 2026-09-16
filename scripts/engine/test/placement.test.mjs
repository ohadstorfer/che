import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planTest, shouldStop, testOutcome } from '../../../src/lib/placement.ts';
import { learner, units } from './fixture.mjs';

const published = units.filter((u) => u.status === 'published');
const [u1, u2, u3] = units;

test('a test samples each unit: two questions, four for a single unit, none repeated', () => {
  const data = learner();
  const items = planTest(data, published);
  assert.ok(items.length > 0);
  for (const u of published.slice(0, 15)) {
    const own = items.filter((i) => i.placementUnit === u.id);
    assert.ok(own.length >= 1 && own.length <= 2, `${u.slug}: ${own.length}`);
  }
  assert.ok(items.every((i) => ['sentence_build', 'sentence_gap', 'typing', 'word_build'].includes(i.mode)));
  const single = planTest(data, [published[0]]);
  assert.ok(single.length >= 3 && single.length <= 4, `single unit asks ${single.length}`);
  assert.ok(planTest(data, units).length <= 30);
});

test('placement stops after two units in a row with a miss, or two misses in one', () => {
  const a = (unitId, correct) => ({ unitId, correct, formIds: [] });
  assert.ok(!shouldStop([a(u1.id, true), a(u1.id, false), a(u2.id, true)]));
  assert.ok(shouldStop([a(u1.id, false), a(u2.id, false)]));
  assert.ok(shouldStop([a(u1.id, false), a(u1.id, false)]));
  assert.ok(!shouldStop([a(u1.id, false), a(u2.id, true), a(u2.id, true), a(u3.id, false)]));
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

test('a jump passes with at most one miss and lands on its target', () => {
  const a = (unitId, correct) => ({ unitId, correct, formIds: [] });
  let o = testOutcome('jump', [a(u1.id, true), a(u1.id, false), a(u2.id, true), a(u2.id, true)], [u1, u2], u3.course_order);
  assert.deepEqual([o.passed, o.throughOrder], [true, u3.course_order]);
  o = testOutcome('jump', [a(u1.id, false), a(u1.id, true), a(u2.id, false), a(u2.id, true)], [u1, u2], u3.course_order);
  assert.deepEqual([o.passed, o.tripped?.id], [false, u1.id]);
});
