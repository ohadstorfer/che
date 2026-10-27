import type { Form } from '@/lib/types';
import { nounArticle } from '@/lib/noun-articles';

/**
 * The indefinite article a noun is taught with — "un paquete", "una
 * medialuna", "unos anteojos" — so its gender comes with it. Only for the
 * nouns with a picture (noun-articles.ts); null for anything else.
 */
export function articleOf(form: Form): string | null {
  if (form.pos !== 'noun') return null;
  const known = nounArticle[form.lemma_id];
  if (!known) return null;
  const many = form.features?.number === 'pl' || known.many === true;
  if (!many) return known.one;
  return known.one === 'una' || known.feminine ? 'unas' : 'unos';
}
