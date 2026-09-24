// More than one right answer for a word typed on its own (src/lib/answers.ts,
// gradeTyped and companions). Before this, "yo soy" for "I am" was wrong: only
// the form itself, its other gender and its alternative spellings counted.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { companions, gradeTyped } from '../../../src/lib/answers.ts';
import { checkSentenceAlternatives, checkWordAnswers } from '../lib/alternatives.mjs';
import { buildRows } from '../lib/rows.mjs';

const { formEntries } = buildRows();
const deck = formEntries.filter((f) => !f.is_glue && f.pos !== 'propn');
const get = (text) => deck.find((f) => f.form === text);
const right = (input, text, meaning) => gradeTyped(input, get(text), deck, meaning).correct;

test('a verb typed with its subject pronoun is right', () => {
  assert.equal(right('yo soy', 'soy'), true);
  assert.equal(right('Yo soy', 'soy'), true, 'case does not count');
  assert.equal(right('vos sos', 'sos'), true);
  assert.equal(right('yo tengo', 'tengo'), true);
});

test('only the pronoun that agrees with the verb', () => {
  assert.equal(right('vos soy', 'soy'), false);
  assert.equal(right('yo sos', 'sos'), false);
  assert.equal(right('tú sos', 'sos'), false, 'there is no tú to accept');
  assert.equal(right('yo yo soy', 'soy'), false, 'one pronoun, once');
});

test('a third person takes the pronoun the English names', () => {
  const es = get('es');
  assert.deepEqual(companions(es, 'is (he/she is)').flat(), ['él', 'ella']);
  assert.deepEqual(companions(es, 'she is').flat(), ['ella']);
  assert.deepEqual(companions(es, 'is').flat(), ['él', 'ella']);
  const son = get('son');
  assert.deepEqual(companions(son, 'they are').flat(), ['ellos', 'ellas']);
  assert.deepEqual(companions(son, 'you (pl.) are').flat(), ['ustedes']);
});

test('a pronominal verb takes its clitic, with or without the pronoun', () => {
  assert.equal(right('me llamo', 'llamo'), true);
  assert.equal(right('yo me llamo', 'llamo'), true);
  assert.equal(right('te llamo', 'llamo'), false);
  assert.equal(right('me yo llamo', 'llamo'), false);
});

test('an imperative takes no pronoun', () => {
  assert.deepEqual(companions(get('sentate'), 'sit down'), []);
});

test('a noun typed with the article that agrees with it is right', () => {
  assert.equal(right('una medialuna', 'medialuna'), true);
  assert.equal(right('la medialuna', 'medialuna'), true);
  assert.equal(right('el medialuna', 'medialuna'), false);
  assert.equal(right('los hermanos', 'hermanos'), true);
  assert.equal(right('la hermanos', 'hermanos'), false);
});

test('a noun with no gender recorded takes no article from the rules', () => {
  assert.deepEqual(companions(get('café'), 'coffee'), []);
});

test('the slips forgiven on the word are forgiven after a companion too', () => {
  const graded = gradeTyped('una medialúna', get('medialuna'), deck);
  assert.equal(graded.correct, true);
  assert.equal(graded.note, 'accent');
});

test('stored answers count for the meaning they were written for, and only that one', () => {
  const hola = { ...get('hola'), accepts: [{ meaning: 'hi', answer: 'buenas' }] };
  const lex = deck.map((f) => (f.id === hola.id ? hola : f));
  assert.equal(gradeTyped('buenas', hola, lex, 'hi').correct, true);
  assert.equal(gradeTyped('Buenas', hola, lex, 'Hi').correct, true, 'meanings compare without case');
  assert.equal(gradeTyped('buenas', hola, lex, 'hello').correct, false);
});

// --- what course:answers stores (scripts/course/lib/alternatives.mjs) --------

test('a proposed word answer is stored only if it is new, rioplatense, and not another course word', () => {
  const hola = get('hola');
  const { rows, problems, skipped } = checkWordAnswers({
    form: hola,
    meanings: ['hi', 'hello'],
    proposed: [
      { meaning: 'hi', answer: 'buenas' },
      { meaning: 'Hi', answer: 'Buenas' }, // the same answer again
      { meaning: 'hi', answer: 'hola' }, // the word itself
      { meaning: 'hi', answer: 'chau' }, // another course word, another meaning
      { meaning: 'hi', answer: 'hi' }, // the English
      { meaning: 'bye', answer: 'buenas' }, // not one of its meanings
      { meaning: 'hello', answer: 'buenas tú' }, // tuteo
    ],
    deck,
  });
  assert.deepEqual(rows, [{ form_id: hola.id, meaning: 'hi', answer: 'buenas' }]);
  assert.equal(skipped.length, 2);
  assert.equal(problems.length, 4);
});

test('a proposed sentence alternative must be buildable from its own tiles', () => {
  const sentence = { es: '¿Vos sos Lucía?', en: 'Are you Lucía?', es_alt: ['¿Sos Lucía?'] };
  const { es_alt, added, problems } = checkSentenceAlternatives({
    sentence,
    proposed: ['¿Sos vos Lucía?', '¿Sos Lucía vos?', '¿Sos Lucía?', '¿Vos sos Sofi?', 'Sos vos Lucía?'],
  });
  assert.deepEqual(added, ['¿Sos vos Lucía?', '¿Sos Lucía vos?']);
  assert.deepEqual(es_alt, ['¿Sos Lucía?', '¿Sos vos Lucía?', '¿Sos Lucía vos?']);
  assert.equal(problems.length, 2, 'a word the tiles lack, and a missing ¿');
});

test('a stored phrase for the meaning is right, and names the word being drilled', () => {
  const porteña = { ...get('porteña'), accepts: [{ meaning: 'from Buenos Aires', answer: 'de Buenos Aires' }] };
  const graded = gradeTyped('de buenos aires', porteña, deck, 'from Buenos Aires');
  assert.equal(graded.correct, true);
  assert.equal(graded.note, 'synonym');
  assert.equal(graded.expected, 'porteña');
  assert.equal(gradeTyped('de buenos aires', porteña, deck, 'a porteño').correct, false, 'only for that meaning');
  assert.equal(gradeTyped('porteña', porteña, deck, 'from Buenos Aires').note, undefined, 'the word itself needs no note');
});
