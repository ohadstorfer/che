import assert from 'node:assert/strict';
import { test } from 'node:test';

import { supabase } from '../../test/supabase-stub.mjs';
import { send, sendOnce, wakeOutbox, within } from '../../../src/lib/outbox.ts';

// A fake server: every request is logged, and `answer` decides what it says.
function fakeServer(answer) {
  const log = [];
  const builder = (call) => {
    const q = {
      insert: (rows) => builder({ ...call, op: 'insert', rows }),
      upsert: (rows) => builder({ ...call, op: 'upsert', rows }),
      update: (values) => builder({ ...call, op: 'update', values }),
      select: () => q,
      single: () => q,
      eq: () => q,
      abortSignal: () => q,
      then: (ok, bad) => {
        log.push(call);
        return Promise.resolve(answer(call, log)).then(ok, bad);
      },
    };
    return q;
  };
  supabase.from = (table) => builder({ table });
  supabase.rpc = (fn) => builder({ fn, op: 'rpc' });
  return log;
}

const ok = { data: null, error: null, status: 201 };
const offline = { data: null, error: { message: 'TypeError: Network request failed', code: '' }, status: 0 };

test('a write waits for the one it needs, even while that one is retried', async () => {
  let roundTries = 0;
  const log = fakeServer((call) => {
    if (call.table === 'rounds' && ++roundTries < 3) return offline;
    return ok;
  });
  const round = send({ kind: 'insert', table: 'rounds', rows: { id: 'r' }, duplicateOk: true }, { key: 'round:r' });
  const logs = send({ kind: 'insert', table: 'review_logs', rows: [{ round_id: 'r' }] }, { needs: ['round:r'] });
  // Skip the waits between tries.
  const waker = setInterval(wakeOutbox, 5);
  const [a, b] = await Promise.all([round, logs]);
  clearInterval(waker);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.deepEqual(
    log.map((c) => c.table),
    ['rounds', 'rounds', 'rounds', 'review_logs'],
  );
});

test('an insert that already landed counts as landed', async () => {
  fakeServer(() => ({ data: null, error: { code: '23505', message: 'duplicate key' }, status: 409 }));
  const out = await send({ kind: 'insert', table: 'rounds', rows: { id: 'x' }, duplicateOk: true }, { key: 'round:x' });
  assert.equal(out.ok, true);
});

test('a refused write is dropped, and what waits on it still goes', async () => {
  const log = fakeServer((call) =>
    call.table === 'form_states' && call.op === 'upsert'
      ? { data: null, error: { code: '42501', message: 'denied' }, status: 403 }
      : ok,
  );
  const warn = console.warn;
  console.warn = () => {};
  const first = await send({ kind: 'upsert', table: 'form_states', rows: {}, onConflict: 'form_id,user_id' }, { key: 'form:f' });
  const next = await send({ kind: 'update', table: 'form_states', values: {}, match: { form_id: 'f' } }, { key: 'form:f' });
  console.warn = warn;
  assert.equal(first.ok, false);
  assert.equal(next.ok, true);
  assert.equal(log.length, 2);
});

test('writes to the same key land in the order they were made', async () => {
  const order = [];
  fakeServer(async (call) => {
    // The first is slow; the second must still wait for it.
    if (call.values?.n === 1) await new Promise((r) => setTimeout(r, 30));
    order.push(call.values?.n);
    return ok;
  });
  await Promise.all([
    send({ kind: 'update', table: 'form_states', values: { n: 1 }, match: {} }, { key: 'form:g' }),
    send({ kind: 'update', table: 'form_states', values: { n: 2 }, match: {} }, { key: 'form:g' }),
  ]);
  assert.deepEqual(order, [1, 2]);
});

test('within gives up after its time, without cancelling the write', async () => {
  let release;
  fakeServer(() => new Promise((r) => (release = () => r(ok))));
  const landed = send({ kind: 'rpc', fn: 'finish_lesson', args: {} });
  assert.equal(await within(landed, 20), null);
  release();
  assert.equal((await landed).ok, true);
});

test('sendOnce answers after the first try and keeps trying behind', async () => {
  let tries = 0;
  fakeServer(() => (++tries === 1 ? offline : { data: { id: 'row' }, error: null, status: 201 }));
  const first = await sendOnce({ kind: 'upsert', table: 'form_states', rows: {}, onConflict: 'form_id,user_id', returning: true }, { key: 'form:h' });
  assert.equal(first, null);
  wakeOutbox();
  // A later write on the same word still waits for it to land.
  const next = await send({ kind: 'update', table: 'form_states', values: {}, match: {} }, { key: 'form:h' });
  assert.equal(next.ok, true);
  assert.equal(tries, 3);
});
