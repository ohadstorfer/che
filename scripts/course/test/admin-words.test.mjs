// Editing words and sentences in the admin (src/lib/admin-words.ts,
// docs/superplan-admin-palabras.md §3, §5), against the real course: what each
// operation writes, what it pauses, and what it brings back.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { gradeTyped } from '../../../src/lib/answers.ts';
import {
  checkAnswer,
  checkNewForm,
  deckOf,
  pendingFor,
  planFeatures,
  planMeaning,
  planMove,
  planRetire,
  planSentence,
  planSpelling,
  replaceWord,
  sentenceState,
  sentencesUsing,
  withForm,
} from '../../../src/lib/admin-words.ts';
import { buildRows } from '../lib/rows.mjs';

/** The course as the admin loads it, straight after the seed: everything published. */
function course() {
  const { rows, formEntries } = buildRows();
  const own = new Map(rows.forms.map((f) => [f.id, f]));
  return {
    forms: formEntries.map((f) => ({
      ...f,
      status: 'published',
      position: own.get(f.id).position,
      source: 'outline',
      own_gloss_en: own.get(f.id).gloss_en,
      own_gloss_note_en: own.get(f.id).gloss_note_en,
    })),
    lemmas: rows.lemmas,
    units: rows.units,
    lessons: rows.lessons,
    slots: rows.lesson_slots.map((s) => ({ ...s, id: s.id })),
    sentences: rows.sentences.map((s) => ({ ...s, status: 'published', problems: [] })),
    answers: [],
    asked: new Map(),
  };
}
const data = course();
const form = (d, text) => d.forms.find((f) => f.form === text);
const sentence = (d, es) => d.sentences.find((s) => s.es === es);
/** The data after a plan's sentence writes, as the next plan would load it. */
function applied(d, plan) {
  const next = structuredClone({ ...d, asked: undefined });
  next.asked = new Map();
  for (const w of plan.writes) {
    if (w.op !== 'update') continue;
    const list = { forms: next.forms, sentences: next.sentences, lemmas: next.lemmas }[w.table];
    const row = list?.find((r) => r.id === w.id);
    if (row) Object.assign(row, w.patch);
  }
  return next;
}
const edit = (d, es, edits) => planSentence(d, sentence(d, es), edits);

// ---------------------------------------------------------------------------
// §3 — what pauses a sentence, and what brings it back
// ---------------------------------------------------------------------------

test('1. a word the learner hasn\'t met yet pauses it; taking it out brings it back', () => {
  const paused = edit(data, 'Un café, por favor.', { es: 'Un perro, por favor.', en: 'A dog, please.', target_form_id: form(data, 'café').id });
  assert.equal(paused.row.status, 'draft');
  assert.ok(paused.problems.some((p) => p.includes(`"perro" isn't taught until unit 8`)), paused.problems.join('\n'));
  assert.ok(paused.paused);
  const back = planSentence(applied(data, paused), { ...sentence(data, 'Un café, por favor.'), ...paused.row }, { es: 'Un café, por favor.', en: 'A coffee, please.' });
  assert.deepEqual(back.problems, []);
  assert.equal(back.row.status, 'published');
  assert.ok(back.wentLive);
});

test('2. a word that is not in the course pauses it', () => {
  const plan = edit(data, 'Una medialuna, por favor.', { es: 'Un croissant, por favor.' });
  assert.ok(plan.problems.some((p) => p.includes(`"croissant" isn't in the course lexicon`)), plan.problems.join('\n'));
  assert.ok(plan.problems.some((p) => p.includes('no longer uses "medialuna"')), 'and it lost its target');
  const back = planSentence(data, { ...sentence(data, 'Una medialuna, por favor.'), ...plan.row }, { es: 'Una medialuna, por favor.' });
  assert.deepEqual(back.problems, []);
});

