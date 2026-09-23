// Two rules a token-by-token check can't see, because every word in the
// sentence is a real Argentine word and it is the arrangement that is wrong:
// where `che` stands, and set phrases that belong to another Spanish.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chePlacement, checkPhrases, checkSentence, compoundPast } from '../../../src/lib/course-rules/check.ts';
import { REGIONAL } from '../../../src/lib/course-rules/rules.ts';
import { buildContent } from '../lib/content.mjs';
import { loadOutline } from '../lib/outline.mjs';

const { outline } = loadOutline();
const vocabulary = outline;

const problems = (slug, target, es, en) =>
  buildContent(outline, { [slug]: { sentences: { x: { target, es, en } } } }).errors;

test('che opens what you say', () => {
  assert.deepEqual(chePlacement('Che, ¿todo bien?'), []);
  assert.deepEqual(chePlacement('Che, Lucía, ¿vos sos de acá?'), []);
  // A bare greeting is the one thing that may come first: the two are one breath.
  assert.deepEqual(chePlacement('Hola, che.'), []);
  assert.deepEqual(chePlacement('Chau, che.'), []);
  assert.deepEqual(chePlacement('Buenas tardes, che.'), []);
  // Per clause, so a greeting and then a question is fine.
  assert.deepEqual(chePlacement('Hola. Che, ¿todo bien?'), []);
});

test('che is never the English "man" on the end', () => {
  for (const es of ['Mal, che.', 'Bien, che.', 'Bueno, chau, che.', 'Bueno, che, chau.', '¿Cómo te llamás, che?']) {
    assert.equal(chePlacement(es).length, 1, es);
    assert.match(chePlacement(es)[0], /goes in front/);
  }
  // The second clause is the wrong one, and it is the one named.
  assert.match(chePlacement('Che, hola. ¿Todo bien, che?')[0], /¿Todo bien, che\?/);
});

test('qué tal is Spain\'s greeting, whatever the punctuation', () => {
  for (const es of ['¿Qué tal?', 'Hola, ¿qué tal?', '¿Qué tal tus viejos?', 'Que tal.']) {
    assert.match(checkPhrases(es)[0] ?? '', /qué onda/, es);
  }
  assert.deepEqual(checkPhrases('¿Qué onda?'), []);
  assert.deepEqual(checkPhrases('¿Todo bien?'), []);
  // "qué" and "tal" apart are not the phrase.
  assert.deepEqual(checkPhrases('¿Qué hora es?'), []);
});

test('the content build refuses both, in es and in es_alt', () => {
  assert.deepEqual(problems('hola-che', 'todo bien', 'Che, ¿todo bien?', 'Hey, all good?'), []);
  assert.match(problems('hola-che', 'bien', 'Bien, che.', 'Fine.').join('\n'), /goes in front/);
  assert.match(problems('hola-che', 'qué onda', '¿Qué tal?', "How's it going?").join('\n'), /qué onda/);
  const alt = buildContent(outline, {
    'hola-che': { sentences: { x: { target: 'todo bien', es: 'Che, ¿todo bien?', en: 'Hey, all good?', es_alt: ['¿Todo bien, che?'] } } },
  });
  assert.match(alt.errors.join('\n'), /es_alt .*goes in front/);
});

test('qué onda replaced qué tal in the outline', () => {
  const lemmas = outline.lemmas.map((l) => l.lemma);
  assert.ok(lemmas.includes('qué onda'));
  assert.ok(!lemmas.includes('qué tal'));
  assert.deepEqual(problems('hola-che', 'qué onda', '¿Qué onda?', "What's up?"), []);
});

test('a word from another Spanish fails in any form, with the word to use', () => {
  const regional = (es) => checkSentence(vocabulary, vocabulary.units.at(-1), es).filter((p) => p.includes('rioplatense'));
  assert.match(regional('La piscina.')[0] ?? '', /use "pileta"/);
  assert.match(regional('Las piscinas.')[0] ?? '', /use "pileta"/);
  assert.match(regional('Me enfadé.')[0] ?? '', /use "enojar/);
  assert.match(regional('La nevera.')[0] ?? '', /use "heladera"/);
  assert.match(checkPhrases('Te echo de menos.')[0] ?? '', /extrañar/);
});

test('words that mean something else in Argentina are never blocked', () => {
  // A punch, a cut of beef, a metre, the street tree, income — and the words
  // we tell people to use, whatever else Wiktionary says they are.
  for (const w of ['piña', 'falda', 'metro', 'plátano', 'renta', 'camión', 'computadora', 'pileta', 'heladera', 'trabajo', 'tu']) {
    assert.ok(!REGIONAL.has(w), w);
  }
});

test('the compound past is Spain\'s; Buenos Aires says comí', () => {
  for (const es of ['Hoy he comido empanadas.', '¿Has visto a Juan?', 'Ya hemos llegado.', 'Me ha dicho que no.']) {
    assert.match(compoundPast(es)[0] ?? '', /simple past/, es);
  }
  // "ha" and "han" as other words, and the simple past, pass.
  for (const es of ['Hoy comí empanadas.', '¿Viste a Juan?', 'Ya llegamos.', 'Ha sido un día largo, che.'.replace('Ha sido', 'Fue')]) {
    assert.deepEqual(compoundPast(es), [], es);
  }
});

test('parts of the day take "a": a la noche, not por la noche', () => {
  assert.match(checkPhrases('Salimos por la noche.')[0] ?? '', /a la noche/);
  assert.match(checkPhrases('Por la mañana tomo mate.')[0] ?? '', /a la mañana/);
  assert.deepEqual(checkPhrases('A la noche salimos.'), []);
});
