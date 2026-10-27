import assert from 'node:assert/strict';
import { test } from 'node:test';

import { articleOf } from '../../../src/lib/article.ts';

const noun = (lemma_id, form, features = {}) => ({ id: 'f', lemma_id, lemma: form, pos: 'noun', form, features });
const PAQUETE = 'a44ca707-5cf5-56e4-a7de-aef226c7dafb';
const MEDIALUNA = 'aa5883af-95bf-5b63-a33a-9dc346c549ca';
const AGUA = 'ed3af589-e7c0-5b47-a42d-0cb2297bbc15';
const ANTEOJOS = '31324eb5-22f7-516d-87fc-83cf026714ef';

test('a pictured noun is taught with its indefinite article', () => {
  assert.equal(articleOf(noun(PAQUETE, 'paquete')), 'un');
  assert.equal(articleOf(noun(MEDIALUNA, 'medialuna')), 'una');
  assert.equal(articleOf(noun(MEDIALUNA, 'medialunas', { number: 'pl' })), 'unas');
  // A stressed a: un agua, but unas aguas.
  assert.equal(articleOf(noun(AGUA, 'agua')), 'un');
  assert.equal(articleOf(noun(AGUA, 'aguas', { number: 'pl' })), 'unas');
  // Only ever plural.
  assert.equal(articleOf(noun(ANTEOJOS, 'anteojos')), 'unos');
});

test('no article for anything that is not a pictured noun', () => {
  assert.equal(articleOf({ ...noun(PAQUETE, 'paquete'), pos: 'verb' }), null);
  assert.equal(articleOf(noun('00000000-0000-0000-0000-000000000000', 'algo')), null);
});