test('3. a retired word pauses the sentences that use it; undoing the retirement clears it', () => {
  const retire = planRetire(data, form(data, 'mate'));
  const s = retire.sentences.find((p) => p.before.es === 'Un mate, por favor.');
  assert.ok(s.problems.some((p) => p.includes('"mate" is a retired word')), s.problems.join('\n'));
  assert.equal(s.row.status, 'draft');
  const back = planSentence(data, { ...s.before, ...s.row }, {});
  assert.deepEqual(back.problems, []);
  assert.equal(back.row.status, 'published');
});

test('4. tuteo pauses it', () => {
  const plan = edit(data, 'Soy Sofi.', { es: '¿Tú eres Sofi?', en: 'Are you Sofi?' });
  assert.ok(plan.problems.some((p) => p.includes('"Tú" is tuteo')), plan.problems.join('\n'));
  assert.ok(plan.problems.some((p) => p.includes('"eres" is tuteo')));
  assert.deepEqual(planSentence(data, { ...sentence(data, 'Soy Sofi.'), ...plan.row }, { es: 'Soy Sofi.', en: "I'm Sofi." }).problems, []);
});

test('5. a word from Spain or Mexico pauses it', () => {
  const plan = edit(data, 'Agua, por favor.', { es: 'Zumo, por favor.', en: 'Juice, please.' });
  assert.ok(plan.problems.some((p) => p.includes('"Zumo" is not rioplatense — use "jugo"')), plan.problems.join('\n'));
  assert.deepEqual(planSentence(data, { ...sentence(data, 'Agua, por favor.'), ...plan.row }, { es: 'Agua, por favor.', en: 'Water, please.' }).problems, []);
});

test('6. English that doesn\'t ask for a word pauses it', () => {
  const plan = edit(data, 'Dale, chau.', { en: 'Bye!' });
  assert.ok(plan.problems.some((p) => p.includes('nothing for "Dale"')), plan.problems.join('\n'));
  assert.deepEqual(planSentence(data, { ...sentence(data, 'Dale, chau.'), ...plan.row }, { en: 'OK, bye.' }).problems, []);
});

test('7. losing the word it teaches pauses it', () => {
  const plan = edit(data, '¿Y una medialuna?', { es: '¿Y un café?', en: 'And a coffee?' });
  assert.ok(plan.problems.some((p) => p.includes('no longer uses "medialuna"')), plan.problems.join('\n'));
  assert.deepEqual(planSentence(data, { ...sentence(data, '¿Y una medialuna?'), ...plan.row }, { es: '¿Y una medialuna?', en: 'And a croissant?' }).problems, []);
});

test('8. a missing opening ¿ or ¡ pauses it', () => {
  const plan = edit(data, '¿Todo bien?', { es: 'Todo bien?' });
  assert.ok(plan.problems.some((p) => p.includes('opening "¿"')), plan.problems.join('\n'));
  assert.deepEqual(planSentence(data, { ...sentence(data, '¿Todo bien?'), ...plan.row }, { es: '¿Todo bien?' }).problems, []);
});

test('9. a word too informal for the unit pauses it', () => {
  const strict = structuredClone({ ...data, asked: undefined });
  strict.asked = new Map();
  const unit = strict.units.find((u) => u.id === sentence(strict, 'Chau, che.').unit_id);
  unit.register_max = 'neutral';
  const plan = planSentence(strict, sentence(strict, 'Chau, che.'), { es: 'Chau, che.' });
  assert.ok(plan.problems.some((p) => p.includes('"che" is informal; this unit allows up to neutral')), plan.problems.join('\n'));
  assert.deepEqual(planSentence(strict, { ...sentence(strict, 'Chau, che.'), ...plan.row }, { es: 'Chau.', en: 'Bye!' }).problems, []);
});

test('an untouched sentence writes nothing', () => {
  for (const s of data.sentences) assert.deepEqual(planSentence(data, s, {}).writes, [], s.es);
});

test('a draft that nobody paused stays a draft when it passes', () => {
  const d = structuredClone({ ...data, asked: undefined });
  d.asked = new Map();
  sentence(d, 'Un jugo, por favor.').status = 'ai_reviewed';
  assert.equal(planSentence(d, sentence(d, 'Un jugo, por favor.'), { en: 'One juice, please.' }).row.status, 'ai_reviewed');
});

