// The outline and authored content, as the rows the database holds. The demo
// build and the SQL seed both come from here, so the app sees the same course
// whichever backend it runs on.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { buildContent } from './content.mjs';
import { loadOutline } from './outline.mjs';

export const DEMO_FIXTURE = new URL('../fixtures/demo.yaml', import.meta.url);

/**
 * @param publishThrough  units up to this ordinal (and their lessons, tips,
 *                        lemmas, forms, sentences) are published; the rest are
 *                        drafts. Infinity publishes everything.
 * @returns {{ rows, warnings }}  throws with every error if anything fails.
 */
export function buildRows({ publishThrough = Infinity, fixture = DEMO_FIXTURE } = {}) {
  const { outline, errors: outlineErrors } = loadOutline();
  if (outlineErrors.length) throw new Error(`outline:\n${outlineErrors.join('\n')}`);

  const content = parse(readFileSync(fixture, 'utf8'));
  const { sentences, slots, errors, warnings } = buildContent(outline, content, { source: 'human' });
  if (errors.length) throw new Error(`content:\n${errors.join('\n')}`);

  const status = (ordinal) => (ordinal <= publishThrough ? 'published' : 'draft');
  const unitOrdinalById = new Map(outline.units.map((u) => [u.id, u.ordinal]));
  const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));
  const lessonUnit = new Map(outline.units.flatMap((u) => u.lessons.map((l) => [l.id, u.ordinal])));

  const rows = {
    sections: [{ ...outline.section, status: 'published' }],
    units: outline.units.map(({ sample, lessons, tips, ...u }) => ({ ...u, status: status(u.ordinal) })),
    lessons: outline.units.flatMap((u) => u.lessons.map((l) => ({ ...l, status: status(u.ordinal) }))),
    tips: outline.units.flatMap((u) => u.tips.map((t) => ({ ...t, status: status(u.ordinal) }))),
    lemmas: outline.lemmas.map(({ unit_ordinal, ...l }) => ({ ...l, status: status(unit_ordinal) })),
    forms: outline.forms.map((f) => ({
      id: f.id,
      lemma_id: f.lemma_id,
      form: f.form,
      features: f.features,
      gloss_en: f.gloss_en,
      unit_id: f.unit_id,
      audio_path: null,
      status: status(f.unit_ordinal),
    })),
    sentences: sentences.map((s) => ({ ...s, status: status(unitOrdinalById.get(s.unit_id)) })),
    // Slots only exist for lessons with authored content; they follow their lesson.
    lesson_slots: slots.filter((s) => lessonUnit.get(s.lesson_id) <= publishThrough),
  };

  // The view the app reads, precomputed for the demo backend.
  const formEntries = outline.forms.map((f) => ({
    id: f.id,
    lemma_id: f.lemma_id,
    lemma: f.lemma,
    pos: f.pos,
    form: f.form,
    gloss_en: f.gloss_en ?? lemmaById.get(f.lemma_id).gloss_en,
    features: f.features,
    unit_id: f.unit_id,
    unit_ordinal: f.unit_ordinal,
    section_id: outline.section.id,
    is_glue: f.is_glue,
    register: f.register,
    audio_path: null,
    status: status(f.unit_ordinal),
  }));

  return { rows, formEntries, warnings };
}
