// What a word means on screen (src/lib/meanings.ts, answers.ts meaningOf and
// gradeTyped). Before this, every screen printed the whole dictionary entry —
// "Type it in Spanish: thanks, thank you" — and a fixed one-sense label would
// have printed "fine" for the `bien` of "bien hecho".
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { glossSenses, gradeTyped, meaningOf, selfGlossed, sharesMeaning, senseOf, shownMeaning, splitSense } from '../../../src/lib/answers.ts';
import { meaningsFromSentences, popoverMeanings, standsAlone, withMeanings } from '../../../src/lib/meanings.ts';
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
const rows = (form, gloss_en, inContext) => popoverMeanings({ form, gloss_en }, inContext);

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
  // Met more as a question, the card still says what the word is: a question's
  // word order is the sentence's.
  sentences[0].shown = { shown_count: 2, correct_count: 0, last_shown_at: null };
  const asked = byId(withMeanings([sos], sentences)).get('sos');
  assert.equal(asked.meaning_en, 'you are');
  assert.deepEqual(asked.meanings_en, ['are you', "you're"], 'both still count as right');
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
  assert.equal(standsAlone('pretty bad', 'bad, badly'), false, 'a meaning the gloss never listed is the sentence\'s');
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

test('a rendering stands for the word only when it is one of its senses, whole', () => {
  // "No sabés" is "You don't know": the "don't" lands on `sabés`, and the card
  // for `sabés` said "you don't know".
  assert.equal(standsAlone("you don't know", 'you know'), false);
  assert.equal(standsAlone("can't you", 'you can'), false);
  assert.equal(standsAlone("I won't make it", 'get there (when I, when he/she get there)'), false);
  assert.equal(standsAlone("I don't know", "I don't know"), true, 'a negative word keeps its "not"');
  // A word more.
  assert.equal(standsAlone('I have to', 'I have'), false);
  assert.equal(standsAlone('there are twenty-two of us', 'we are'), false);
  assert.equal(standsAlone('seventh birthday', 'birthday'), false);
  // A word less.
  assert.equal(standsAlone('are', 'you are'), false);
  assert.equal(standsAlone('park', 'to park'), false);
  assert.equal(standsAlone('went', 'we went'), false);
  // Small words with nothing to hang on, or left hanging.
  assert.equal(standsAlone('I do', 'I'), false);
  assert.equal(standsAlone('do you', 'you'), false);
  assert.equal(standsAlone('we had a', 'we had (a time)'), false, '"we had a great time", cut short');
  assert.equal(standsAlone('what a', 'what'), false);
  // What a sentence adds without changing the meaning.
  assert.equal(standsAlone('do you know', 'you know'), true);
  assert.equal(standsAlone('did you know', 'you know'), false, 'but not a change of tense');
  assert.equal(standsAlone('he came', 'came (he/she came)'), true);
  assert.equal(standsAlone('works', 'works (he/she works)'), true, 'a note is not part of the sense');
  assert.equal(standsAlone('a bike', 'bike'), true);
  assert.equal(standsAlone('a', 'a, an'), true, 'a word that is all filler');
  assert.equal(standsAlone("I'd go out", 'would go out, would leave (I/he/she)'), true);
  assert.equal(standsAlone('her name is', 'his/her name is'), true, 'either side of a slash');
  assert.equal(standsAlone('she went', 'he/she went; it was'), true);

  const sabes = form('sabes', 'sabés', 'you know', 11, { pos: 'verb' });
  const conoces = form('conoces', 'conocés', 'you know', 135, { pos: 'verb' });
  const sentences = [
    sentence('s1', [{ surface: 'sabés', form_ids: ['sabes'], gloss: "you don't know" }], 9, 'sabes'),
    sentence('s2', [{ surface: '¿Sabés', form_ids: ['sabes'], gloss: 'do you know' }], 0, 'sabes'),
    sentence('s3', [{ surface: '¿Conocés', form_ids: ['conoces'], gloss: 'do you know' }], 0, 'conoces'),
  ];
  // Met most as "you don't know", and every other meaning is `conocés` too.
  const out = byId(withMeanings([sabes, conoces], sentences, 200)).get('sabes');
  assert.equal(out.meaning_en, 'you know');
  assert.deepEqual(out.meanings_en, ['do you know']);
  // In its own sentence the rendering still shows, with what the word means.
  assert.deepEqual(rows('sabés', 'you know', "you don't know"), [{ text: "you don't know", here: true }, { text: 'you know' }]);
});

