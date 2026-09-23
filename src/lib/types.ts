export type Role = 'student' | 'reviewer' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
  timezone: string;
}

export type ContentStatus = 'draft' | 'linted' | 'ai_reviewed' | 'approved' | 'published' | 'retired';

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

export interface Section {
  id: number;
  ordinal: number;
  slug: string;
  title_en: string;
  cefr: string;
}

export interface Unit {
  id: string;
  section_id: number;
  /** Place in its own section — what the path shows ("Section 2, Unit 3"). */
  ordinal: number;
  /** Place in the whole course, which is what "taught by now" is measured on. */
  course_order: number;
  slug: string;
  title_en: string;
  summary_en: string;
  grammar_focus: string[];
  register_max: string;
  status: ContentStatus;
}

export type LessonKind = 'lesson' | 'practice' | 'story' | 'listening' | 'review' | 'checkpoint';

export interface Lesson {
  id: string;
  unit_id: string;
  ordinal: number;
  title_en: string;
  kind: LessonKind;
  status: ContentStatus;
}

export interface Tip {
  id: string;
  unit_id: string;
  title_en: string;
  body_md: string;
}

export type SlotKind = 'teach' | 'drill' | 'match' | 'tip' | 'review' | 'recap';

export interface LessonSlot {
  id: string;
  lesson_id: string;
  ordinal: number;
  kind: SlotKind;
  form_id: string | null;
  sentence_id: string | null;
  tip_id: string | null;
  mode: ExerciseMode | null;
  review_count: number | null;
  /** recap: the unit's forms, or its whole section's. */
  scope?: 'unit' | 'section' | null;
}

// ---------------------------------------------------------------------------
// Lexicon
// ---------------------------------------------------------------------------

export interface FormFeatures {
  person?: 1 | 2 | 3;
  number?: 'sg' | 'pl';
  tense?: 'pres';
  mood?: 'ind' | 'imp';
  verb_form?: 'inf' | 'ger';
  voseo?: boolean;
  clitic?: boolean;
  gender?: 'm' | 'f';
  /** An irregular form: decays faster, so it can start with a lower ease. */
  irregular?: boolean;
}

/**
 * One surface string of one lemma — what the learner meets, drills and
 * schedules. Read from the `form_entries` view, so the lemma's facts and the
 * teaching unit's position come folded in and `gloss_en` is always resolved.
 */
export interface Form {
  id: string;
  lemma_id: string;
  lemma: string;
  pos: string;
  /** The Spanish, as written: `tenés`, `Buenos Aires`, `todo bien`. */
  form: string;
  /** English meaning — the form's own gloss, or its lemma's. Short enough to
   *  sit on an answer tile, and never containing the Spanish it glosses. A
   *  dictionary entry ("well, fine, good"): screens that show one meaning use
   *  `meaningOf` instead. */
  gloss_en: string;
  /** What the word means where she has met it — the one meaning a prompt, an
   *  option or a tile shows. Worked out from its sentences each time her data
   *  loads (meanings.ts), so it follows the content rather than being authored. */
  meaning_en?: string;
  /** Every meaning its sentences give it ("fine", "well"), most familiar first. */
  meanings_en?: string[];
  /** The aside that explains the word rather than translating it — "the drink"
   *  for mate. Shown where the word is taught or revealed, never where it is
   *  asked: on a tile or an option it would hand over the answer. */
  gloss_note_en: string | null;
  features: FormFeatures;
  unit_id: string;
  section_id?: number;
  /** Its unit's place in its section, for display. */
  unit_ordinal: number;
  /** Its unit's place in the whole course: a form is available from here on. */
  unit_order: number;
  is_glue: boolean;
  /** A form that never stands on its own — `llamo`, which only ever appears
   *  inside `me llamo`. It keeps its place in sentences and in the dictionary
   *  and gets no exercise of its own; the chunk is what is drilled.
   *  `course-rules/vocabulary.ts` · docs/course-spec.md §1.5. */
  bound?: boolean;
  register: string;
  audio_path: string | null;
  /** Who says `audio_path` — a row of `voices`. Null where there is no
   *  recording. What decides which figure may speak the line on screen. */
  voice_id: string | null;
  /** Other spellings accepted when the form is typed on its own. */
  alt?: string[];
  /** Other answers accepted when the form is typed for one of its meanings
   *  ("buenas" for "hi"), from the `form_answers` table. */
  accepts?: { meaning: string; answer: string }[];
}

