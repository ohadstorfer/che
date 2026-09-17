import { answerWords } from './answers';
import { supabase } from './supabase';
import type { ContentStatus, Form, Lesson, LessonSlot, Section, Tip, Unit } from './types';

// ---------------------------------------------------------------------------
// The admin dashboard's data (docs/course-spec.md §5).
//
// Every write a reviewer makes goes through `staffUpdate` / `staffInsert` /
// `staffDelete`, which record the row before and after in content_revisions —
// so any edit can be traced and undone by hand. Reading and writing are both
// allowed by RLS only for reviewers and admins.
// ---------------------------------------------------------------------------

export const STATUSES: ContentStatus[] = ['draft', 'linted', 'ai_reviewed', 'approved', 'published', 'retired'];

type Row = Record<string, unknown>;

async function currentUser(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('not signed in');
  return id;
}

/**
 * Writes that make up one operation — a spelling fixed in every sentence, a
 * word moved or retired — share a batch, so one Undo reverts them together.
 */
export interface WriteOptions {
  batchId?: string;
}

export const newBatchId = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

async function revision(table: string, rowId: string, before: Row | null, after: Row, opts?: WriteOptions) {
  const edited_by = await currentUser();
  const { error } = await supabase
    .from('content_revisions')
    .insert({ table_name: table, row_id: rowId, before, after, edited_by, batch_id: opts?.batchId ?? null });
  if (error) throw new Error(error.message);
}

/** Update one row by id and record the change. Returns the row after. */
export async function staffUpdate<T = Row>(table: string, id: string, patch: Row, opts?: WriteOptions): Promise<T> {
  const { data: before } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  await revision(table, id, (before as Row) ?? null, data as Row, opts);
  return data as T;
}

export async function staffInsert<T = Row>(table: string, row: Row, opts?: WriteOptions): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw new Error(error.message);
  await revision(table, (data as Row).id as string, null, data as Row, opts);
  return data as T;
}

/** Only lesson slots may be deleted (RLS); everything else is retired. */
export async function staffDeleteSlot(slot: LessonSlot, opts?: WriteOptions) {
  const { error } = await supabase.from('lesson_slots').delete().eq('id', slot.id);
  if (error) throw new Error(error.message);
  await revision('lesson_slots', slot.id, slot as unknown as Row, { deleted: true }, opts);
}

// ---------------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------------

export interface Revision {
  id: number;
  table_name: string;
  row_id: string;
  before: Row | null;
  after: Row;
  batch_id: string | null;
  created_at: string;
}

export type UndoStep =
  | { kind: 'update'; table: string; id: string; patch: Row }
  | { kind: 'retire'; table: string; id: string }
  | { kind: 'delete'; table: string; id: string }
  | { kind: 'insert'; table: string; row: Row };

/** Columns the database keeps itself; an undo never writes them. */
const MANAGED = new Set(['id', 'created_at', 'updated_at']);
/** Tables whose rows may be deleted; the rest are retired instead. */
const DELETABLE = new Set(['lesson_slots']);

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * What reverting a batch takes, newest write first. An update puts back only
 * the columns it changed, so a later edit to another field survives; an insert
 * is retired (or deleted, for a slot); a deleted slot comes back.
 */
export function planUndo(revisions: Revision[]): UndoStep[] {
  return [...revisions]
    .sort((a, b) => b.id - a.id)
    .flatMap((r): UndoStep[] => {
      if (r.before === null) {
        return [DELETABLE.has(r.table_name) ? { kind: 'delete', table: r.table_name, id: r.row_id } : { kind: 'retire', table: r.table_name, id: r.row_id }];
      }
      if ((r.after as { deleted?: boolean }).deleted === true) return [{ kind: 'insert', table: r.table_name, row: r.before }];
      const patch: Row = {};
      for (const [k, v] of Object.entries(r.before)) {
        if (!MANAGED.has(k) && !sameValue(v, r.after[k])) patch[k] = v;
      }
      return Object.keys(patch).length ? [{ kind: 'update', table: r.table_name, id: r.row_id, patch }] : [];
    });
}

