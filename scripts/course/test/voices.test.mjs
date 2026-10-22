// Casting: which voice reads which line (scripts/course/lib/tts.mjs).
//
// The rule the course holds itself to: a sentence that says who is speaking is
// read by a voice of that gender. "Soy Martín" is never Malena. Everything else
// alternates, and the alternation absorbs the forced lines rather than being
// skewed by them.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  assignVoices,
  castDialogue,
  castLabel,
  cutMp3,
  joinMp3,
  needsSentence,
  recordedAs,
  speakerGender,
} from '../lib/tts.mjs';

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

// --- words that are cut out of a sentence -----------------------------------

test('a lone word with the rioplatense sh is recorded inside a sentence', () => {
  for (const w of ['llame', 'vaya', 'yo', 'calle', 'Reyes', '¡Tocayo!', 'funyi']) assert.ok(needsSentence(w), w);
  // "y", "hoy" and "muy" have no sh, and a sentence already is one.
  for (const w of ['y', 'hoy', 'muy', 'mate', 'Me llamo Sofi.']) assert.ok(!needsSentence(w), w);
});

test('an mp3 is cut between frames, a frame early', () => {
  // 128 kbps at 44.1 kHz: frames of 417 bytes, each numbered in its last byte.
  const frame = (n) => {
    const f = Buffer.alloc(417);
    f.set([0xff, 0xfb, 0x90, 0xc4]);
    f[416] = n;
    return f;
  };
  const tag = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 5, 1, 2, 3, 4, 5]);
  const mp3 = Buffer.concat([tag, ...Array.from({ length: 40 }, (_, n) => frame(n))]);
  const seconds = 1152 / 44100;
  const cut = cutMp3(mp3, 10 * seconds, 20 * seconds);
  assert.equal(cut.length % 417, 0);
  assert.equal(cut[416], 9);
  assert.equal(cut.at(-1), 20);
});

test('clips are joined frame to frame, without their tags or the encoder note', () => {
  const frame = (n, note = '') => {
    const f = Buffer.alloc(417);
    f.set([0xff, 0xfb, 0x90, 0xc4]);
    f.write(note, 36, 'latin1');
    f[416] = n;
    return f;
  };
  const tag = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 5, 1, 2, 3, 4, 5]);
  const clip = (from) => Buffer.concat([tag, frame(99, 'Info'), frame(from), frame(from + 1)]);
  const joined = joinMp3([clip(1), clip(3)]);
  assert.equal(joined.length, 4 * 417);
  assert.deepEqual([1, 2, 3, 4].map((n, i) => joined[i * 417 + 416]), [1, 2, 3, 4]);
});

// --- dialogues: two people, two voices --------------------------------------

const dialogue = (text, s1, s2) => castLabel(castDialogue('id', text, { es: text, s1, s2 }, VOICES));

test('a dialogue between a man and a woman is Tomás and Malena, in the order the text says', () => {
  assert.equal(dialogue('—Tomás, ¿cómo va? —Bien, ¿y vos?', null, 'm'), 'malena+tomas');
  assert.equal(dialogue('—¿Estás cansada? —Sí, medio.', null, 'f'), 'tomas+malena');
  assert.equal(dialogue('—Gracias, querida. —No es nada.', 'm', null), 'tomas+malena');
  assert.equal(dialogue('—Encantada, Nico. —Igualmente, Juli.', 'f', 'm'), 'malena+tomas');
});

test('two men or two women get two different voices', () => {
  assert.equal(dialogue('—Hola, Fede. —Hola, Mati.', 'm', 'm'), 'tomas+agustin');
  assert.equal(dialogue('—¿Un mate, Ana? —Sí, sos una capa.', 'f', 'f'), 'malena+martina');
});

test('a dialogue the text says nothing about is still a man and a woman, the same on every run', () => {
  const text = '—¿Un café? —Dale.';
  const ids = Array.from({ length: 40 }, (_, i) => `s${i}`);
  const casts = ids.map((id) => castLabel(castDialogue(id, text, undefined, VOICES)));
  assert.ok(casts.every((c) => c === 'tomas+malena' || c === 'malena+tomas'));
  assert.ok(casts.includes('tomas+malena') && casts.includes('malena+tomas'));
  assert.deepEqual(ids.map((id) => castLabel(castDialogue(id, text, undefined, VOICES))), casts);
});

test('a cast read from other words is ignored, and one line is not a dialogue', () => {
  const stale = castDialogue('id', '—¿Un mate? —Dale.', { es: '—¿Un café? —Dale.', s1: 'm', s2: 'm' }, VOICES);
  assert.ok(!castLabel(stale).includes('agustin'));
  assert.equal(castDialogue('id', 'Hola, ¿qué tal?', undefined, VOICES), null);
  assert.equal(castDialogue('id', '—Hola.', undefined, VOICES), null);
});

test('a dialogue recorded in one voice is due again; one recorded as cast is not', () => {
  const speakers = castDialogue('id', '—Hola, Fede. —Hola, Mati.', { es: '—Hola, Fede. —Hola, Mati.', s1: 'm', s2: 'm' }, VOICES);
  assert.ok(!recordedAs({ audio_path: 'sentences/id-tomas-1.mp3', voice_id: 'tomas' }, speakers[0], speakers));
  assert.ok(recordedAs({ audio_path: 'sentences/id-tomas+agustin-2.mp3', voice_id: 'tomas' }, speakers[0], speakers));
  // A one-voice sentence is judged by its voice, as before.
  assert.ok(recordedAs({ audio_path: 'x', voice_id: 'tomas' }, VOICES[1], null));
  assert.ok(!recordedAs({ audio_path: 'x', voice_id: 'malena' }, VOICES[1], null));
});
