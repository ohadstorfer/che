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
  ordinal: number;
  slug: string;
  title_en: string;
  summary_en: string;
  grammar_focus: string[];
  register_max: string;
  status: ContentStatus;
}

export type LessonKind = 'lesson' | 'review' | 'checkpoint';

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

export type SlotKind = 'teach' | 'drill' | 'match' | 'tip' | 'review';

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
  /** English meaning — the form's own gloss, or its lemma's. */
  gloss_en: string;
  features: FormFeatures;
  unit_id: string;
  unit_ordinal: number;
  is_glue: boolean;
  register: string;
  audio_path: string | null;
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
  /** The sentence with its target word blanked out: pick the word. */
  | 'sentence_gap'
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
}

// An authored sentence. Not a form: it has no SM-2 state of its own — it is a
// context the forms in `form_ids` get drilled through. `shown` is her rotation
// record for it (sentence_states), null until it is first served.
export interface Sentence {
  id: string;
  unit_id: string;
  es: string;
  en: string;
  en_alt: string[];
  audio_path: string | null;
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
