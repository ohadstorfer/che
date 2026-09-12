export type Role = 'teacher' | 'student';

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
  timezone: string;
}

export interface Card {
  id: string;
  hebrew: string;
  translit: string;
  spanish: string;
  english: string | null;
  audio_path: string | null;
  created_by: string;
  created_at: string;
}

export type CardStateName = 'new' | 'learning' | 'review';

export interface CardState {
  id: string;
  card_id: string;
  user_id: string;
  state: CardStateName;
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
  /** A new word met for the first time inside a generated sentence: pick the
   *  sentence's meaning, with the word marked and tappable. */
  | 'sentence_intro'
  /** A sentence she knows every word of: read it, pick its meaning. The first
   *  rung of the ladder, before the gap and the tiles. */
  | 'sentence_meaning'
  /** The sentence with its target word blanked out: pick the word. */
  | 'sentence_gap'
  /** Rebuild the sentence from word tiles, given its Spanish. */
  | 'sentence_build'
  /** Rebuild the sentence from word tiles, given only its audio. */
  | 'sentence_listen';

/** One space-separated word of a generated sentence, and where it came from. */
export interface SentenceToken {
  surface: string;
  translit: string;
  /** The card(s) this word is — two when the same Hebrew sits on two cards. */
  card_ids?: string[];
  /** A word allowed without being a card (pronouns, של, עם…). */
  glue?: string;
  /** A prefix letter glued on (בבית → ב + בית). */
  prefix?: string;
  /** 'other' when the word is a conjugated form of its card. */
  form?: 'taught' | 'other';
}

// A generated practice sentence. Not a card: it has no SM-2 state of its own —
// it is a context the cards in `card_ids` get reviewed through. `shown` is her
// rotation record for it (sentence_states), null until it is first served.
export interface Sentence {
  id: string;
  hebrew: string;
  translit: string;
  spanish: string;
  english: string | null;
  audio_path: string | null;
  /** The word this sentence was written for — introduced or drilled by it. */
  target_card_id: string;
  level: number;
  tokens: SentenceToken[];
  card_ids: string[];
  shown: { shown_count: number; correct_count: number; last_shown_at: string | null } | null;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  /** A run lost to a missed day, recoverable until the comeback day ends. */
  recoverable_streak: number;
}