export type FormStateName = 'new' | 'learning' | 'review';

export interface FormState {
  id: string;
  form_id: string;
  user_id: string;
  state: FormStateName;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_at: string | null;
  introduced_on: string;
}

export type Rating = 0 | 1 | 2 | 3; // otra vez, difícil, bien, fácil

export type ExerciseMode =
  | 'flashcard'
  | 'multiple_choice'
  | 'listen'
  | 'typing'
  | 'matching'
  | 'word_build'
  | 'true_false'
  /** Hear the sentence, then rebuild it word by word from tiles. */
  | 'listen_build'
  /** A new word met for the first time inside a sentence: pick the sentence's
   *  meaning, with the word marked and tappable. */
  | 'sentence_intro'
  /** A sentence she knows every word of: read it, pick its meaning. The first
   *  rung of the ladder, before the gap and the tiles. */
  | 'sentence_meaning'
  /** The same rung, asked properly: read the Spanish and put its English
   *  together from tiles, rather than picking it out of four. */
  | 'sentence_meaning_tiles'
  /** The sentence with its target word blanked out: pick the word. */
  | 'sentence_gap'
  /** The same blank, filled from a bank of word tiles instead of four
   *  choices — the step above the gap for a sentence that stays at it. */
  | 'sentence_gap_tiles'
  /** The same blank again, typed. The top of the gap, and the one production
   *  screen a word can be given before it has settled enough to be typed on
   *  its own: the sentence around it carries everything else. */
  | 'sentence_gap_typed'
  /** Rebuild the sentence from word tiles, given its English. */
  | 'sentence_build'
  /** Rebuild the sentence from word tiles, given only its audio. */
  | 'sentence_listen'
  /** A grammar note between exercises. Graded by nothing. */
  | 'tip';

// ---------------------------------------------------------------------------
// Raw content
// ---------------------------------------------------------------------------

/**
 * One token of a sentence. Stored as `{ surface, form_ids }`; on load the ids
 * are split by what they are — content forms stay in `form_ids` (drilled and
 * graded), a function word moves to `glue` (in view, never graded), and a
 * proper noun drops out altogether.
 */
export interface SentenceToken {
  /** As written, punctuation included: `¿Tenés`, `mate?`. */
  surface: string;
  form_ids: string[];
  /** The glue form this token is, if it is one (`de`, `el`, `me`). */
  glue?: string;
  /** What the token means in this sentence: the words of the sentence's English
   *  that translate it ("well done" for `bien hecho`). Absent where the English
   *  has nothing for it (`che`), or before `course:gloss` has run. */
  gloss?: string;
}

// An authored sentence. Not a form: it has no SM-2 state of its own — it is a
// context the forms in `form_ids` get drilled through. `shown` is her rotation
// record for it (sentence_states), null until it is first served.
export interface Sentence {
  id: string;
  unit_id: string;
  /** The place in the course of the unit its target form is taught in. */
  unit_order?: number;
  es: string;
  en: string;
  en_alt: string[];
  /** Other Spanish accepted when the sentence is built from its English. */
  es_alt: string[];
  audio_path: string | null;
  /** Who says `audio_path` — a row of `voices`. */
  voice_id: string | null;
  /** The form this sentence exists to teach or drill. */
  target_form_id: string;
  difficulty: number;
  tokens: SentenceToken[];
  /** Content forms in the sentence (glue and proper nouns excluded). */
  form_ids: string[];
  shown: { shown_count: number; correct_count: number; last_shown_at: string | null } | null;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  /** A run lost to a missed day, recoverable until the comeback day ends. */
  recoverable_streak: number;
}
