// Aligning tokens with their English (scripts/course/lib/gloss.mjs). The model's
// answer is only stored if every gloss is words that are really in the
// sentence's English — these are the ways it can fail that check.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyGlosses, glossPrompt, inEnglish, isGlossed } from '../lib/gloss.mjs';

const bienHecho = {
  id: 's1',
  es: '¡Bien hecho, che!',
  en: 'Well done!',
  tokens: [
    { surface: '¡Bien', form_ids: ['bien'] },
    { surface: 'hecho,', form_ids: ['hecho'] },
    { surface: 'che!', form_ids: ['che'], gloss: 'hey' },
  ],
};

test('a gloss must be whole words of the English', () => {
  assert.equal(inEnglish('well done', 'Well done!'), true);
  assert.equal(inEnglish('Well', 'Well done!'), true, 'case does not count');
  assert.equal(inEnglish("I'm", 'I’m from here.'), true, 'curly apostrophes are apostrophes');
  assert.equal(inEnglish('do', "I don't know."), false, 'not a piece of a word');
  assert.equal(inEnglish('fine', 'Well done!'), false);
  assert.equal(inEnglish('', 'Well done!'), false);
});

test('glosses are applied by token, trimmed of punctuation', () => {
  const { tokens, problems } = applyGlosses(bienHecho, { tokens: [{ i: 0, en: 'Well' }, { i: 1, en: 'done!' }] });
  assert.deepEqual(problems, []);
  assert.equal(tokens[0].gloss, 'Well');
  assert.equal(tokens[1].gloss, 'done');
});

test('a gloss that is not in the English is dropped and reported', () => {
  const { tokens, problems } = applyGlosses(bienHecho, { tokens: [{ i: 0, en: 'fine' }, { i: 7, en: 'well' }] });
  assert.equal(tokens[0].gloss, undefined);
  assert.equal(problems.length, 2);
});

test('a token the answer leaves out loses its old gloss', () => {
  const { tokens } = applyGlosses(bienHecho, { tokens: [{ i: 0, en: 'well' }] });
  assert.equal(tokens[2].gloss, undefined, '"che" has nothing in "Well done!"');
  assert.deepEqual(tokens[2].form_ids, ['che'], 'the rest of the token is kept');
  assert.equal(isGlossed({ tokens }), true);
});

test('the prompt numbers every token and names what it is', () => {
  const formById = new Map([['bien', { lemma: 'bien', pos: 'adv', is_glue: false }]]);
  const { user } = glossPrompt({ sentences: [bienHecho], formById });
  assert.match(user, /id: s1/);
  assert.match(user, /English: Well done!/);
  assert.match(user, /0\. ¡Bien — bien \(adv\)/);
  assert.match(user, /2\. che!/);
});