/** The newest batch that touched any of these rows, for a per-word Undo button. */
export async function lastBatchFor(rowIds: string[]): Promise<Revision | null> {
  if (!rowIds.length) return null;
  const { data } = await supabase
    .from('content_revisions')
    .select('*')
    .in('row_id', rowIds)
    .not('batch_id', 'is', null)
    .order('id', { ascending: false })
    .limit(1);
  return ((data ?? []) as Revision[])[0] ?? null;
}

/** Reverts every write of a batch. The undo is a batch of its own, so it shows in the history too. */
export async function undoBatch(batchId: string) {
  const { data, error } = await supabase.from('content_revisions').select('*').eq('batch_id', batchId);
  if (error) throw new Error(error.message);
  const opts = { batchId: newBatchId() };
  for (const step of planUndo((data ?? []) as Revision[])) {
    if (step.kind === 'update') await staffUpdate(step.table, step.id, step.patch, opts);
    else if (step.kind === 'retire') await staffUpdate(step.table, step.id, { status: 'retired' }, opts);
    else if (step.kind === 'delete') {
      const { data: slot } = await supabase.from('lesson_slots').select('*').eq('id', step.id).maybeSingle();
      if (slot) await staffDeleteSlot(slot as LessonSlot, opts);
    } else {
      const row = Object.fromEntries(Object.entries(step.row).filter(([k]) => k !== 'created_at' && k !== 'updated_at'));
      await staffInsert(step.table, row, opts);
    }
  }
  return opts.batchId;
}

