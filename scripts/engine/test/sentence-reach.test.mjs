// Sentences load only as far as she has got (sentences.ts, loadSentenceRowsInReach),
// and the rest of the course reaches a word's meanings through tallies the
// database sums (form_gloss_tallies). Neither may change what a screen shows.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { meaningsFromSentences } from '../../../src/lib/meanings.ts';
import { SENTENCE_BLOCK_UNITS, blocksThrough } from '../../../src/lib/sentences.ts';

const units = Array.from({ length: 20 }, (_, i) => ({ id: `u${i + 1}`, course_order: i + 1 }));

test('blocks cover every unit up to the reach, in whole blocks', () => {
  assert.deepEqual(blocksThrough(units, 0), []);
  assert.deepEqual(blocksThrough(units, 1), [units.slice(0, SENTENCE_BLOCK_UNITS).map((u) => u.id)]);
  const through = blocksThrough([...units].reverse(), 9).flat();
  for (let o = 1; o <= 9; o++) assert.ok(through.includes(`u${o}`));
  assert.equal(new Set(blocksThrough(units, 99).flat()).size, units.length);
});

const sentence = (id, target, tokens, shown = 0) => ({
  id,
  target_form_id: target,
  unit_order: 1,
  tokens: tokens.map(([form, gloss]) => ({ surface: form, form_ids: [form], gloss })),
  shown: shown ? { shown_count: shown, correct_count: 0, last_shown_at: null } : null,
});

test('tallies plus the sentences she was shown rank as every sentence does', () => {
  const all = [
    sentence('a', 'bien', [['bien', 'well']]),
    sentence('b', 'x', [['bien', 'fine']]),
    sentence('c', 'x', [['bien', 'fine']], 2),
    sentence('d', 'bien', [['bien', 'OK']]),
  ];
  const base = {
    bien: [
      ['well', 1, 1, 1],
      ['fine', 2, 0, 1],
      ['OK', 1, 1, 1],
    ],
  };
  const shownOnly = all.filter((s) => s.shown);
  assert.deepEqual(meaningsFromSentences(shownOnly, undefined, base), meaningsFromSentences(all));
  // A sentence newer than the tallies still counts in full.
  const newer = sentence('e', 'bien', [['bien', 'alright']], 1);
  assert.deepEqual(
    meaningsFromSentences([...shownOnly, newer], undefined, base).get('bien'),
    meaningsFromSentences([...all, newer]).get('bien'),
  );
});
