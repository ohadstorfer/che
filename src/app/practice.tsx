import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Exercise } from '@/components/exercises';
import { LessonComplete } from '@/components/lesson-complete';
import { LoadingVideo } from '@/components/loading-video';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button, Panel } from '@/components/ui';
import { type AnswerActions, AnswerActionsContext } from '@/components/wrong-answer-actions';
import { answerWords } from '@/lib/answers';
import { preloadAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { conceptsOf } from '@/lib/concepts';
import { currentIndex, loadCourse, loadProgress } from '@/lib/course';
import { buildLesson } from '@/lib/lesson';
import { goBack } from '@/lib/nav';
import { type TestMode, type TestOutcome, buildTest, maxUnitsInTest, shouldStop, testOutcome } from '@/lib/placement';
import {
  type AnswerExtra,
  type FinishResult,
  type QueueItem,
  type RoundKind,
  formsOf,
  useRound,
  withIntros,
} from '@/lib/round';
import { type SessionData, buildFreeSession, buildMistakesSession, buildSession } from '@/lib/session';
import { streakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Form, Sentence, Streak, Unit } from '@/lib/types';

/** Score a unit check needs (learning-engine-spec §3). Mirrors finish_lesson. */
const UNIT_PASS_SCORE = 80;
const UNIT_MAX_ATTEMPTS = 3;

interface TestPlan {
  mode: TestMode;
  units: Unit[];
  /** course_order she lands on if the test lets her through. */
  targetOrder: number;
  target: Unit | null;
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
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
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
  /** The loading clip is watched to the end before the first exercise shows. */
  const [clipPlayed, setClipPlayed] = useState(false);
  /** Set by the Dale! on the finish screen, when there is a streak to show. */
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

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    finishing.current = false;

    const load = async (): Promise<{ data: SessionData; kind: RoundKind; plan?: TestPlan }> => {
      if (testMode) {
        const [course, done] = await Promise.all([loadCourse(), loadProgress(userId)]);
        const units = course.units;
        let span: Unit[];
        let target: Unit | null = null;
        if (testMode === 'placement') {
          span = units.slice(0, maxUnitsInTest());
        } else {
          target = units.find((u) => u.id === params.to) ?? null;
          const here = course.path[currentIndex(course.path, done)]?.unit;
          span =
            target && here
              ? units.filter((u) => u.course_order >= here.course_order && u.course_order < target!.course_order)
              : [];
        }
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

    load().then(({ data, kind: k, plan: p }) => {
      if (cancelled) return;
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
      setAllSentences(data.sentences);
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
    setClipPlayed(false);
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

  // Latency is measured from the moment an exercise is on screen.
  useEffect(() => {
    round.shown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, clipPlayed]);

  // The clips for the exercise she is on and the two after it are fetched
  // ahead of the press, so by the time she taps the speaker there is nothing
  // left to load.
  useEffect(() => {
    if (!queue) return;
    for (const item of queue.slice(index, index + 3)) {
      for (const form of formsOf(item)) preloadAudio(form.audio_path);
      if (item.sentence?.audio_path) preloadAudio(item.sentence.audio_path);
    }
  }, [queue, index]);

  // Then the rest of the lesson, behind those, once.
  const warmed = useRef(false);
  const warmedFirst = useRef(false);
  useEffect(() => {
    if (!queue || warmed.current) return;
    warmed.current = true;
    for (const item of queue) for (const form of formsOf(item)) void preloadAudio(form.audio_path);
  }, [queue]);

  // The doorway also waits on the first recording, though never for long.
  const [firstReady, setFirstReady] = useState(false);
  const firstClip = useMemo(
    () =>
      queue
        ?.slice(0, 3)
        .flatMap(formsOf)
        .find((form) => form.audio_path)?.audio_path ?? null,
    [queue],
  );
  useEffect(() => {
    if (!firstClip || warmedFirst.current) return;
    warmedFirst.current = true;
    const open = () => setFirstReady(true);
    void preloadAudio(firstClip).then(open);
    const giveUp = setTimeout(open, 2500);
    return () => clearTimeout(giveUp);
  }, [firstClip]);

  const finish = async () => {
    if (!profile || finishing.current) return;
    finishing.current = true;
    if (preview) return goBack('/admin');

    let result: FinishResult | null;
    if (plan) {
      const outcome = testOutcome(plan.mode, round.testAnswers.current, plan.units, plan.targetOrder);
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
      setVerdict({ kind: 'test', outcome, plan });
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
    // A placement test stops as soon as she has reached her level.
    if (plan?.mode === 'placement' && shouldStop(round.testAnswers.current)) return void finish();
    advance(next);
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
                <Button title="Back home" variant="ghost" onPress={() => router.replace('/home')} />
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
            onDone={() => router.replace('/home')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <LessonComplete
          streak={celebrate || finished.streak <= 0 ? null : finished.streak}
          onNext={() => (celebrate ? setCelebrating(true) : router.replace('/home'))}
        />
      </SafeAreaView>
    );
  }

  if (gate === undefined) {
    return <SafeAreaView style={styles.safe} />;
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

  if (!queue || (queue.length > 0 && (!clipPlayed || (!!firstClip && !firstReady)))) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <LoadingVideo onPlayedThrough={() => setClipPlayed(true)} />
        </View>
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
          <Button title="Back home" onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  const progress = index / queue.length;
  const title =
    kind === 'unit_check'
      ? 'Unit check'
      : kind === 'placement'
        ? plan?.mode === 'jump'
          ? 'Jump ahead'
          : 'Placement'
        : kind === 'mistakes'
          ? 'Mistakes'
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
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 3)}%` }]} />
        </View>
        <Text style={styles.counter}>
          {index + 1}/{queue.length}
        </Text>
      </View>
      {title ? <Text style={styles.kicker}>{title}</Text> : null}

      {current && (
        <AnswerActionsContext.Provider value={kind === 'placement' ? null : actions}>
          <Exercise
            key={`${current.form.id}-${index}`}
            item={current}
            allForms={allForms}
            allSentences={allSentences}
            hints={(kind !== 'lesson' && kind !== 'placement') || !!current.review}
            onIntroDone={() => onIntroDone(current)}
            onAnswered={(wrongIds, extra) => void onAnswered(current, wrongIds, extra)}
          />
        </AnswerActionsContext.Provider>
      )}
    </SafeAreaView>
  );
}

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
              <Text style={styles.missedEn}>{f.gloss_en}</Text>
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
      ? `You start at ${landed?.title_en ?? 'a later unit'}. What you skipped will come back in reviews over the next week.`
      : 'The first units will get you going quickly.';
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
  safe: { flex: 1 },
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
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.primary },
  counter: { fontSize: 13, fontWeight: '600', color: colors.muted, minWidth: 40, textAlign: 'right' },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
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

  // The frozen-streak gate, and the unit-check and test results ---------------
  gatePanel: { alignItems: 'stretch', gap: 12, maxWidth: 400, width: '100%' },
  gateTitle: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  gateClip: { width: 210, height: 210, alignSelf: 'center' },
  gateSub: { fontSize: 17, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  gateBody: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  missed: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 4 },
  missedLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, letterSpacing: 0.3 },
  missedRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  missedEs: { fontSize: 17, fontWeight: '700', color: colors.ink },
  missedEn: { fontSize: 15, color: colors.primaryDark, flexShrink: 1, textAlign: 'right' },
  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  resultIconSoft: { backgroundColor: colors.primarySoft },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  doneHint: { fontSize: 15, color: colors.muted, textAlign: 'center' },
});
