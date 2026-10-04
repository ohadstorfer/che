// The Hablar content validator: schema limits, and the course's rioplatense
// rules applied to free Spanish text.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildContent,
  clipPath,
  isVosImperative,
  loadCultureIds,
  loadScenarios,
  spanishProblems,
  validate,
} from '../lib/content.mjs';

const real = loadScenarios();
const cultureIds = loadCultureIds();

/** A fresh deep copy of the real document, edited by `edit`. */
const variant = (edit) => {
  const doc = structuredClone(real);
  edit(doc);
  return validate(doc, { cultureIds });
};
const fails = (edit, pattern) => {
  const errors = variant(edit);
  assert.ok(errors.some((e) => pattern.test(e)), `expected ${pattern}, got:\n  ${errors.join('\n  ') || '(no errors)'}`);
};

test('the authored scenarios are valid', () => {
  assert.deepEqual(validate(real, { cultureIds }), []);
  assert.equal(real.scenarios.length, 19);
});

test('tuteo is rejected anywhere Spanish appears', () => {
  fails((d) => (d.scenarios[0].versions.A1.opener.es = '¡Buenas! ¿Qué quieres?'), /quieres.*tuteo/);
  fails((d) => (d.scenarios[1].versions.A1.key_phrases[0].es = '¿Tú tienes alfajores?'), /tuteo/);
  fails((d) => (d.scenarios[2].setting_es = 'Eres nuevo en la fiesta.'), /eres.*tuteo/i);
  fails((d) => d.scenarios[3].keyterms.push('tienes'), /keyterm "tienes"/);
  fails((d) => (d.openers.free.A1[0].es = '¿Vosotros sois de acá?'), /tuteo/);
});

test('the character is Tomás, never "tomas" (tú tomas)', () => {
  fails((d) => (d.scenarios[2].versions.A1.opener.es = '¡Hola! Soy Tomas. ¿Cómo te llamás?'), /Tomas.*tuteo/);
  assert.deepEqual(spanishProblems('¡Hola! Soy Tomás. ¿Cómo te llamás?'), []);
});

test('other Spanishes are rejected: words, phrases, compound past, che at the end', () => {
  fails((d) => (d.scenarios[5].versions.A1.key_phrases[0].es = '¿Qué autobús me lleva a La Boca?'), /autobús.*not rioplatense/);
  fails((d) => (d.openers.free.A1[0].es = '¡Hola! ¿Qué tal?'), /qué tal/);
  fails((d) => (d.openers.free.A2[0].es = '¿Qué has hecho hoy?'), /compound past/);
  fails((d) => (d.openers.free.A1[0].es = '¿Todo bien, che?'), /che/);
  fails((d) => (d.scenarios[0].versions.A1.opener.es = 'Buenas, qué te traigo?'), /opening "¿"/);
});

test('goal and phrase counts', () => {
  const v = (d) => d.scenarios[0].versions.A1;
  fails((d) => (v(d).goals = v(d).goals.slice(0, 1)), /A1: 1 goals \(want 2–3\)/);
  fails((d) => v(d).goals.push({ id: 'more', es: 'Pedí agua', en: 'Ask for water' }), /4 goals/);
  fails((d) => (v(d).key_phrases = v(d).key_phrases.slice(0, 2)), /2 key phrases \(want 3–4\)/);
  fails((d) => v(d).key_phrases.push({ es: 'Gracias.', en: 'Thanks.' }), /5 key phrases/);
});

test('goals are vos imperatives', () => {
  for (const es of ['Pedí un alfajor', 'Preguntá cuánto sale', 'Pedile una recomendación', 'Decime algo', 'Contá de dónde sos'])
    assert.ok(isVosImperative(es), es);
  for (const es of ['Pide un alfajor', 'Pregunta cuánto sale', 'Pida la cuenta', 'Un café']) assert.ok(!isVosImperative(es), es);
  fails((d) => (d.scenarios[0].versions.B1.goals[0].es = 'Pide un café'), /B1 goal .*vos imperative|tuteo/);
});

test('ids are unique slugs', () => {
  fails((d) => (d.scenarios[1].id = d.scenarios[0].id), /duplicate id/);
  fails((d) => (d.scenarios[1].id = 'Kiosco Uno'), /bad id/);
  fails((d) => (d.scenarios[0].versions.A2.goals[1].id = d.scenarios[0].versions.A2.goals[0].id), /duplicate goal id/);
});

