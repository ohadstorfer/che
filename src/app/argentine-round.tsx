import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseFrame } from '@/components/exercise-frame';
import { Exercise } from '@/components/exercises';
import { PathLessonDone } from '@/components/path-lesson-done';
import { Button } from '@/components/ui';
import { WordIntro } from '@/components/word-intro';
import {
  type ArPack,
  type ArWord,
  type PackItem,
  buildPackRound,
  decoyWords,
  findPack,
  knownIn,
  loadCourseWords,
  toForm,
  toGapForm,
} from '@/lib/argentine';
import { type PackScore, savePackScore } from '@/lib/argentine-scores';
import { useAuth } from '@/lib/auth';
import { lessonWithUnit } from '@/lib/lesson';
import { goBack } from '@/lib/nav';
import type { FinishResult } from '@/lib/round';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font } from '@/lib/theme';
import { finishPathLesson, unitSlang, unitSlangCourse } from '@/lib/unit-extras';

// ---------------------------------------------------------------------------
// One play of an Argentine pack (?pack=<slug>). The course's own exercises,
// graded here and nowhere else: nothing is scheduled, and all that is kept is
// the share she got right on the first try. A miss comes back once at the end,
// the way a lesson re-asks, without counting toward the score.
//
// A unit's slang class on the road (?lesson=<id>) is the same round over the
// unit's cards (unit-extras.ts), taught the first-time way; finishing it
// finishes the lesson and goes back to the path. Where the unit also teaches
// slang as course words, the cards are the first half: the lesson goes on in
// /practice, which drills those words and finishes it.
// ---------------------------------------------------------------------------

/** Each word once: the packs of a slang class share their theme's words. */
const uniqueWords = (words: ArWord[]) => [...new Map(words.map((w) => [w.id, w])).values()];

