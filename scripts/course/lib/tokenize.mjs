// Splits a Spanish sentence into tokens and resolves each one to the forms it
// could be. This is what makes "no word before it's taught" checkable: a token
// that resolves to nothing is a word the learner hasn't met.
//
// A token is one space-separated word with its punctuation kept on it
// ("¿Tenés", "mate?"), except where the lexicon has a multi-word form — a set
// phrase or a place name ("todo bien", "Buenos Aires") — in which case the
// words it spans become one token. Longest match wins.

import { fold } from './rules.mjs';

const LEAD = /^[¿¡"“«(\-—]+/u;
const TAIL = /[.,!?;:…"”»)\-—]+$/u;

function split(piece) {
  const lead = piece.match(LEAD)?.[0] ?? '';
  const rest = piece.slice(lead.length);
  const tail = rest.match(TAIL)?.[0] ?? '';
  return { lead, core: rest.slice(0, rest.length - tail.length), tail };
}

/**
 * An index over the forms a sentence may use: folded surface → form entries.
 * `forms` are `{ id, form, ... }`.
 */
export function buildIndex(forms) {
  const index = new Map();
  let maxWords = 1;
  for (const f of forms) {
    const key = fold(f.form);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(f);
    maxWords = Math.max(maxWords, key.split(' ').length);
  }
  return { index, maxWords };
}

/**
 * @returns {{ surface: string, core: string, forms: object[] }[]}
 *   `forms` is empty for a token nothing in the index matches.
 */
export function tokenize(es, { index, maxWords }) {
  const pieces = es.trim().split(/\s+/).filter(Boolean).map(split);
  const tokens = [];
  let i = 0;
  while (i < pieces.length) {
    let matched = null;
    for (let n = Math.min(maxWords, pieces.length - i); n >= 1; n--) {
      const span = pieces.slice(i, i + n);
      // Punctuation may only sit at the outer edges of a multi-word token —
      // "bien, gracias" is two tokens even though "bien gracias" might not be.
      const inner = span.some((p, k) => (k > 0 && p.lead) || (k < n - 1 && p.tail));
      if (n > 1 && inner) continue;
      const core = span.map((p) => p.core).join(' ');
      const hit = index.get(fold(core));
      if (hit) {
        matched = { n, core, forms: hit };
        break;
      }
    }
    const n = matched?.n ?? 1;
    const span = pieces.slice(i, i + n);
    tokens.push({
      surface: span.map((p, k) => `${k === 0 ? p.lead : ''}${p.core}${k === n - 1 ? p.tail : ''}`).join(' '),
      core: matched?.core ?? pieces[i].core,
      forms: matched?.forms ?? [],
    });
    i += n;
  }
  return tokens;
}
