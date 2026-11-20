import type { Form } from '@/lib/types';
import { sharesMeaning } from '@/lib/answers';
import { courseArtName, panchoCourseArt } from '@/lib/word-art-keys';

// Plain names, not the pictures: this file is loaded by the engine's tests,
// outside Metro, where an image can't be required.
const courseArt = (lemmaId: string): string | undefined => courseArtName[lemmaId];

// ---------------------------------------------------------------------------
// "Which one is el café?": a beginner hears and reads a new word and taps its
// picture out of four, the way the first class asks for the medialuna. It
// sits between meeting a word and building it from letters (lesson.ts), so
// the word is recognised once before she is asked to make it.
//
// The rules that keep it fair:
//   · only things a picture can say: nouns and numbers. "estudiar" drawn is a
//     capybara with a book, which reads as "book" as much as "study";
//   · no Pancho pictures, for the same reason: the capybara doing something
//     makes every one of them look like the same answer;
//   · no two options with the same picture (some lemmas share one);
//   · wrong answers from other units than the word and than each other. Units
//     are themed, so this keeps café away from mate and medialuna, the
//     lookalikes that would make it a guess;
//   · only the first sections of the course, where she is a beginner.
// ---------------------------------------------------------------------------

/** Sections whose new words can be asked as a picture. */
export const PICTURE_PICK_SECTIONS = 3;
/** At most this many in one lesson, so it stays a change of pace. */
export const PICTURE_PICK_PER_LESSON = 2;
const OPTIONS = 4;
const PICTURED_POS = new Set(['noun', 'num']);

const picturable = (f: Form) => {
  if (!PICTURED_POS.has(f.pos) || !courseArt(f.lemma_id)) return false;
  return !panchoCourseArt.has(f.lemma_id);
};

/** Whether this new word can be asked by its picture. */
export const canPicturePick = (form: Form) =>
  (form.section_id ?? Infinity) <= PICTURE_PICK_SECTIONS && picturable(form);

/**
 * The three wrong answers for `form`, or null when three fair ones can't be
 * found. Words she has met come first (`deck`); the rest of the course's
 * early words fill in, never from the word's own unit.
 */
export function pictureDecoys(form: Form, deck: Form[], lexicon: Iterable<Form>): Form[] | null {
  const chosen: Form[] = [];
  const pictures = new Set([courseArt(form.lemma_id)]);
  const units = new Set([form.unit_id]);
  const lemmas = new Set([form.lemma_id]);
  const fits = (f: Form) =>
    f.pos === form.pos &&
    picturable(f) &&
    !lemmas.has(f.lemma_id) &&
    !units.has(f.unit_id) &&
    !pictures.has(courseArt(f.lemma_id)) &&
    (f.section_id ?? Infinity) <= PICTURE_PICK_SECTIONS &&
    !sharesMeaning(f, form) &&
    !chosen.some((c) => sharesMeaning(c, f));
  const take = (pool: Form[]) => {
    for (const f of shuffled(pool)) {
      if (chosen.length === OPTIONS - 1) return;
      if (!fits(f)) continue;
      chosen.push(f);
      pictures.add(courseArt(f.lemma_id));
      units.add(f.unit_id);
      lemmas.add(f.lemma_id);
    }
  };
  take(deck);
  // Earlier units first: a word from further on is a picture she has never
  // seen named, which is fine for a wrong answer, but a known one is better.
  if (chosen.length < OPTIONS - 1) take([...lexicon].filter((f) => f.unit_order < form.unit_order));
  if (chosen.length < OPTIONS - 1) take([...lexicon]);
  return chosen.length === OPTIONS - 1 ? chosen : null;
}

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
