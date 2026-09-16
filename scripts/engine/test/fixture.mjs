// A learner built from the real demo course (src/lib/demo-course.json): the
// published lexicon and sentences, and whatever states a test gives her.
import { readFileSync } from 'node:fs';

import { toSentence } from '../../../src/lib/sentences.ts';

export const course = JSON.parse(readFileSync(new URL('../../../src/lib/demo-course.json', import.meta.url), 'utf8'));
export const forms = course.form_entries.filter((f) => f.status === 'published');
export const formById = new Map(forms.map((f) => [f.id, f]));
export const units = [...course.units].sort((a, b) => a.course_order - b.course_order);
export const unitBySlug = (slug) => units.find((u) => u.slug === slug);
export const formOf = (text, unitSlug) =>
  forms.find((f) => f.form === text && (!unitSlug || f.unit_id === unitBySlug(unitSlug).id));

const DAY = 86_400_000;
export const iso = (daysFromNow) => new Date(Date.now() + daysFromNow * DAY).toISOString();

export function state(form, over = {}) {
  return {
    id: `st-${form.id}`,
    form_id: form.id,
    user_id: 'u',
    state: 'review',
    ease_factor: 2.5,
    interval_days: 3,
    repetitions: 2,
    lapses: 0,
    due_at: iso(2),
    introduced_on: '2026-09-01',
    ...over,
  };
}

/** @param states FormState[]  @param shown Map<sentenceId, {shown_count, correct_count, last_shown_at}> */
export function learner(states = [], { shown = new Map(), ladder } = {}) {
  const sentences = course.sentences
    .filter((s) => s.status === 'published')
    .map((r) => toSentence(r, formById, shown.get(r.id)));
  return {
    forms,
    formById,
    states,
    stateByForm: new Map(states.map((s) => [s.form_id, s])),
    sentences,
    ladder,
  };
}