test('a comma inside a note does not cut a sense in two', () => {
  assert.deepEqual(glossSenses('would go (I, he/she)'), ['would go (I, he/she)']);
  assert.deepEqual(glossSenses('to face, to tackle (a problem, a person); to chat up'), [
    'to face',
    'to tackle (a problem, a person)',
    'to chat up',
  ]);
  const iria = form('iria', 'iría', 'would go (I, he/she)', 292, { pos: 'verb' });
  assert.equal(byId(withMeanings([iria], [])).get('iria').meaning_en, 'would go (I, he/she)');
});

test("a gloss's brackets come off the meaning, and say what they said only when it is needed", () => {
  assert.deepEqual(splitSense('they told (a story)'), { main: 'they told', hint: 'a story' });
  assert.deepEqual(splitSense('(that) they see'), { main: 'they see', hint: 'that' });
  assert.deepEqual(splitSense('(noun) work'), { main: 'work', hint: 'noun' });
  assert.deepEqual(splitSense('you (pl.) are'), { main: 'you are', hint: 'plural' });
  assert.deepEqual(splitSense('he/she likes (someone) — with bien or mal'), {
    main: 'he/she likes',
    hint: 'someone · with bien or mal',
  });
  // A bracket that is a word of the meaning stays in it.
  assert.deepEqual(splitSense('repeat (it) to me'), { main: 'repeat it to me', hint: null });
  assert.deepEqual(splitSense('(traffic) ticket'), { main: 'traffic ticket', hint: null });
  assert.deepEqual(splitSense('well'), { main: 'well', hint: null });
  assert.deepEqual(splitSense('where (to)'), { main: 'where to', hint: null });

  const vos = form('vos', 'vos', 'you', 3, { pos: 'pron' });
  const ustedes = form('uds', 'ustedes', 'you (plural)', 37, { pos: 'pron' });
  const contaron = form('con', 'contaron', 'they told (a story)', 305, { pos: 'verb' });
  const out = byId(withMeanings([vos, ustedes, contaron], [], 400));
  // `vos` is "you" too: without the hint the two tiles read the same.
  assert.deepEqual(shownMeaning(out.get('uds')), { text: 'you', hint: 'plural' });
  // Nothing else is "they told".
  assert.deepEqual(shownMeaning(out.get('con')), { text: 'they told', hint: null });
  assert.deepEqual(shownMeaning(out.get('vos')), { text: 'you', hint: null });
  // A subjunctive's hint is where the form goes, not the dictionary's "that".
  const subj = (tense) => ({ features: { mood: 'subj', tense } });
  assert.deepEqual(senseOf(subj('pres'), '(that) they see'), { main: 'they see', hint: 'after “quiero que”' });
  assert.deepEqual(senseOf(subj('pres'), 'you come (that you come)'), { main: 'you come', hint: 'after “quiero que”' });
  assert.deepEqual(senseOf(subj('impf'), '(that) I came'), { main: 'I came', hint: 'after “quería que”' });
  assert.deepEqual(senseOf(subj('impf'), 'lived (if I/he/she lived)'), { main: 'lived', hint: 'after “si”' });
  assert.deepEqual(senseOf(subj('pres'), 'you can (when you can)'), { main: 'you can', hint: 'after “cuando”' });
  assert.deepEqual(senseOf(subj('pres'), 'you know (so that you know)'), { main: 'you know', hint: 'after “para que”' });
  assert.deepEqual(senseOf(subj('pres'), 'you say (don\'t say)'), { main: 'you say', hint: 'after “no”' });
  // Saying the meaning again with its subject is cut to the subject.
  assert.deepEqual(senseOf({ features: {} }, 'cooks (he/she cooks)'), { main: 'cooks', hint: 'he/she' });
  assert.deepEqual(senseOf({ features: {} }, 'work (they work)'), { main: 'work', hint: 'they' });
  assert.deepEqual(senseOf({ features: {} }, 'is (he/she/it is)'), { main: 'is', hint: 'he/she/it' });
  assert.deepEqual(senseOf({ features: {} }, 'they told (a story)'), { main: 'they told', hint: 'a story' });
  // Grading still goes by the sense as written.
  assert.equal(meaningOf(out.get('uds')), 'you (plural)');
});

