// The app's fetch (src/lib/deadline-fetch.ts): a read that gets stuck is asked
// again, a write never is, and a read she called off stays called off.
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import { withDeadline } from '../../../src/lib/deadline-fetch.ts';

const READ = 'https://x.supabase.co/rest/v1/streaks?select=*';

/** A server whose first `stuck` requests never answer. */
function server(stuck) {
  const calls = [];
  const send = (input, init) => {
    calls.push(init?.method ?? 'GET');
    if (calls.length > stuck) return Promise.resolve(new Response('[]'));
    return new Promise((_, reject) => {
      init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  };
  return { calls, send };
}

/** Runs the clock forward until `work` settles. */
async function settle(work, step = 1000) {
  let done = false;
  const out = work.finally(() => (done = true));
  out.catch(() => {});
  while (!done) {
    await new Promise((resolve) => setImmediate(resolve));
    if (!done) mock.timers.tick(step);
  }
  return out;
}

test.beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));
test.afterEach(() => mock.timers.reset());

test('a read stuck twice lands on the third try', async () => {
  const { calls, send } = server(2);
  const res = await settle(withDeadline(READ, undefined, send));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 3);
});

test('a read stuck on every try fails after three', async () => {
  const { calls, send } = server(99);
  await assert.rejects(settle(withDeadline(READ, undefined, send)));
  assert.equal(calls.length, 3);
});

test('a read that fails outright is asked again too', async () => {
  let n = 0;
  const send = async () => {
    if (++n === 1) throw new TypeError('Network request failed');
    return new Response('[]');
  };
  const res = await settle(withDeadline(READ, undefined, send));
  assert.equal(res.status, 200);
  assert.equal(n, 2);
});

test('a write goes once, even stuck', async () => {
  const { calls, send } = server(99);
  await assert.rejects(settle(withDeadline(READ, { method: 'POST', body: '{}' }, send)));
  assert.deepEqual(calls, ['POST']);
});

test('a read she called off is not asked again', async () => {
  const { calls, send } = server(99);
  const outer = new AbortController();
  const work = settle(withDeadline(READ, { signal: outer.signal }, send));
  outer.abort();
  await assert.rejects(work);
  assert.equal(calls.length, 1);
});

test('functions and storage keep their own pace', async () => {
  const seen = [];
  const send = async (input, init) => {
    seen.push(init?.signal);
    return new Response('{}');
  };
  await withDeadline('https://x.supabase.co/functions/v1/hablar', undefined, send);
  assert.deepEqual(seen, [undefined]);
});
