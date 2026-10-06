import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClassDoor, ClassWait } from '@/components/class-door';
import { Exercise } from '@/components/exercises';
import { LessonComplete } from '@/components/lesson-complete';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button, Panel } from '@/components/ui';
import { type AnswerActions, AnswerActionsContext } from '@/components/wrong-answer-actions';
import { answerWords, meaningOf } from '@/lib/answers';
import { preloadAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { conceptsOf } from '@/lib/concepts';
import { currentIndex, loadCourse, loadProgress } from '@/lib/course';
import { LessonLockedError, buildLesson } from '@/lib/lesson';
import { backToCourse, goBack } from '@/lib/nav';
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
  sectionPassed,
  testOutcome,
} from '@/lib/placement';
import {
  type AnswerExtra,
  type FinishResult,
  type QueueItem,
  type RoundKind,
  formsOf,
  useRound,
  withIntros,
} from '@/lib/round';
import { type SessionData, buildFreeSession, buildMistakesSession, buildSession, buildWordsSession } from '@/lib/session';
import { streakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, gradients, press, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Form, Section, Sentence, Streak, Unit } from '@/lib/types';

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

export default function Practice() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
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
  /** A frozen streak stops her at the door: what she lost, and the way back.
   *  `undefined` while the answer is in flight — the doorway holds still until
   *  it lands, so the loading clip can't flash in front of the gate. */
  const [gate, setGate] = useState<{ lost: number; oneMore: boolean } | null | undefined>(undefined);

  // Depend on the id, not on the profile object: every auth event hands back a
  // freshly-fetched profile, and rebuilding the queue underneath her
  // mid-session would swap out the exercise she is answering.
  const userId = profile?.id;
  const round = useRound(userId);
  const finishing = useRef(false);
  /** The placement walk: which sections she has passed, and the one on screen. */
  const walk = useRef<Walk | null>(null);
  /** The next section of a placement is on its way. */
  const [staging, setStaging] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    finishing.current = false;
    walk.current = null;

    const load = async (): Promise<{ data: SessionData; kind: RoundKind; plan?: TestPlan; walk?: Walk }> => {
      if (testMode) {
        const [course, done] = await Promise.all([loadCourse(), loadProgress(userId)]);
        const units = course.units;
        if (testMode === 'placement') {
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

    load().then(({ data, kind: k, plan: p, walk: w }) => {
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
      if (cancelled) return;
      if (e instanceof LessonLockedError) router.replace('/paywall?from=lesson');
      else {
        console.warn('lesson failed to load', e);
        // A test that can't be built says so rather than spinning for good.
        if (testMode) {
          setLoadFailed(true);
          setQueue([]);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId, testMode, params.to, params.mode, params.concept, isAgain]);

  // Replacing the route with new params remounts the screen, which resets state
  // on its own; this is the belt-and-braces for when the screen is reused.
  useEffect(() => {
    setFinished(null);
    setVerdict(null);
    setCelebrating(false);
    setIndex(0);
    setQueue(null);
    setStaging(false);
    setLoadFailed(false);
  }, [lessonId, isAgain, testMode, params.mode]);

  // The gate is read once, on the way in.
  useEffect(() => {
    if (!userId) return;
    if (isAgain || preview) {
      setGate(null);
      return;
    }
    supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        const st = streakStatus((data as Streak) ?? null);
        if (st.kind === 'frozen') setGate({ lost: st.lost, oneMore: false });
        else if (st.kind === 'recovering') setGate({ lost: st.lost, oneMore: true });
        else setGate(null);
      });
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
    void preloadAudio(firstClip).then(open);
    const giveUp = setTimeout(open, 900);
    return () => clearTimeout(giveUp);
  }, [firstClip]);
  /** The first screen has what it needs; the rest may load behind it. */
  const doorOpen = !!queue && (!firstClip || firstReady);

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
        const { error } = await supabase.rpc('apply_placement', {
          p_round_id: round.roundId.current,
          p_through_order: outcome.throughOrder,
          p_passed_form_ids: outcome.passedFormIds,
          p_failed_form_ids: outcome.failedFormIds,
        });
        if (error) console.warn('apply_placement failed', error);
      }
      result = await round.finish();
      setVerdict({ kind: 'test', outcome, plan: { ...plan, cutShort: w?.cutShort } });
    } else {
      result = await round.finish();
      if (kind === 'unit_check' && result && !result.passed) {
        setVerdict({
          kind: 'check',
          score: round.score() ?? 0,
          attempts: result.attempts ?? 1,
          missed: [...round.missedForms.current.values()],
        });
      }
    }
    setFinished({
      streak: result?.current_streak ?? 0,
      previous: result?.previous_streak ?? 0,
      oneMore: result && result.recoverable_streak > 0 ? result.recoverable_streak : undefined,
    });
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

  const onAnswered = async (item: QueueItem, wrongFormIds: string[], extra?: AnswerExtra) => {
    if (!queue) return;
    const next = await round.answer(item, index, queue, wrongFormIds, extra);
    // A placement asks a section at a time: at the end of one, the walk
    // decides whether there is another to ask.
    if (walk.current && index + 1 >= next.length) return void nextSection(walk.current, next);
    advance(next);
  };

  const stagingNow = useRef(false);
  const nextSection = async (w: Walk, asked: QueueItem[]) => {
    if (stagingNow.current || finishing.current) return;
    const own = new Set(w.session.sections[w.stage]?.units.map((u) => u.id));
    w.results.set(
      w.stage,
      sectionPassed(round.testAnswers.current.filter((a) => own.has(a.unitId)).map((a) => a.correct)),
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
    if (celebrating) {
      if (finished.oneMore != null) {
        const lost = finished.oneMore;
        return (
          <SafeAreaView style={styles.safe}>
            <View style={styles.doneWrap}>
              <View style={styles.gatePanel}>
                <Text style={styles.gateTitle}>Almost!</Text>
                <Image
                  source={require('@/assets/videos/frozen-pitas.webp')}
                  style={styles.gateClip}
                  contentFit="contain"
                  accessible={false}
                />
                <Text style={styles.gateBody}>One more lesson and you get your {lost} day streak back.</Text>
                <Button title="One more lesson" onPress={() => router.replace('/practice?again=1')} />
                <Button title="Back home" variant="ghost" onPress={backToCourse} />
              </View>
            </View>
          </SafeAreaView>
        );
      }
      return (
        <SafeAreaView style={styles.safe}>
          <StreakCelebration
            previous={finished.previous}
            streak={finished.streak}
            onDone={backToCourse}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <LessonComplete
          streak={celebrate || finished.streak <= 0 ? null : finished.streak}
          onNext={() => (celebrate ? setCelebrating(true) : backToCourse())}
        />
      </SafeAreaView>
    );
  }

  const doorLine = testMode ? 'Getting your test ready…' : undefined;
  if (gate === undefined) {
    return <ClassDoor onClose={() => goBack('/home')} line={doorLine} />;
  }
  if (gate) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.gatePanel}>
            <Text style={styles.gateTitle}>{gate.oneMore ? 'Almost!' : 'Your streak is frozen!'}</Text>
            <Image
              source={require('@/assets/videos/frozen-pitas.webp')}
              style={styles.gateClip}
              contentFit="contain"
              accessible={false}
            />
            {gate.oneMore ? null : <Text style={styles.gateSub}>Your {gate.lost} day streak is on ice</Text>}
            <Text style={styles.gateBody}>
              {gate.oneMore
                ? `One more lesson and you get your ${gate.lost} day streak back.`
                : 'To get it back, finish two lessons in a row today.'}
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

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>😌</Text>
          <Text style={styles.doneTitle}>
            {kind === 'mistakes'
              ? 'No mistakes to go over'
              : plan
                ? loadFailed
                  ? "Couldn't load the test"
                  : 'Nothing to test here yet'
                : 'Nothing to practise right now'}
          </Text>
          <Text style={styles.doneHint}>
            {loadFailed ? 'Check your connection and try again.' : 'Take a lesson on the path and come back.'}
          </Text>
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
        <Pressable onPress={() => goBack('/home')} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 3)}%` }]}>
            <LinearGradient colors={gradients.progress} style={StyleSheet.absoluteFill} />
          </View>
        </View>
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
          <AnswerActionsContext.Provider value={kind === 'placement' ? null : actions}>
            <Exercise
              key={`${current.form.id}-${index}`}
              item={current}
              allForms={allForms}
              allSentences={allSentences}
              lexicon={lexicon}
              ladder={ladder}
              hints={(kind !== 'lesson' && kind !== 'placement') || !!current.review}
              onIntroDone={() => onIntroDone(current)}
              onAnswered={(wrongIds, extra) => void onAnswered(current, wrongIds, extra)}
            />
          </AnswerActionsContext.Provider>
        </Animated.View>
      )}
    </SafeAreaView>
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
              <Text style={styles.missedEn}>{meaningOf(f)}</Text>
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
  doneTitle: { ...font.display[800], fontSize: 26, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  doneHint: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center' },
});
