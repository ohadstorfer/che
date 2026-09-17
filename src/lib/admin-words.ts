import { glossSenses, norm, senseKey } from './answers';
import { newBatchId, staffDeleteSlot, staffInsert, staffUpdate } from './admin';
import { answerKey, checkFormEntry, checkSentence, missingOpeningMarks, reviewSentence } from './course-rules/check';
import { type GlossToken, carryGlosses, isGlossed } from './course-rules/gloss';
import { split } from './course-rules/tokenize';
import { type VocabForm, type Vocabulary, drillable } from './course-rules/vocabulary';
import { candidateMeanings, checkWordAnswers } from './course-rules/word-answers';
import { withMeanings } from './meanings';
import { toSentence } from './sentences';
import { supabase } from './supabase';
import type { ContentStatus, Form, FormFeatures, Lesson, LessonSlot, Sentence, Unit } from './types';

// ---------------------------------------------------------------------------
// Words and sentences in the admin (docs/superplan-admin-palabras.md §5, §7.3).
//
// Every operation is two steps. A pure `plan…` works out everything that
// changes — the rows to write, the sentences it pauses or brings back, what the
// person should confirm — so the admin can show it first and tests can check it.
// `applyWrites` then writes the plan as one batch, which one Undo reverts.
//
// A sentence an edit leaves invalid is still saved, but paused: back to draft
// with its reasons in `problems`. When an edit clears them it goes live again.
// ---------------------------------------------------------------------------

export interface AdminForm extends Form {
  status: ContentStatus;
  position: number;
  source: 'outline' | 'dashboard';
  /** The form's own gloss and note, when it overrides its lemma's. */
  own_gloss_en: string | null;
  own_gloss_note_en: string | null;
}

export interface LemmaRow {
  id: string;
  lemma: string;
  pos: string;
  gloss_en: string;
  gloss_note_en: string | null;
  register: string;
  is_glue: boolean;
  status: ContentStatus;
}

export interface WordSentence {
  id: string;
  unit_id: string;
  es: string;
  en: string;
  en_alt: string[];
  es_alt: string[];
  tokens: GlossToken[];
  target_form_id: string;
  kind: string;
  difficulty: number;
  source: string;
  audio_path: string | null;
  status: ContentStatus;
  problems: string[];
}

export interface AnswerRow {
  id: string;
  form_id: string;
  meaning: string;
  answer: string;
  source: string;
}

/** What `course:answers` last asked about a word or a sentence. */
export interface Asked {
  meanings?: string[];
  es?: string;
  en?: string;
}

export interface WordsData {
  forms: AdminForm[];
  lemmas: LemmaRow[];
  units: Unit[];
  lessons: Lesson[];
  slots: LessonSlot[];
  sentences: WordSentence[];
  answers: AnswerRow[];
  asked: Map<string, Asked>;
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** Every row, past PostgREST's page size. */
async function all<T>(query: () => { range: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }> }) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await query().range(from, from + 999);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

