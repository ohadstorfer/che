// What each word of a sentence means in that sentence — the checks, shared by
// `course:gloss` (which asks a model) and the admin (where a person corrects a
// gloss by hand). A gloss must be words that are really in the sentence's
// English, so the worst a wrong one can do is point at the wrong words of a
// right translation.

export interface GlossToken {
  surface: string;
  form_ids: string[];
  gloss?: string;
  /** 'staff': written by hand in the admin; `course:gloss` leaves it alone. */
  gloss_source?: 'staff';
  /** The text changed and the model hasn't aligned this token yet. */
  gloss_pending?: boolean;
}

/** Lowercased, apostrophes straightened, spaces collapsed: how English is compared. */
const plain = (s: string) =>
  String(s)
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Punctuation a gloss may carry at its edges and loses when stored. */
const EDGES = /^[\s"“”«».,!?¿¡;:()…-]+|[\s"“”«».,!?¿¡;:()…-]+$/gu;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A gloss as stored: trimmed of the punctuation around it. */
export const cleanGloss = (gloss: string) => String(gloss ?? '').replace(EDGES, '');

/** Whether `gloss` is a whole-word piece of `en`: "do" is not in "don't". */
export function inEnglish(gloss: string, en: string) {
  const needle = plain(gloss);
  if (!needle) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}'])${escape(needle)}($|[^\\p{L}\\p{N}'])`, 'u').test(plain(en));
}

/**
 * A sentence's tokens with the model's glosses applied, and what was wrong with
 * the answer. A gloss that isn't in the English is dropped and reported, never
 * stored; a token the answer leaves out loses any gloss it had, since the
 * answer says the English has nothing for it. A gloss written by hand stays.
 */
export function applyGlosses(
  sentence: { en: string; tokens: GlossToken[] },
  answer: { tokens?: { i: unknown; en?: unknown }[] } | null | undefined,
) {
  const problems: string[] = [];
  const byIndex = new Map<number, string>();
  for (const entry of answer?.tokens ?? []) {
    const i = Number(entry.i);
    const gloss = cleanGloss(String(entry.en ?? ''));
    if (!Number.isInteger(i) || i < 0 || i >= sentence.tokens.length) {
      problems.push(`token ${entry.i} does not exist`);
    } else if (!gloss) {
      continue;
    } else if (!inEnglish(gloss, sentence.en)) {
      problems.push(`"${sentence.tokens[i].surface}" → "${gloss}", which is not in "${sentence.en}"`);
    } else {
      byIndex.set(i, gloss);
    }
  }
  const tokens = sentence.tokens.map((token, i): GlossToken => {
    if (token.gloss_source === 'staff') {
      const { gloss_pending: _done, ...t } = token;
      return t;
    }
    const { gloss: _stale, gloss_pending: _done, gloss_source: _none, ...t } = token;
    return byIndex.has(i) ? { ...t, gloss: byIndex.get(i) } : t;
  });
  return { tokens, problems };
}

/**
 * Whether a sentence's glosses are done: some token is glossed and none is
 * waiting for the model. (A sentence nobody has aligned yet has no gloss at all.)
 */
export const isGlossed = (sentence: { tokens: GlossToken[] }) =>
  sentence.tokens.some((t) => t.gloss && t.gloss_source !== 'staff') && !sentence.tokens.some((t) => t.gloss_pending);

/**
 * The glosses a sentence keeps when its text is edited. A token whose words and
 * forms didn't change keeps its gloss, if the English still has those words;
 * everything else waits for `course:gloss`. When the English changed, only the
 * glosses written by hand can still be right.
 */
export function carryGlosses(
  before: { en: string; tokens: GlossToken[] },
  after: { en: string; tokens: { surface: string; form_ids: string[] }[] },
): GlossToken[] {
  const enChanged = before.en.trim() !== after.en.trim();
  const same = (a: { surface: string; form_ids: string[] }, b: { surface: string; form_ids: string[] }) =>
    a.surface === b.surface && a.form_ids.join() === b.form_ids.join();
  const unchanged = before.tokens.length === after.tokens.length;
  const changed = !unchanged || before.tokens.some((t, i) => !same(t, after.tokens[i]));
  if (!changed && !enChanged) return before.tokens.map((t, i) => ({ ...t, ...after.tokens[i] }));

  // Tokens are matched in order, skipping over what was inserted or removed.
  const out: GlossToken[] = [];
  let j = 0;
  for (const token of after.tokens) {
    let k = j;
    while (k < before.tokens.length && !same(before.tokens[k], token)) k++;
    const old = k < before.tokens.length ? before.tokens[k] : null;
    if (old) j = k + 1;
    const keep = old?.gloss && (old.gloss_source === 'staff' || !enChanged) && inEnglish(old.gloss, after.en);
    out.push(
      keep
        ? { ...token, gloss: old!.gloss, ...(old!.gloss_source ? { gloss_source: old!.gloss_source } : {}) }
        : old?.gloss_source === 'staff' && !old.gloss && !enChanged
          ? { ...token, gloss_source: 'staff' }
          : { ...token, gloss_pending: true },
    );
  }
  return out;
}

/** A gloss corrected by hand: blank means the English has nothing for the word. */
export function setGloss(sentence: { en: string; tokens: GlossToken[] }, index: number, gloss: string) {
  const clean = cleanGloss(gloss);
  if (clean && !inEnglish(clean, sentence.en)) {
    return { tokens: sentence.tokens, problem: `"${clean}" is not in "${sentence.en}"` };
  }
  const tokens = sentence.tokens.map((token, i): GlossToken => {
    if (i !== index) return token;
    const { gloss: _old, gloss_pending: _done, ...t } = token;
    return { ...t, ...(clean ? { gloss: clean } : {}), gloss_source: 'staff' };
  });
  return { tokens, problem: null };
}
