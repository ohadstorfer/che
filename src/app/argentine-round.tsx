import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseFrame } from '@/components/exercise-frame';
import { Exercise } from '@/components/exercises';
import { Button } from '@/components/ui';
import { INTRO_LOOKS, WordIntro, lookOffset } from '@/components/word-intro';
import {
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
import { themeArt } from '@/lib/argentine-art';
import { type PackScore, savePackScore } from '@/lib/argentine-scores';
import { useAuth } from '@/lib/auth';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// One play of an Argentine pack (?pack=<slug>). The course's own exercises,
// graded here and nowhere else: nothing is scheduled, and all that is kept is
// the share she got right on the first try. A miss comes back once at the end,
// the way a lesson re-asks, without counting toward the score.
// ---------------------------------------------------------------------------

export default function ArgentineRound() {
  const { pack: slug, first } = useLocalSearchParams<{ pack?: string; first?: string }>();
  const pack = slug ? findPack(slug) : null;
  const { profile } = useAuth();
  const userId = profile?.id;

  const [queue, setQueue] = useState<PackItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<{ score: number; saved: PackScore } | null>(null);
  /** First tries on graded screens: how the score is worked out. */
  const firstTries = useRef<boolean[]>([]);
  const retried = useRef(new Set<number>());

  // A new word gets one of the intro looks, dealt in turn through the pack so
  // neighbours differ; the page and the status bar take the look's colour.
  const introLook = useMemo(() => {
    const item = queue?.[index];
    if (!queue || !pack || item?.kind !== 'intro') return null;
    const n = queue.slice(0, index).filter((q) => q.kind === 'intro').length;
    return INTRO_LOOKS[(lookOffset(pack.slug) + n) % INTRO_LOOKS.length];
  }, [queue, index, pack]);
  useStatusBarColor(introLook?.bg ?? colors.bg);

  // Wrong answers come from the pack, its theme, then any clean word; the gap
  // draws from the same words as they appear in their examples.
  const decoys = useMemo(() => (pack ? decoyWords(pack) : []), [pack]);
  const forms = useMemo(() => decoys.map(toForm), [decoys]);
  const gapForms = useMemo(() => decoys.map(toGapForm), [decoys]);

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

  if (!pack) {
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

  if (queue.length === 0) {
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

  if (done) {
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
    <SafeAreaView style={[styles.safe, introLook && { backgroundColor: introLook.bg }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/words')} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={introLook?.ink ?? colors.muted} />
        </Pressable>
        <View style={[styles.progressTrack, introLook && { backgroundColor: introLook.track }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max((index / queue.length) * 100, 3)}%` },
              introLook && { backgroundColor: introLook.fill },
            ]}
          />
        </View>
        <Text style={[styles.counter, introLook && { color: introLook.ink }]}>
          {index + 1}/{queue.length}
        </Text>
      </View>
      <Text style={[styles.kicker, introLook && { color: introLook.ink }]}>{pack.title}</Text>

      {current.kind === 'intro' ? (
        <WordIntro
          key={`intro-${index}`}
          look={introLook ?? INTRO_LOOKS[0]}
          word={current.word}
          art={themeArt(pack.theme)}
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
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.primary },
  counter: { ...font.body[800], fontSize: 13, color: colors.muted, minWidth: 40, textAlign: 'right' },
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
  },
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