export async function loadWords(): Promise<WordsData> {
  const [entries, own, lemmas, units, lessons, slots, sentences, answers, reviews] = await Promise.all([
    all<Form & { status: ContentStatus }>(() => supabase.from('form_entries').select('*').order('id')),
    all<{ id: string; position: number; source: AdminForm['source']; gloss_en: string | null; gloss_note_en: string | null }>(() =>
      supabase.from('forms').select('id, position, source, gloss_en, gloss_note_en').order('id'),
    ),
    all<LemmaRow>(() => supabase.from('lemmas').select('id, lemma, pos, gloss_en, gloss_note_en, register, is_glue, status').order('id')),
    all<Unit>(() => supabase.from('units').select('*').order('course_order')),
    all<Lesson>(() => supabase.from('lessons').select('*').order('ordinal')),
    all<LessonSlot>(() => supabase.from('lesson_slots').select('*').order('ordinal')),
    all<WordSentence>(() => supabase.from('sentences').select('*').neq('status', 'retired').order('id')),
    all<AnswerRow>(() => supabase.from('form_answers').select('id, form_id, meaning, answer, source').eq('status', 'published').order('id')),
    all<{ row_id: string; notes: Asked & { kind: string } }>(() =>
      supabase.from('content_reviews').select('row_id, notes').eq('stage', 'ai').in('notes->>kind', ['answers', 'alternatives']).order('id'),
    ),
  ]);
  const ownById = new Map(own.map((o) => [o.id, o]));
  const asked = new Map<string, Asked>();
  for (const r of reviews) asked.set(r.row_id, r.notes);
  return {
    forms: entries.map((f) => ({
      ...f,
      features: f.features ?? {},
      position: ownById.get(f.id)?.position ?? 0,
      source: ownById.get(f.id)?.source ?? 'outline',
      own_gloss_en: ownById.get(f.id)?.gloss_en ?? null,
      own_gloss_note_en: ownById.get(f.id)?.gloss_note_en ?? null,
    })),
    lemmas,
    units: units.filter((u) => u.status !== 'retired'),
    lessons: lessons.filter((l) => l.status !== 'retired'),
    slots,
    sentences: sentences.map((s) => ({ ...s, problems: s.problems ?? [], en_alt: s.en_alt ?? [], es_alt: s.es_alt ?? [] })),
    answers,
    asked,
  };
}

// ---------------------------------------------------------------------------
// Reading the data
// ---------------------------------------------------------------------------

const live = (f: { status: ContentStatus }) => f.status !== 'retired';

export const vocabularyOf = (data: WordsData): Vocabulary => ({ forms: data.forms.filter(live) as VocabForm[] });
export const retiredOf = (data: WordsData) => data.forms.filter((f) => f.status === 'retired');
export const unitById = (data: WordsData, id: string) => data.units.find((u) => u.id === id);
export const lessonsOf = (data: WordsData, unitId: string) =>
  data.lessons.filter((l) => l.unit_id === unitId && l.kind !== 'story').sort((a, b) => a.ordinal - b.ordinal);

/** Sentences whose tokens use a form — not only the ones written to teach it. */
export const sentencesUsing = (data: WordsData, formId: string) =>
  data.sentences.filter((s) => s.tokens.some((t) => t.form_ids.includes(formId)));

export type SentenceState = 'live' | 'paused' | 'draft' | 'retired';
export const sentenceState = (s: Pick<WordSentence, 'status' | 'problems'>): SentenceState =>
  s.status === 'published' ? 'live' : s.status === 'retired' ? 'retired' : s.problems.length ? 'paused' : 'draft';

/** The lesson whose teach slot introduces a form, if any. */
export function teachingLesson(data: WordsData, formId: string) {
  const slot = data.slots.find((s) => s.kind === 'teach' && s.form_id === formId);
  return slot ? data.lessons.find((l) => l.id === slot.lesson_id) : undefined;
}

/** Sentences the way the app holds them: for meanings, and the preview. */
export function learnerSentences(data: WordsData, forms: Form[] = data.forms) {
  const formById = new Map(forms.map((f) => [f.id, f]));
  return data.sentences.filter((s) => s.status === 'published').map((s) => toSentence(s, formById));
}

/** The published drillable deck with meanings and stored answers, as a learner past every unit has it. */
export function deckOf(data: WordsData): Form[] {
  const accepts = new Map<string, { meaning: string; answer: string }[]>();
  for (const a of data.answers) accepts.set(a.form_id, [...(accepts.get(a.form_id) ?? []), { meaning: a.meaning, answer: a.answer }]);
  const forms = data.forms.filter((f) => f.status === 'published').map((f) => ({ ...f, accepts: accepts.get(f.id) ?? [] }));
  const sentences = learnerSentences(data, forms);
  return withMeanings(forms, sentences, Infinity).filter(drillable);
}

export type PendingKind = 'paused' | 'glosses' | 'alternatives' | 'no_sentences' | 'orphans' | 'no_audio';
export interface Pending {
  kind: PendingKind;
  label: string;
}

