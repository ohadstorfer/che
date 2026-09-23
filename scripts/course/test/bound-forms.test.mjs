// A word the course only ever says inside a longer one (docs/course-spec.md
// §1.5). "llamo" shipped as a card reading «llamo / name is» — half a Spanish
// word against half an English phrase, with nothing in between a learner could
// know. These are the three gates that keep that from happening again: the
// outline can say a form is bound, nothing drills one, and the validator finds
// the ones nobody marked.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { boundCandidates, checkSentence } from '../../../src/lib/course-rules/check.ts';
import { drillable } from '../../../src/lib/course-rules/vocabulary.ts';
import { exercisesFor } from '../../../src/lib/session.ts';
import { loadOutline } from '../lib/outline.mjs';

const { outline } = loadOutline();
const byForm = (s) => outline.forms.find((f) => f.form === s);
const unitOf = (f) => outline.units.find((u) => u.id === f.unit_id);

test('the chunk is the form, and the bare verb rides inside it', () => {
  for (const [chunk, bare] of [
    ['me llamo', 'llamo'],
    ['te llamás', 'llamás'],
    ['me levanto', 'levanto'],
    ['nos juntamos', 'juntamos'],
  ]) {
    assert.ok(byForm(chunk), `${chunk} is a form of its own`);
    assert.equal(byForm(bare).bound, true, `${bare} is bound`);
    assert.equal(byForm(chunk).lemma_id, byForm(bare).lemma_id, `${chunk} and ${bare} are one verb`);
  }
});

test('a bound form is never drilled, and the chunk is', () => {
  assert.equal(drillable(byForm('llamo')), false);
  assert.equal(drillable(byForm('me llamo')), true);
  // Every exercise crosses between the Spanish and the English, so a form whose
  // English needs a word the Spanish does not have gets none of them.
  assert.deepEqual(exercisesFor({ ...byForm('llamo'), bound: true, gloss_en: 'to be called' }, null, outline.forms), []);
  assert.ok(exercisesFor({ ...byForm('me llamo'), gloss_en: 'my name is' }, null, outline.forms).length > 0);
});

test('a sentence may not say the bare form, and is told what to say', () => {
  const unit = unitOf(byForm('me llamo'));
  assert.deepEqual(checkSentence(outline, unit, 'Me llamo Sofi.'), []);
  const problems = checkSentence(outline, unit, 'Llamo Sofi.');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /never said on its own/);
  assert.match(problems[0], /me llamo/);
});

/** The lexicon as it was before this rule: no chunks, nothing marked bound. */
const beforeTheFix = {
  ...outline,
  forms: outline.forms.filter((f) => !(f.features?.clitic && f.form.includes(' '))).map((f) => ({ ...f, bound: false })),
};

test('the validator finds a form nobody marked bound', () => {
  // "llamo" as it was: a word in the lexicon like any other, and not one
  // sentence in the course that let it stand up by itself.
  const sentences = [
    { es: 'Me llamo Sofi.' },
    { es: 'Yo me llamo Martín.' },
    { es: 'Me llamo Lucía.' },
    { es: '¿Cómo te llamás?' },
    { es: '¿Te llamás Juan?' },
    { es: 'Che, ¿cómo te llamás?' },
  ];
  const found = boundCandidates(beforeTheFix, sentences).map((c) => `${c.after} ${c.form.form}`);
  assert.deepEqual(found.sort(), ['me llamo', 'te llamás']);
});

test('a word that merely likes a neighbour is left alone', () => {
  // "bien" follows "todo" often and stands on its own just as often; only a
  // word that has *never* stood alone is suspect, and the clitic is the tell.
  const sentences = [{ es: 'Todo bien.' }, { es: 'Muy bien.' }, { es: 'Bien, gracias.' }, { es: '¿Todo bien?' }];
  assert.deepEqual(boundCandidates(outline, sentences), []);
});

test('two sentences prove nothing', () => {
  assert.deepEqual(boundCandidates(beforeTheFix, [{ es: 'Me llamo Sofi.' }, { es: 'Me llamo Juan.' }]), []);
});
