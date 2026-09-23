// What the rules check sentences against: the course's words, wherever they
// come from. The scripts used to read them from the YAML outline; now the
// database is the source of truth, and the admin and the scripts both hand the
// rules the same shape.

import type { FormFeatures } from '../types';

export interface VocabForm {
  id: string;
  lemma_id: string;
  lemma: string;
  pos: string;
  form: string;
  features: FormFeatures;
  /** The form's own gloss, or its lemma's. */
  gloss_en: string | null;
  unit_id: string;
  /** Its unit's place in the whole course: a form is available from here on. */
  unit_order: number;
  is_glue: boolean;
  register: string;
  /**
   * A form that never stands on its own: it exists only inside a longer form —
   * `llamo` only ever inside `me llamo`. It stays in the lexicon so its
   * sentences still resolve and the dictionary still has the conjugation, but
   * it is never drilled, because there is nothing about it a learner could
   * know. The chunk is drilled instead.
   */
  bound?: boolean;
}

export interface VocabLemma {
  id: string;
  gloss_en: string;
}

export interface Vocabulary {
  forms: VocabForm[];
  /** For forms whose gloss is their lemma's. */
  lemmas?: VocabLemma[];
}

export interface VocabUnit {
  course_order: number;
  register_max: string;
}

/**
 * Whether a form may be asked about on its own — a card, a tile, an option, a
 * distractor, an SRS schedule of its own. Three kinds of form may not:
 *
 *   glue     `de`, `el`, `me` — taught inside sentences, never drilled alone
 *   propn    `Montevideo` — nobody learns a place name as vocabulary
 *   bound    `llamo` — it has no meaning without `me`, so a card for it asks
 *            a question with no answer (docs/course-spec.md §1.5)
 *
 * Every producer of exercises and every linter reads this one function, so a
 * form barred here is barred everywhere.
 */
export const drillable = (f: Pick<VocabForm, 'is_glue' | 'pos' | 'bound'>) =>
  !f.is_glue && f.pos !== 'propn' && !f.bound;
