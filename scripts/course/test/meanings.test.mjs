// What a word means on screen (src/lib/meanings.ts, answers.ts meaningOf and
// gradeTyped). Before this, every screen printed the whole dictionary entry —
// "Type it in Spanish: thanks, thank you" — and a fixed one-sense label would
// have printed "fine" for the `bien` of "bien hecho".
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { gradeTyped, meaningOf, selfGlossed, sharesMeaning } from '../../../src/lib/answers.ts';
import { meaningsFromSentences, standsAlone, withMeanings } from '../../../src/lib/meanings.ts';
import { buildRows } from '../lib/rows.mjs';

const form = (id, text, gloss, unit_order, extra = {}) => ({
  id,
  lemma_id: `l-${id}`,
  lemma: text,
  pos: 'adv',
  form: text,
  gloss_en: gloss,
  gloss_note_en: null,
  features: {},
  unit_id: `u${unit_order}`,
  unit_ordinal: unit_order,
  unit_order,
  is_glue: false,
  register: 'neutral',
  audio_path: null,
  ...extra,
});

const bien = form('bien', 'bien', 'well, fine, good', 2);
const bueno = form('bueno', 'bueno', 'well, OK', 5);
const gracias = form('gracias', 'gracias', 'thanks, thank you', 1);

const sentence = (id, tokens, shown_count = 0, target_form_id = 'bien') => ({
  id,
  unit_id: 'u2',
  unit_order: 2,
  es: '',
  en: '',
  en_alt: [],
  es_alt: [],
  audio_path: null,
  target_form_id,
  difficulty: 1,
  tokens,
  form_ids: tokens.flatMap((t) => t.form_ids),
  shown: shown_count ? { shown_count, correct_count: 0, last_shown_at: null } : null,
});

const byId = (forms) => new Map(forms.map((f) => [f.id, f]));

test('a word no sentence has glossed shows one sense of its gloss, not the list', () => {
  const out = byId(withMeanings([gracias], []));
  assert.equal(meaningOf(out.get('gracias')), 'thanks');
  assert.equal(meaningOf(gracias), 'thanks', 'even before meanings are worked out');
});

test("a word's meanings come from its sentences — including ones its gloss never listed", () => {
  const sentences = [
    sentence('s1', [{ surface: '¡Bien', form_ids: ['bien'], gloss: 'well' }, { surface: 'hecho!', form_ids: [] }]),
    sentence('s2', [{ surface: 'Está', form_ids: [] }, { surface: 'bien.', form_ids: ['bien'], gloss: 'all right' }]),
  ];
  assert.deepEqual(meaningsFromSentences(sentences).get('bien').sort(), ['all right', 'well']);
});

test('the meaning shown is the one she has met', () => {
  const sentences = [
    sentence('s1', [{ surface: 'bien', form_ids: ['bien'], gloss: 'fine' }]),
    sentence('s2', [{ surface: 'bien', form_ids: ['bien'], gloss: 'well' }], 3),
  ];
  const out = byId(withMeanings([bien, bueno], sentences, 2));
  assert.equal(out.get('bien').meaning_en, 'well');
  assert.deepEqual(out.get('bien').meanings_en, ['well', 'fine']);
});

test('between meanings met as often, the one that reads like the dictionary comes first', () => {
  const sos = form('sos', 'sos', 'you are', 3, { pos: 'verb' });
  const sentences = [
    sentence('s1', [{ surface: '¿Sos', form_ids: ['sos'], gloss: 'are you' }], 0, 'sos'),
    sentence('s2', [{ surface: 'Sos', form_ids: ['sos'], gloss: "you're" }], 0, 'sos'),
  ];
  assert.equal(byId(withMeanings([sos], sentences)).get('sos').meaning_en, "you're");
  // Having met it the other way still wins: familiarity comes first.
  sentences[0].shown = { shown_count: 2, correct_count: 0, last_shown_at: null };
  assert.equal(byId(withMeanings([sos], sentences)).get('sos').meaning_en, 'are you');
});

test('a meaning another word in reach also has is passed over while there is a clearer one', () => {
  const sentences = [
    sentence('s1', [{ surface: 'bien', form_ids: ['bien'], gloss: 'well' }], 3),
    sentence('s2', [{ surface: 'bien', form_ids: ['bien'], gloss: 'fine' }]),
  ];
  // bueno ("well, OK") is taught in unit 5: out of reach at unit 2, in reach at 5.
  assert.equal(byId(withMeanings([bien, bueno], sentences, 2)).get('bien').meaning_en, 'well');
  assert.equal(byId(withMeanings([bien, bueno], sentences, 5)).get('bien').meaning_en, 'fine');
});

