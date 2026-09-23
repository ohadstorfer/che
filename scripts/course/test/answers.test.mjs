// The app's answer rules (src/lib/answers.ts), on sentences built from the real
// outline. Every case here is a learner being marked wrong for a right answer,
// or right for a wrong one, before these rules existed.
import assert from 'node:assert/strict';
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
  gradeTyped,
  typedAnswerMatches,
} from '../../../src/lib/answers.ts';
import { buildContent } from '../lib/content.mjs';
import { loadOutline } from '../lib/outline.mjs';
import { buildRows } from '../lib/rows.mjs';

const { outline } = loadOutline();
const { formEntries } = buildRows();

/** The lexicon a learner holds at the end of unit 7 — the deck exercises draw on. */
const forms = formEntries.filter((f) => f.unit_order <= 7 && !f.is_glue && f.pos !== 'propn');
const byForm = (text) => forms.find((f) => f.form === text);
const formById = new Map(formEntries.map((f) => [f.id, f]));

// Sentences across the units these rules are about: an optional "che", subject
// pronouns, adjectives that have a gender, set phrases, and two ways to say
// the same thing.
const CONTENT = {
  'un-cafe-por-favor': {
    sentences: {
      cafe: { es: 'Un café, por favor.', en: 'A coffee, please.', target: 'por favor' },
      mate: { es: 'Un mate, por favor.', en: 'A mate, please.', target: 'mate' },
    },
  },
  'hola-che': {
    sentences: {
      chau_che: { es: 'Chau, che.', en: 'Bye!', target: 'chau' },
      que_onda: { es: '¿Qué onda?', en: "What's up?", target: 'qué onda' },
      dale_chau: { es: 'Dale, chau.', en: 'OK, bye.', target: 'dale' },
      bueno_chau: { es: 'Bueno, chau.', en: 'Well, bye.', target: 'bueno' },
      soy_sofi: { es: 'Soy Sofi.', en: "I'm Sofi.", target: 'soy' },
    },
  },
  'de-donde-sos': {
    sentences: {
      de_donde: { es: '¿De dónde sos?', en: 'Where are you from?', es_alt: ['¿De dónde sos vos?'], target: 'dónde' },
      soy_de_aca: { es: 'Soy de acá.', en: "I'm from here.", target: 'acá' },
    },
  },
  'vos-y-sos': {
    sentences: {
      vos_sos_juan: { es: '¿Vos sos Juan?', en: 'Are you Juan?', target: 'sos' },
    },
  },
  'el-y-ella': {
    sentences: {
      ella_es_de_aca: { es: 'Ella es de acá.', en: 'She is from here.', target: 'ella' },
    },
  },
  'argentino-argentina': {
    sentences: {
      sos_argentino: { es: '¿Sos argentino?', en: 'Are you Argentinian?', target: 'argentino' },
      el_uruguayo: { es: 'Él es uruguayo.', en: "He's Uruguayan.", target: 'uruguayo' },
      si_uruguaya: { es: 'Sí, es uruguaya.', en: "Yes, she's Uruguayan.", target: 'uruguaya' },
    },
  },
};

const built = buildContent(outline, CONTENT);
assert.deepEqual(built.errors, [], built.errors.join('\n'));

/** The shape loadSentences hands the app: glue and names out of `form_ids`. */
const sentences = built.sentences.map((s) => {
  const tokens = s.tokens.map((t) => ({
    surface: t.surface,
    form_ids: t.form_ids.filter((id) => {
      const f = formById.get(id);
      return f && !f.is_glue && f.pos !== 'propn';
    }),
  }));
  return { ...s, tokens, form_ids: [...new Set(tokens.flatMap((t) => t.form_ids))], shown: null };
});
const sentence = (es) => {
  const hit = sentences.find((s) => s.es === es);
  if (!hit) throw new Error(`no sentence "${es}" in the test content`);
  return hit;
};
const words = (text) => text.split(' ');

test('a sentence build accepts what the English allows', () => {
  assert.ok(sentenceAnswerMatches(['chau'], sentence('Chau, che.')), '"che" is optional');
  assert.ok(sentenceAnswerMatches(words('sos Juan'), sentence('¿Vos sos Juan?')), 'pronoun dropped');
  assert.ok(sentenceAnswerMatches(words('yo soy de acá'), sentence('Soy de acá.')), 'pronoun added');
  assert.ok(sentenceAnswerMatches(words('sos argentina'), sentence('¿Sos argentino?')), 'other gender');
  assert.ok(sentenceAnswerMatches(words('sí ella es uruguaya'), sentence('Sí, es uruguaya.')));
  assert.ok(sentenceAnswerMatches(words('de dónde sos vos'), sentence('¿De dónde sos?')), 'authored word order');
  assert.ok(sentenceAnswerMatches(words('qué onda'), sentence('¿Qué onda?')));
});

