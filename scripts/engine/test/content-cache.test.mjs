// Content kept on the phone (src/lib/content-cache.ts): a piece is fetched
// once, saved, and fetched again only when its version moved.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT_FORMAT, clearContentCache, setContentDisk, stampHash, stored } from '../../../src/lib/content-cache.ts';

function fakeDisk(files = new Map()) {
  return {
    files,
    read: async (name) => files.get(name) ?? null,
    write: async (name, text) => {
      files.set(name, text);
    },
  };
}

const fetcher = (value) => {
  const f = async () => {
    f.calls++;
    return value;
  };
  f.calls = 0;
  return f;
};

const flush = () => new Promise((r) => setTimeout(r, 0));

test('a piece is fetched once per version, then read from the phone', async () => {
  clearContentCache();
  const disk = fakeDisk();
  setContentDisk(disk);
  const fetch = fetcher({ rows: [1, 2, 3] });

  assert.deepEqual(await stored('piece', 'v1', fetch), { rows: [1, 2, 3] });
  assert.equal(fetch.calls, 1);
  await flush();
  assert.equal(JSON.parse(disk.files.get('piece')).version, 'v1');

  // Same run, same version: memory.
  await stored('piece', 'v1', fetch);
  assert.equal(fetch.calls, 1);

  // A new run (memory cleared), same version: the phone's copy, no fetch.
  clearContentCache();
  assert.deepEqual(await stored('piece', 'v1', fetch), { rows: [1, 2, 3] });
  assert.equal(fetch.calls, 1);

  // The version moved: fetched again, file replaced.
  const fresh = fetcher({ rows: [4] });
  assert.deepEqual(await stored('piece', 'v2', fresh), { rows: [4] });
  assert.equal(fresh.calls, 1);
  await flush();
  assert.equal(JSON.parse(disk.files.get('piece')).version, 'v2');
});

test('with no version to go by, the phone\'s copy is used as it is', async () => {
  clearContentCache();
  const disk = fakeDisk(new Map([['piece', JSON.stringify({ format: CONTENT_FORMAT, version: 'old', data: 'saved' })]]));
  setContentDisk(disk);
  const fetch = fetcher('network');
  assert.equal(await stored('piece', null, fetch), 'saved');
  assert.equal(fetch.calls, 0);

  // Nothing saved: fetched, and not written down without a version.
  assert.equal(await stored('other', null, fetch), 'network');
  assert.equal(fetch.calls, 1);
  await flush();
  assert.equal(disk.files.has('other'), false);
});

test('a file in an old format, or unreadable, counts as missing', async () => {
  clearContentCache();
  const disk = fakeDisk(
    new Map([
      ['a', JSON.stringify({ format: CONTENT_FORMAT - 1, version: 'v1', data: 'stale' })],
      ['b', '{not json'],
    ]),
  );
  setContentDisk(disk);
  assert.equal(await stored('a', 'v1', fetcher('fresh a')), 'fresh a');
  assert.equal(await stored('b', 'v1', fetcher('fresh b')), 'fresh b');
});

test('a failed fetch is not remembered', async () => {
  clearContentCache();
  setContentDisk(fakeDisk());
  let n = 0;
  const flaky = async () => {
    if (n++ === 0) throw new Error('offline');
    return 'ok';
  };
  await assert.rejects(stored('piece', 'v1', flaky));
  assert.equal(await stored('piece', 'v1', flaky), 'ok');
});

test('stamp hashes are stable and short', () => {
  assert.equal(stampHash(['u1', 'u2']), stampHash(['u1', 'u2']));
  assert.notEqual(stampHash(['u1', 'u2']), stampHash(['u2', 'u1']));
  assert.ok(stampHash(Array.from({ length: 8 }, (_, i) => `70:17591000${i}`)).length < 16);
});
