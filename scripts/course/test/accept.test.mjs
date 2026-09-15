// Accepted answers and the English-coverage check, run through buildContent
// against the real outline — the same gate authored and generated content pass.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildContent } from '../lib/content.mjs';
import { loadOutline } from '../lib/outline.mjs';

const { outline } = loadOutline();

/** One sentence in unit 2 (which may use everything from units 1–2). Its
 *  target doesn't matter here, so errors about it are left out. */
function build(s) {
  const out = buildContent(outline, { 'de-donde-sos': { sentences: { x: { target: 'es', ...s } } } });
  return { ...out, errors: out.errors.filter((e) => !/target/.test(e)) };
}
const alts = (es, en, extra = {}) => {
  const { sentences, errors } = build({ es, en, ...extra });
  assert.deepEqual(errors, []);
  return sentences[0].es_alt;
};

test('dropped and added subject pronouns', () => {
  assert.deepEqual(alts('¿Vos sos de acá?', 'Are you from here?'), ['¿Sos de acá?']);
  assert.deepEqual(alts('Juan es de acá, pero yo soy de Rosario.', 'Juan is from here, but I am from Rosario.'), [
    'Juan es de acá, pero soy de Rosario.',
  ]);
  assert.deepEqual(alts('Sí, es de acá.', "Yes, she's from here."), ['Sí, ella es de acá.']);
  assert.deepEqual(alts('Él es de acá.', "He's from here."), ['Es de acá.']);
  // Nothing says who "is" is: no pronoun to add.
  assert.deepEqual(alts('Sofi es de acá.', 'Sofi is from here.'), []);
  // "¿Sos vos?" asks about the person; the pronoun is the point.
  assert.deepEqual(alts('¿Sos vos, Martín?', 'Is that you, Martín?'), []);
});

test('the other gender only when nothing says which', () => {
  assert.deepEqual(alts('¿Sos argentino?', 'Are you Argentinian?'), [
    '¿Sos argentina?',
    '¿Vos sos argentino?',
    '¿Vos sos argentina?',
  ]);
  assert.deepEqual(alts('Él es argentino.', "He's Argentinian."), ['Es argentino.']);
});

test('an optional "che" can go, and its punctuation goes with it', () => {
  assert.deepEqual(alts('Chau, che.', 'Bye!'), ['Chau.']);
});

test('authored alternatives are checked like the sentence', () => {
  const { errors } = build({ es: '¿De dónde sos?', en: 'Where are you from?', es_alt: ['¿De dónde eres?'] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /es_alt "¿De dónde eres\?": "eres" is tuteo/);
});

test('an English that leaves out a word the Spanish needs fails the build', () => {
  const { errors } = build({ es: 'Hola, soy de acá.', en: "I'm from here." });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /has nothing for "Hola"/);
  // Idiomatic translations are declared, not guessed at.
  assert.deepEqual(build({ es: '¿Cómo te llamás?', en: "What's your name?", loose: ['cómo'] }).errors, []);
});
