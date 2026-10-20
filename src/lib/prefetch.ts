import { prefetchPackScores } from './argentine-scores';
import { arThemes } from './argentine';
import { preloadAudio } from './audio';
import { themeArt, themeObject } from './argentine-art';
import { currentIndex, loadCourse, loadProgress } from './course';
import { cultureSections, prefetchCultureDone } from './culture';
import { tileArt } from './culture-art';
import { recallPages } from './fetch-all';
import { scenarios } from './hablar';
import { freeChatArt, scenarioArt, tomasArt } from './hablar-art';
import { loadHablarHome } from './hablar-home';
import { learnerAsked, learnerComing } from './learner-ready';
import { lessonWithUnit, resolveSlots } from './lesson';
import { warmMeanings } from './meanings';
import { preloadImages } from './preload-images';
import { loadSentenceRowsInReach, warmShapes } from './sentences';
import { loadGlossTallies, loadLexicon, readLearnerAhead } from './session';
import { inSlices } from './slices';
import { supabase } from './supabase';
import type { LessonSlot } from './types';

// ---------------------------------------------------------------------------
// The other tabs, made ready while she is on Course.
//
// Once the launch splash has gone, Words, Culture and Speaking read what they
// open on — their data, and every picture on their first screen (their
// headers' streak is already shared, see streak-week.ts) — so each one
// opens whole instead of filling in circle by circle. It runs once per launch,
// after Course is standing, so it never competes with the screen she is
// actually looking at.
// ---------------------------------------------------------------------------

let started: string | null = null;

/**
 * Once per launch — or again, if a piece of it failed (no network at launch):
 * the next call, when she comes back to the app, tries the whole of it again.
 */
export function prefetchTabs(userId: string, limited: boolean) {
  if (started === userId) return;
  started = userId;
  const failed = () => {
    if (started === userId) started = null;
  };

  // Speaking's rows and Culture's tiles first — they are the most picture-heavy
  // first screens — then Words' themes.
  preloadImages([
    tomasArt,
    freeChatArt,
    ...scenarios.map((s) => scenarioArt(s.id)),
    ...cultureSections.map((s, i) => tileArt(s.slug, i)),
    ...arThemes.flatMap((t) => [themeObject(t.slug), themeArt(t.slug)]),
  ]);

  void loadHablarHome(userId, limited).catch(failed);
  void prefetchCultureDone().catch(failed);
  void prefetchPackScores().catch(failed);
  // The lexicon is what My words is built from; content-cache keeps it after.
  void loadLexicon().catch(failed);
  // How many pages her records took last time, so the first class of this
  // launch asks for them all at once (fetch-all.ts).
  recallPages([`form_states:${userId}`, `sentence_states:${userId}`]);
  // The class she is on: found, then read ahead — unless she has opened one
  // already, which has then done all of this for itself.
  const coming = warmSentences(userId).then((next) => {
    if (next && !learnerAsked()) void warmClass(userId, next).catch(() => {});
  });
  coming.catch(failed);
  learnerComing(coming);
}

/**
 * The sentences of every unit up to hers, onto the phone. A class needs all of
 * them (lesson.ts, loadLearner), and they are kept once fetched — but someone
 * who starts far along (placed there, a new phone, a publish that touched many
 * units) would otherwise wait for dozens of blocks on the class's loading
 * screen. Here they arrive while she is still looking at the road.
 */
async function warmSentences(userId: string) {
  const [course, done] = await Promise.all([loadCourse(), loadProgress(userId)]);
  const lesson = course.path[Math.min(currentIndex(course.path, done), course.path.length - 1)];
  if (!lesson) return null;
  const rows = await loadSentenceRowsInReach({ throughOrder: lesson.unit.course_order, units: course.units });
  return { lessonId: lesson.id, unit: lesson.unit, rows };
}

/**
 * The class she is on, got ready behind the road (docs/class-loading.md).
 *
 * The first class of a launch waited twice as long as the ones after it, for
 * things that are only slow once: every sentence in reach shaped for the first
 * time, the meanings' answers worked out for the first time, and the first
 * requests of a launch, which are slow whatever they ask. So all of it is done
 * here — the two long pieces of work a few milliseconds at a time, so a tap on
 * the road never waits on them — and her data is read and held for the class
 * to take (learner-ready.ts), rather than read here and again there.
 *
 * She may tap before it is done: the class then waits for this read instead of
 * starting its own beside it.
 */
async function warmClass(userId: string, next: NonNullable<Awaited<ReturnType<typeof warmSentences>>>) {
  const from = Date.now();
  const { lessonId, unit, rows } = next;
  const data = await readLearnerAhead(userId, { throughOrder: unit.course_order, unitIds: [unit.id] }, async () => {
    const [lexicon, tallies] = await Promise.all([loadLexicon(), loadGlossTallies().catch(() => null)]);
    await warmShapes(rows, lexicon, inSlices);
    if (tallies) await warmMeanings(lexicon, tallies, inSlices);
  });
  if (__DEV__) console.log(`[warm] class ready in ${Date.now() - from} ms`);

  // And the recording of its first screen, which the door waits on: the class
  // is built once here to learn which it is. A locked lesson has no slots to
  // read, and so nothing to fetch.
  const [{ lesson, tips, shaped }, { data: slots }] = await Promise.all([
    lessonWithUnit(lessonId),
    supabase.from('lesson_slots').select('*').eq('lesson_id', lessonId).order('ordinal', { ascending: true }),
  ]);
  if (lesson.kind === 'story' || !slots?.length) return;
  const { items } = resolveSlots(data, unit, slots as LessonSlot[], tips, false, new Date(), shaped);
  // The opening may fall another way when she gets there (which sentence
  // carries a new word is a draw among equals), so the second screen's too.
  for (const item of items.slice(0, 2)) {
    for (const form of item.group ?? [item.form]) void preloadAudio(form.audio_path);
    void preloadAudio(item.sentence?.audio_path);
  }
}