export default function ArgentineRound() {
  const { pack: slug, first, lesson: lessonId } = useLocalSearchParams<{ pack?: string; first?: string; lesson?: string }>();
  const pack = slug ? findPack(slug) : null;
  /** The unit's slang class, once its unit is known; null if it has none. */
  const [slang, setSlang] = useState<{ words: ArWord[]; packs: ArPack[] } | null | undefined>(undefined);
  const [ended, setEnded] = useState<{ result: FinishResult | null } | null>(null);
  /** The lesson goes on in /practice after the cards: its unit teaches slang as course words. */
  const [goesOn, setGoesOn] = useState(false);
  /** The unit couldn't be read at all, which says nothing about whether the class exists. */
  const [unreachable, setUnreachable] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const { profile } = useAuth();
  const userId = profile?.id;

  const [queue, setQueue] = useState<PackItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<{ score: number; saved: PackScore } | null>(null);
  /** First tries on graded screens: how the score is worked out. */
  const firstTries = useRef<boolean[]>([]);
  const retried = useRef(new Set<number>());

  useStatusBarColor(colors.bg);

  // Wrong answers come from the pack, its theme, then any clean word; the gap
  // draws from the same words as they appear in their examples.
  const decoys = useMemo(
    () => (pack ? decoyWords(pack) : slang ? uniqueWords(slang.packs.flatMap(decoyWords)) : []),
    [pack, slang],
  );
  const forms = useMemo(() => decoys.map(toForm), [decoys]);
  const gapForms = useMemo(() => decoys.map(toGapForm), [decoys]);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    lessonWithUnit(lessonId)
      .then(
        ({ unit }) => ({ found: unitSlang(unit.slug), course: unitSlangCourse(unit.slug) }),
        () => {
          if (!cancelled) setUnreachable(true);
          return { found: null, course: false };
        },
      )
      .then(({ found, course }) => {
        if (cancelled) return;
        // No cards, but course words to drill: the lesson is all in /practice.
        if (!found && course) return void router.replace(`/practice?lesson=${lessonId}`);
        setGoesOn(course);
        setSlang(found);
        if (found) setQueue(buildPackRound(found.words, true));
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!pack || !userId) return;
    let cancelled = false;
    loadCourseWords(userId)
      .catch(() => new Set<string>())
      .then((known) => {
        if (cancelled) return;
        const words = pack.words.filter((w) => !knownIn(known, w));
        setQueue(buildPackRound(words, first === '1'));
      });
    return () => {
      cancelled = true;
    };
  }, [pack, userId, first]);

  if (lessonId) {
    if (ended) return <PathLessonDone result={ended.result} />;
    if (slang === null) {
      // The road can hold a class this build has no words for (the plan ships in
      // the app, the road in the database). It is skipped rather than left as a
      // step she can never finish.
      const skip = () => {
        setSkipping(true);
        void finishPathLesson(lessonId, null).then((result) => (result ? setEnded({ result }) : setSkipping(false)));
      };
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Text style={styles.centerText}>
              {unreachable ? "Couldn't load this class. Check your connection and try again." : "This class isn't in this version of the app."}
            </Text>
            {unreachable ? null : <Button title="Skip it" loading={skipping} onPress={skip} />}
            <Button title="Back to the course" variant={unreachable ? 'primary' : 'ghost'} onPress={() => goBack('/home')} />
          </View>
        </SafeAreaView>
      );
    }
  } else if (!pack) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.centerText}>This pack doesn't exist.</Text>
          <Button title="Back to words" onPress={() => router.dismissTo('/words')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!queue) return <SafeAreaView style={styles.safe} />;

  if (queue.length === 0 && pack) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🧉</Text>
          <Text style={styles.centerTitle}>You know all of these already</Text>
          <Text style={styles.centerText}>The course taught you every word in this pack.</Text>
          <Button title="Back" onPress={() => goBack('/words')} />
        </View>
      </SafeAreaView>
    );
  }

  if (done && pack) {
    return (
      <Finish
        score={done.score}
        saved={done.saved}
        title={pack.title}
        onAgain={() => router.replace(`/argentine-round?pack=${pack.slug}`)}
        onDone={() => goBack('/words')}
      />
    );
  }

  const current = queue[index];

  const next = (q: PackItem[]) => {
    if (index + 1 < q.length) {
      setIndex(index + 1);
      return;
    }
    const tries = firstTries.current;
    const score = tries.length ? Math.round((tries.filter(Boolean).length / tries.length) * 100) : 100;
    // The second half, where there is one, finishes the lesson.
    if (lessonId && goesOn) return void router.replace(`/practice?lesson=${lessonId}`);
    if (lessonId) return void finishPathLesson(lessonId, score).then((result) => setEnded({ result }));
    if (!pack) return;
    void savePackScore(pack.slug, score).then((saved) => setDone({ score, saved }));
  };

  const onAnswered = (wrongIds: string[]) => {
    if (current.kind !== 'exercise') return;
    const right = wrongIds.length === 0;
    let q = queue;
    if (!current.item.isRetry) firstTries.current.push(right);
    // A miss is asked again at the end — once.
    if (!right && !current.item.isRetry && !retried.current.has(index)) {
      retried.current.add(index);
      q = [...queue, { kind: 'exercise', item: { ...current.item, isRetry: true } }];
      setQueue(q);
    }
    next(q);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack(lessonId ? '/home' : '/words')} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max((index / queue.length) * 100, 3)}%` },
            ]}
          />
        </View>
        <Text style={styles.counter}>
          {index + 1}/{queue.length}
        </Text>
      </View>

      {current.kind === 'intro' ? (
        <WordIntro
          key={`intro-${index}`}
          word={current.word}
          onDone={() => next(queue)}
        />
      ) : (
        <Exercise
          key={`${current.item.form.id}-${index}`}
          item={current.item}
          allForms={current.item.mode === 'sentence_gap' ? gapForms : forms}
          allSentences={[]}
          onIntroDone={() => next(queue)}
          onAnswered={onAnswered}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Finish — the score, and the best one so far. It rises in once; it is seen at
// the end of a pack, rarely enough to earn the motion.
// ---------------------------------------------------------------------------
function Finish({
  score,
  saved,
  title,
  onAgain,
  onDone,
}: {
  score: number;
  saved: PackScore;
  title: string;
  onAgain: () => void;
  onDone: () => void;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 280,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const newBest = saved.plays > 1 && score >= saved.best && score > 0;
  const line = score >= 90 ? '¡Bárbaro!' : score >= 70 ? '¡Muy bien!' : score >= 50 ? 'Vas bien' : 'Dale, otra vez';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.finish,
            {
              opacity: enter,
              transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
            },
          ]}>
          <Text style={styles.finishKicker}>{title}</Text>
          <Text style={styles.finishLine}>{line}</Text>
          <Text style={styles.finishScore}>{score}%</Text>
          <Text style={styles.finishSub}>
            {newBest ? 'New best!' : saved.plays > 1 ? `Best so far: ${saved.best}%` : 'right on the first try'}
          </Text>
        </Animated.View>
        <View style={styles.finishButtons}>
          <Button title="Continue" onPress={onDone} />
          <Button title="Practice again" variant="secondary" onPress={onAgain} />
        </View>
      </View>
    </SafeAreaView>
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
    height: 18,
    borderRadius: 99,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.progress },
  counter: { ...font.body[800], fontSize: 13, color: colors.muted, minWidth: 40, textAlign: 'right' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  emoji: { fontSize: 56 },
  centerTitle: { ...font.display[800], fontSize: 22, color: colors.ink, textAlign: 'center' },
  centerText: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },

  finish: { alignItems: 'center', gap: 4, marginBottom: 12 },
  finishKicker: { ...font.body[800], fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  finishLine: { ...font.display[800], fontSize: 30, letterSpacing: -0.5, color: colors.ink, marginTop: 6 },
  finishScore: {
    ...font.display[800],
    fontSize: 72,
    lineHeight: 80,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  finishSub: { ...font.body[600], fontSize: 15, color: colors.muted },
  finishButtons: { alignSelf: 'stretch', gap: 10 },
});
