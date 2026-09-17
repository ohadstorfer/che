// One Undo for one operation (docs/superplan-admin-palabras.md §6): every write
// of a batch reverted, newest first, touching only what the batch changed.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planUndo } from '../../../src/lib/admin.ts';

const rev = (id, table_name, row_id, before, after) => ({ id, table_name, row_id, before, after, batch_id: 'b', created_at: '' });

test('a batch of three writes is reverted, newest first', () => {
  const steps = planUndo([
    rev(1, 'forms', 'f1', { id: 'f1', form: 'medialuna', status: 'published', updated_at: 'x' }, { id: 'f1', form: 'medialunita', status: 'published', updated_at: 'y' }),
    rev(2, 'sentences', 's1', { id: 's1', es: 'Una medialuna.', tokens: [{ surface: 'medialuna.' }] }, { id: 's1', es: 'Una medialunita.', tokens: [{ surface: 'medialunita.' }] }),
    rev(3, 'lesson_slots', 'l1', { id: 'l1', lesson_id: 'L', ordinal: 3, kind: 'teach', form_id: 'f1' }, { deleted: true }),
  ]);
  assert.deepEqual(steps, [
    { kind: 'insert', table: 'lesson_slots', row: { id: 'l1', lesson_id: 'L', ordinal: 3, kind: 'teach', form_id: 'f1' } },
    { kind: 'update', table: 'sentences', id: 's1', patch: { es: 'Una medialuna.', tokens: [{ surface: 'medialuna.' }] } },
    { kind: 'update', table: 'forms', id: 'f1', patch: { form: 'medialuna' } },
  ]);
});

test('an inserted row is retired, and an inserted slot deleted', () => {
  const steps = planUndo([
    rev(1, 'form_answers', 'a1', null, { id: 'a1', answer: 'buenas' }),
    rev(2, 'lesson_slots', 'l1', null, { id: 'l1' }),
  ]);
  assert.deepEqual(steps, [
    { kind: 'delete', table: 'lesson_slots', id: 'l1' },
    { kind: 'retire', table: 'form_answers', id: 'a1' },
  ]);
});

test('a write that changed nothing needs no undo', () => {
  assert.deepEqual(planUndo([rev(1, 'forms', 'f1', { id: 'f1', form: 'x', updated_at: '1' }, { id: 'f1', form: 'x', updated_at: '2' })]), []);
});