// ---------------------------------------------------------------------------
// §5.9 — glosses and alternatives after an edit
// ---------------------------------------------------------------------------

test('a new English drops the glosses, and course:gloss finds the sentence pending', () => {
  // Once medialuna means "medialuna", the English can say so.
  const d = structuredClone({ ...withForm(data, form(data, 'medialuna').id, { gloss_en: 'medialuna' }), asked: undefined });
  d.asked = new Map();
  const s = sentence(d, 'Un café y una medialuna.');
  s.tokens = s.tokens.map((t, i) => ({ ...t, gloss: ['a', 'coffee', 'and', 'a', 'croissant'][i] }));
  const plan = planSentence(d, s, { en: 'A coffee and a medialuna.' });
  assert.ok(plan.glossesPending);
  assert.equal(plan.row.tokens.filter((t) => t.gloss).length, 0);
  assert.deepEqual(plan.problems, []);
  assert.equal(plan.row.status, 'published');
});

test('a changed Spanish keeps the glosses of the words that stayed', () => {
  const d = structuredClone({ ...data, asked: undefined });
  d.asked = new Map();
  const s = sentence(d, 'Un café, por favor.');
  s.tokens = s.tokens.map((t, i) => ({ ...t, gloss: ['a', 'coffee', 'please'][i] }));
  const plan = planSentence(d, s, { es: 'Un café, che, por favor.' });
  assert.deepEqual(plan.row.tokens.map((t) => t.gloss ?? null), ['a', 'coffee', null, 'please']);
  assert.deepEqual(plan.row.tokens.map((t) => !!t.gloss_pending), [false, false, true, false]);
  assert.equal(plan.row.audio_path, null);
});

test('alternatives that no longer fit are dropped for confirmation, and the rules regenerate theirs', () => {
  const plan = edit(data, 'Soy Sofi.', { es: 'Soy Lucía.', en: "I'm Lucía." });
  assert.deepEqual(plan.droppedAlts, ['Yo soy Sofi.']);
  assert.deepEqual(plan.row.es_alt, ['Yo soy Lucía.']);
});

test('another Spanish with tuteo is refused; one that can\'t be built is only a warning', () => {
  // "Soy Sofi, che." is refused twice over: `che` never trails the sentence.
  const plan = edit(data, 'Soy Sofi.', { es_alt: ['Yo soy Sofi.', 'Tú eres Sofi.', 'Sofi soy.', 'Soy Sofi, che.', 'Che, soy Sofi.'] });
  assert.ok(plan.altProblems.some((p) => p.includes('Tú eres Sofi.')));
  assert.ok(plan.altProblems.some((p) => p.includes('Soy Sofi, che.') && p.includes('goes in front')));
  // In front it is legal Spanish; the English just never asks for it.
  assert.ok(plan.altWarnings.some((p) => p.includes('Che, soy Sofi.')));
  assert.deepEqual(plan.row.es_alt, ['Yo soy Sofi.', 'Sofi soy.', 'Che, soy Sofi.']);
});

// ---------------------------------------------------------------------------
// §5.1–5.3 — a word's meaning, grammar and answers
// ---------------------------------------------------------------------------

test('medialuna means medialuna: written on its lemma, since medialunas has a meaning of its own', () => {
  const plan = planMeaning(data, form(data, 'medialuna'), { gloss_en: 'medialuna', gloss_note_en: 'a small sweet croissant-like pastry' });
  assert.deepEqual(plan.writes, [
    { op: 'update', table: 'lemmas', id: form(data, 'medialuna').lemma_id, patch: { gloss_en: 'medialuna', gloss_note_en: 'a small sweet croissant-like pastry' } },
  ]);
});

