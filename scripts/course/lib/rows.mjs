// The outline and authored content, as the rows the database holds. The demo
// build and the SQL seed both come from here, so the app sees the same course
// whichever backend it runs on.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { buildContent } from './content.mjs';
import { SECTION_PATHS, loadOutline } from './outline.mjs';

export const DEMO_FIXTURE = new URL('../fixtures/demo.yaml', import.meta.url);

/**
 * @param publishThrough  units up to this place in the course (course_order,
 *                        counted across sections) and their lessons, tips,
 *                        lemmas, forms and sentences are published; the rest
 *                        are drafts. Infinity publishes everything.
 * @returns {{ rows, warnings }}  throws with every error if anything fails.
 */
export function buildRows({ publishThrough = Infinity, fixture = DEMO_FIXTURE, paths = SECTION_PATHS } = {}) {
  const { outline, errors: outlineErrors } = loadOutline(paths);
  if (outlineErrors.length) throw new Error(`outline:\n${outlineErrors.join('\n')}`);

  const content = parse(readFileSync(fixture, 'utf8'));
  const { sentences, slots, stories, phrases, errors, warnings } = buildContent(outline, content, { source: 'human' });
  if (errors.length) throw new Error(`content:\n${errors.join('\n')}`);

  const status = (order) => (order <= publishThrough ? 'published' : 'draft');
  const unitOrderById = new Map(outline.units.map((u) => [u.id, u.course_order]));
  const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));
  const lessonUnit = new Map(outline.units.flatMap((u) => u.lessons.map((l) => [l.id, u.course_order])));
  for (const l of stories.lessons) lessonUnit.set(l.id, unitOrderById.get(l.unit_id));
  const unitOrderOf = (unitId) => unitOrderById.get(unitId);

  const rows = {
    // A section is published once any of its units is.
    sections: outline.sections.map((s) => ({
      ...s,
      status: outline.units.some((u) => u.section_id === s.id && u.course_order <= publishThrough)
        ? 'published'
        : 'draft',
    })),
    units: outline.units.map(({ sample, lessons, tips, ...u }) => ({ ...u, status: status(u.course_order) })),
    // A story sits before its unit's check, which moves down a place for it.
    lessons: [
      ...outline.units.flatMap((u) =>
        u.lessons.map((l) => ({ ...l, ordinal: stories.ordinals.get(l.id) ?? l.ordinal, status: status(u.course_order) })),
      ),
      ...stories.lessons.map((l) => ({ ...l, status: status(unitOrderOf(l.unit_id)) })),
    ],
    tips: outline.units.flatMap((u) => u.tips.map((t) => ({ ...t, status: status(u.course_order) }))),
    lemmas: outline.lemmas.map(({ unit_order, ...l }) => ({ ...l, status: status(unit_order) })),
    forms: outline.forms.map((f) => ({
      id: f.id,
      lemma_id: f.lemma_id,
      form: f.form,
      features: f.features,
      gloss_en: f.gloss_en,
      gloss_note_en: f.gloss_note_en,
      unit_id: f.unit_id,
      position: f.position,
      bound: f.bound,
      audio_path: null,
      voice_id: null,
      status: status(f.unit_order),
    })),
    sentences: sentences.map((s) => ({ ...s, status: status(unitOrderById.get(s.unit_id)) })),
    // Slots only exist for lessons with authored content; they follow their lesson.
    lesson_slots: slots.filter((s) => lessonUnit.get(s.lesson_id) <= publishThrough),
    story_lines: stories.lines.filter((l) => lessonUnit.get(l.lesson_id) <= publishThrough),
    unit_phrases: phrases.filter((p) => unitOrderOf(p.unit_id) <= publishThrough),
  };

  // The view the app reads, precomputed for the demo backend.
  const unitById = new Map(outline.units.map((u) => [u.id, u]));
  const formEntries = outline.forms.map((f) => {
    const unit = unitById.get(f.unit_id);
    return {
      id: f.id,
      lemma_id: f.lemma_id,
      lemma: f.lemma,
      pos: f.pos,
      form: f.form,
      gloss_en: f.gloss_en ?? lemmaById.get(f.lemma_id).gloss_en,
      gloss_note_en: f.gloss_note_en ?? lemmaById.get(f.lemma_id).gloss_note_en ?? null,
      features: f.features,
      unit_id: f.unit_id,
      unit_ordinal: unit.ordinal,
      unit_order: f.unit_order,
      section_id: unit.section_id,
      is_glue: f.is_glue,
      bound: f.bound,
      register: f.register,
      audio_path: null,
      voice_id: null,
      status: status(f.unit_order),
    };
  });

  return { rows, formEntries, outline, warnings };
}