test('the same meaning put another way is the same meaning', () => {
  // One sentence wrote "are we" for `estamos`; `somos` only ever got "we're".
  // "are we" looked like a meaning `estamos` had to itself.
  const somos = form('somos', 'somos', 'we are', 37, { pos: 'verb' });
  const estamos = form('estamos', 'estamos', 'we are', 48, { pos: 'verb' });
  const vendes = form('vendes', 'vendés', 'you sell', 60, { pos: 'verb' });
  const sentences = [
    sentence('s1', [{ surface: 'Somos', form_ids: ['somos'], gloss: "we're" }], 0, 'somos'),
    sentence('s2', [{ surface: 'Estamos', form_ids: ['estamos'], gloss: "we're" }], 0, 'estamos'),
    sentence('s3', [{ surface: '¿Estamos', form_ids: ['estamos'], gloss: 'are we' }], 0, 'estamos'),
    sentence('s4', [{ surface: '¿Vendés', form_ids: ['vendes'], gloss: 'do you sell' }], 4, 'vendes'),
  ];
  const out = byId(withMeanings([somos, estamos, vendes], sentences, 100));
  assert.equal(out.get('estamos').meaning_en, "we're");
  assert.equal(out.get('vendes').meaning_en, 'you sell', 'only ever met in a question, still not a question');
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

test("a sentence's article does not go on the word's card", () => {
  // She met "Y pan, por favor" ("And some bread, please") most, and the
  // exercise asked what `pan` means with "some bread" as the answer.
  const pan = form('pa', 'pan', 'bread', 1, { pos: 'noun' });
  const turista = form('tu', 'turista', 'tourist', 1, { pos: 'noun' });
  const sentences = [
    sentence('s1', [{ surface: 'pan,', form_ids: ['pa'], gloss: 'some bread' }], 5, 'pa'),
    sentence('s2', [{ surface: 'pan.', form_ids: ['pa'], gloss: 'bread' }], 0, 'pa'),
    sentence('s3', [{ surface: 'turista.', form_ids: ['tu'], gloss: 'a tourist' }], 3, 'tu'),
  ];
  const out = byId(withMeanings([pan, turista], sentences));
  assert.equal(out.get('pa').meaning_en, 'bread');
  assert.equal(out.get('tu').meaning_en, 'tourist');
  // Still what the sentences say, so typing it is still right.
  assert.deepEqual(out.get('pa').meanings_en, ['some bread', 'bread']);
});

// ---------------------------------------------------------------------------


test('a rendering that is a meaning of the word stands on its own', () => {
  // `bien` in "bien hecho" is "well", not the dictionary's "well, fine, good".
  assert.deepEqual(rows('bien', 'well, fine, good', 'well'), [{ text: 'well' }]);
  assert.deepEqual(rows('sos', 'you are', "you're"), [{ text: "you're" }]);
});

test("a rendering that isn't brings the word's own meaning with it", () => {
  // Every sentence the course has renders `cómo` as "what's" — and the drill
  // two screens later asks for "how".
  assert.deepEqual(rows('cómo', 'how', "what's"), [{ text: "what's", here: true }, { text: 'how' }]);
  assert.deepEqual(rows('che', 'hey', 'there'), [{ text: 'there', here: true }, { text: 'hey' }]);
  // The label only appears when a row follows it to explain what it is next to.
  assert.deepEqual(rows('mate', 'mate', 'the drink'), [{ text: 'the drink' }]);
  // "a" for `un` ("a, an") is the word's meaning, though both sides are filler.
  assert.deepEqual(rows('un', 'a, an', 'a'), [{ text: 'a' }]);
});

test('an unglossed sentence still lists the dictionary, as written', () => {
  assert.deepEqual(rows('dale', 'OK, sure, go ahead'), [{ text: 'OK' }, { text: 'sure' }, { text: 'go ahead' }]);
  // A loanword is not its own translation: the row is dropped, the note stays.
  assert.deepEqual(rows('mate', 'mate'), []);
  assert.deepEqual(rows('mate', 'mate', 'mate'), []);
});

test('an article or possessive does not make a loanword a translation', () => {
  // One sentence glossed `mate` as "the mate" — and the card teaching the
  // drink said "the mate", which an English speaker reads as "the friend".
  const mate = form('ma', 'mate', 'mate', 1, { pos: 'noun' });
  const mates = form('ms', 'mates', 'mates', 1, { pos: 'noun' });
  const sentences = [
    sentence('s1', [{ surface: 'mate', form_ids: ['ma'], gloss: 'the mate' }], 5, 'ma'),
    sentence('s2', [{ surface: 'mate', form_ids: ['ma'], gloss: "mate's" }], 0, 'ma'),
    sentence('s3', [{ surface: 'mates', form_ids: ['ms'], gloss: 'some mate' }], 0, 'ms'),
  ];
  const out = byId(withMeanings([mate, mates], sentences));
  assert.equal(out.get('ma').meaning_en, 'mate');
  assert.equal(out.get('ms').meaning_en, 'mates');
  assert.equal(selfGlossed(out.get('ma')), true);
  assert.deepEqual(rows('mate', 'mate', 'the mate'), []);
});