/**
 * What still needs doing about a word (§8). `no_audio` is listed on the word
 * but doesn't make it pending: nothing has audio until there is TTS.
 */
export function pendingFor(data: WordsData, form: AdminForm, learner: Sentence[] = learnerSentences(data)): Pending[] {
  const out: Pending[] = [];
  const using = sentencesUsing(data, form.id);
  const paused = using.filter((s) => sentenceState(s) === 'paused');
  if (paused.length) out.push({ kind: 'paused', label: `${paused.length} paused sentence${paused.length === 1 ? '' : 's'}` });
  const unglossed = using.filter((s) => s.status === 'published' && !isGlossed(s));
  if (unglossed.length) out.push({ kind: 'glosses', label: `glosses pending in ${unglossed.length}` });
  // A word of a unit still in the pipeline gets its sentences and answers there.
  const unitLive = data.units.find((u) => u.id === form.unit_id)?.status === 'published';
  if (drillable(form) && form.status !== 'retired' && unitLive) {
    const meanings = candidateMeanings(form, learner);
    const asked = new Set((data.asked.get(form.id)?.meanings ?? []).map(senseKey));
    const sentencesChanged = using.filter((s) => {
      const before = data.asked.get(s.id);
      return !before || before.es !== s.es || before.en !== s.en;
    });
    if (meanings.some((m) => !asked.has(senseKey(m))) || sentencesChanged.length) {
      out.push({ kind: 'alternatives', label: 'alternatives to review' });
    }
    if (!using.some((s) => s.status === 'published')) out.push({ kind: 'no_sentences', label: 'no sentences' });
    const orphans = orphanAnswers(data, form, learner);
    if (orphans.length) out.push({ kind: 'orphans', label: `${orphans.length} orphaned answer${orphans.length === 1 ? '' : 's'}` });
  }
  return out;
}

export const isPending = (p: Pending[]) => p.some((x) => x.kind !== 'no_audio');

