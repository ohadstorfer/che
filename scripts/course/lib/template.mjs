// The one shape every unit has: the same
// lessons, in the same order, whatever the unit teaches. A unit with a lot to
// teach is split in two rather than given more lessons; one with little keeps
// all of them and practises more.
//
// Sections are moved to the shape one at a time (TEMPLATE_SECTIONS). A section
// not listed keeps the lessons it has, sized by how much each unit teaches
// (sync-lessons.mjs, `lessonCountFor`).

/** A unit's lessons, first to last. Culture is there while there are classes to give. */
export const TEMPLATE = ['lesson', 'lesson', 'slang', 'lesson', 'practice', 'culture', 'speak', 'review'];

/** The sections (by ordinal) whose units have the shape. */
export const TEMPLATE_SECTIONS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

/** Teaching lessons in a unit. */
export const TEACHING_LESSONS = TEMPLATE.filter((k) => k === 'lesson').length;

/**
 * What one teaching lesson may introduce, counted two ways.
 *
 * Words: "soy, sos, es" is one word met three ways, and its forms are taught
 * together. Four words is the most a lesson holds.
 *
 * Screens: the first form of a word is taught in full — the card, a question
 * about it, its meaning in a sentence (FULL). Another form of a word she has
 * already met is shown inside a sentence and then drilled (LIGHT): "hablás"
 * after "hablo" needs no card of its own. And where the other form is only the
 * word agreeing — "alta", "altos" after "alto", a plural after its singular —
 * being shown in a sentence is enough (PATTERN): the rule is the unit's tip,
 * and practice drills it. A lesson has LESSON_COST of these screens to spend
 * before its practice and its review.
 */
export const LESSON_WORDS = { target: 3, max: 4 };
export const COST = { full: 3, light: 2, pattern: 1 };
export const LESSON_COST = 12;
/** A lesson may run this far past it: the planner gives up one gap to make the room. */
export const LESSON_COST_SLACK = 1;

/** A unit past either of these is split in two. */
export const UNIT_WORDS_MAX = TEACHING_LESSONS * LESSON_WORDS.max;
export const UNIT_COST_MAX = TEACHING_LESSONS * LESSON_COST;

/**
 * New words a slang lesson teaches: two while the everyday ones last (A1),
 * then one, with more of the lesson given to the slang she already knows.
 */
export const slangWordsFor = (sectionOrdinal) => (sectionOrdinal <= 3 ? 2 : 1);

export const hasTemplate = (sectionOrdinal) => TEMPLATE_SECTIONS.has(sectionOrdinal);

/** A form that is its word agreeing in gender or number, not a verb form: nothing new to learn but the ending. */
const agrees = (f) =>
  f.pos !== 'verb' && !f.features?.tense && !f.features?.mood && !f.features?.verb_form && Boolean(f.features?.gender || f.features?.number);

/**
 * Which of a unit's forms get a lighter introduction, and what each costs:
 * every form of a word after the first she meets, in this unit or an earlier
 * one — COST.pattern where it only agrees, COST.light otherwise.
 *
 * @param forms  the unit's drillable forms, in teaching order
 * @param known  lemma ids with a drillable form taught in an earlier unit
 * @returns {Map<formId, number>}
 */
export function lightForms(forms, known = new Set()) {
  const met = new Set(known);
  const light = new Map();
  for (const f of forms) {
    if (met.has(f.lemma_id)) light.set(f.id, agrees(f) ? COST.pattern : COST.light);
    met.add(f.lemma_id);
  }
  return light;
}

/** What a unit's forms cost to teach, in screens. */
export const costOf = (forms, light) => forms.reduce((n, f) => n + (light.get(f.id) ?? COST.full), 0);

/** A unit's forms as words: one list per lemma, in teaching order. */
const wordGroups = (forms) => {
  const groups = [];
  const at = new Map();
  for (const f of forms) {
    if (!at.has(f.lemma_id)) {
      at.set(f.lemma_id, groups.length);
      groups.push([]);
    }
    groups[at.get(f.lemma_id)].push(f);
  }
  return groups;
};

/** How far a lesson's share is past what a lesson holds. A word is never cut in two, so one word alone always goes. */
const excess = (groups, light) => {
  const cost = groups.reduce((n, g) => n + costOf(g, light), 0);
  return Math.max(0, groups.length - LESSON_WORDS.max) * 100 + (groups.length > 1 ? Math.max(0, cost - LESSON_COST - LESSON_COST_SLACK) : 0);
};

/**
 * A unit's words dealt over its teaching lessons: whole words (a lemma's forms
 * stay together), in the order the unit lists them, as even as they divide by
 * cost. A thin unit leaves its last lessons with none, and then they practise.
 * Of every way to cut the list, it takes the one that keeps each lesson inside
 * what a lesson holds, and of those the most even.
 *
 * @param forms  the unit's drillable forms, in teaching order
 * @param light  the forms taught the light way (`lightForms`)
 * @returns {form[][]} one list per teaching lesson
 */
export function dealWords(forms, light = new Map(), lessons = TEACHING_LESSONS) {
  const groups = wordGroups(forms);
  let best = null;
  /** The first score is better: lower at the first place they differ. */
  const beats = (a, b) => {
    const i = a.findIndex((x, k) => x !== b[k]);
    return i >= 0 && a[i] < b[i];
  };
  const visit = (cuts) => {
    if (cuts.length < lessons - 1) {
      // Lessons with nothing come last: once a cut reaches the end, the rest sit on it.
      const prev = cuts.at(-1) ?? 0;
      for (let c = Math.min(prev + 1, groups.length); c <= groups.length; c++) visit([...cuts, c]);
      return;
    }
    const bounds = [0, ...cuts, groups.length];
    const parts = bounds.slice(0, -1).map((b, i) => groups.slice(b, bounds[i + 1]));
    const costs = parts.map((p) => p.reduce((n, g) => n + costOf(g, light), 0));
    const full = costs.filter((c) => c > 0);
    const score = [
      parts.reduce((n, p) => n + excess(p, light), 0),
      Math.max(0, ...costs),
      parts.filter((p) => !p.length).length,
      full.length ? Math.max(...full) - Math.min(...full) : 0,
    ];
    if (!best || beats(score, best.score)) best = { score, parts };
  };
  visit([]);
  return best.parts.map((p) => p.flat());
}

/** Why a unit doesn't fit the shape, or null: too many words, or more than its lessons can teach. */
export function overflow(forms, light = new Map()) {
  const groups = wordGroups(forms);
  const cost = costOf(forms, light);
  if (groups.length > UNIT_WORDS_MAX) return `${groups.length} words (a unit holds ${UNIT_WORDS_MAX})`;
  if (cost > UNIT_COST_MAX) return `${forms.length} forms cost ${cost} screens to teach (a unit holds ${UNIT_COST_MAX})`;
  const over = dealWords(forms, light).find((chunk) => excess(wordGroups(chunk), light) > 0);
  if (over) return `its words don't divide over ${TEACHING_LESSONS} lessons of ${LESSON_COST} screens (${forms.length} forms cost ${cost})`;
  return null;
}
