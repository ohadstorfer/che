// How a tip's Markdown is read into the parts the tip screen draws (src/lib/tip-layout.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tipLayout } from '../../../src/lib/tip-layout.ts';

const kinds = (body) => tipLayout(body).map((b) => b.kind);
const plain = (block) => block.spans.map((s) => s.text).join('');

test('the first sentence is the lead, the rest stays one paragraph', () => {
  const blocks = tipLayout('The little word matches the thing, not you. Learn each word with its *un* or *una*. One twist: *agua* takes **un**.');
  assert.deepEqual(kinds('x'), ['lead']);
  assert.deepEqual(blocks.map((b) => b.kind), ['lead', 'text']);
  assert.equal(plain(blocks[0]), 'The little word matches the thing, not you.');
  assert.equal(plain(blocks[1]), 'Learn each word with its un or una. One twist: agua takes un.');
});

test('a Spanish sentence on its own is an example; one inside a sentence stays put', () => {
  const blocks = tipLayout('**Che** gets attention — like "hey": *Che, ¿todo bien?* It comes first: *Che, Juan, ¿un mate?* Casual only.');
  assert.deepEqual(blocks.map((b) => b.kind), ['lead', 'examples', 'text', 'examples', 'text']);
  assert.deepEqual(blocks[1].lines, ['Che, ¿todo bien?']);
  assert.deepEqual(kinds('*Vos* can go either side: *¿Vos sos Juan?* and *¿Sos vos?* are both fine.'), ['lead']);
});

test('Spanish with its English is a pair, and a run of them is one block', () => {
  const blocks = tipLayout('Big moments: **se recibió** — *graduated*; **te paso el link**; **se jubiló** — *retired*. And more.');
  assert.deepEqual(blocks.map((b) => b.kind), ['lead', 'pairs', 'text']);
  assert.deepEqual(blocks[1].rows, [
    { es: 'se recibió', en: 'graduated' },
    { es: 'te paso el link', en: '' },
    { es: 'se jubiló', en: 'retired' },
  ]);
  // A gloss in the middle of a sentence is not lifted out of it.
  assert.deepEqual(kinds('Cut in **fetas** — *slices* — at the counter.'), ['lead']);
});

test('tables: a header row, pairs written side by side, and plain rows', () => {
  const [verbs] = tipLayout('| | querer | poder |\n| yo | quiero | puedo |\n| vos | **querés** | **podés** |');
  assert.deepEqual(verbs.head, ['', 'querer', 'poder']);
  assert.equal(verbs.rows.length, 2);

  const [named] = tipLayout('| yo (now) | vos |\n| llamo | **llames** |\n| vengo | **vengas** |');
  assert.deepEqual(named.head, ['yo (now)', 'vos']);

  const [pairs] = tipLayout('| yo | estoy | vos | estás |\n| ellos | **están** | | |');
  assert.equal(pairs.head, null);
  assert.deepEqual(pairs.rows, [['yo', 'estoy'], ['vos', 'estás'], ['ellos', '**están**']]);

  const [plainRows] = tipLayout('| yo | **soy** | I am |\n| vos | **sos** | you are |');
  assert.equal(plainRows.head, null);
  assert.equal(plainRows.rows.length, 2);
});

test('a table glued to its paragraph, with no blank line, is still a table', () => {
  const blocks = tipLayout('Swap the vowel.\n| yo (now) | vos |\n| llamo | **llames** |\n| vengo | **vengas** |\n*Ir* is the odd one out.');
  assert.deepEqual(blocks.map((b) => b.kind), ['lead', 'table', 'text']);
  assert.deepEqual(blocks[1].head, ['yo (now)', 'vos']);
});