/** A reviewer's verdict on a row, alongside the linter's and the AI's. */
export async function recordReview(
  table: string,
  rowId: string,
  verdict: 'pass' | 'flag' | 'fail',
  comment?: string,
) {
  const reviewer = await currentUser();
  await supabase.from('content_reviews').insert({
    table_name: table,
    row_id: rowId,
    stage: 'native',
    verdict,
    notes: comment ? { comment } : {},
    reviewer,
  });
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

export interface SentenceRow {
  id: string;
  unit_id: string;
  es: string;
  en: string;
  en_alt: string[];
  es_alt: string[];
  tokens: { surface: string; form_ids: string[]; gloss?: string }[];
  target_form_id: string;
  kind: string;
  difficulty: number;
  source: string;
  audio_path: string | null;
  status: ContentStatus;
}

export interface ReviewRow {
  id: number;
  stage: 'lint' | 'ai' | 'native';
  verdict: 'pass' | 'flag' | 'fail';
  notes: Record<string, unknown>;
  created_at: string;
}

export interface UnitSummary extends Unit {
  section: Section | null;
  sentences: Record<ContentStatus, number>;
  forms: number;
  lessons: number;
  slots: number;
}

const emptyCounts = () => Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<ContentStatus, number>;

export async function loadUnits(): Promise<UnitSummary[]> {
  const [{ data: units }, { data: sections }, { data: sentences }, { data: forms }, { data: lessons }, { data: slots }] =
    await Promise.all([
      supabase.from('units').select('*').neq('status', 'retired'),
      supabase.from('sections').select('*'),
      supabase.from('sentences').select('unit_id, status'),
      supabase.from('forms').select('unit_id, status'),
      supabase.from('lessons').select('id, unit_id, status').neq('status', 'retired'),
      supabase.from('lesson_slots').select('lesson_id'),
    ]);
  const sectionById = new Map(((sections ?? []) as Section[]).map((s) => [s.id, s]));
  const lessonUnit = new Map(((lessons ?? []) as Lesson[]).map((l) => [l.id, l.unit_id]));
  return ((units ?? []) as Unit[])
    .sort((a, b) => a.course_order - b.course_order)
    .map((u) => {
      const counts = emptyCounts();
      for (const s of (sentences ?? []) as { unit_id: string; status: ContentStatus }[]) {
        if (s.unit_id === u.id) counts[s.status] += 1;
      }
      return {
        ...u,
        section: sectionById.get(u.section_id) ?? null,
        sentences: counts,
        forms: ((forms ?? []) as { unit_id: string; status: string }[]).filter((f) => f.unit_id === u.id && f.status !== 'retired').length,
        lessons: ((lessons ?? []) as Lesson[]).filter((l) => l.unit_id === u.id).length,
        slots: ((slots ?? []) as { lesson_id: string }[]).filter((s) => lessonUnit.get(s.lesson_id) === u.id).length,
      };
    });
}

export interface UnitDetail {
  unit: Unit;
  forms: (Form & { status: ContentStatus })[];
  sentences: SentenceRow[];
  lessons: Lesson[];
  tips: Tip[];
}

export async function loadUnit(id: string): Promise<UnitDetail | null> {
  const [{ data: unit }, { data: forms }, { data: sentences }, { data: lessons }, { data: tips }] = await Promise.all([
    supabase.from('units').select('*').eq('id', id).maybeSingle(),
    supabase.from('form_entries').select('*').eq('unit_id', id),
    supabase.from('sentences').select('*').eq('unit_id', id),
    supabase.from('lessons').select('*').eq('unit_id', id).neq('status', 'retired'),
    supabase.from('tips').select('*').eq('unit_id', id),
  ]);
  if (!unit) return null;
  return {
    unit: unit as Unit,
    forms: (forms ?? []) as UnitDetail['forms'],
    sentences: ((sentences ?? []) as SentenceRow[]).sort((a, b) => a.es.localeCompare(b.es, 'es')),
    lessons: ((lessons ?? []) as Lesson[]).sort((a, b) => a.ordinal - b.ordinal),
    tips: (tips ?? []) as Tip[],
  };
}

export async function loadReviews(table: string, rowId: string): Promise<ReviewRow[]> {
  const { data } = await supabase
    .from('content_reviews')
    .select('*')
    .eq('table_name', table)
    .eq('row_id', rowId)
    .order('created_at', { ascending: false });
  return (data ?? []) as ReviewRow[];
}

export async function loadForms(ids?: string[]): Promise<Form[]> {
  const query = supabase.from('form_entries').select('*');
  const { data } = ids ? await query.in('id', ids) : await query;
  return (data ?? []) as Form[];
}

/**
 * Publishes a unit: the unit, its lessons and tips, the forms and lemmas it
 * introduces, and its approved sentences. Drafts stay drafts — a sentence nobody
 * approved is not shown to learners by publishing the unit around it.
 */
export async function publishUnit(detail: UnitDetail) {
  const writes: Promise<unknown>[] = [staffUpdate('units', detail.unit.id, { status: 'published' })];
  for (const l of detail.lessons) if (l.status !== 'published') writes.push(staffUpdate('lessons', l.id, { status: 'published' }));
  for (const t of detail.tips) writes.push(staffUpdate('tips', t.id, { status: 'published' }));
  for (const f of detail.forms) {
    if (f.status !== 'published' && f.status !== 'retired') {
      writes.push(staffUpdate('forms', f.id, { status: 'published' }));
      writes.push(Promise.resolve(supabase.from('lemmas').update({ status: 'published' }).eq('id', f.lemma_id).neq('status', 'retired')));
    }
  }
  for (const s of detail.sentences) if (s.status === 'approved') writes.push(staffUpdate('sentences', s.id, { status: 'published' }));
  // The section too, once any of its units is live.
  writes.push(Promise.resolve(supabase.from('sections').update({ status: 'published' }).eq('id', detail.unit.section_id)));
  await Promise.all(writes);
}

// ---------------------------------------------------------------------------
// Reports: "my answer should be accepted"
// ---------------------------------------------------------------------------

export interface ReportGroup {
  sentence_id: string | null;
  form_id: string | null;
  answer_key: string;
  answer: string;
  reports: number;
  first_at: string;
}

export async function loadReportGroups(): Promise<ReportGroup[]> {
  const { data } = await supabase.rpc('staff_open_reports');
  return (data ?? []) as ReportGroup[];
}

async function resolveGroup(group: ReportGroup, status: 'accepted' | 'rejected', note?: string) {
  const reviewer = await currentUser();
  let q = supabase
    .from('answer_reports')
    .update({ status, resolved_by: reviewer, resolved_at: new Date().toISOString(), note: note ?? null })
    .eq('status', 'open')
    .eq('answer_key', group.answer_key);
  q = group.sentence_id ? q.eq('sentence_id', group.sentence_id) : q.is('sentence_id', null);
  q = group.form_id ? q.eq('form_id', group.form_id) : q.is('form_id', null);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

/** Accepts a reported answer: it joins the sentence's es_alt (or the form's
 *  alt), and every identical report is resolved at once. */
export async function acceptReport(group: ReportGroup, answer: string) {
  const clean = answer.trim();
  if (group.sentence_id) {
    const { data: s } = await supabase.from('sentences').select('es, es_alt').eq('id', group.sentence_id).single();
    const existing = [(s as SentenceRow).es, ...((s as SentenceRow).es_alt ?? [])].map((x) => answerWords(x).join(' '));
    if (!existing.includes(answerWords(clean).join(' '))) {
      await staffUpdate('sentences', group.sentence_id, { es_alt: [...((s as SentenceRow).es_alt ?? []), clean] });
    }
  } else if (group.form_id) {
    const { data: f } = await supabase.from('forms').select('alt').eq('id', group.form_id).single();
    const alt = ((f as { alt?: string[] }).alt ?? []) as string[];
    if (!alt.includes(clean)) await staffUpdate('forms', group.form_id, { alt: [...alt, clean] });
  }
  await resolveGroup(group, 'accepted');
}

export const rejectReport = (group: ReportGroup, note?: string) => resolveGroup(group, 'rejected', note);

// ---------------------------------------------------------------------------
// Attention and engine reports
// ---------------------------------------------------------------------------

export interface Attention {
  sentences: { sentence_id: string; unit_id: string; es: string; tries: number; fail_rate: number; build_fail_rate: number | null; open_reports: number }[];
  leeches: { form_id: string; form: string; learners: number; avg_lapses: number }[];
  checks: { unit_id: string; unit_title: string; learners: number; first_attempt_pass: number; by_attempts: number }[];
  openReports: number;
}

export async function loadAttention(): Promise<Attention> {
  const [q, l, c, r] = await Promise.all([
    supabase.rpc('staff_sentence_quality', { p_min_tries: 20 }),
    supabase.rpc('staff_form_leeches', { p_min_lapses: 3 }),
    supabase.rpc('staff_unit_check_rates'),
    supabase.rpc('staff_open_reports'),
  ]);
  return {
    sentences: ((q.data ?? []) as Attention['sentences']).filter((s) => s.fail_rate > 0.35 || s.open_reports > 0),
    leeches: ((l.data ?? []) as Attention['leeches']).filter((x) => x.learners >= 3),
    checks: ((c.data ?? []) as Attention['checks']).filter((x) => x.learners >= 5 && x.first_attempt_pass < 0.6),
    openReports: ((r.data ?? []) as ReportGroup[]).reduce((n, g) => n + Number(g.reports), 0),
  };
}

export interface EngineStats {
  rounds: { week: string; kind: string; finished: number; abandoned: number; avg_score: number | null; out_of_band: number }[];
  modes: { week: string; mode: string; promoted: boolean; first_tries: number; fail_rate: number | null; median_ms: number | null }[];
}

export async function loadEngineStats(): Promise<EngineStats> {
  const [r, m] = await Promise.all([supabase.rpc('staff_round_stats'), supabase.rpc('staff_mode_stats')]);
  return { rounds: (r.data ?? []) as EngineStats['rounds'], modes: (m.data ?? []) as EngineStats['modes'] };
}
