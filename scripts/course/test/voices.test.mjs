// Casting: which voice reads which line (scripts/course/lib/tts.mjs).
//
// The rule the course holds itself to: a sentence that says who is speaking is
// read by a voice of that gender. "Soy Martín" is never Malena. Everything else
// alternates, and the alternation absorbs the forced lines rather than being
// skewed by them.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assignVoices, speakerGender } from '../lib/tts.mjs';

// A pocket lexicon in the shape the database hands over: forms by id, each with
// the `features.gender` the real rows carry.
const F = {
  soy: { id: 'soy', form: 'soy', features: {} },
  sos: { id: 'sos', form: 'sos', features: {} },
  llamo: { id: 'llamo', form: 'llamo', features: {} },
  estoy: { id: 'estoy', form: 'estoy', features: {} },
  martin: { id: 'martin', form: 'Martín', features: { gender: 'm' } },
  sofi: { id: 'sofi', form: 'Sofi', features: { gender: 'f' } },
  lucia: { id: 'lucia', form: 'Lucía', features: { gender: 'f' } },
  cansada: { id: 'cansada', form: 'cansada', features: { gender: 'f', number: 'sg' } },
  gracias: { id: 'gracias', form: 'gracias', features: {} },
  cordoba: { id: 'cordoba', form: 'Córdoba', features: {} }, // a place carries none
  de: { id: 'de', form: 'de', features: {} },
  vos: { id: 'vos', form: 'vos', features: {} },
};
const formById = new Map(Object.values(F).map((f) => [f.id, f]));
/** Tokens from form ids, the way a stored sentence holds them. */
const toks = (...ids) => ids.map((id) => ({ surface: F[id].form, form_ids: [id] }));

const VOICES = [
  { id: 'malena', gender: 'female' },
  { id: 'tomas', gender: 'male' },
];

test('a name after soy casts the speaker', () => {
  assert.equal(speakerGender(toks('soy', 'martin'), formById), 'm');
  assert.equal(speakerGender(toks('soy', 'sofi'), formById), 'f');
  assert.equal(speakerGender(toks('llamo', 'lucia'), formById), 'f');
});

test('an adjective agreeing with the speaker casts them too', () => {
  assert.equal(speakerGender(toks('estoy', 'cansada'), formById), 'f');
});

test('naming someone is not being them', () => {
  // "Gracias, Sofi." — spoken to Sofi, by anyone.
  assert.equal(speakerGender(toks('gracias', 'sofi'), formById), null);
  // "Sos Lucía, ¿no?" — second person says nothing about the voice.
  assert.equal(speakerGender(toks('sos', 'lucia'), formById), null);
});

test('the speaker is the first name, not every name in the line', () => {
  // "Hola, soy Martín. ¿Vos sos Lucía?" — Martín is talking to Lucía.
  assert.equal(speakerGender(toks('soy', 'martin', 'vos', 'sos', 'lucia'), formById), 'm');
});

test('only the token right after the verb counts', () => {
  // "Soy de Córdoba" — a place, and one the rule must not reach past `de` for.
  assert.equal(speakerGender(toks('soy', 'de', 'cordoba'), formById), null);
});

test('a cast line gets the voice its text demands', () => {
  const clips = [
    { id: 'a', sortKey: 'a', gender: 'm' },
    { id: 'b', sortKey: 'b', gender: 'f' },
  ];
  const got = assignVoices(clips, VOICES);
  assert.equal(got.get('a').id, 'tomas');
  assert.equal(got.get('b').id, 'malena');
});

test('the free lines pay back the cast ones', () => {
  // Three lines forced onto one voice; the other four are free. A blind
  // alternation would finish 5–2. Balancing finishes 4–3 at worst.
  const clips = [
    { id: '1', sortKey: '1', gender: 'f' },
    { id: '2', sortKey: '2', gender: 'f' },
    { id: '3', sortKey: '3', gender: 'f' },
    ...['4', '5', '6', '7'].map((id) => ({ id, sortKey: id, gender: null })),
  ];
  const got = assignVoices(clips, VOICES);
  const tally = { malena: 0, tomas: 0 };
  for (const v of got.values()) tally[v.id]++;
  assert.ok(Math.abs(tally.malena - tally.tomas) <= 1, JSON.stringify(tally));
  for (const id of ['1', '2', '3']) assert.equal(got.get(id).id, 'malena');
});

test('the same clips get the same voices on a second run', () => {
  const clips = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, sortKey: id, gender: null }));
  const first = assignVoices(clips, VOICES);
  // Shuffled in, because a re-run reads them back in whatever order the
  // database returns — the sort is what has to make that not matter.
  const second = assignVoices([...clips].reverse(), VOICES);
  for (const c of clips) assert.equal(first.get(c.id).id, second.get(c.id).id, c.id);
});

test('a line with no voice of its gender is still read', () => {
  const onlyWomen = [{ id: 'malena', gender: 'female' }];
  const got = assignVoices([{ id: 'a', sortKey: 'a', gender: 'm' }], onlyWomen);
  assert.equal(got.get('a').id, 'malena');
});
