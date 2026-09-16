// node --test scripts/course/test
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { buildContent } from '../lib/content.mjs';
import { ids, uuid5 } from '../lib/ids.mjs';
import { checkSentence, loadOutline } from '../lib/outline.mjs';
import { buildIndex, tokenize } from '../lib/tokenize.mjs';

const dir = mkdtempSync(join(tmpdir(), 'che-outline-'));
function outlineFrom(yaml) {
  const path = join(dir, `${Math.random().toString(36).slice(2)}.yaml`);
  writeFileSync(path, yaml);
  return loadOutline(path);
}

const HEADER = `section: {id: 1, slug: s, title: S, cefr: A1.1}\nunits:\n`;
const unit = (ordinal, body, sample = '') => `
  - ordinal: ${ordinal}
    slug: u${ordinal}
    title: U${ordinal}
    summary: Summary
    grammar: [g]
    register_max: informal
    ${sample ? `sample: {es: "${sample}", en: "x"}` : ''}
    tips: [{title: T, body: B}]
    words:
${body}`;

test('ids are deterministic and well-formed', () => {
  assert.equal(ids.form('ser', 'verb', 'sos'), ids.form('ser', 'verb', 'sos'));
  assert.notEqual(ids.form('ser', 'verb', 'sos'), ids.form('ser', 'verb', 'soy'));
  assert.match(uuid5('x'), /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('the real outline validates', () => {
  const { errors } = loadOutline();
  assert.deepEqual(errors, []);
});

test('rejects a tuteo form in the lexicon', () => {
  const { errors } = outlineFrom(
    HEADER + unit(1, `      - {lemma: tener, pos: verb, en: have, forms: [{form: tienes, f: 2sg.pres.ind.vos}]}`),
  );
  assert.ok(errors.some((e) => e.includes('tuteo')), errors.join('\n'));
});

test('rejects a second-person verb not tagged vos', () => {
  const { errors } = outlineFrom(
    HEADER + unit(1, `      - {lemma: tener, pos: verb, en: have, forms: [{form: tenés, f: 2sg.pres.ind}]}`),
  );
  assert.ok(errors.some((e) => e.includes('tagged "vos"')), errors.join('\n'));
});

test('rejects a non-rioplatense word', () => {
  const { errors } = outlineFrom(HEADER + unit(1, `      - {lemma: coche, pos: noun, en: car}`));
  assert.ok(errors.some((e) => e.includes('"auto"')), errors.join('\n'));
});

test('rejects a sample that uses a word taught later', () => {
  const { errors } = outlineFrom(
    HEADER +
      unit(1, `      - {lemma: hola, pos: interj, en: hi}`, 'Hola, che.') +
      unit(2, `      - {lemma: che, pos: interj, en: hey}`, 'Che.'),
  );
  assert.ok(errors.some((e) => e.includes(`isn't taught until unit 2`)), errors.join('\n'));
});

test('rejects a word above the unit register', () => {
  const { outline } = loadOutline();
  const unit1 = outline.units[0];
  // quilombo is lunfardo and exists (the checkpoint unit), but unit 1 allows up to informal
  const late = { ...unit1, ordinal: outline.units.length, register_max: 'informal' };
  const problems = checkSentence(outline, late, 'Qué quilombo.');
  assert.ok(problems.some((p) => p.includes('lunfardo')), problems.join('\n'));
});

test('tokenizer keeps punctuation on tokens and merges set phrases', () => {
  const forms = [
    { id: 'a', form: 'todo bien' },
    { id: 'b', form: 'y' },
    { id: 'c', form: 'vos' },
    { id: 'd', form: 'Buenos Aires' },
    { id: 'e', form: 'bien' },
    { id: 'f', form: 'gracias' },
  ];
  const idx = buildIndex(forms);
  assert.deepEqual(
    tokenize('Todo bien, ¿y vos?', idx).map((t) => [t.surface, t.forms.map((f) => f.id)]),
    [['Todo bien,', ['a']], ['¿y', ['b']], ['vos?', ['c']]],
  );
  assert.deepEqual(tokenize('Soy de Buenos Aires.', idx).map((t) => t.surface), ['Soy', 'de', 'Buenos Aires.']);
  // punctuation between the words breaks a phrase
  assert.deepEqual(tokenize('Bien, gracias.', idx).map((t) => t.forms.length), [1, 1]);
  // accents are significant: "tenes" is not "tenés"
  assert.equal(tokenize('tenes', buildIndex([{ id: 'x', form: 'tenés' }]))[0].forms.length, 0);
});

// --- content (sentences + lesson slots) -----------------------------------

test('the demo fixture builds clean', async () => {
  const { readFileSync } = await import('node:fs');
  const { parse } = await import('yaml');
  const { outline } = loadOutline();
  const fixture = parse(readFileSync(new URL('../fixtures/demo.yaml', import.meta.url), 'utf8'));
  const { errors } = buildContent(outline, fixture);
  assert.deepEqual(errors, []);
});

test('rejects a drill that uses a word before its teach slot', () => {
  const { outline } = loadOutline();
  const { errors } = buildContent(outline, {
    'hola-che': {
      sentences: { s: { es: 'Hola, che.', en: 'Hey there.', target: 'che' } },
      lessons: { 1: [{ drill: 's' }, { teach: 'hola' }, { teach: 'che' }] },
    },
  });
  assert.ok(errors.some((e) => e.includes('before it is taught')), errors.join('\n'));
});

test("rejects a sentence whose target isn't one of its unit's forms", () => {
  const { outline } = loadOutline();
  const { errors } = buildContent(outline, {
    'de-donde-sos': { sentences: { s: { es: 'Soy de acá.', en: "I'm from here.", target: 'soy' } } },
  });
  assert.ok(errors.some((e) => e.includes('is not a form unit 2 introduces')), errors.join('\n'));
});

test('rejects an ambiguous form reference and accepts the disambiguated one', () => {
  const { outline } = loadOutline();
  const bad = buildContent(outline, {
    'de-donde-sos': { sentences: { s: { es: 'Ella es argentina.', en: "She's Argentinian.", target: 'argentina' } } },
  });
  assert.ok(bad.errors.some((e) => e.includes('ambiguous')), bad.errors.join('\n'));
  const good = buildContent(outline, {
    'de-donde-sos': { sentences: { s: { es: 'Ella es argentina.', en: "She's Argentinian.", target: 'argentina/adj' } } },
  });
  assert.deepEqual(good.errors, []);
});