test('versions: known bands only, at least one, whole', () => {
  fails((d) => (d.scenarios[0].versions.C1 = d.scenarios[0].versions.B2), /cafe C1: unknown band/);
  fails((d) => (d.scenarios[0].versions = {}), /no versions/);
  fails((d) => delete d.scenarios[0].versions.B1.setting_en, /setting_es and setting_en go together/);
  fails((d) => (d.scenarios[0].versions.B2.role_es = 'el mozo que tiene prisa'), /not rioplatense|tuteo|prisa/);
  fails((d) => d.scenarios[0].versions.A2.keyterms.push('tienes'), /keyterm "tienes"/);
});

test('openers end in a question', () => {
  fails((d) => (d.scenarios[0].versions.A1.opener.es = '¡Buenas!'), /end in a question/);
  fails((d) => (d.openers.culture.mate.es = 'El mate es lo más.'), /end in a question/);
});

test('keyterms: present, ≤ 50 chars, no duplicates', () => {
  fails((d) => (d.scenarios[0].keyterms = []), /needs keyterms/);
  fails((d) => d.scenarios[0].keyterms.push('x'.repeat(51)), /over 50 chars/);
  fails((d) => d.scenarios[0].keyterms.push('Medialunas'), /duplicate keyterm/);
});

test('culture openers match the culture sections exactly', () => {
  fails((d) => (d.openers.culture['no-such-section'] = { ...d.openers.culture.mate }), /no culture section with this id/);
  fails((d) => delete d.openers.culture.tango, /culture tango: no opener/);
  fails((d) => delete d.openers.culture.mate.keyterms, /culture mate keyterms: needs keyterms/);
});

test('free openers: every band, known bands only', () => {
  fails((d) => delete d.openers.free.B2, /free B2: 0 openers/);
  fails((d) => (d.openers.free.C1 = d.openers.free.B2), /free C1: unknown band/);
});

test('clip paths are stable and follow the text', () => {
  const a = clipPath('¿Cuánto sale?');
  assert.match(a, /^hablar\/[0-9a-f]{20}\.mp3$/);
  assert.equal(clipPath('¿Cuánto sale?'), a);
  assert.equal(clipPath(' ¿Cuánto sale? '), a);
  assert.notEqual(clipPath('¿Cuánto cuesta?'), a);
  assert.notEqual(clipPath('¿Cuánto sale?', { id: 'tomas', model: 'eleven_flash_v2_5' }), a);
});

test('build: audio is null until the manifest has the clip', () => {
  const opener = real.scenarios[0].versions.A1.opener.es;
  const none = buildContent(real, {}, { cultureIds });
  assert.equal(none.scenarios[0].versions.A1.opener.audio, null);
  const some = buildContent(real, { [clipPath(opener)]: { text: opener } }, { cultureIds });
  assert.equal(some.scenarios[0].versions.A1.opener.audio, clipPath(opener));
  assert.equal(some.scenarios[0].versions.A1.key_phrases[0].audio, null);

  const s = none.scenarios[0];
  assert.deepEqual(Object.keys(s), ['id', 'title_es', 'title_en', 'versions']);
  assert.deepEqual(Object.keys(s.versions), ['A1', 'A2', 'B1', 'B2']);
  assert.deepEqual(Object.keys(s.versions.A1), [
    'setting_es', 'setting_en', 'role_es', 'role_en', 'goals', 'key_phrases', 'opener', 'keyterms',
  ]);
  assert.deepEqual(Object.keys(s.versions.A1.key_phrases[0]), ['es', 'en', 'audio']);
  assert.deepEqual(Object.keys(none.openers.free), ['A1', 'A2', 'B1', 'B2']);
  assert.deepEqual(Object.keys(none.openers.culture), cultureIds);
  assert.deepEqual(Object.keys(none.openers.culture.mate), ['es', 'en', 'audio', 'keyterms']);
});

test('build: a version inherits the scene and adds its own keyterms', () => {
  const built = buildContent(real, {}, { cultureIds });
  const cafe = built.scenarios.find((s) => s.id === 'cafe');
  assert.equal(cafe.versions.A1.setting_es, real.scenarios[0].setting_es);
  assert.equal(cafe.versions.B1.setting_es, real.scenarios[0].versions.B1.setting_es);
  assert.equal(cafe.versions.B1.role_es, real.scenarios[0].role_es);
  assert.ok(cafe.versions.B1.keyterms.includes('medialunas') && cafe.versions.B1.keyterms.includes('para llevar'));
  const only = built.scenarios.find((s) => s.id === 'entrevista');
  assert.deepEqual(Object.keys(only.versions), ['B2']);
});