test('a form of a lemma with other forms gets its own meaning', () => {
  const soy = form(data, 'soy');
  const plan = planMeaning(data, soy, { gloss_en: "I'm", gloss_note_en: '' });
  assert.equal(plan.writes[0].table, 'forms');
  assert.equal(plan.writes[0].id, soy.id);
});

test('giving café a gender makes "un café" right', () => {
  const cafe = form(data, 'café');
  assert.equal(gradeTyped('un café', deckOf(data).find((f) => f.id === cafe.id), deckOf(data)).correct, false);
  const plan = planFeatures(data, cafe, { gender: 'm', number: 'sg' });
  assert.deepEqual(plan.errors, []);
  assert.deepEqual(plan.writes[0], { op: 'update', table: 'forms', id: cafe.id, patch: { features: { gender: 'm', number: 'sg' } } });
  const next = withForm(data, cafe.id, { features: { gender: 'm', number: 'sg' } });
  const deck = deckOf(next);
  assert.equal(gradeTyped('un café', deck.find((f) => f.id === cafe.id), deck).correct, true);
});

test('an answer typed by hand is checked like a generated one', () => {
  const hola = form(data, 'hola');
  const ok = checkAnswer(data, hola, 'hi', 'buenas');
  assert.equal(ok.error, null);
  assert.deepEqual(ok.writes[0].row, { form_id: hola.id, meaning: 'hi', answer: 'buenas', source: 'staff' });
  assert.match(checkAnswer(data, hola, 'hi', 'hola').error, /already right/);
  assert.match(checkAnswer(data, form(data, 'sos'), 'you are', 'tú eres').error, /tuteo/);
  assert.match(checkAnswer(data, hola, 'goodbye', 'chau').error, /not one of its meanings/);
});

// ---------------------------------------------------------------------------
// §5.4–5.7 — the big operations
// ---------------------------------------------------------------------------

test('replacing a word touches whole words only, and keeps a capital', () => {
  assert.equal(replaceWord('Mate, tomate y mate.', 'mate', 'maté'), 'Maté, tomate y maté.');
  assert.equal(replaceWord('¿Mate o café?', 'mate', 'maté'), '¿Maté o café?');
});

test('fixing a spelling rewrites every sentence that uses the word, glosses kept', () => {
  const d = structuredClone({ ...data, asked: undefined });
  d.asked = new Map();
  const s = sentence(d, 'Una medialuna, por favor.');
  s.tokens = s.tokens.map((t, i) => ({ ...t, gloss: ['a', 'croissant', 'please'][i] }));
  const medialuna = form(d, 'medialuna');
  const plan = planSpelling(d, medialuna, 'media luna');
  assert.deepEqual(plan.errors, []);
  assert.equal(plan.renameLemma, true);
  assert.deepEqual(
    plan.sentences.map((p) => p.row.es).sort(),
    ['Un café y una media luna.', 'Una media luna, por favor.', '¿Y una media luna?'].sort(),
  );
  assert.ok(plan.sentences.every((p) => p.problems.length === 0), plan.sentences.flatMap((p) => p.problems).join('\n'));
  const rewritten = plan.sentences.find((p) => p.before.id === s.id);
  assert.deepEqual(rewritten.row.tokens.map((t) => t.gloss), ['a', 'croissant', 'please']);
  assert.equal(rewritten.glossesPending, false);
  assert.deepEqual(plan.writes.slice(0, 2), [
    { op: 'update', table: 'forms', id: medialuna.id, patch: { form: 'media luna', audio_path: null } },
    { op: 'update', table: 'lemmas', id: medialuna.lemma_id, patch: { lemma: 'media luna' } },
  ]);
  assert.equal(plan.writes.filter((w) => w.table === 'sentences').length, 3);
});

test('a spelling that is tuteo, or unchanged, is refused', () => {
  assert.ok(planSpelling(data, form(data, 'sos'), 'eres').errors.some((e) => e.includes('tuteo')));
  assert.ok(planSpelling(data, form(data, 'mate'), 'mate').errors.length);
});

