// Paged loads (src/lib/fetch-all.ts): every row, in order, whatever the guess
// at how many pages there are — and a query that names itself goes in one trip
// the second time.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { all } from '../../../src/lib/fetch-all.ts';

/** A table of `count` rows that notes which pages each trip asked for. */
function table(count) {
  const rows = Array.from({ length: count }, (_, i) => i);
  const trips = [];
  let open = null;
  const query = () => ({
    range: async (from, to) => {
      // Requests made in the same tick are one trip.
      if (!open) {
        trips.push((open = []));
        queueMicrotask(() => (open = null));
      }
      open.push(from / (to - from + 1));
      return { data: rows.slice(from, to + 1), error: null };
    },
  });
  return { rows, trips, query };
}

test('an unnamed query asks for the first page alone, then four at a time', async () => {
  const small = table(259);
  assert.deepEqual(await all(small.query), small.rows);
  assert.deepEqual(small.trips, [[0]]);

  const big = table(2719);
  assert.deepEqual(await all(big.query), big.rows);
  assert.deepEqual(big.trips, [[0], [1, 2, 3, 4]]);
});

test('a named query goes in one trip once its size is known', async () => {
  const first = table(2719);
  assert.deepEqual(await all(first.query, { remember: 'states:a' }), first.rows);
  // Pages of 500 for a query that will know to ask for them together.
  assert.deepEqual(first.trips, [[0], [1, 2, 3, 4], [5, 6, 7, 8]]);

  const second = table(2719);
  assert.deepEqual(await all(second.query, { remember: 'states:a' }), second.rows);
  assert.deepEqual(second.trips, [[0, 1, 2, 3, 4, 5]]);

  // Someone else's is not hers.
  const other = table(2719);
  await all(other.query, { remember: 'states:b' });
  assert.deepEqual(other.trips, [[0], [1, 2, 3, 4], [5, 6, 7, 8]]);
});

test('a stale guess loses no rows, either way', async () => {
  await all(table(2719).query, { remember: 'states:c' });
  // She has more now: the three pages come back full, and the rest follow.
  const grown = table(5200);
  assert.deepEqual(await all(grown.query, { remember: 'states:c' }), grown.rows);
  assert.deepEqual(grown.trips, [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12, 13]]);
  // And fewer: the pages past the end come back empty.
  const shrunk = table(40);
  assert.deepEqual(await all(shrunk.query, { remember: 'states:c' }), shrunk.rows);
  assert.deepEqual(shrunk.trips, [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  const after = table(40);
  await all(after.query, { remember: 'states:c' });
  assert.deepEqual(after.trips, [[0]]);
});

test('a table that ends on a full page is followed to its empty one', async () => {
  const exact = table(2000);
  assert.deepEqual(await all(exact.query, { remember: 'states:d' }), exact.rows);
  const again = table(2000);
  assert.deepEqual(await all(again.query, { remember: 'states:d' }), again.rows);
  assert.deepEqual(again.trips, [[0, 1, 2, 3, 4]]);
});

test('nothing waits on the phone to say how many pages there were', async () => {
  // No trip has been made for this name, and none is held up finding out.
  const fresh = table(10);
  const rows = all(fresh.query, { remember: 'states:e' });
  assert.deepEqual(fresh.trips, [[0]]);
  assert.deepEqual(await rows, fresh.rows);
});

test('an error on any page is thrown', async () => {
  const query = () => ({ range: async (from) => (from === 1000 ? { data: null, error: { message: 'no' } } : { data: Array(1000).fill(0), error: null }) });
  await assert.rejects(all(query), /no/);
});
