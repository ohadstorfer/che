// The rioplatense rules machines can enforce (docs/course-spec.md, Appendix B
// and C). Shared by the outline validator, the sentence linter, the generator
// prompt and the admin's editors, so none of them can disagree about what is
// allowed. Pure: runs in the app and, through scripts/course/lib/rules.mjs, in
// the scripts.

import type { FormFeatures } from '../types';

/** Registers in increasing order of informality. */
export const REGISTERS = ['neutral', 'informal', 'lunfardo', 'vulgar'];
export const registerRank = (r: string) => REGISTERS.indexOf(r);

export const POS = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'prep', 'conj', 'interj', 'num', 'phrase', 'propn'];

/** Tags allowed in a form's `f:` feature string. */
export const FEATURE_TAGS: Record<string, FormFeatures> = {
  '1sg': { person: 1, number: 'sg' },
  '2sg': { person: 2, number: 'sg' },
  '3sg': { person: 3, number: 'sg' },
  '1pl': { person: 1, number: 'pl' },
  '2pl': { person: 2, number: 'pl' },
  '3pl': { person: 3, number: 'pl' },
  pres: { tense: 'pres' },
  ind: { mood: 'ind' },
  imp: { mood: 'imp' },
  inf: { verb_form: 'inf' },
  ger: { verb_form: 'ger' },
  vos: { voseo: true },
  clitic: { clitic: true },
  m: { gender: 'm' },
  f: { gender: 'f' },
  sg: { number: 'sg' },
  pl: { number: 'pl' },
  irregular: { irregular: true },
};

export function parseFeatures(f: string | null | undefined): FormFeatures {
  if (!f) return {};
  const out: FormFeatures = {};
  for (const tag of String(f).split('.')) {
    const add = FEATURE_TAGS[tag];
    if (!add) throw new Error(`unknown feature tag "${tag}" in "${f}"`);
    Object.assign(out, add);
  }
  return out;
}

/**
 * Surfaces that only exist in tuteo (or vosotros). None of them may appear in
 * the lexicon or in a sentence. `tú` is here; `tu` (the possessive) is not.
 */
export const TUTEO = new Set([
  // pronouns
  'tú', 'ti', 'contigo', 'vosotros', 'vosotras', 'os', 'vuestro', 'vuestra', 'vuestros', 'vuestras',
  // tú present — the vos forms are the same words with the stress moved
  'eres', 'tienes', 'puedes', 'quieres', 'vienes', 'haces', 'dices', 'sabes', 'vives', 'comes',
  'hablas', 'estudias', 'trabajas', 'tomas', 'escribes', 'lees', 'aprendes', 'juegas',
  'pagas', 'llegas', 'prefieres', 'duermes', 'piensas', 'entiendes', 'caminas',
  'desayunas', 'almuerzas', 'acuestas', 'levantas', 'bañas', 'traes',
  // tú imperatives that are nothing else
  'haz', 'ten', 'pon', 'siéntate', 'fíjate', 'dime', 'espérame', 'escúchame', 'mírame',
  // vosotros verbs
  'sois', 'tenéis', 'queréis', 'podéis', 'vais', 'habláis', 'coméis', 'estáis', 'hacéis',
]);

/**
 * Tuteo imperatives that are also ordinary words — `mira` is *él mira*, `ven`
 * is *ellos ven*, `sal` is salt. A sentence can't be rejected on the surface
 * alone, so these only fail a lexicon entry that claims to be a second-person
 * imperative without the vos tag.
 */
export const TUTEO_AMBIGUOUS = new Set([
  'mira', 'escucha', 'espera', 'toma', 'habla', 'come', 'ven', 'di', 'sal', 'pasa', 'anda',
  'llamas', 'cenas', 'compras',
]);

/**
 * Regional words the course never uses, with the rioplatense word to use
 * instead (Appendix B). Keys are lowercase surfaces. Only words that mean
 * nothing else in Argentina belong here: `camión` is a truck, `metro` a metre,
 * `vale` is *vale la pena* — rejecting those would reject real Argentine.
 */
export const REGIONAL = new Map([
  ['coche', 'auto'], ['coches', 'autos'],
  ['autobús', 'colectivo / bondi'],
  ['móvil', 'celular'],
  ['ordenador', 'computadora'],
  ['curro', 'laburo'], ['currar', 'laburar'], ['chamba', 'laburo'], ['chambear', 'laburar'],
  ['chaval', 'pibe'], ['chavala', 'piba'], ['chavo', 'pibe'], ['chava', 'piba'],
  ['camiseta', 'remera'], ['playera', 'remera'],
  ['deportivas', 'zapatillas'],
  ['chaqueta', 'campera'], ['chamarra', 'campera'],
  ['bonito', 'lindo'], ['bonita', 'linda'],
  ['guay', 'copado / bárbaro'], ['chido', 'copado / bárbaro'],
  ['discoteca', 'boliche'],
  ['bollería', 'facturas'],
  ['fresa', 'frutilla'], ['fresas', 'frutillas'],
  ['aguacate', 'palta'],
  ['piña', 'ananá'],
  ['elote', 'choclo'],
  ['aquí', 'acá'], ['allí', 'allá'],
  ['zumo', 'jugo'],
  ['patatas', 'papas'], ['patata', 'papa'],
  ['gafas', 'anteojos'],
  ['conducir', 'manejar'],
]);

/**
 * Words an answer may leave out without being wrong: a vocative "che" adds
 * colour, not meaning, and English has nothing to prompt it with.
 */
export const OPTIONAL_LEMMAS = new Set(['che']);

/** Subject pronouns — Spanish drops them whenever the verb already says who. */
export const SUBJECT_PRONOUNS = new Map<string, { person: number; number: 'sg' | 'pl' }>([
  ['yo', { person: 1, number: 'sg' }],
  ['vos', { person: 2, number: 'sg' }],
  ['él', { person: 3, number: 'sg' }],
  ['ella', { person: 3, number: 'sg' }],
  ['usted', { person: 3, number: 'sg' }],
  ['nosotros', { person: 1, number: 'pl' }],
  ['nosotras', { person: 1, number: 'pl' }],
  ['ellos', { person: 3, number: 'pl' }],
  ['ellas', { person: 3, number: 'pl' }],
  ['ustedes', { person: 3, number: 'pl' }],
]);

/** Object pronouns that sit between a subject and its verb: "yo *me* llamo". */
export const CLITIC_LEMMAS = new Set(['me', 'te', 'se', 'nos', 'lo', 'la', 'le', 'los', 'las', 'les']);

/** Lowercase, keep accents: `Tenés` and `tenés` match, `tenes` does not. */
export const fold = (s: string) => s.toLocaleLowerCase('es');

/** Case- and accent-insensitive key, for duplicate detection only. */
export const bare = (s: string) =>
  s.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^\p{L}\p{N} ]/gu, '').trim();
