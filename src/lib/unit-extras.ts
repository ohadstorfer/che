import { type ArPack, type ArWord, arPacks } from './argentine';
import { findClass } from './culture';
import { localDateStr } from './dates';
import type { FinishResult } from './round';
import { supabase } from './supabase';
import plan from './unit-extras.json';

// ---------------------------------------------------------------------------
// A unit's three extra classes, as lessons on the road (kinds speak · slang ·
// culture; 20260930000001_unit_extras.sql):
//   speak    a chat with Pancho about the unit (hablar kind 'unit')
//   slang    three Argentine words, played like a Words pack
//   culture  a culture class, played like one from the Culture tab
// Which words and which class a unit plays is planned once, in course order,
// by scripts/course/unit-extras.mjs; this file only reads the plan.
// ---------------------------------------------------------------------------

interface UnitExtras {
  slang?: string[];
  culture?: { section: string; class: string };
}

const units = (plan as { units: Record<string, UnitExtras> }).units;

const wordById = new Map<string, { word: ArWord; pack: ArPack }>(
  arPacks.flatMap((pack) => pack.words.map((word) => [word.id, { word, pack }] as const)),
);

/** A unit's slang class: its three words, and the packs they come from (for wrong answers). */
export function unitSlang(unitSlug: string): { words: ArWord[]; packs: ArPack[] } | null {
  const ids = units[unitSlug]?.slang;
  if (!ids?.length) return null;
  const found = ids.flatMap((id) => (wordById.has(id) ? [wordById.get(id)!] : []));
  if (!found.length) return null;
  return { words: found.map((f) => f.word), packs: [...new Set(found.map((f) => f.pack))] };
}

/** A unit's culture class, if it still has one. */
export function unitCulture(unitSlug: string) {
  const at = units[unitSlug]?.culture;
  return at ? findClass(at.section, at.class) : null;
}

/** Finishes a lesson on the road that isn't a round of the course's exercises. */
export async function finishPathLesson(lessonId: string, score: number | null): Promise<FinishResult | null> {
  const { data, error } = await supabase.rpc('finish_lesson', {
    p_local_date: localDateStr(),
    p_lesson_id: lessonId,
    p_score: score,
  });
  if (error) console.warn('finish_lesson failed', error);
  return ((data as FinishResult[] | null)?.[0] ?? null) as FinishResult | null;
}
