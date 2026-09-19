// ---------------------------------------------------------------------------
// A sentence's shape: how long it is, and how many sentences it really is.
//
// "Che, ¿sos vos? ¡Hola! ¿Todo bien?" is six words and three clauses. The word
// count calls it a fair difficulty-3 drill; the clause count calls it three
// greetings in a trench coat. The two are not the same load. Reading it is
// easy — the punctuation marks where each piece ends. Rebuilding it from tiles
// is not: the tiles carry no punctuation, so she has to order three blocks with
// the only thing that separates them taken away. Hence both checks, and hence
// the runtime asking for one clause at a time when a sentence has several
// (`buildClauses` in sentences.ts).
// ---------------------------------------------------------------------------

/** Words a sentence may have at each difficulty (course-spec Appendix C). */
export const WORD_BAND: Record<number, number> = { 1: 4, 2: 7, 3: 10, 4: 14 };

/** Clauses it may have. Two is an exchange — "Soy Sofi. ¿Y vos?" — which is how
 *  the language is actually spoken. Three is a chain, and only the longest
 *  sentences have room for one. */
export const CLAUSE_BAND: Record<number, number> = { 1: 2, 2: 2, 3: 2, 4: 3 };

/** Punctuation that ends a clause, with any closing quote or bracket after it:
 *  "vos?" and "¡Hola!" end one, "Che," does not. */
const CLOSES = /[.!?…]+["”»)\]]*$/u;

export const endsClause = (surface: string) => CLOSES.test(surface.trim());

/**
 * Which clause each surface belongs to, counting from 0. The boundary falls
 * *after* the surface that closes: ["Che,", "¿sos", "vos?", "¡Hola!"] is
 * [0, 0, 0, 1].
 */
export function clauseOfSurface(surfaces: string[]): number[] {
  let clause = 0;
  return surfaces.map((s) => {
    const here = clause;
    if (endsClause(s)) clause++;
    return here;
  });
}

/** The words of a sentence, as everything here counts them. */
export const wordsIn = (es: string) => es.trim().split(/\s+/).filter(Boolean);

/** The sentence cut into its clauses: "Che, ¿sos vos? ¡Hola!" → two. */
export function clausesOf(es: string): string[] {
  const words = wordsIn(es);
  const of = clauseOfSurface(words);
  const out: string[] = [];
  words.forEach((w, i) => {
    out[of[i]] = out[of[i]] ? `${out[of[i]]} ${w}` : w;
  });
  return out.filter(Boolean);
}

/** How many sentences a sentence really is. Never below one. */
export const clauseCount = (es: string) => Math.max(1, clausesOf(es).length);

/**
 * Length rules that need the difficulty the author claimed, so they can't live
 * in `checkSentence` — it is given the Spanish and nothing else.
 *
 * The two land differently. A clause chain is *wrong*, whatever its length, so
 * it fails. Being a word over the band is usually a label a shade too low on a
 * sentence worth keeping — "Un café y una medialuna." is five words because
 * three of them are articles — so it stays the warning it has always been, and
 * the learner is protected from an over-long build by the tile ceiling at
 * runtime (`buildClauses` in sentences.ts) rather than by this number.
 */
export function checkShape(es: string, difficulty: number): { problems: string[]; warnings: string[] } {
  const problems: string[] = [];
  const warnings: string[] = [];
  const band = WORD_BAND[difficulty] ?? WORD_BAND[4];
  const words = wordsIn(es).length;
  if (words > band) warnings.push(`length.band — ${words} words at difficulty ${difficulty} (at most ${band})`);
  const clauses = clauseCount(es);
  const clauseMax = CLAUSE_BAND[difficulty] ?? CLAUSE_BAND[4];
  if (clauses > clauseMax) {
    problems.push(
      `clause.count — ${clauses} sentences in one at difficulty ${difficulty} (at most ${clauseMax}). ` +
        `Write one thing, not a chain of them: "${clausesOf(es)[0]}" is a sentence on its own.`,
    );
  }
  return { problems, warnings };
}
