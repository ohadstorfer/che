export type ExerciseType =
  | "fill_blank"
  | "transform"
  | "identify_type"
  | "free_production";

export type Exercise = {
  id: string;
  type: ExerciseType;
  section_title: string;
  section_description: string;
  instruction: string;
  prompt: string;
  correct_answer: string;
  acceptable_answers: string[];
  explanation: string;
  english_idiomatic: string;
  hebrew_idiomatic: string;
};

export type ExerciseSection = {
  title: string;
  description: string;
  exercises: Exercise[];
};

export type GenerateResponse = {
  topic: string;
  sections: ExerciseSection[];
};

export type SessionRecord = {
  id: string;
  topic: string;
  prompt: string;
  data: GenerateResponse;
  createdAt: string;
  lastResult?: { correct: number; total: number };
};

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
};

export type Settings = {
  reminderTime: string;
  notificationsEnabled: boolean;
  displayName: string;
};
