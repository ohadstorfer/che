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
  /** Position on the whole road, 0-based. */
  index: number;
  /** Which unit of the road this lesson is in, 0-based — the banner count above it. */
  unitIndex: number;
  /** First lesson of its unit: the unit's banner is drawn just above it. */
  opensUnit: boolean;
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

  const path: PathLesson[] = [];
  const visibleUnits: Unit[] = [];
  for (const unit of orderedUnits) {
    const own = (lessonsByUnit.get(unit.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
    // A unit with no published lessons has nothing to walk; leave it off the road.
    if (own.length === 0) continue;
    const unitIndex = visibleUnits.length;
    visibleUnits.push(unit);
    own.forEach((lesson, k) =>
      path.push({ ...lesson, unit, index: path.length, unitIndex, opensUnit: k === 0 }),
    );
  }

  const tipsByUnit = new Map<string, Tip[]>();
  for (const t of tips) {
    if (!tipsByUnit.has(t.unit_id)) tipsByUnit.set(t.unit_id, []);
    tipsByUnit.get(t.unit_id)!.push(t);
  }

  return { sections, units: visibleUnits, path, tipsByUnit };
}

/** Lesson ids she has finished. */
export async function loadProgress(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId);
  return new Set((data ?? []).map((r: { lesson_id: string }) => r.lesson_id));
}

/** Where she stands: the first lesson on the road she hasn't finished.
 *  Equal to `path.length` once the whole course is done. */
export function currentIndex(path: PathLesson[], done: Set<string>): number {
  const i = path.findIndex((l) => !done.has(l.id));
  return i === -1 ? path.length : i;
}
