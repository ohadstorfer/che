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
import { checkShape, clauseCount, clauseOfSurface, clausesOf } from '../../../src/lib/course-rules/shape.ts';

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
  // quilombo is lunfardo and exists (the last unit teaches it), but every unit
  // of the course allows up to informal.
  const last = { ...outline.units.at(-1), register_max: 'informal' };
  const problems = checkSentence(outline, last, 'Qué quilombo.');
  assert.ok(problems.some((p) => p.includes('lunfardo')), problems.join('\n'));
});

test('a chain of sentences is rejected, an exchange of two is not', () => {
  // Three greetings in a trench coat: six words, so the word band passes it,
  // and six tiles in no marked order once the punctuation comes off.
  const chain = checkShape('Che, ¿sos vos? ¡Hola! ¿Todo bien?', 3);
  assert.equal(clauseCount('Che, ¿sos vos? ¡Hola! ¿Todo bien?'), 3);
  assert.ok(chain.problems.some((p) => p.startsWith('clause.count')), chain.problems.join('\n'));
  assert.deepEqual(chain.warnings, []);

  // A question and its answer is how people speak, and stays legal.
  assert.deepEqual(checkShape('Soy Sofi. ¿Y vos?', 2).problems, []);
  // Three clauses are the reserve of the longest sentences.
  assert.deepEqual(checkShape('Che, ¿sos vos? ¡Hola! ¿Todo bien?', 4).problems, []);
  // Over the band is a warning on a sentence worth keeping, never a failure.
  const long = checkShape('Un café y una medialuna.', 1);
  assert.deepEqual(long.problems, []);
  assert.ok(long.warnings.some((w) => w.startsWith('length.band')), long.warnings.join('\n'));
});

test('clauses are cut after the word that closes them', () => {
  assert.deepEqual(clausesOf('Che, ¿sos vos? ¡Hola! ¿Todo bien?'), ['Che, ¿sos vos?', '¡Hola!', '¿Todo bien?']);
  // No final stop, and a comma, still make one clause.
  assert.deepEqual(clausesOf('Todo bien, che'), ['Todo bien, che']);
  assert.deepEqual(clauseOfSurface(['Che,', '¿sos', 'vos?', '¡Hola!', '¿Todo bien?']), [0, 0, 0, 1, 2]);
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
    // "soy" is taught two units earlier; this unit introduces "acá".
    'de-donde-sos': { sentences: { s: { es: 'Soy de acá.', en: "I'm from here.", target: 'soy' } } },
  });
  assert.ok(errors.some((e) => e.includes('is not a form unit de-donde-sos introduces')), errors.join('\n'));
});

test('rejects an ambiguous form reference and accepts the disambiguated one', () => {
  const { outline } = loadOutline();
  // "mañana" is both the morning and tomorrow, and one unit teaches both.
  const bad = buildContent(outline, {
    'la-hora': { sentences: { s: { es: 'Mañana.', en: 'Tomorrow.', target: 'mañana' } } },
  });
  assert.ok(bad.errors.some((e) => e.includes('ambiguous')), bad.errors.join('\n'));
  const good = buildContent(outline, {
    'la-hora': { sentences: { s: { es: 'Mañana.', en: 'Tomorrow.', target: 'mañana/adv' } } },
  });
  assert.deepEqual(good.errors, []);
});
