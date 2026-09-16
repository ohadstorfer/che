// Pinned for the content pipeline (docs/course-spec.md §4): which model drafts
// sentences and which judges them. Every generated batch records these and its
// prompt hash in content_reviews, so a bad batch can be traced to what made it.

export const GENERATOR_MODEL = 'claude-opus-5';
export const JUDGE_MODEL = 'claude-opus-5';
/** Drafting is creative work within hard constraints; judging is careful reading. */
export const GENERATOR_EFFORT = 'high';
export const JUDGE_EFFORT = 'high';