test('a sentence build rejects real mistakes, however small', () => {
  assert.ok(!sentenceAnswerMatches(words('vos soy Juan'), sentence('¿Vos sos Juan?')), 'wrong person');
  assert.ok(!sentenceAnswerMatches(words('él es uruguaya'), sentence('Él es uruguayo.')), 'wrong gender, "he"');
  assert.ok(!sentenceAnswerMatches(words('sí es uruguayo'), sentence('Sí, es uruguaya.')), 'wrong gender, "she"');
  assert.ok(!sentenceAnswerMatches(words('sos vos Juan'), sentence('¿Vos sos Juan?')), 'not an accepted order');
  assert.ok(!sentenceAnswerMatches(words('juan sos'), sentence('¿Vos sos Juan?')));
});

test('transcribing audio accepts only what was said', () => {
  assert.ok(sentenceAnswerMatches(words('chau che'), sentence('Chau, che.'), { byEar: true }));
  assert.ok(!sentenceAnswerMatches(['chau'], sentence('Chau, che.'), { byEar: true }));
});

test('typing forgives typos, not other words', () => {
  assert.ok(typedAnswerMatches('soy', byForm('soy'), forms));
  assert.ok(!typedAnswerMatches('sos', byForm('soy'), forms), 'sos is a word, not a typo');
  assert.ok(!typedAnswerMatches('es', byForm('él'), forms));
  assert.ok(!typedAnswerMatches('y', byForm('yo'), forms), 'too short to have a typo');
  assert.ok(typedAnswerMatches('uruguyo', byForm('uruguayo'), forms), 'a typo in a long word');
  assert.ok(typedAnswerMatches('argentina', byForm('argentino'), forms), 'same English, other gender');
  assert.ok(typedAnswerMatches('tambien', byForm('también'), forms), 'accents are not the test');
});

test('a wrong build blames the words she missed, not ones she could leave out', () => {
  assert.deepEqual(missedForms(sentence('¿Vos sos Juan?'), words('soy Juan'), forms), [byForm('sos').id]);
  assert.deepEqual(missedForms(sentence('Él es uruguayo.'), words('él es argentino'), forms), [byForm('uruguayo').id]);
});

test('no gap option is also a right answer', () => {
  const s = sentence('¿Sos argentino?');
  for (let i = 0; i < 50; i++) {
    const labels = gapOptions(s, byForm('argentino'), forms).map((o) => o.label);
    assert.ok(!labels.includes('argentina'), labels.join(', '));
  }
});

test('a phrase gap is answered among phrases', () => {
  const s = sentence('Un café, por favor.');
  for (let i = 0; i < 20; i++) {
    const options = gapOptions(s, byForm('por favor'), forms);
    assert.ok(options.every((o) => o.label.includes(' ')), options.map((o) => o.label).join(', '));
  }
});

test('set phrases break into word tiles; no spare tile is a synonym', () => {
  assert.deepEqual(sentenceTiles(sentence('¿Qué onda?'), forms).answer, ['qué', 'onda']);
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

test('ñ is a letter: a missing tilde is a slip in a long word and another word in a short one', () => {
  const f = (form, gloss = 'x') => ({ id: form, lemma_id: form, pos: 'noun', form, gloss_en: gloss, is_glue: false });
  const año = f('año', 'year');
  const compañero = f('compañero', 'classmate');
  const lex = [año, compañero, f('mano', 'hand')];
  assert.deepEqual(gradeTyped('ano', año, lex), { correct: false, expected: 'año' });
  assert.deepEqual(gradeTyped('companero', compañero, lex), { correct: true, note: 'enye', expected: 'compañero' });
  assert.deepEqual(gradeTyped('compañero', compañero, lex), { correct: true, expected: 'compañero' });
  assert.equal(gradeTyped('mano', año, lex).correct, false, 'a course word is never a slip');
});

test('accents are accepted and pointed out; typos too', () => {
  assert.deepEqual(gradeTyped('tambien', byForm('también'), forms), { correct: true, note: 'accent', expected: 'también' });
  assert.deepEqual(gradeTyped('También', byForm('también'), forms), { correct: true, expected: 'también' });
  assert.equal(gradeTyped('uruguyo', byForm('uruguayo'), forms).note, 'typo');
  assert.deepEqual(gradeTyped('sos', byForm('soy'), forms), { correct: false, expected: 'soy' });
});

test('a form accepts its alternative spellings', () => {
  const okay = { ...byForm('también'), alt: ['tambien nomas'] };
  assert.equal(gradeTyped('tambien nomas', okay, forms).correct, true);
});