/** Stored answers for a meaning the word no longer has. */
export function orphanAnswers(data: WordsData, form: AdminForm, learner: Sentence[] = learnerSentences(data)) {
  const meanings = new Set(candidateMeanings(form, learner).map(senseKey));
  return data.answers.filter((a) => a.form_id === form.id && !meanings.has(senseKey(a.meaning)));
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export type Write =
  | { op: 'update'; table: string; id: string; patch: Record<string, unknown> }
  | { op: 'insert'; table: string; row: Record<string, unknown> }
  | { op: 'deleteSlot'; slot: LessonSlot };

/** Writes a plan as one batch, in order. Returns the batch, for Undo. */
export async function applyWrites(writes: Write[]) {
  const opts = { batchId: newBatchId() };
  for (const w of writes) {
    if (w.op === 'update') await staffUpdate(w.table, w.id, w.patch, opts);
    else if (w.op === 'insert') await staffInsert(w.table, w.row, opts);
    else await staffDeleteSlot(w.slot, opts);
  }
  return opts.batchId;
}

/** A copy of the data with one form changed, for planning what that change does. */
export function withForm(data: WordsData, formId: string, change: Partial<AdminForm>): WordsData {
  return { ...data, forms: data.forms.map((f) => (f.id === formId ? { ...f, ...change } : f)) };
}

// ---------------------------------------------------------------------------
// Sentences (§5.8–5.10)
// ---------------------------------------------------------------------------

export interface SentenceEdits {
  es?: string;
  en?: string;
  en_alt?: string[];
  es_alt?: string[];
  target_form_id?: string;
}

export interface SentencePlan {
  id: string | null;
  before: WordSentence | null;
  row: Omit<WordSentence, 'id'>;
  problems: string[];
  /** Other Spanish removed because it no longer fits the sentence; confirm first. */
  droppedAlts: string[];
  /** Other Spanish that can't be accepted, and why. Not saved. */
  altProblems: string[];
  /** Other Spanish that can't be built from the tiles: accepted when typed, never built. */
  altWarnings: string[];
  glossesPending: boolean;
  wentLive: boolean;
  paused: boolean;
  writes: Write[];
}

const wordsOf = (text: string) => new Set(text.split(/\s+/).map((w) => norm(split(w).core)).filter(Boolean));

/**
 * A sentence as it will be saved: re-tokenized against the words available in
 * its unit, checked (§3), its automatic alternatives regenerated, its glosses
 * carried over where the words didn't change. `sentence` null is a new one.
 */
export function planSentence(data: WordsData, sentence: WordSentence | null, edits: SentenceEdits): SentencePlan {
  const vocabulary = vocabularyOf(data);
  const es = (edits.es ?? sentence?.es ?? '').trim().replace(/\s+/g, ' ');
  const en = (edits.en ?? sentence?.en ?? '').trim();
  const targetId = edits.target_form_id ?? sentence?.target_form_id ?? null;
  const target = data.forms.find((f) => f.id === targetId);
  const unitId = sentence?.unit_id ?? target?.unit_id ?? '';
  const unit = unitById(data, unitId) ?? { course_order: 0, register_max: 'neutral' };
  const review = reviewSentence({ vocabulary, unit, es, en, targetFormId: targetId, retired: retiredOf(data) });
  const esChanged = !sentence || sentence.es !== es;

  // Other Spanish: what the person listed, then what the rules generate.
  const listed = (edits.es_alt ?? sentence?.es_alt ?? []).map((a) => a.trim()).filter(Boolean);
  const variantWords = new Set(review.variants.flatMap((v) => [...wordsOf(v)]));
  const esWords = wordsOf(es);
  const droppedAlts: string[] = [];
  const altProblems: string[] = [];
  const altWarnings: string[] = [];
  const kept: string[] = [];
  for (const alt of listed) {
    if (esChanged && sentence && sentence.es_alt.includes(alt) && [...wordsOf(alt)].some((w) => !esWords.has(w) && !variantWords.has(w))) {
      droppedAlts.push(alt);
      continue;
    }
    const problems = [...checkSentence(vocabulary, unit, alt, retiredOf(data)), ...missingOpeningMarks(alt)];
    if (problems.length) {
      altProblems.push(`"${alt}": ${problems.join('; ')}`);
      continue;
    }
    if (![...wordsOf(alt)].every((w) => esWords.has(w) || variantWords.has(w))) {
      altWarnings.push(`"${alt}" uses words the tiles don't have, so it can be typed but never built`);
    }
    kept.push(alt);
  }
  const taken = new Set([answerKey(es)]);
  const es_alt: string[] = [];
  for (const alt of [...kept, ...review.variants]) {
    const k = answerKey(alt);
    if (taken.has(k)) continue;
    taken.add(k);
    es_alt.push(alt);
  }

  const tokens = sentence
    ? carryGlosses({ en: sentence.en, tokens: sentence.tokens }, { en, tokens: review.tokens })
    : review.tokens.map((t) => ({ ...t, gloss_pending: true }));
  const problems = review.problems;
  const wasPaused = !!sentence && sentenceState(sentence) === 'paused';
  const status: ContentStatus = problems.length
    ? 'draft'
    : !sentence || sentence.status === 'published' || wasPaused
      ? 'published'
      : sentence.status;
  const row: Omit<WordSentence, 'id'> = {
    unit_id: unitId,
    es,
    en,
    en_alt: (edits.en_alt ?? sentence?.en_alt ?? []).map((a) => a.trim()).filter(Boolean),
    es_alt,
    tokens,
    target_form_id: targetId ?? '',
    kind: sentence?.kind ?? (review.tokens.length > 1 ? 'sentence' : 'word'),
    difficulty: sentence?.difficulty ?? 1,
    source: sentence?.source ?? 'human',
    audio_path: esChanged ? null : (sentence?.audio_path ?? null),
    status,
    problems,
  };
  const writes: Write[] = [];
  if (sentence) {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (JSON.stringify(v) !== JSON.stringify((sentence as unknown as Record<string, unknown>)[k])) patch[k] = v;
    }
    if (Object.keys(patch).length) writes.push({ op: 'update', table: 'sentences', id: sentence.id, patch });
  } else if (target) {
    writes.push({ op: 'insert', table: 'sentences', row });
  }
  return {
    id: sentence?.id ?? null,
    before: sentence,
    row,
    problems,
    droppedAlts,
    altProblems,
    altWarnings,
    glossesPending: tokens.some((t) => t.gloss_pending),
    wentLive: status === 'published' && (!sentence || sentence.status !== 'published'),
    paused: status === 'draft' && problems.length > 0 && (!sentence || sentenceState(sentence) !== 'paused'),
    writes,
  };
}

