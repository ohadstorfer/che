// Accepted answers and the English-coverage check, run through buildContent
// against the real outline — the same gate authored and generated content pass.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildContent } from '../lib/content.mjs';
import { loadOutline } from '../lib/outline.mjs';

const { outline } = loadOutline();

/**
 * One sentence in a unit of the outline. The target doesn't matter to these
 * tests, so errors about it are left out.
 */
function build(slug, target, s) {
  const out = buildContent(outline, { [slug]: { sentences: { x: { target, ...s } } } });
  return { ...out, errors: out.errors.filter((e) => !/target/.test(e)) };
}
const alts = (slug, target, es, en, extra = {}) => {
  const { sentences, errors } = build(slug, target, { es, en, ...extra });
  assert.deepEqual(errors, []);
  return sentences[0].es_alt;
};

test('dropped and added subject pronouns', () => {
  assert.deepEqual(alts('el-y-ella', 'es', '¿Vos sos de acá?', 'Are you from here?'), ['¿Sos de acá?']);
  assert.deepEqual(alts('el-y-ella', 'pero', 'Juan es de acá, pero yo soy de Rosario.', 'Juan is from here, but I am from Rosario.'), [
    'Juan es de acá, pero soy de Rosario.',
  ]);
  assert.deepEqual(alts('el-y-ella', 'es', 'Sí, es de acá.', "Yes, she's from here."), ['Sí, ella es de acá.']);
  assert.deepEqual(alts('el-y-ella', 'él', 'Él es de acá.', "He's from here."), ['Es de acá.']);
  // Nothing says who "is" is: no pronoun to add.
  assert.deepEqual(alts('el-y-ella', 'es', 'Sofi es de acá.', 'Sofi is from here.'), []);
  // "¿Sos vos?" asks about the person; the pronoun is the point.
  assert.deepEqual(alts('de-donde-sos', 'dónde', '¿De dónde sos, Martín?', 'Where are you from, Martín?'), []);
});

test('the other gender only when nothing says which', () => {
  assert.deepEqual(alts('argentino-argentina', 'argentino', '¿Sos argentino?', 'Are you Argentinian?'), [
    '¿Sos argentina?',
    '¿Vos sos argentino?',
    '¿Vos sos argentina?',
  ]);
  assert.deepEqual(alts('argentino-argentina', 'argentino', 'Él es argentino.', "He's Argentinian."), ['Es argentino.']);
});

test('the other gender never for a word agreeing with a noun, nor when the listener is named', () => {
  const last = outline.units.at(-1).slug;
  const all = (es, en) => build(last, 'x', { es, en }).sentences[0].es_alt;
  // An adjective next to its noun agrees with the noun.
  assert.ok(!all('Tengo la heladera rota.', "I've got a broken fridge.").some((a) => /roto/.test(a)));
  // A quantifier agrees with what it counts.
  assert.ok(!all('¿Cuántos años tenés vos?', 'How old are you?').some((a) => /Cuántas/.test(a)));
  // Lucía is who she's talking to.
  assert.ok(!all('Che, Lucía, ¿vos sos chilena?', 'Hey Lucía, are you Chilean?').some((a) => /chileno/.test(a)));
});

test('no "yo" before a command that is spelled like a first-person verb', () => {
  const last = outline.units.at(-1).slug;
  const all = (es, en) => build(last, 'x', { es, en }).sentences[0].es_alt;
  assert.ok(!all('Sé sincera.', 'Be honest.').some((a) => /^Yo /.test(a)));
  assert.ok(!all('Pedí unos días.', 'Ask for a few days off.').some((a) => /^Yo /.test(a)));
  assert.ok(all('Pedí unos días.', 'I asked for a few days off.').includes('Yo pedí unos días.'));
});

test('an optional "che" can go, and its punctuation goes with it', () => {
  assert.deepEqual(alts('hola-che', 'chau', 'Chau, che.', 'Bye!'), ['Chau.']);
});

test('authored alternatives are checked like the sentence', () => {
  const { errors } = build('de-donde-sos', 'dónde', {
    es: '¿De dónde sos?',
    en: 'Where are you from?',
    es_alt: ['¿De dónde eres?'],
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /es_alt "¿De dónde eres\?": "eres" is tuteo/);
});

test('an English that leaves out a word the Spanish needs fails the build', () => {
  const { errors } = build('de-donde-sos', 'acá', { es: 'Hola, soy de acá.', en: "I'm from here." });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /has nothing for "Hola"/);
  // Idiomatic translations are declared, not guessed at.
  assert.deepEqual(
    build('como-te-llamas', 'llamás', { es: '¿Cómo te llamás?', en: "What's your name?", loose: ['cómo'] }).errors,
    [],
  );
});