test("a sentence's rendering leaves the sentence only if it is a translation of the word", () => {
  assert.equal(standsAlone("you're", 'you are'), true, 'contractions are opened');
  assert.equal(standsAlone('are you', 'you are'), true);
  assert.equal(standsAlone('not great', 'badly, not well'), true, 'a new meaning the gloss never listed');
  assert.equal(standsAlone("it's", 'you are'), false, '"¡Sos vos!" = "It\'s you!"');
  assert.equal(standsAlone('there', 'hey'), false, '"Hola, che" = "Hi there"');
  assert.equal(standsAlone('me', 'I'), false, '"¿Yo?" = "Me?"');

  const che = form('che', 'che', 'hey', 2, { pos: 'interj' });
  const sentences = [
    sentence('s1', [{ surface: 'che.', form_ids: ['che'], gloss: 'there' }], 5, 'che'),
    sentence('s2', [{ surface: 'Che,', form_ids: ['che'], gloss: 'hey' }], 0, 'che'),
  ];
  const out = byId(withMeanings([che], sentences)).get('che');
  assert.equal(out.meaning_en, 'hey', 'met more often as "there", still asked as "hey"');
  assert.deepEqual(out.meanings_en, ['hey'], 'and "there" is not an answer che accepts');
});

test('the other gender of the same word is not a rival', () => {
  const argentino = form('m', 'argentino', 'Argentinian', 1, { lemma_id: 'arg', pos: 'adj' });
  const argentina = form('f', 'argentina', 'Argentinian', 1, { lemma_id: 'arg', pos: 'adj' });
  assert.equal(byId(withMeanings([argentino, argentina], [])).get('m').meaning_en, 'Argentinian');
});

test('another word that means what the prompt showed is right, with a note', () => {
  const { formEntries } = buildRows();
  const deck = withMeanings(
    formEntries.filter((f) => f.unit_order <= 7 && !f.is_glue && f.pos !== 'propn'),
    [],
    7,
  );
  const get = (text) => deck.find((f) => f.form === text);
  // bueno is "well, OK", and both are taken (bien, dale): it keeps "well".
  assert.equal(meaningOf(get('bueno')), 'well');
  assert.deepEqual(gradeTyped('bien', get('bueno'), deck), { correct: true, note: 'synonym', expected: 'bueno' });
  assert.deepEqual(gradeTyped('bueno', get('bueno'), deck), { correct: true, expected: 'bueno' });
  // bien shows "fine", which bueno doesn't mean.
  assert.equal(meaningOf(get('bien')), 'fine');
  assert.equal(gradeTyped('bueno', get('bien'), deck).correct, false);
  // A word that means something else is still wrong.
  assert.equal(gradeTyped('chau', get('bueno'), deck).correct, false);
});

test('meanings from sentences keep two words that share one apart in distractors', () => {
  const a = { ...form('a', 'laburo', 'job', 3), meanings_en: ['work'] };
  const b = form('b', 'trabajo', 'work', 3);
  assert.equal(sharesMeaning(a, b), true);
});

test('a word is never its own meaning while its gloss has a real translation', () => {
  const medialuna = form('ml', 'medialuna', 'croissant', 1, { pos: 'noun' });
  const sentences = [
    sentence('s1', [{ surface: 'medialuna,', form_ids: ['ml'], gloss: 'medialuna' }], 5, 'ml'),
    sentence('s2', [{ surface: 'medialuna.', form_ids: ['ml'], gloss: 'croissant' }], 0, 'ml'),
  ];
  const out = byId(withMeanings([medialuna], sentences)).get('ml');
  assert.equal(out.meaning_en, 'croissant', 'a prompt saying "medialuna" would print its own answer');
  assert.equal(selfGlossed(out), false);

  // A loanword with nothing else keeps itself — and is kept out of the
  // exercises that translate it instead (session.ts, exercisesFor).
  const cortado = form('co', 'cortado', 'cortado', 1, { pos: 'noun' });
  assert.equal(byId(withMeanings([cortado], [])).get('co').meaning_en, 'cortado');
  assert.equal(selfGlossed(cortado), true);
});