/** Retiring a sentence: it leaves the drills of every lesson it was in. */
export function planRetireSentence(data: WordsData, sentence: WordSentence) {
  const slots = data.slots.filter((s) => s.sentence_id === sentence.id);
  const writes: Write[] = [
    { op: 'update', table: 'sentences', id: sentence.id, patch: { status: 'retired' } },
    ...slots.map((slot): Write => ({ op: 'deleteSlot', slot })),
  ];
  return { writes, slots: slots.length };
}

/** Every sentence using a form, re-checked against changed data. Only the ones that change are written. */
function recheck(next: WordsData, formId: string, edits?: (s: WordSentence) => SentenceEdits) {
  return sentencesUsing(next, formId)
    .map((s) => planSentence(next, s, edits ? edits(s) : {}))
    .filter((p) => p.writes.length);
}

// ---------------------------------------------------------------------------
// Words (§5.1–5.3)
// ---------------------------------------------------------------------------

/** Where a meaning is written: the lemma, when this is its only form, or the form's own override. */
export function planMeaning(data: WordsData, form: AdminForm, fields: { gloss_en: string; gloss_note_en: string }) {
  const gloss_en = fields.gloss_en.trim();
  const gloss_note_en = fields.gloss_note_en.trim() || null;
  const errors: string[] = [];
  if (!gloss_en) errors.push('The meaning can’t be empty.');
  // On the lemma only when no other form reads its meaning from there: "medialunas" says "croissants" itself.
  const others = data.forms.filter((f) => f.lemma_id === form.lemma_id && f.id !== form.id && live(f));
  const onLemma = form.own_gloss_en == null && others.every((f) => f.own_gloss_en != null);
  const writes: Write[] = onLemma
    ? [{ op: 'update', table: 'lemmas', id: form.lemma_id, patch: { gloss_en, gloss_note_en } }]
    : [{ op: 'update', table: 'forms', id: form.id, patch: { gloss_en, gloss_note_en } }];
  const next = withForm(data, form.id, { gloss_en, gloss_note_en });
  const orphans = orphanAnswers(next, next.forms.find((f) => f.id === form.id)!);
  return { errors, writes, onLemma, orphans };
}

/** Grammar: the grading follows at once ("un café" once café has a gender); sentence alternatives are regenerated. */
export function planFeatures(data: WordsData, form: AdminForm, features: FormFeatures) {
  const clean = Object.fromEntries(Object.entries(features).filter(([, v]) => v !== undefined && v !== '' && v !== false)) as FormFeatures;
  const errors = checkFormEntry({ form: form.form, pos: form.pos, features: clean });
  const next = withForm(data, form.id, { features: clean });
  const sentences = recheck(next, form.id);
  return {
    errors,
    sentences,
    writes: [{ op: 'update', table: 'forms', id: form.id, patch: { features: clean } } as Write, ...sentences.flatMap((p) => p.writes)],
  };
}

/** An accepted answer typed by hand, checked the way `course:answers` checks a model's. */
export function checkAnswer(data: WordsData, form: AdminForm, meaning: string, answer: string) {
  const deck = deckOf(data);
  const drilled = deck.find((f) => f.id === form.id) ?? { ...form, accepts: data.answers.filter((a) => a.form_id === form.id) };
  const meanings = candidateMeanings(form, learnerSentences(data));
  const { rows, problems, skipped } = checkWordAnswers({ form: drilled, meanings, proposed: [{ meaning, answer }], deck });
  const row = rows[0];
  return {
    error: row ? null : (problems[0] ?? skipped[0] ?? 'Not accepted.').replace(/^.*?: /, ''),
    writes: row ? [{ op: 'insert', table: 'form_answers', row: { ...row, source: 'staff' } } as Write] : [],
  };
}

