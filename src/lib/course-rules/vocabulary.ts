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

export const drillable = (f: Pick<VocabForm, 'is_glue' | 'pos'>) => !f.is_glue && f.pos !== 'propn';
