// The app's answer rules (src/lib/answers.ts), against the real demo content.
// Every case here is a learner being marked wrong for a right answer, or right
// for a wrong one, before these rules existed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  gapOptions,
  matchable,
  meaningOptions,
  missedForms,
  pickImposter,
  pickOptions,
  sentenceAnswerMatches,
  sentenceTiles,
  typedAnswerMatches,
} from '../../../src/lib/answers.ts';

const course = JSON.parse(readFileSync(new URL('../../../src/lib/demo-course.json', import.meta.url), 'utf8'));
const forms = course.form_entries.filter((f) => f.unit_ordinal <= 2 && !f.is_glue && f.pos !== 'propn');
const byForm = (text, pos) => forms.find((f) => f.form === text && (!pos || f.pos === pos));
const formById = new Map(course.form_entries.map((f) => [f.id, f]));
// The app's shape: glue and names out of form_ids (sentences.ts loadSentences).
const sentences = course.sentences.map((s) => {
  const tokens = s.tokens.map((t) => {
    const content = t.form_ids.filter((id) => {
      const f = formById.get(id);
      return f && !f.is_glue && f.pos !== 'propn';
    });
    return { surface: t.surface, form_ids: content };
  });
  return { ...s, tokens, form_ids: [...new Set(tokens.flatMap((t) => t.form_ids))], shown: null };
});
const sentence = (es) => sentences.find((s) => s.es === es);
const words = (text) => text.split(' ');

test('a sentence build accepts what the English allows', () => {
  assert.ok(sentenceAnswerMatches(['chau'], sentence('Chau, che.')), '"che" is optional');
  assert.ok(sentenceAnswerMatches(words('sos Juan'), sentence('¿Vos sos Juan?')), 'pronoun dropped');
  assert.ok(sentenceAnswerMatches(words('yo soy Sofi'), sentence('Soy Sofi.')), 'pronoun added');
  assert.ok(sentenceAnswerMatches(words('no soy chilena'), sentence('No, soy chileno.')), 'other gender');
  assert.ok(sentenceAnswerMatches(words('soy inglesa y vos'), sentence('Yo soy inglés, ¿y vos?')));
  assert.ok(sentenceAnswerMatches(words('sí ella es uruguaya'), sentence('Sí, es uruguaya.')));
  assert.ok(sentenceAnswerMatches(words('de dónde sos vos'), sentence('¿De dónde sos?')), 'authored word order');
  assert.ok(sentenceAnswerMatches(words('qué tal'), sentence('¿Qué tal?')));
});

test('a sentence build rejects real mistakes, however small', () => {
  assert.ok(!sentenceAnswerMatches(words('vos soy Juan'), sentence('¿Vos sos Juan?')), 'wrong person');
  assert.ok(!sentenceAnswerMatches(words('él es uruguaya'), sentence('Él es uruguayo.')), 'wrong gender, "he"');
  assert.ok(!sentenceAnswerMatches(words('sí es uruguayo'), sentence('Sí, es uruguaya.')), 'wrong gender, "she"');
  assert.ok(!sentenceAnswerMatches(words('sos vos Juan'), sentence('¿Vos sos Juan?')), 'not an accepted order');
  assert.ok(!sentenceAnswerMatches(words('juan sos'), sentence('¿Vos sos Juan?')));
});

test('transcribing audio accepts only what was said', () => {
  assert.ok(sentenceAnswerMatches(words('hola che'), sentence('Hola, che.'), { byEar: true }));
  assert.ok(!sentenceAnswerMatches(['hola'], sentence('Hola, che.'), { byEar: true }));
});

test('typing forgives typos, not other words', () => {
  const soy = byForm('soy');
  assert.ok(typedAnswerMatches('soy', soy, forms));
  assert.ok(!typedAnswerMatches('sos', soy, forms), 'sos is a word, not a typo');
  assert.ok(!typedAnswerMatches('es', byForm('él'), forms));
  assert.ok(!typedAnswerMatches('y', byForm('yo'), forms), 'too short to have a typo');
  assert.ok(typedAnswerMatches('uruguyo', byForm('uruguayo'), forms), 'a typo in a long word');
  assert.ok(typedAnswerMatches('argentina', byForm('argentino'), forms), 'same English, other gender');
  assert.ok(typedAnswerMatches('tambien', byForm('también'), forms), 'accents are not the test');
});

test('a wrong build blames the words she missed, not ones she could leave out', () => {
  assert.deepEqual(missedForms(sentence('¿Vos sos Juan?'), words('soy Juan'), forms), [byForm('sos').id]);
  assert.deepEqual(missedForms(sentence('No, soy chileno.'), words('no soy uruguayo'), forms), [byForm('chileno').id]);
});

test('no gap option is also a right answer', () => {
  const s = sentence('¿Sos argentino?');
  for (let i = 0; i < 50; i++) {
    const labels = gapOptions(s, byForm('argentino'), forms).map((o) => o.label);
    assert.ok(!labels.includes('argentina'), labels.join(', '));
  }
});

test('a phrase gap is answered among phrases', () => {
  const s = sentence('Mucho gusto, Lucía.');
  for (let i = 0; i < 20; i++) {
    const options = gapOptions(s, byForm('mucho gusto'), forms);
    assert.ok(options.every((o) => o.label.includes(' ')), options.map((o) => o.label).join(', '));
  }
});

test('set phrases break into word tiles; no spare tile is a synonym', () => {
  assert.deepEqual(sentenceTiles(sentence('¿Qué tal?'), forms).answer, ['qué', 'tal']);
  for (let i = 0; i < 50; i++) {
    const { tiles } = sentenceTiles(sentence('Dale, chau.'), forms);
    assert.ok(!tiles.includes('bueno'), tiles.join(', '));
  }
});

test('multiple choice, true/false and matching never offer a second right answer', () => {
  for (let i = 0; i < 50; i++) {
    const forArgentino = pickOptions(byForm('argentino'), forms, 'form').map((f) => f.form);
    assert.ok(!forArgentino.includes('argentina'), forArgentino.join(', '));
    const forBien = pickOptions(byForm('bien'), forms, 'form').map((f) => f.form);
    assert.ok(!forBien.includes('bueno'), forBien.join(', '));
    const imposter = pickImposter(byForm('dale'), forms);
    assert.notEqual(imposter?.form, 'bueno');
    const block = matchable(forms).map((f) => f.form);
    assert.ok(!(block.includes('argentino') && block.includes('argentina')), block.join(', '));
    assert.ok(!(block.includes('bien') && block.includes('bueno')), block.join(', '));
  }
});

test('meaning options never include another way of saying it', () => {
  const s = sentence('Dale, chau.');
  for (let i = 0; i < 50; i++) {
    const labels = meaningOptions(s, sentences, forms).map((o) => o.label);
    assert.ok(!labels.includes('Well, bye.'), labels.join(' | '));
    assert.equal(labels.length, 3);
  }
});
