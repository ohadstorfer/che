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
  correct_answers?: string[];
  acceptable_answers_per_blank?: string[][];
  usage_example?: string;
  explanation: string;
  english_idiomatic: string;
  hebrew_idiomatic: string;
};

export type GenerateResponse = {
  topic: string;
  sections: Array<{
    title: string;
    description: string;
    exercises: Exercise[];
  }>;
};

export function normalizeGenerateResponse(
  raw: unknown,
): GenerateResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;
  if (!Array.isArray(parsed.sections)) return null;

  const sections = parsed.sections
    .map((sec: unknown, sIdx: number) => {
      if (!sec || typeof sec !== "object") return null;
      const s = sec as Record<string, unknown>;
      const title = String(s.title ?? `Sección ${sIdx + 1}`);
      const description = String(s.description ?? "");
      const exercisesIn = Array.isArray(s.exercises) ? s.exercises : [];
      const exercises = exercisesIn
        .map((ex: unknown, eIdx: number) =>
          normalizeExercise(ex, title, description, sIdx, eIdx)
        )
        .filter((x: Exercise | null): x is Exercise => x !== null);
      if (exercises.length === 0) return null;
      return { title, description, exercises };
    })
    .filter((
      s: { title: string; description: string; exercises: Exercise[] } | null,
    ): s is { title: string; description: string; exercises: Exercise[] } =>
      s !== null
    );

  if (sections.length === 0) return null;

  return {
    topic: typeof parsed.topic === "string" && parsed.topic.trim()
      ? parsed.topic
      : sections[0].title,
    sections,
  };
}

function normalizeExercise(
  raw: unknown,
  sectionTitle: string,
  sectionDescription: string,
  sIdx: number,
  eIdx: number,
): Exercise | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prompt = typeof r.prompt === "string" ? r.prompt : "";
  const correctAnswersRaw = Array.isArray(r.correct_answers)
    ? r.correct_answers.filter((x: unknown): x is string => typeof x === "string")
    : null;
  const correct = typeof r.correct_answer === "string" && r.correct_answer
    ? r.correct_answer
    : correctAnswersRaw && correctAnswersRaw.length > 0
    ? correctAnswersRaw[0]
    : "";
  if (!prompt || !correct) return null;

  const allowed = new Set([
    "fill_blank",
    "transform",
    "identify_type",
    "free_production",
  ]);
  const t = typeof r.type === "string" && allowed.has(r.type)
    ? (r.type as ExerciseType)
    : "fill_blank";

  return {
    id: typeof r.id === "string" && r.id ? r.id : `ex_${sIdx}_${eIdx}`,
    type: t,
    section_title:
      typeof r.section_title === "string" && r.section_title
        ? r.section_title
        : sectionTitle,
    section_description:
      typeof r.section_description === "string" && r.section_description
        ? r.section_description
        : sectionDescription,
    instruction: typeof r.instruction === "string" && r.instruction
      ? r.instruction
      : typeof r.section_description === "string" && r.section_description
      ? r.section_description
      : sectionDescription,
    prompt,
    correct_answer: correct,
    acceptable_answers: Array.isArray(r.acceptable_answers)
      ? r.acceptable_answers.filter((x: unknown): x is string =>
        typeof x === "string"
      )
      : [],
    correct_answers: correctAnswersRaw && correctAnswersRaw.length > 0
      ? correctAnswersRaw
      : undefined,
    acceptable_answers_per_blank: Array.isArray(r.acceptable_answers_per_blank)
      ? r.acceptable_answers_per_blank
        .map((arr: unknown) =>
          Array.isArray(arr)
            ? arr.filter((x: unknown): x is string => typeof x === "string")
            : []
        )
      : undefined,
    usage_example: typeof r.usage_example === "string" && r.usage_example
      ? r.usage_example
      : undefined,
    explanation: typeof r.explanation === "string" ? r.explanation : "",
    english_idiomatic: typeof r.english_idiomatic === "string"
      ? r.english_idiomatic
      : "",
    hebrew_idiomatic: typeof r.hebrew_idiomatic === "string"
      ? r.hebrew_idiomatic
      : "",
  };
}