test('moving a word to a later unit pauses the sentences before it; moving it back brings them back', () => {
  const medialuna = form(data, 'medialuna');
  const later = data.units.find((u) => u.course_order === 5);
  const lesson = data.lessons.find((l) => l.unit_id === later.id && l.ordinal === 1);
  const plan = planMove(data, medialuna, later.id, lesson.id);
  assert.deepEqual(plan.errors, []);
  assert.deepEqual(plan.paused.map((p) => p.before.es).sort(), ['Un café y una medialuna.', 'Una medialuna, por favor.', '¿Y una medialuna?'].sort());
  assert.ok(plan.paused.every((p) => p.problems.some((x) => x.includes("isn't taught until unit 5"))));
  assert.ok(plan.writes.some((w) => w.op === 'deleteSlot' && w.slot.form_id === medialuna.id));
  assert.ok(plan.writes.some((w) => w.op === 'insert' && w.row.lesson_id === lesson.id && w.row.kind === 'teach'));

  const moved = applied(withForm(data, medialuna.id, { unit_id: later.id, unit_order: 5 }), plan);
  const home = data.units.find((u) => u.id === medialuna.unit_id);
  const homeLesson = data.lessons.find((l) => l.unit_id === home.id && l.ordinal === 1);
  const back = planMove(moved, form(moved, 'medialuna'), home.id, homeLesson.id);
  assert.deepEqual(back.wentLive.map((p) => p.before.es).sort(), plan.paused.map((p) => p.before.es).sort());
  assert.ok(back.sentences.every((p) => p.row.status === 'published'));
});

test('retiring a word takes it out of its lessons and pauses its sentences', () => {
  const mate = form(data, 'mate');
  const plan = planRetire(data, mate);
  assert.equal(plan.retiresLemma, false, 'mates is still in the course');
  assert.equal(planRetire(data, form(data, 'cortado')).retiresLemma, data.forms.filter((f) => f.lemma_id === form(data, 'cortado').lemma_id).length === 1);
  assert.deepEqual(plan.writes[0], { op: 'update', table: 'forms', id: mate.id, patch: { status: 'retired' } });
  assert.ok(plan.writes.some((w) => w.op === 'deleteSlot' && w.slot.form_id === mate.id));
  assert.equal(plan.paused.length, sentencesUsing(data, mate.id).length);
});

test('a new word is checked before it is added', () => {
  const unit = data.units[0];
  const lesson = data.lessons.find((l) => l.unit_id === unit.id);
  const base = { lemma_id: null, lemma: 'pileta', pos: 'noun', features: { gender: 'f', number: 'sg' }, gloss_en: 'swimming pool', gloss_note_en: '', register: 'neutral', is_glue: false, unit_id: unit.id, lesson_id: lesson.id };
  assert.deepEqual(checkNewForm(data, { ...base, form: 'pileta' }).errors, []);
  assert.ok(checkNewForm(data, { ...base, form: 'mate', lemma: 'mate' }).errors.some((e) => e.includes('already in the course')));
  assert.ok(checkNewForm(data, { ...base, form: 'coche', lemma: 'coche' }).errors.some((e) => e.includes('"auto"')));
});

// ---------------------------------------------------------------------------
// §8 — pending
// ---------------------------------------------------------------------------

test('pending: paused sentences, glosses, alternatives, and no sentences at all', () => {
  const d = structuredClone({ ...data, asked: undefined });
  d.asked = new Map();
  const kinds = (text) => pendingFor(d, form(d, text)).map((p) => p.kind);
  assert.ok(kinds('medialuna').includes('glosses'), 'nothing is glossed in the fixture');
  assert.ok(kinds('medialuna').includes('alternatives'), 'nothing was asked yet');
  const perro = form(d, 'perro');
  assert.ok(pendingFor(d, perro).some((p) => p.kind === 'no_sentences'));
  const s = sentence(d, 'Una medialuna, por favor.');
  s.status = 'draft';
  s.problems = ['x'];
  assert.equal(sentenceState(s), 'paused');
  assert.ok(kinds('medialuna').includes('paused'));
});
