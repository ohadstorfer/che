import { supabase } from './supabase';
import type { Lesson, Section, Tip, Unit } from './types';

// ---------------------------------------------------------------------------
// The curriculum, as the path draws it.
//
// The path is one ordered road of lessons: section by section, unit by unit,
// lesson by lesson. Where she stands on it is simply the first lesson she has
// no progress row for — only that one is tappable, so the road is walked in
// order and "lessons finished" and "index of the current step" are the same
// number.
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

export async function loadCourse(): Promise<Course> {
  const [{ data: sections }, { data: units }, { data: lessons }, { data: tips }] = await Promise.all([
    supabase.from('sections').select('*').eq('status', 'published').order('ordinal', { ascending: true }),
    supabase.from('units').select('*').eq('status', 'published').order('ordinal', { ascending: true }),
    supabase.from('lessons').select('*').eq('status', 'published').order('ordinal', { ascending: true }),
    supabase.from('tips').select('*').eq('status', 'published'),
  ]);
  return assemble(
    (sections ?? []) as Section[],
    (units ?? []) as Unit[],
    (lessons ?? []) as Lesson[],
    (tips ?? []) as Tip[],
  );
}

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

/** Lesson ids she has finished — for a unit check, passed (learning-engine-spec
 *  §3): a check finished below the pass score keeps the path waiting on it. */
export async function loadProgress(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('lesson_progress').select('lesson_id, passed').eq('user_id', userId);
  return new Set(
    ((data ?? []) as { lesson_id: string; passed?: boolean | null }[])
      .filter((r) => r.passed !== false)
      .map((r) => r.lesson_id),
  );
}

/** Attempts at lessons she has tried but not passed — the unit checks still
 *  waiting on her, by lesson id. */
export async function loadCheckAttempts(userId: string): Promise<Map<string, number>> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id, passed, attempts')
    .eq('user_id', userId);
  return new Map(
    ((data ?? []) as { lesson_id: string; passed?: boolean | null; attempts?: number }[])
      .filter((r) => r.passed === false)
      .map((r) => [r.lesson_id, r.attempts ?? 1]),
  );
}

/** Where she stands: the first lesson on the road she hasn't finished.
 *  Equal to `path.length` once the whole course is done. */
export function currentIndex(path: PathLesson[], done: Set<string>): number {
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

/** Every section that has something to walk, with how far she is through it. */
export function sectionSummaries(course: Course, current: number): SectionSummary[] {
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
      done: Math.max(0, Math.min(current, lastIndex + 1) - firstIndex),
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
