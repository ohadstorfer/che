import type { Form } from './types';

// ---------------------------------------------------------------------------
// Grammar concepts (learning-engine-spec §12).
//
// A closed list of tags derived from a form's lemma and features — never
// authored — so a learner's accuracy can be read per concept ("vos
// imperatives") and not only per word. Mirrored for the content scripts in
// scripts/course/lib/concepts.mjs.
// ---------------------------------------------------------------------------

export const CONCEPT_LABELS: Record<string, string> = {
  'verbo.presente.vos': 'present tense with vos',
  'verbo.presente.yo': 'present tense with yo',
  'verbo.presente.3': 'present tense with él, ella, usted',
  'verbo.presente.plural': 'present tense in the plural',
  'verbo.imperativo.vos': 'commands with vos',
  'verbo.preterito.vos': 'past tense with vos',
  'verbo.preterito': 'past tense',
  'verbo.imperfecto': 'the imperfect (was doing, used to do)',
  'verbo.gerundio': 'the -ando / -iendo form',
  'verbo.infinitivo': 'infinitives',
  ser: 'ser',
  estar: 'estar',
  tener: 'tener',
  gustar: 'gustar',
  'adjetivo.genero': 'adjective gender',
  'sustantivo.plural': 'plural nouns',
};

export function conceptsOf(form: Pick<Form, 'lemma' | 'pos' | 'features'>): string[] {
  const f = form.features ?? {};
  const out: string[] = [];
  if (form.pos === 'verb') {
    if (f.mood === 'imp' && f.voseo) out.push('verbo.imperativo.vos');
    else if (f.verb_form === 'ger') out.push('verbo.gerundio');
    else if (f.verb_form === 'inf') out.push('verbo.infinitivo');
    else if (f.tense === 'impf') out.push('verbo.imperfecto');
    else if (f.tense === 'pret') out.push(f.person === 2 && f.voseo ? 'verbo.preterito.vos' : 'verbo.preterito');
    else if (f.tense === 'pres') {
      if (f.number === 'pl') out.push('verbo.presente.plural');
      else if (f.person === 2 && f.voseo) out.push('verbo.presente.vos');
      else if (f.person === 1) out.push('verbo.presente.yo');
      else if (f.person === 3) out.push('verbo.presente.3');
    }
    if (['ser', 'estar', 'tener', 'gustar'].includes(form.lemma)) out.push(form.lemma);
  }
  if (form.pos === 'adj' && f.gender) out.push('adjetivo.genero');
  if (form.pos === 'noun' && f.number === 'pl') out.push('sustantivo.plural');
  return out;
}

export interface ConceptScore {
  concept: string;
  tries: number;
  accuracy: number;
}

/** Minimum first tries on a concept before its accuracy means anything. */
export const CONCEPT_MIN_TRIES = 8;
/** Below this, a concept "needs work". */
export const CONCEPT_WEAK = 0.8;

/** First-try accuracy per concept from logged answers, weakest first; only
 *  concepts with enough tries. */
export function conceptScores(
  logs: { form_id: string; correct: boolean | null; is_retry?: boolean }[],
  formById: Map<string, Pick<Form, 'lemma' | 'pos' | 'features'>>,
): ConceptScore[] {
  const tally = new Map<string, { tries: number; right: number }>();
  for (const log of logs) {
    if (log.is_retry || log.correct == null) continue;
    const form = formById.get(log.form_id);
    if (!form) continue;
    for (const c of conceptsOf(form)) {
      const t = tally.get(c) ?? { tries: 0, right: 0 };
      t.tries += 1;
      if (log.correct) t.right += 1;
      tally.set(c, t);
    }
  }
  return [...tally]
    .filter(([, t]) => t.tries >= CONCEPT_MIN_TRIES)
    .map(([concept, t]) => ({ concept, tries: t.tries, accuracy: t.right / t.tries }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** The weakest concept that needs work, if any. */
export const weakestConcept = (scores: ConceptScore[]) => scores.find((s) => s.accuracy < CONCEPT_WEAK) ?? null;
