import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClassDoor, ClassWait, SLOW_MS } from '@/components/class-door';
import { POSE } from '@/components/mascot';
import { PageColorContext } from '@/components/exercise-frame';
import { Exercise } from '@/components/exercises';
import { type Cheer, cheerFor, CheerUpContext, LessonCheer, makeCheer } from '@/components/lesson-cheer';
import { StreakAlmost } from '@/components/streak-almost';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button, Panel } from '@/components/ui';
import type { RoundStatsData } from '@/components/round-stats';
import { PerfectLesson } from '@/components/perfect-lesson';
import { LessonEnd } from '@/components/unit-progress';
import { type AnswerActions, AnswerActionsContext } from '@/components/wrong-answer-actions';
import { answerWords, shownMeaning } from '@/lib/answers';
import { holdAudio, preloadAudio, releaseAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { conceptsOf } from '@/lib/concepts';
import { currentIndex, loadCourse, loadProgress } from '@/lib/course';
import { LessonLockedError, buildLesson } from '@/lib/lesson';
import { timed, timingEnd, timingStart } from '@/lib/load-timing';
import { markLessonFinished } from '@/lib/just-finished';
import { backToCourse, goBack } from '@/lib/nav';
import { maybeAskForReview } from '@/lib/review-prompt';
import { type Landed, send, wakeOutbox, within } from '@/lib/outbox';
import { success } from '@/lib/haptics';
import { warmSfx } from '@/lib/sfx';
import { DEFAULT_LADDER, type Ladder } from '@/lib/sentences';
import { loadAnswers } from '@/lib/onboarding';
import {
  PLACEMENT_MAX_ITEMS,
  type PlacementSession,
  type TestMode,
  type TestOutcome,
  type WalkResults,
  beginPlacement,
  buildTest,
  nextStage,
  placementOutcome,
  placementStage,
  stagePassed,
  testOutcome,
} from '@/lib/placement';
import {
  type AnswerExtra,
  type FinishResult,
  type QueueItem,
  type RoundKind,
  formsOf,
  roundKey,
  useRound,
  withIntros,
} from '@/lib/round';
import { type SessionData, buildFreeSession, buildMistakesSession, buildSession, buildWordsSession } from '@/lib/session';
import { lapsedRun, streakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, gradients, press, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Form, Section, Sentence, Streak, Unit } from '@/lib/types';
import { preloadCourseArt } from '@/lib/word-art';

/** How long a class may take to load before it is called off. A class far
 *  along with nothing on the phone yet is dozens of sentence blocks; what has
 *  arrived by then is kept, so trying again picks up where this left off. */
const LOAD_TIMEOUT_MS = 20_000;
/** How long the gate's answer is waited for. A streak that can't be read is
 *  not a reason to keep her from the class. */
const GATE_TIMEOUT_MS = 4000;
/** How long a passed test's placement is waited for before she is told it
 *  isn't saved yet. */
const PLACE_WAIT_MS = 15_000;

/** What stops her at the door: a frozen run, a comeback one round in, or a run lost yesterday. */
type Gate = { kind: 'frozen' | 'oneMore' | 'lapsed'; lost: number };
const gateTitle = (g: Gate) =>
  g.kind === 'frozen' ? 'Your mate went cold' : g.kind === 'oneMore' ? 'One more to go!' : `Your ${g.lost} day streak ended`;
/** Once Pancho has come out to say the class is on its way, he stays this
 *  long: a figure that pops in and is gone in the same breath reads as a
 *  glitch, where the empty frame before him reads as nothing at all. */
const WAIT_SHOWN_MS = 400;

/** Score a unit check needs (learning-engine-spec §3). Mirrors finish_lesson. */
const UNIT_PASS_SCORE = 80;
const UNIT_MAX_ATTEMPTS = 3;

interface TestPlan {
  mode: TestMode;
  units: Unit[];
  /** course_order she lands on if the test lets her through. */
  targetOrder: number;
  target: Unit | null;
  /** Placement: the course's sections, to name where she landed. */
  sections?: Section[];
  /** Placement: the walk ended because the next section couldn't be loaded. */
  cutShort?: boolean;
}

// The press scale eases on the web; on the phones it follows the finger.
const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

/** The onboarding placement as it walks the course (placement.ts). */
interface Walk {
  session: PlacementSession;
  results: WalkResults;
  /** Index of the section being asked. */
  stage: number;
  cutShort: boolean;
}

/** A placement opened by someone who has finished a lesson: it sends her home. */
class PlacementClosedError extends Error {}

export default function Practice() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  const { profile, session: authSession } = useAuth();
  // What this round is:
  //   ?lesson=<id>            a lesson off the path (a unit check when it is
  //                           the unit's review lesson)
  //   ?mode=mistakes          the words she has missed lately
  //   ?mode=words             the Words tab's round: her weakest words
  //   ?mode=concept&concept=  free practice of one grammar concept
  //   ?test=placement         the onboarding placement test
  //   ?test=jump&to=<unit>    a jump-ahead test to a later unit
  //   (nothing)               a practice round — everything due
  // `again=1` marks a round entered straight from a finish screen, which just
  // said everything the frozen-streak gate would say.
  const params = useLocalSearchParams<{
    lesson?: string;
    again?: string;
    mode?: string;
    concept?: string;
    preview?: string;
    test?: string;
    to?: string;
  }>();
  const lessonId = params.lesson;
  const isAgain = params.again === '1';
  // The dashboard's preview: the lesson as a reviewer approves it, review slots
  // as placeholders, and nothing recorded.
  const preview = params.preview === '1';
  const testMode: TestMode | null = params.test === 'placement' || params.test === 'jump' ? params.test : null;

  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  // The round knows which words it teaches: load their pictures now, so each
  // arrives with its card instead of a frame after it.
  useEffect(() => {
    if (!queue) return;
    preloadCourseArt(
      queue.flatMap((it) => [it.introduces?.lemma_id, it.isIntro ? it.form.lemma_id : undefined]).filter((id) => id != null),
    );
  }, [queue]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [lexicon, setLexicon] = useState<Map<string, Form>>(() => new Map());
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [ladder, setLadder] = useState<Ladder>(DEFAULT_LADDER);
  const [index, setIndex] = useState(0);
  const [kind, setKind] = useState<RoundKind>('practice');
  const [plan, setPlan] = useState<TestPlan | null>(null);
  const [finished, setFinished] = useState<{
    streak: number;
    previous: number;
    /** Set mid-comeback: the banked run one more class would recover. */
    oneMore?: number;
    /** How the round went, for the end screen's tiles. */
    stats: RoundStatsData;
  } | null>(null);
  /** A unit check she didn't pass yet, or a test's outcome — said before the
   *  usual finish screens. Cleared once she has read it. */
  const [verdict, setVerdict] = useState<
    | { kind: 'check'; score: number; attempts: number; missed: Form[] }
    | { kind: 'test'; outcome: TestOutcome; plan: TestPlan }
    | null
  >(null);
  /** Set by Keep going on the finish screen, when there is a streak to show. */
  const [celebrating, setCelebrating] = useState(false);
  /** A round with no misses opens its end on PerfectLesson; set once she has gone past it. */
  const [perfectSeen, setPerfectSeen] = useState(false);
  /** A frozen streak stops her at the door: what she lost, and the way back.
   *  `undefined` while the answer is in flight — the doorway holds still until
   *  it lands, so the loading clip can't flash in front of the gate. */
  const [gate, setGate] = useState<Gate | null | undefined>(undefined);

  // Depend on the id, not on the profile object: every auth event hands back a
  // freshly-fetched profile, and rebuilding the queue underneath her
  // mid-session would swap out the exercise she is answering.
  const userId = profile?.id;
  const round = useRound(userId);
  const finishing = useRef(false);
  /** This round was a unit check she passed: the moment to ask for a review. */
  const passedCheck = useRef(false);
  /** A passed test's placement, once sent: asking again waits for the same write. */
  const placeSent = useRef<Promise<Landed> | null>(null);
  /** The placement walk: which sections she has passed, and the one on screen. */
  const walk = useRef<Walk | null>(null);
  /** The next section of a placement is on its way. */
  const [staging, setStaging] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  /** The round is over but couldn't be saved yet: 'saving' while she asks again. */
  const [unsaved, setUnsaved] = useState<'failed' | 'saving' | null>(null);
  /** Counts her tries at a class that wouldn't load; a new one loads again. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    finishing.current = false;
    placeSent.current = null;
    walk.current = null;

    const load = async (): Promise<{ data: SessionData; kind: RoundKind; plan?: TestPlan; walk?: Walk }> => {
      if (testMode) {
        const [course, done] = await Promise.all([loadCourse(), loadProgress(userId)]);
        const units = course.units;
        if (testMode === 'placement') {
          // Only before her first lesson: once she is on the road, a jump test
          // from where she stands is the way ahead.
          if (done.size > 0) throw new PlacementClosedError();
          // Starts at the level she gave in onboarding, and fetches a section's
          // sentences only when the walk gets to it.
          const answers = await loadAnswers();
          const session = await beginPlacement(userId, course, answers?.level);
          const first = await placementStage(session, session.start);
          const opening: Walk = { session, results: new Map(), stage: session.start, cutShort: false };
          return {
            data: {
              items: first.items,
              allForms: first.allForms,
              lexicon: session.data.formById,
              sentences: first.sentences,
              scheduledFormIds: [],
            },
            kind: 'placement',
            plan: { mode: testMode, units, targetOrder: 0, target: null, sections: course.sections },
            walk: opening,
          };
        }
        const target = units.find((u) => u.id === params.to) ?? null;
        const here = course.path[currentIndex(course.path, done)]?.unit;
        const span: Unit[] =
          target && here
            ? units.filter((u) => u.course_order >= here.course_order && u.course_order < target.course_order)
            : [];
        const targetOrder = target?.course_order ?? (span.at(-1)?.course_order ?? 0) + 1;
        const data = await buildTest(userId, span);
        return { data, kind: 'placement', plan: { mode: testMode, units: span, targetOrder, target } };
      }
      if (lessonId) {
        const data = await buildLesson(userId, lessonId, { canonical: preview });
        if (data.lesson.kind === 'story') {
          router.replace(`/story?lesson=${lessonId}`);
          return { data: { ...data, items: [] }, kind: 'story' };
        }
        const check = data.lesson.kind === 'review' || data.lesson.kind === 'checkpoint';
        return { data, kind: check ? 'unit_check' : 'lesson' };
      }
      if (params.mode === 'mistakes') return { data: await buildMistakesSession(userId), kind: 'mistakes' };
      // Scheduled like any practice round: the Words tab's drills count.
      if (params.mode === 'words') return { data: await buildWordsSession(userId), kind: 'practice' };
      if (params.mode === 'concept' && params.concept) {
        // Practice of one grammar concept: free practice, so SM-2 is left alone.
        const concept = params.concept;
        const free = await buildFreeSession(userId, 8, (f) => conceptsOf(f).includes(concept));
        return { data: { ...free, items: free.items.map((it) => ({ ...it, filler: true })) }, kind: 'free' };
      }
      // A practice round on a day where nothing happens to fall due still has a
      // day to earn, so it falls back to words she has met — as filler, so the
      // day is credited but SM-2 is left alone.
      const due = await buildSession(userId);
      if (due.items.length > 0) return { data: due, kind: 'practice' };
      const free = await buildFreeSession(userId);
      return { data: { ...free, items: free.items.map((it) => ({ ...it, filler: true })) }, kind: 'free' };
    };

    timingStart('class');
    // A load that never answers is a load that failed: she is told, and can
    // try again, rather than left looking at the doorway.
    const calledOff = setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      console.warn('lesson took too long to load');
      setLoadFailed(true);
      setQueue([]);
    }, LOAD_TIMEOUT_MS);
    timed('build', load()).then(({ data, kind: k, plan: p, walk: w }) => {
      clearTimeout(calledOff);
      if (cancelled) return;
      walk.current = w ?? null;
      const q = withIntros(data.items);
      round.begin({
        kind: k,
        lessonId: lessonId ?? null,
        queue: q,
        scheduledFormIds: data.scheduledFormIds,
        sentences: data.sentences,
        ladder: data.ladder,
        retries: k !== 'placement',
        deckSize: data.allForms.length,
        dryRun: preview,
      });
      setKind(k);
      setPlan(p ?? null);
      setQueue(q);
      setAllForms(data.allForms);
      setLexicon(data.lexicon);
      setAllSentences(data.sentences);
      setLadder(data.ladder ?? DEFAULT_LADDER);
    }).catch((e) => {
      clearTimeout(calledOff);
      if (cancelled) return;
      if (e instanceof LessonLockedError) router.replace('/paywall?from=lesson');
      else if (e instanceof PlacementClosedError) router.replace('/home');
      else {
        console.warn('lesson failed to load', e);
        // Whatever it was, it says so rather than spinning for good.
        setLoadFailed(true);
        setQueue([]);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(calledOff);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId, testMode, params.to, params.mode, params.concept, isAgain, attempt]);

  // The answer sounds are loaded with the class, so the first one isn't late.
  useEffect(() => warmSfx(), []);

  const tryAgain = () => {
    setLoadFailed(false);
    setQueue(null);
    setAttempt((n) => n + 1);
  };

  // Replacing the route with new params remounts the screen, which resets state
  // on its own; this is the belt-and-braces for when the screen is reused.
  useEffect(() => {
    setFinished(null);
    setVerdict(null);
    setCelebrating(false);
    setPerfectSeen(false);
    // A new round counts its runs from nothing (the screen may be reused).
    inRow.current = { run: 0, comeback: false, lastAt: -10, shown: 0 };
    setCheer(null);
    releaseAudio(false);
    setIndex(0);
    setQueue(null);
    setStaging(false);
    setLoadFailed(false);
    setUnsaved(null);
  }, [lessonId, isAgain, testMode, params.mode]);

  // The gate is read once, on the way in.
  useEffect(() => {
    if (!userId) return;
    if (isAgain || preview) {
      setGate(null);
      return;
    }
    // Answered once: by the streak, or by the clock if it doesn't come — a
    // gate that turned up after the class had started would land on top of it.
    let answered = false;
    const answer = (next: Gate | null) => {
      if (answered) return;
      answered = true;
      clearTimeout(giveUp);
      setGate(next);
    };
    const giveUp = setTimeout(() => answer(null), GATE_TIMEOUT_MS);
    timed('gate', Promise.resolve(supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle())).then(
      ({ data }) => {
        const row = (data as Streak) ?? null;
        const st = streakStatus(row);
        if (st.kind === 'frozen') return answer({ kind: 'frozen', lost: st.lost });
        if (st.kind === 'recovering') return answer({ kind: 'oneMore', lost: st.lost });
        // A run lost yesterday is said once, on the first round after it.
        const lapsed = lapsedRun(row);
        if (lapsed == null) return answer(null);
        const key = `streak-lapsed-told:${row?.last_practice_date}`;
        AsyncStorage.getItem(key)
          .then((told) => {
            if (told) return answer(null);
            answer({ kind: 'lapsed', lost: lapsed });
            AsyncStorage.setItem(key, '1').catch(() => {});
          })
          .catch(() => answer(null));
      },
      () => answer(null),
    );
    return () => {
      answered = true;
      clearTimeout(giveUp);
    };
  }, [userId, isAgain, preview]);

  const current = queue?.[index] ?? null;

  // The doorway waits on one thing besides the exercises: the recording of the
  // very first screen, and never for long. A first screen with nothing to play
  // (a tip) opens at once. Measured: holding the door for a clip two screens
  // away, fetched alongside the rest of the lesson's, was most of the wait.
  const [firstReady, setFirstReady] = useState(false);
  const firstClip = useMemo(() => {
    const first = queue?.[0];
    if (!first) return null;
    return formsOf(first).find((form) => form.audio_path)?.audio_path ?? first.sentence?.audio_path ?? null;
  }, [queue]);
  const warmedFirst = useRef(false);
  useEffect(() => {
    if (!firstClip || warmedFirst.current) return;
    warmedFirst.current = true;
    const open = () => setFirstReady(true);
    void timed('first clip', preloadAudio(firstClip)).then(open);
    const giveUp = setTimeout(open, 900);
    return () => clearTimeout(giveUp);
  }, [firstClip]);
  /** The first screen has what it needs; the rest may load behind it. */
  const doorOpen = !!queue && (!firstClip || firstReady);
  useEffect(() => {
    if (doorOpen && gate !== undefined) timingEnd();
  }, [doorOpen, gate]);

  // The doorway stands while anything it waits on is out — and, if that came
  // back just after Pancho did, a moment more (WAIT_SHOWN_MS).
  const waiting = gate === undefined || (!gate && !doorOpen);
  const waitingSince = useRef<number | null>(null);
  const [lingering, setLingering] = useState(false);
  useEffect(() => {
    if (waiting) {
      waitingSince.current ??= Date.now();
      return;
    }
    const since = waitingSince.current;
    waitingSince.current = null;
    if (since == null) return;
    const waited = Date.now() - since;
    const owed = SLOW_MS + WAIT_SHOWN_MS - waited;
    if (waited < SLOW_MS || owed <= 0) return;
    setLingering(true);
    const done = setTimeout(() => setLingering(false), owed);
    return () => clearTimeout(done);
  }, [waiting]);

  // The clips for the exercise she is on and the two after it are fetched
  // ahead of the press, so by the time she taps the speaker there is nothing
  // left to load. Until the door is open only her own screen's are asked for,
  // so the first clip doesn't share the line with the ones behind it.
  useEffect(() => {
    if (!queue) return;
    for (const item of queue.slice(index, index + (doorOpen ? 3 : 1))) {
      for (const form of formsOf(item)) preloadAudio(form.audio_path);
      if (item.sentence?.audio_path) preloadAudio(item.sentence.audio_path);
    }
  }, [queue, index, doorOpen]);

  // Then the rest of the lesson, behind those, once.
  const warmed = useRef(false);
  useEffect(() => {
    if (!queue || !doorOpen || warmed.current) return;
    warmed.current = true;
    for (const item of queue) for (const form of formsOf(item)) void preloadAudio(form.audio_path);
  }, [queue, doorOpen]);

  // Latency is measured from the moment an exercise is on screen.
  useEffect(() => {
    round.shown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, queue, firstReady]);

  const finish = async () => {
    if (!profile || finishing.current) return;
    finishing.current = true;
    if (preview) return goBack('/admin');

    let result: FinishResult | null;
    if (plan) {
      const w = walk.current;
      const outcome = w
        ? placementOutcome(
            w.session.sections.map((s) => s.units),
            w.results,
            round.testAnswers.current,
          )
        : testOutcome(plan.mode, round.testAnswers.current, plan.units, plan.targetOrder);
      if (outcome.passed) {
        // Kept and sent again like the round's end (outbox.ts): a placement
        // the server never got must not be shown as done.
        placeSent.current ??= send(
          {
            kind: 'rpc',
            fn: 'apply_placement',
            args: {
              p_round_id: round.roundId.current,
              p_through_order: outcome.throughOrder,
              p_passed_form_ids: outcome.passedFormIds,
              p_failed_form_ids: outcome.failedFormIds,
            },
          },
          { needs: [roundKey(round.roundId.current)] },
        );
        wakeOutbox();
        const placed = await within(placeSent.current, PLACE_WAIT_MS);
        if (!placed) return notSaved();
        // Refused outright (and logged): the round still ends, as it always did.
        if (!placed.ok) placeSent.current = null;
      }
      const ended = await round.finish();
      if (!ended.saved) return notSaved();
      result = ended.result;
      setVerdict({ kind: 'test', outcome, plan: { ...plan, cutShort: w?.cutShort } });
    } else {
      const ended = await round.finish();
      if (!ended.saved) return notSaved();
      result = ended.result;
      passedCheck.current = kind === 'unit_check' && !!result?.passed;
      // Saved, so the road can count it before it reads her progress again.
      if (lessonId && !preview && (kind === 'lesson' || passedCheck.current)) markLessonFinished(lessonId);
      if (kind === 'unit_check' && result && !result.passed) {
        setVerdict({
          kind: 'check',
          score: round.score() ?? 0,
          attempts: result.attempts ?? 1,
          missed: [...round.missedForms.current.values()],
        });
      }
    }
    setUnsaved(null);
    setFinished({
      streak: result?.current_streak ?? 0,
      previous: result?.previous_streak ?? 0,
      oneMore: result && result.recoverable_streak > 0 ? result.recoverable_streak : undefined,
      stats: {
        accuracy: round.score(),
        seconds: round.elapsed(),
        words: round.wordsAsked(),
        newWords: new Set(queue?.filter((it) => it.isIntro || it.introduces).map((it) => (it.introduces ?? it.form).id)).size,
      },
    });
  };

  // Not the end screen: that would say the lesson counted when it hasn't yet.
  // The round stays on the phone and goes up by itself once it can (outbox.ts).
  const notSaved = () => {
    setUnsaved('failed');
  };

  /** Asks again. The round's end is the same write, so it never counts twice;
   *  a passed test's placement is asked for again too (it is safe to repeat). */
  const saveAgain = () => {
    if (unsaved !== 'failed') return;
    setUnsaved('saving');
    finishing.current = false;
    void finish();
  };

  /** Home from the end screens; after a passed unit check, the store's review sheet may follow. */
  const doneToCourse = () => {
    if (passedCheck.current) void maybeAskForReview(authSession?.user.created_at);
    backToCourse();
  };

  const advance = (nextQueue: QueueItem[]) => {
    if (index + 1 < nextQueue.length) {
      setQueue(nextQueue);
      setIndex(index + 1);
    } else {
      void finish();
    }
  };

  const onIntroDone = async (item: QueueItem) => {
    if (!queue) return;
    await round.createState(item.form);
    advance(queue);
  };

  // Answers in a row, for the mid-lesson cheers. Tips and intros aren't
  // answers, so they neither count nor break a run. Tests and the unit check
  // stay quiet: those are measuring her, not coaching her.
  const inRow = useRef({ run: 0, comeback: false, lastAt: -10, shown: 0 });
  const [cheer, setCheer] = useState<Cheer | null>(null);
  /** The next exercise goes up behind a cheer at once, so the old one is never
   *  seen again as the cheer leaves; its clip is held until the cheer has gone
   *  (audio.ts). */
  const clearCheer = useCallback(() => {
    setCheer(null);
    releaseAudio();
  }, []);
  // Leaving mid-cheer drops the held clip rather than playing it over whatever comes next.
  useEffect(() => () => releaseAudio(false), []);
  /** Counts the answer; true when it earned a cheer. */
  const countAnswer = (item: QueueItem, right: boolean, next: QueueItem[]) => {
    if (item.mode === 'tip' || item.mode === 'sentence_intro' || plan || kind === 'placement' || kind === 'unit_check') return false;
    const r = inRow.current;
    if (!right) {
      r.run = 0;
      r.comeback = true;
      return false;
    }
    r.run += 1;
    const pick = cheerFor(r.run, r.comeback);
    // Never on the last question (the end screen has that moment), and at
    // most one every 3 questions.
    if (!pick || index + 1 >= next.length || index - r.lastAt < 3) return false;
    r.lastAt = index;
    r.shown += 1;
    if (pick === 'back') r.comeback = false;
    success();
    setCheer(makeCheer(pick, r.run));
    return true;
  };

  const onAnswered = async (item: QueueItem, wrongFormIds: string[], extra?: AnswerExtra) => {
    if (!queue) return;
    const next = await round.answer(item, index, queue, wrongFormIds, extra);
    const cheered = countAnswer(item, wrongFormIds.length === 0, next);
    // A placement asks a section at a time: at the end of one, the walk
    // decides whether there is another to ask.
    if (walk.current && index + 1 >= next.length) return void nextSection(walk.current, next);
    if (cheered) holdAudio();
    advance(next);
  };

  const stagingNow = useRef(false);
  const nextSection = async (w: Walk, asked: QueueItem[]) => {
    if (stagingNow.current || finishing.current) return;
    const own = new Set(w.session.sections[w.stage]?.units.map((u) => u.id));
    const answers = round.testAnswers.current;
    w.results.set(
      w.stage,
      stagePassed(
        answers.filter((a) => own.has(a.unitId)).map((a) => a.credit),
        answers.map((a) => a.credit),
        w.results,
      ),
    );
    const to = nextStage(w.session.sections.length, w.session.start, w.results);
    if (to == null) return void finish();
    stagingNow.current = true;
    setStaging(true);
    try {
      const stage = await placementStage(w.session, to);
      // A section with nothing to ask ends the walk where it stands.
      if (stage.items.length === 0) return void finish();
      const items = withIntros(stage.items);
      round.extend(items);
      w.stage = to;
      setAllForms(stage.allForms);
      setAllSentences(stage.sentences);
      setQueue([...asked, ...items]);
      setIndex(asked.length);
    } catch (e) {
      console.warn('placement section failed to load', e);
      w.cutShort = true;
      void finish();
    } finally {
      stagingNow.current = false;
      setStaging(false);
    }
  };

  /** Stop here: she is placed with the sections she has passed so far. */
  const stopPlacement = () => {
    if (stagingNow.current) return;
    void finish();
  };

  // -------------------------------------------------------------------------
  // Staff: answer the exercise on screen without answering it. Two buttons —
  // right and wrong — each grade the item the way the exercise itself would
  // (nothing is invented; a wrong press simply marks every form the item
  // drills as missed) and move on. It is how a reviewer walks a lesson end to
  // end, and how a wrong-answer path gets looked at without having to think of
  // a wrong answer. Only staff ever see it.
  // -------------------------------------------------------------------------
  const simulating = useRef(false);
  const simulate = async (correct: boolean) => {
    const item = queue?.[index];
    if (!item || simulating.current) return;
    simulating.current = true;
    try {
      if (item.isIntro) await onIntroDone(item);
      else await onAnswered(item, correct ? [] : formsOf(item).map((f) => f.id));
    } finally {
      simulating.current = false;
    }
  };

  const actions = useMemo<AnswerActions | null>(
    () =>
      userId
        ? {
            report: async (item, answer) => {
              await supabase.from('answer_reports').insert({
                user_id: userId,
                round_id: round.roundId.current || null,
                sentence_id: item.sentence?.id ?? null,
                form_id: item.sentence ? null : item.form.id,
                mode: item.mode,
                answer,
                answer_key: answerWords(answer).join(' '),
              });
            },
            explain: async (item, answer) => {
              const { data, error } = await supabase.functions.invoke('explain-answer', {
                body: {
                  sentence_id: item.sentence?.id ?? null,
                  form_id: item.sentence ? null : item.form.id,
                  mode: item.mode,
                  answer,
                },
              });
              if (error) return null;
              return (data as { explanation?: string } | null)?.explanation ?? null;
            },
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  );

  // Leaving mid-class loses it, so after the first answer the close button
  // asks first — and so does Android's back button, which would otherwise
  // drop her out without a word. (iOS's swipe back is off on this screen.)
  const [quitting, setQuitting] = useState(false);
  const midClass = !!queue && queue.length > 0 && !finished && !unsaved && !loadFailed && gate === null;
  const close = () => {
    if (midClass && index > 0) setQuitting(true);
    else goBack('/home');
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const quittingRef = useRef(quitting);
  quittingRef.current = quitting;
  useEffect(() => {
    if (Platform.OS !== 'android' || !midClass) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // With the sheet up, back is "Keep going" — what a sheet's back always is.
      if (quittingRef.current) setQuitting(false);
      else closeRef.current();
      return true;
    });
    return () => sub.remove();
  }, [midClass]);

  if (!profile) return null;

  if (finished && verdict) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          {verdict.kind === 'check' ? (
            <CheckNotYet
              score={verdict.score}
              attempts={verdict.attempts}
              missed={verdict.missed}
              onRetry={() => router.replace(`/practice?lesson=${lessonId}&again=1`)}
              onLater={() => setVerdict(null)}
            />
          ) : (
            <TestResult outcome={verdict.outcome} plan={verdict.plan} onDone={() => setVerdict(null)} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    // Every finished round ends on the same clip. One that actually moved the
    // streak then hands over to the full celebration; any other just goes home.
    const celebrate =
      finished.oneMore != null || (finished.streak > 0 && finished.streak !== finished.previous);
    if (finished.stats.accuracy === 100 && !perfectSeen && !plan && kind !== 'placement') {
      return <PerfectLesson onNext={() => setPerfectSeen(true)} />;
    }
    if (celebrating) {
      if (finished.oneMore != null) {
        return (
          <StreakAlmost
            lost={finished.oneMore}
            moreLabel="One more lesson"
            onMore={() => router.replace('/practice?again=1')}
            onHome={backToCourse}
          />
        );
      }
      return (
        <SafeAreaView style={styles.safe}>
          <StreakCelebration
            previous={finished.previous}
            streak={finished.streak}
            onDone={doneToCourse}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <LessonEnd
          lessonId={preview ? null : lessonId}
          streak={finished.streak}
          celebrate={celebrate}
          stats={finished.stats}
          onNext={() => (celebrate ? setCelebrating(true) : doneToCourse())}
        />
      </SafeAreaView>
    );
  }

  if (unsaved) {
    const test = !!plan || kind === 'placement';
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.doneWrap}>
          <Image source={POSE.sip} style={styles.failedFigure} contentFit="contain" accessible={false} />
          <Text style={styles.doneTitle}>{test ? "Couldn't save your test" : "Couldn't save your lesson"}</Text>
          <Text style={styles.doneHint}>
            Check your connection and try again. It's kept on this phone and will save once you're back online.
          </Text>
          <Button title="Try again" loading={unsaved === 'saving'} onPress={saveAgain} />
          <Button title="Back home" variant="ghost" onPress={backToCourse} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  const doorLine = testMode ? 'Getting your test ready…' : undefined;
  if (gate === undefined || lingering) {
    return <ClassDoor onClose={() => goBack('/home')} line={doorLine} />;
  }
  if (gate) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack('/home')} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>
        <View style={styles.doneWrap}>
          <View style={styles.gatePanel}>
            <Text style={styles.gateTitle}>{gateTitle(gate)}</Text>
            <Image
              source={require('@/assets/images/mate-frozen-figure.png')}
              style={styles.gateClip}
              contentFit="contain"
              accessible={false}
            />
            {gate.kind === 'frozen' ? <Text style={styles.gateSub}>Your {gate.lost} day streak is on ice</Text> : null}
            <Text style={styles.gateBody}>
              {gate.kind === 'oneMore'
                ? `One more lesson today and your ${gate.lost} day streak is back.`
                : gate.kind === 'lapsed'
                  ? `It needed two lessons on the same day. You're on a new streak now: this lesson makes it 2 days.`
                  : 'Finish two lessons today to get it back.'}
            </Text>
            <Button title="Let's go" onPress={() => setGate(null)} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!queue || (queue.length > 0 && !!firstClip && !firstReady)) {
    return <ClassDoor onClose={() => goBack('/home')} line={doorLine} />;
  }

  if (loadFailed) {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.doneWrap}>
          <Image source={POSE.sip} style={styles.failedFigure} contentFit="contain" accessible={false} />
          <Text style={styles.doneTitle}>{plan || testMode ? "Couldn't load the test" : "Couldn't load your class"}</Text>
          <Text style={styles.doneHint}>Check your connection and try again.</Text>
          <Button title="Try again" onPress={tryAgain} />
          <Button title="Back home" variant="ghost" onPress={backToCourse} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>😌</Text>
          <Text style={styles.doneTitle}>
            {kind === 'mistakes'
              ? 'No mistakes to go over'
              : plan
                ? 'Nothing to test here yet'
                : 'Nothing to practise right now'}
          </Text>
          <Text style={styles.doneHint}>Take a lesson on the path and come back.</Text>
          <Button title="Back home" onPress={backToCourse} />
        </View>
      </SafeAreaView>
    );
  }

  // A placement has no set length: its bar runs towards the most it ever asks,
  // and the line under it says which section she is being asked about.
  const placing = walk.current;
  const progress = placing ? Math.min(index / PLACEMENT_MAX_ITEMS, 1) : index / queue.length;
  const title =
    kind === 'unit_check'
      ? 'Unit check'
      : kind === 'placement'
        ? plan?.mode === 'jump'
          ? 'Jump ahead'
          : placing
            ? `Placement · Section ${placing.stage + 1} of ${placing.session.sections.length}`
            : 'Placement'
        : kind === 'mistakes'
          ? 'Mistakes'
          : params.mode === 'words'
            ? 'Word practice'
            : null;

  return (
    // The bottom edge is left to the exercise frame: its docked bar and its
    // result panel are meant to sit against it, not float above it.
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <ProgressBar progress={progress} />
        {placing ? (
          <Pressable
            onPress={stopPlacement}
            disabled={staging}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Stop the test and start where you have got to"
            style={({ pressed }) => [styles.stop, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
            <Text style={styles.stopText}>Stop here</Text>
          </Pressable>
        ) : (
          <Text style={styles.counter}>
            {index + 1}/{queue.length}
          </Text>
        )}
      </View>
      {title ? <Text style={styles.kicker}>{title}</Text> : null}
      {profile.role !== 'student' ? <SimulateBar onSimulate={(c) => void simulate(c)} /> : null}

      {staging ? <ClassWait line="Getting the next part ready…" /> : null}
      {current && !staging && (
        // Fades in once, as the class takes over from its empty frame; the
        // exercises after the first change inside it.
        <Animated.View entering={FadeIn.duration(200)} style={styles.stage}>
          {/* This page is flat oat, so an exercise too tall for it can fade into it. */}
          <PageColorContext.Provider value={colors.bg}>
            <AnswerActionsContext.Provider value={kind === 'placement' ? null : actions}>
            <CheerUpContext.Provider value={cheer !== null}>
              {/* Each exercise slides in from where the class is heading, so a
                  new question reads as the next one rather than the screen
                  blinking. The first rides the stage's own fade instead. */}
              <Animated.View
                key={`${current.form.id}-${index}`}
                entering={index === 0 ? undefined : NEXT_EXERCISE}
                style={styles.stage}>
              <Exercise
                item={current}
                allForms={allForms}
                allSentences={allSentences}
                lexicon={lexicon}
                ladder={ladder}
                hints={kind !== 'placement'}
                onIntroDone={() => onIntroDone(current)}
                onAnswered={(wrongIds, extra) => void onAnswered(current, wrongIds, extra)}
              />
              </Animated.View>
            </CheerUpContext.Provider>
            </AnswerActionsContext.Provider>
          </PageColorContext.Provider>
        </Animated.View>
      )}
      <LessonCheer cheer={cheer} onDone={clearCheer} />
      <QuitSheet
        open={quitting}
        test={!!plan || kind === 'placement'}
        onStay={() => setQuitting(false)}
        onQuit={() => {
          setQuitting(false);
          goBack('/home');
        }}
      />
    </SafeAreaView>
  );
}

/** Strong ease-out: the movement is spent where the eye is already looking. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** The next exercise, arriving: a short travel from the right and a fade. */
const NEXT_EXERCISE = FadeInRight.duration(240).easing(EASE_OUT);

// ---------------------------------------------------------------------------
// The class's progress bar. It grows to each new answer instead of snapping,
// so the step forward is something she sees happen.
// ---------------------------------------------------------------------------
function ProgressBar({ progress }: { progress: number }) {
  const shown = useSharedValue(progress);
  useEffect(() => {
    shown.set(withTiming(progress, { duration: 420, easing: EASE_OUT }));
  }, [progress, shown]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(shown.get() * 100, 3)}%` }));
  return (
    <View
      style={styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <Animated.View style={[styles.progressFill, fill]}>
        <LinearGradient colors={gradients.progress} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// "Leave the class?" — raised by the close button (or Android's back) once she
// has answered something, because leaving throws the class away. Staying is
// the big button; leaving is there, plainly, under it.
// ---------------------------------------------------------------------------
function QuitSheet({
  open,
  test,
  onStay,
  onQuit,
}: {
  open: boolean;
  test: boolean;
  onStay: () => void;
  onQuit: () => void;
}) {
  const inset = useSafeAreaInsets().bottom;
  // Drawn over the class inside the screen itself, not in a native Modal: a
  // Modal still closing as the screen goes away can stay behind on iOS as an
  // invisible layer that swallows every touch in the app.
  if (!open) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.quitLayer]}>
        <View style={styles.quitDock}>
          <Animated.View entering={FadeIn.duration(200)} style={[StyleSheet.absoluteFill, styles.quitScrim]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onStay} accessibilityLabel="Keep going" />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.duration(300).easing(Easing.bezier(0.32, 0.72, 0, 1))}
            style={[styles.quitSheet, { paddingBottom: 20 + inset }]}>
            <Image source={POSE.sip} style={styles.quitFigure} contentFit="contain" accessible={false} />
            <Text style={styles.quitTitle}>Wait, don&apos;t go!</Text>
            <Text style={styles.quitBody}>
              {test
                ? "If you leave now, this test won't count."
                : "If you leave now, you'll lose your progress in this lesson."}
            </Text>
            <Button title="Keep going" onPress={onStay} />
            <Button title={test ? 'Leave the test' : 'End lesson'} variant="ghost" onPress={onQuit} />
          </Animated.View>
        </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The staff shortcut through a round: grade this exercise right or wrong and
// go on. Deliberately plain and a little out of the way — it is scaffolding
// for reviewers, not part of the lesson.
// ---------------------------------------------------------------------------
function SimulateBar({ onSimulate }: { onSimulate: (correct: boolean) => void }) {
  return (
    <View style={styles.simBar}>
      <Text style={styles.simLabel}>Simulate</Text>
      <SimButton
        label="Correct"
        icon="checkmark"
        tint={colors.success}
        background={colors.successSoft}
        onPress={() => onSimulate(true)}
      />
      <SimButton
        label="Wrong"
        icon="close"
        tint={colors.dangerInk}
        background={colors.dangerSoft}
        onPress={() => onSimulate(false)}
      />
    </View>
  );
}

function SimButton({
  label,
  icon,
  tint,
  background,
  onPress,
}: {
  label: string;
  icon: 'checkmark' | 'close';
  tint: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Simulate a ${label.toLowerCase()} answer`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.simButton,
        { backgroundColor: background, transform: [{ scale: pressed ? press.scale : 1 }] },
        simTransition,
      ]}>
      <Ionicons name={icon} size={14} color={tint} />
      <Text style={[styles.simButtonText, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

// On web the press scale eases instead of snapping, as it does on every other
// button in the app.
const simTransition =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

// ---------------------------------------------------------------------------
// A unit check she didn't pass: how close she was, the words that tripped her,
// and the way back in. On the third attempt the check lets her through
// whatever the score, so this screen never appears a third time.
// ---------------------------------------------------------------------------
function CheckNotYet({
  score,
  attempts,
  missed,
  onRetry,
  onLater,
}: {
  score: number;
  attempts: number;
  missed: Form[];
  onRetry: () => void;
  onLater: () => void;
}) {
  return (
    <View style={styles.gatePanel}>
      <Text style={styles.gateTitle}>Almost there</Text>
      <Text style={styles.gateBody}>
        You got {score}% right. The unit check needs {UNIT_PASS_SCORE}% to move on.
        {attempts < UNIT_MAX_ATTEMPTS
          ? ` Attempt ${attempts} of ${UNIT_MAX_ATTEMPTS} — the last one lets you through either way.`
          : ''}
      </Text>
      {missed.length ? (
        <Panel style={styles.missed}>
          <Text style={styles.missedLabel}>Words to firm up</Text>
          {missed.slice(0, 6).map((f) => (
            <View key={f.id} style={styles.missedRow}>
              <Text style={styles.missedEs}>{f.form}</Text>
              <Text style={styles.missedEn}>{shownMeaning(f).text}</Text>
            </View>
          ))}
        </Panel>
      ) : null}
      <Button title="Try again" onPress={onRetry} />
      <Button title="Later" variant="ghost" onPress={onLater} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Where a placement or jump test left her.
// ---------------------------------------------------------------------------
function TestResult({ outcome, plan, onDone }: { outcome: TestOutcome; plan: TestPlan; onDone: () => void }) {
  const landed = plan.units.find((u) => u.course_order === outcome.throughOrder) ?? plan.target;
  const section = landed ? plan.sections?.find((s) => s.id === landed.section_id) : undefined;
  const where = section
    ? `Section ${section.ordinal}, ${section.title_en}: ${landed?.title_en}`
    : (landed?.title_en ?? 'a later unit');
  let title: string;
  let body: string;
  if (plan.mode === 'jump') {
    title = outcome.passed ? "You're through!" : 'Not quite yet';
    body = outcome.passed
      ? `You skipped ahead to ${plan.target?.title_en ?? 'the next unit'}. The words you skipped will come back in reviews over the next week.`
      : `${outcome.tripped?.title_en ?? 'An earlier unit'} still needs a little work. Keep going on the path — you can try again any time.`;
  } else {
    title = outcome.passed ? 'Placed!' : "Let's start from the beginning";
    body = outcome.passed
      ? `You start at ${where}. What you skipped will come back in reviews over the next week.`
      : 'The first units will get you going quickly.';
    if (plan.cutShort) body += " We couldn't load the next section, so the test stopped early.";
  }
  return (
    <View style={styles.gatePanel}>
      <View style={[styles.resultIcon, !outcome.passed && styles.resultIconSoft]}>
        <Ionicons
          name={outcome.passed ? 'rocket' : 'footsteps'}
          size={34}
          color={outcome.passed ? colors.onPrimary : colors.primaryDark}
        />
      </View>
      <Text style={styles.gateTitle}>{title}</Text>
      <Text style={styles.gateBody}>{body}</Text>
      <Button title="Continue" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Plain oat: the lesson sits on bare clay paper, not the app's wash.
  safe: { flex: 1, backgroundColor: colors.bg },
  stage: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.progress, overflow: 'hidden' },
  counter: { ...font.body[800], fontSize: 13, color: colors.muted, minWidth: 40, textAlign: 'right' },
  stop: { paddingVertical: 4 },
  stopText: { ...font.body[800], fontSize: 13, color: colors.primaryDark },
  kicker: {
    ...font.body[800],
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginBottom: -6,
  },

  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },

  // Leave the class? --------------------------------------------------------
  // Over the header too: the SafeAreaView's own top inset is under it.
  quitLayer: { zIndex: 10, elevation: 10 },
  quitDock: { flex: 1, justifyContent: 'flex-end' },
  quitScrim: { backgroundColor: 'rgba(58, 42, 32, 0.38)' },
  quitSheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'stretch',
    gap: 10,
    padding: 24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: clay.float,
  },
  quitFigure: { width: 104, height: 104, alignSelf: 'center' },
  quitTitle: { ...font.display[800], fontSize: 24, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  quitBody: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.muted, textAlign: 'center', marginBottom: 8 },

  // The staff simulate bar ---------------------------------------------------
  simBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: -4,
  },
  simLabel: {
    ...font.body[800],
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.faint,
    marginRight: 2,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
  },
  simButtonText: { ...font.body[800], fontSize: 13 },

  // The frozen-streak gate, and the unit-check and test results ---------------
  gatePanel: { alignItems: 'stretch', gap: 12, maxWidth: 400, width: '100%' },
  gateTitle: { ...font.display[800], fontSize: 26, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  gateClip: { width: 210, height: 210, alignSelf: 'center' },
  gateSub: { ...font.body[800], fontSize: 17, color: colors.ink, textAlign: 'center' },
  gateBody: {
    ...font.body[600],
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  missed: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 4 },
  missedLabel: { ...font.body[800], fontSize: 13, color: colors.muted, letterSpacing: 0.3 },
  missedRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  missedEs: { ...font.body[800], fontSize: 17, color: colors.ink },
  missedEn: { ...font.body[600], fontSize: 15, color: colors.primaryDark, flexShrink: 1, textAlign: 'right' },
  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    boxShadow: clay.button,
  },
  resultIconSoft: { backgroundColor: colors.card, boxShadow: clay.surface },
  doneEmoji: { fontSize: 64 },
  failedFigure: { width: 132, height: 132 },
  doneTitle: { ...font.display[800], fontSize: 26, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  doneHint: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center' },
});
