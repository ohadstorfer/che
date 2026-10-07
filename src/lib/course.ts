import { peekStored, versioned } from './content-cache';
import { all } from './fetch-all';
import { supabase } from './supabase';
import type { Lesson, LessonKind, Section, Tip, Unit } from './types';

// ---------------------------------------------------------------------------
// The curriculum, as the path draws it.
//
// The path is one ordered road of lessons: section by section, unit by unit,
// lesson by lesson. Where she stands on it is simply the first lesson she has
// no progress row for — only that one starts a new lesson, so the road is
// walked in order.
//
// What she has finished is not always the stretch behind her, though. A
// reshaped course (units split, lessons reordered) or a credit handed out by a
// migration can leave finished lessons ahead of her step. So "finished" is
// always asked of the set of lesson ids, never worked out from her index: a
// step ahead that is done is drawn done, and the road walks past it.
// ---------------------------------------------------------------------------

export interface PathLesson extends Lesson {
  unit: Unit;
  section: Section;
  /** Position on the whole road, 0-based. */
  index: number;
  /** Which unit of the road this lesson is in, 0-based — the banner count above it. */
  unitIndex: number;
  /** How many section headers stand above it, its own included. */
  sectionIndex: number;
  /** First lesson of its unit: the unit's banner is drawn just above it. */
  opensUnit: boolean;
  /** First lesson of its section: the section's header is drawn above that. */
  opensSection: boolean;
}

export interface Course {
  sections: Section[];
  units: Unit[];
  path: PathLesson[];
  tipsByUnit: Map<string, Tip[]>;
}

interface CourseRows {
  sections: Section[];
  units: Unit[];
  lessons: Lesson[];
  tips: Tip[];
}

/** The published course, loaded once and kept on the phone (content-cache.ts). */
export async function loadCourse(): Promise<Course> {
  const rows = await versioned('course', (v) => v.course, fetchCourseRows);
  return assembled(rows);
}

/** The course as the phone last stored it, without asking the server whether
 *  it is current — what a cold start draws the road from. Null when there is
 *  no copy yet. */
export async function peekCourse(): Promise<Course | null> {
  const rows = await peekStored<CourseRows>('course');
  return rows ? assembled(rows) : null;
}

// Assembled once per set of rows: the rows are shared by every caller in a
// run, and the road holds Maps, which a stored file can't.
const courses = new WeakMap<CourseRows, Course>();
function assembled(rows: CourseRows): Course {
  let course = courses.get(rows);
  if (!course) {
    course = assemble([...rows.sections].sort((a, b) => a.ordinal - b.ordinal), rows.units, rows.lessons, rows.tips);
    courses.set(rows, course);
  }
  return course;
}

async function fetchCourseRows(): Promise<CourseRows> {
  // Paged: the course is past the 1,000 rows PostgREST sends at once (it has
  // ~2,900 lessons), and a single read silently cut every unit after lesson 3.
  // `assemble` puts things in order, so the pages go by id.
  const [sections, units, lessons, tips] = await Promise.all([
    all<Section>(() => supabase.from('sections').select('*').eq('status', 'published').order('id')),
    all<Unit>(() => supabase.from('units').select('*').eq('status', 'published').order('id')),
    all<Lesson>(() => supabase.from('lessons').select('*').eq('status', 'published').order('id')),
    all<Tip>(() => supabase.from('tips').select('*').eq('status', 'published').order('id')),
  ]);
  return { sections, units, lessons, tips };
}

// Lesson kinds kept off the road for now. Stories (the two-voice dialogues,
// app/story.tsx) are hidden until they are ready; their rows stay published,
// so emptying this brings them back. A lesson left off never becomes the
// current step, so nobody is held up behind one.
const HIDDEN_KINDS: ReadonlySet<LessonKind> = new Set<LessonKind>(['story']);