export const planRetireAnswer = (answer: AnswerRow): Write[] => [
  { op: 'update', table: 'form_answers', id: answer.id, patch: { status: 'retired' } },
];

// ---------------------------------------------------------------------------
// Big operations (§5.4–5.7)
// ---------------------------------------------------------------------------

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const capitalized = (w: string) => w.charAt(0) !== w.charAt(0).toLocaleLowerCase('es');
const likeCase = (model: string, text: string) =>
  capitalized(model) ? text.charAt(0).toLocaleUpperCase('es') + text.slice(1) : text;

/** Replace a word as a whole word, keeping a capital where there was one: "mate" doesn't touch "tomate". */
export function replaceWord(text: string, from: string, to: string) {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRe(from)})(?=[^\\p{L}\\p{N}]|$)`, 'giu');
  return text.replace(re, (_m, before: string, word: string) => before + likeCase(word, to));
}

/**
 * Fixing how a word is written (§5.4): the same word, the same id — learners
 * keep their progress — replaced in every sentence that uses it. Glosses stay:
 * the word is the same and the English didn't change.
 */
export function planSpelling(data: WordsData, form: AdminForm, text: string) {
  const next = text.trim().replace(/\s+/g, ' ');
  const errors: string[] = [];
  if (!next) errors.push('The word can’t be empty.');
  if (next === form.form) errors.push('That is how it is written already.');
  errors.push(...checkFormEntry({ form: next, pos: form.pos, features: form.features }));
  if (data.forms.some((f) => f.id !== form.id && f.lemma_id === form.lemma_id && f.form === next)) {
    errors.push(`"${next}" is already a form of ${form.lemma}.`);
  }
  // The lemma is renamed when this form is how the lemma is written: medialuna, not medialunas.
  const lemma = data.lemmas.find((l) => l.id === form.lemma_id);
  const renameLemma = lemma?.lemma === form.form;
  if (renameLemma && data.lemmas.some((l) => l.id !== form.lemma_id && l.lemma === next && l.pos === form.pos)) {
    errors.push(`There is already a ${form.pos} "${next}".`);
  }

  const changed = withForm(data, form.id, { form: next, audio_path: null });
  const sentences = sentencesUsing(data, form.id).map((s) => {
    const tokens = s.tokens.map((t) => {
      if (!t.form_ids.includes(form.id)) return t;
      const { lead, core, tail } = split(t.surface);
      return { ...t, surface: `${lead}${likeCase(core, next)}${tail}` };
    });
    const es = tokens.map((t) => t.surface).join(' ');
    const es_alt = s.es_alt.map((a) => replaceWord(a, form.form, next));
    const plan = planSentence(changed, s, { es, es_alt });
    // The same tokens, the same English: every gloss still holds.
    const same = plan.row.tokens.length === s.tokens.length && plan.row.tokens.every((t, i) => t.form_ids.join() === s.tokens[i].form_ids.join());
    if (same) {
      const glossed = plan.row.tokens.map((t, i): GlossToken => {
        const { gloss_pending: _p, ...rest } = t;
        const old = s.tokens[i];
        return { ...rest, ...(old.gloss ? { gloss: old.gloss } : {}), ...(old.gloss_source ? { gloss_source: old.gloss_source } : {}), ...(old.gloss_pending ? { gloss_pending: true } : {}) };
      });
      return withTokens(plan, s, glossed);
    }
    return plan;
  });
  const writes: Write[] = [
    { op: 'update', table: 'forms', id: form.id, patch: { form: next, audio_path: null } },
    ...(renameLemma ? [{ op: 'update', table: 'lemmas', id: form.lemma_id, patch: { lemma: next } } as Write] : []),
    ...sentences.flatMap((p) => p.writes),
  ];
  return { errors, renameLemma, sentences, writes };
}

/** A sentence plan with its tokens replaced, and its write patched to match. */
function withTokens(plan: SentencePlan, before: WordSentence, tokens: GlossToken[]): SentencePlan {
  const row = { ...plan.row, tokens };
  const writes = plan.writes.map((w): Write => {
    if (w.op !== 'update') return w;
    const patch = { ...w.patch };
    if (JSON.stringify(tokens) === JSON.stringify(before.tokens)) delete patch.tokens;
    else patch.tokens = tokens;
    return { ...w, patch };
  });
  return { ...plan, row, writes, glossesPending: tokens.some((t) => t.gloss_pending) };
}

/**
 * Moving a word to another unit (§5.5): it is taught in the chosen lesson from
 * now on. Sentences that would come before it is taught pause; ones that were
 * paused only for that go live again.
 */
export function planMove(data: WordsData, form: AdminForm, unitId: string, lessonId: string) {
  const errors: string[] = [];
  const unit = unitById(data, unitId);
  const lesson = data.lessons.find((l) => l.id === lessonId);
  if (!unit) errors.push('Pick a unit.');
  if (!lesson || lesson.unit_id !== unitId) errors.push('Pick a lesson of that unit.');
  if (unitId === form.unit_id) errors.push('It is taught in that unit already.');
  const position = Math.max(0, ...data.forms.filter((f) => f.unit_id === unitId).map((f) => f.position)) + 1;
  const next = withForm(data, form.id, {
    unit_id: unitId,
    unit_order: unit?.course_order ?? form.unit_order,
    unit_ordinal: unit?.ordinal ?? form.unit_ordinal,
    position,
  });
  const sentences = recheck(next, form.id);
  const oldSlots = data.slots.filter((s) => s.kind === 'teach' && s.form_id === form.id);
  const ordinal = Math.max(0, ...data.slots.filter((s) => s.lesson_id === lessonId).map((s) => s.ordinal)) + 1;
  const writes: Write[] = [
    { op: 'update', table: 'forms', id: form.id, patch: { unit_id: unitId, position } },
    ...oldSlots.map((slot): Write => ({ op: 'deleteSlot', slot })),
    ...(lesson ? [{ op: 'insert', table: 'lesson_slots', row: { lesson_id: lessonId, ordinal, kind: 'teach', form_id: form.id } } as Write] : []),
    ...sentences.flatMap((p) => p.writes),
  ];
  return {
    errors,
    paused: sentences.filter((p) => p.paused),
    wentLive: sentences.filter((p) => p.wentLive),
    sentences,
    writes,
  };
}

/** Retiring a word (§5.6): out of the course and its lessons; its sentences pause. Undo brings it all back. */
export function planRetire(data: WordsData, form: AdminForm) {
  const next = withForm(data, form.id, { status: 'retired' });
  const sentences = recheck(next, form.id);
  const siblings = data.forms.filter((f) => f.lemma_id === form.lemma_id && f.id !== form.id && live(f));
  const slots = data.slots.filter((s) => s.kind === 'teach' && s.form_id === form.id);
  const writes: Write[] = [
    { op: 'update', table: 'forms', id: form.id, patch: { status: 'retired' } },
    ...(siblings.length ? [] : [{ op: 'update', table: 'lemmas', id: form.lemma_id, patch: { status: 'retired' } } as Write]),
    ...slots.map((slot): Write => ({ op: 'deleteSlot', slot })),
    ...sentences.flatMap((p) => p.writes),
  ];
  return { paused: sentences.filter((p) => p.paused), sentences, writes, retiresLemma: !siblings.length };
}

export interface NewForm {
  form: string;
  /** An existing lemma's id, or null to create one from `lemma`, `pos`… */
  lemma_id: string | null;
  lemma: string;
  pos: string;
  features: FormFeatures;
  gloss_en: string;
  gloss_note_en: string;
  register: string;
  is_glue: boolean;
  unit_id: string;
  lesson_id: string;
}

export function checkNewForm(data: WordsData, fields: NewForm) {
  const errors: string[] = [];
  const text = fields.form.trim();
  const lemma = fields.lemma_id ? data.lemmas.find((l) => l.id === fields.lemma_id) : null;
  const pos = lemma?.pos ?? fields.pos;
  const lemmaText = lemma?.lemma ?? fields.lemma.trim();
  if (!text) errors.push('Write the word.');
  if (!lemmaText) errors.push('Write its lemma (the dictionary form).');
  if (!pos) errors.push('Pick its part of speech.');
  if (!lemma && !fields.gloss_en.trim()) errors.push('Write what it means.');
  if (!unitById(data, fields.unit_id)) errors.push('Pick a unit.');
  if (!data.lessons.some((l) => l.id === fields.lesson_id && l.unit_id === fields.unit_id)) errors.push('Pick a lesson of that unit.');
  errors.push(...checkFormEntry({ form: text, pos, features: fields.features }));
  if (!lemma && lemmaText !== text) errors.push(...checkFormEntry({ form: lemmaText, pos, features: {} }).map((e) => `Lemma: ${e}`));
  const existingLemma = lemma ?? data.lemmas.find((l) => l.lemma === lemmaText && l.pos === pos);
  if (existingLemma && data.forms.some((f) => f.lemma_id === existingLemma.id && f.form === text)) {
    errors.push(`"${text}" (${pos}) is already in the course.`);
  }
  return { errors, lemma: existingLemma ?? null };
}

/** Adds a word: its lemma if new, the form, and its teach slot. Returns the new form's id. */
export async function addForm(data: WordsData, fields: NewForm) {
  const { errors, lemma } = checkNewForm(data, fields);
  if (errors.length) throw new Error(errors.join(' '));
  const unit = unitById(data, fields.unit_id)!;
  const status = unit.status === 'published' ? 'published' : 'draft';
  const opts = { batchId: newBatchId() };
  const lemmaRow =
    lemma ??
    (await staffInsert<LemmaRow>(
      'lemmas',
      {
        lemma: fields.lemma.trim(),
        pos: fields.pos,
        gloss_en: fields.gloss_en.trim(),
        gloss_note_en: fields.gloss_note_en.trim() || null,
        register: fields.register,
        is_glue: fields.is_glue,
        status,
        source: 'dashboard',
      },
      opts,
    ));
  // A form of an existing lemma only carries its own meaning when it differs.
  const ownGloss = lemma && fields.gloss_en.trim() && fields.gloss_en.trim() !== lemma.gloss_en ? fields.gloss_en.trim() : null;
  const position = Math.max(0, ...data.forms.filter((f) => f.unit_id === unit.id).map((f) => f.position)) + 1;
  const form = await staffInsert<{ id: string }>(
    'forms',
    {
      lemma_id: lemmaRow.id,
      form: fields.form.trim(),
      features: fields.features,
      gloss_en: ownGloss,
      gloss_note_en: lemma ? fields.gloss_note_en.trim() || null : null,
      unit_id: unit.id,
      position,
      status,
      source: 'dashboard',
    },
    opts,
  );
  if (lemma && lemma.status === 'retired') await staffUpdate('lemmas', lemma.id, { status }, opts);
  const ordinal = Math.max(0, ...data.slots.filter((s) => s.lesson_id === fields.lesson_id).map((s) => s.ordinal)) + 1;
  await staffInsert('lesson_slots', { lesson_id: fields.lesson_id, ordinal, kind: 'teach', form_id: form.id }, opts);
  return { id: form.id, batchId: opts.batchId };
}

/** The meanings a new answer can be for: the word's senses and its sentences'. */
export const meaningsFor = (data: WordsData, form: AdminForm) => {
  const meanings = candidateMeanings(form, learnerSentences(data));
  return meanings.length ? meanings : glossSenses(form.gloss_en);
};