export function assemble(sections: Section[], units: Unit[], lessons: Lesson[], tips: Tip[]): Course {
  const sectionOrdinal = new Map(sections.map((s) => [s.id, s.ordinal]));
  const orderedUnits = units
    .filter((u) => sectionOrdinal.has(u.section_id))
    .sort(
      (a, b) =>
        sectionOrdinal.get(a.section_id)! - sectionOrdinal.get(b.section_id)! || a.ordinal - b.ordinal,
    );

  const lessonsByUnit = new Map<string, Lesson[]>();
  for (const l of lessons) {
    if (HIDDEN_KINDS.has(l.kind)) continue;
    if (!lessonsByUnit.has(l.unit_id)) lessonsByUnit.set(l.unit_id, []);
    lessonsByUnit.get(l.unit_id)!.push(l);
  }

  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const path: PathLesson[] = [];
  const visibleUnits: Unit[] = [];
  const visibleSections: Section[] = [];
  for (const unit of orderedUnits) {
    const own = (lessonsByUnit.get(unit.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
    // A unit with no published lessons has nothing to walk; leave it off the road.
    if (own.length === 0) continue;
    const section = sectionById.get(unit.section_id)!;
    const opensSection = visibleSections.at(-1)?.id !== section.id;
    if (opensSection) visibleSections.push(section);
    const unitIndex = visibleUnits.length;
    visibleUnits.push(unit);
    own.forEach((lesson, k) =>
      path.push({
        ...lesson,
        unit,
        section,
        index: path.length,
        unitIndex,
        sectionIndex: visibleSections.length - 1,
        opensUnit: k === 0,
        opensSection: opensSection && k === 0,
      }),
    );
  }

  const tipsByUnit = new Map<string, Tip[]>();
  for (const t of tips) {
    if (!tipsByUnit.has(t.unit_id)) tipsByUnit.set(t.unit_id, []);
    tipsByUnit.get(t.unit_id)!.push(t);
  }

  return { sections, units: visibleUnits, path, tipsByUnit };
}

/** Her lesson progress in one read: the lessons she has finished — for a unit
 *  check, passed (learning-engine-spec §3): a check finished below the pass
 *  score keeps the path waiting on it — and her attempts at the checks still
 *  waiting on her, by lesson id. */
export async function loadLessonProgress(
  userId: string,
): Promise<{ done: Set<string>; checkAttempts: Map<string, number> }> {
  const data = await all<{ lesson_id: string; passed?: boolean | null; attempts?: number }>(() =>
    supabase.from('lesson_progress').select('lesson_id, passed, attempts').eq('user_id', userId).order('lesson_id'),
  );
  return {
    done: new Set(data.filter((r) => r.passed !== false).map((r) => r.lesson_id)),
    checkAttempts: new Map(data.filter((r) => r.passed === false).map((r) => [r.lesson_id, r.attempts ?? 1])),
  };
}

/** Lesson ids she has finished (see loadLessonProgress). */
export async function loadProgress(userId: string): Promise<Set<string>> {
  return (await loadLessonProgress(userId)).done;
}

/** Where she stands: the first lesson on the road she hasn't finished.
 *  Equal to `path.length` once the whole course is done. */
export function currentIndex(path: PathLesson[], done: ReadonlySet<string>): number {
  const i = path.findIndex((l) => !done.has(l.id));
  return i === -1 ? path.length : i;
}

// ---------------------------------------------------------------------------
// Sections, as the map shows them. The road is walked one section at a time,
// the way Duolingo does it: the path holds a single section, and the sections
// screen is where she sees the whole course and moves between them.
// ---------------------------------------------------------------------------

export type SectionState = 'done' | 'current' | 'locked';

export interface SectionSummary {
  section: Section;
  /** Its units that have lessons, in order. */
  units: Unit[];
  /** Index on the whole road of its first and last lessons. */
  firstIndex: number;
  lastIndex: number;
  lessons: number;
  /** Lessons of it she has finished. */
  done: number;
  state: SectionState;
}

/**
 * Whether a step is drawn done while she stands on `current`: anything behind
 * her, and any finished lesson ahead. Never her own step — the lesson she has
 * just finished is already among the done while the road still shows her on
 * it, until the move to the next one has played.
 */
export function stepDone(lesson: PathLesson, current: number, done: ReadonlySet<string> | undefined): boolean {
  return lesson.index !== current && (lesson.index < current || !!done?.has(lesson.id));
}

/** How many of these lessons she has finished. */
export function doneCount(lessons: readonly PathLesson[], done: ReadonlySet<string>): number {
  let n = 0;
  for (const l of lessons) if (done.has(l.id)) n++;
  return n;
}

/** Every section that has something to walk, with how far she is through it.
 *  `current` says which section she is in; `done` says how much of each is
 *  finished, which can include lessons past her step. */
export function sectionSummaries(course: Course, current: number, done: ReadonlySet<string>): SectionSummary[] {
  const out: SectionSummary[] = [];
  for (const section of course.sections) {
    const own = course.path.filter((l) => l.section.id === section.id);
    if (own.length === 0) continue;
    const firstIndex = own[0].index;
    const lastIndex = own[own.length - 1].index;
    out.push({
      section,
      units: course.units.filter((u) => u.section_id === section.id),
      firstIndex,
      lastIndex,
      lessons: own.length,
      done: doneCount(own, done),
      state: current > lastIndex ? 'done' : current >= firstIndex ? 'current' : 'locked',
    });
  }
  return out;
}

/** The section her step is in — the last one once the course is finished. */
export function sectionAt(course: Course, index: number): Section | null {
  const lesson = course.path[Math.min(index, course.path.length - 1)];
  return lesson?.section ?? null;
}
