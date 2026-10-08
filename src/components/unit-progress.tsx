import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { LessonComplete } from '@/components/lesson-complete';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { loadCourse, loadProgress } from '@/lib/course';
import { success } from '@/lib/haptics';
import { clay, colors, font, gradients } from '@/lib/theme';

// ---------------------------------------------------------------------------
// UnitProgress — how a lesson ends once the day's streak is already in.
//
// The first lesson of the day ends on LessonComplete and the streak
// celebration. Saying "lesson complete" again after the second and the third
// is a toll, so those end here instead: where she stands in her unit, and how
// little of it is left. One pip per class; the one she just finished fills in
// as the screen lands, with the phone's success tap.
// ---------------------------------------------------------------------------

/** Strong ease-out: all of the movement is spent in the first third. */
const EASE = Easing.bezier(0.23, 1, 0.32, 1);
/** A small overshoot for the pip landing, so it feels pressed, not placed. */
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
const STEP = 90;
const LAND = 260; // when the new pip fills

export interface UnitStanding {
  title: string;
  /** One per class of the unit, in road order. */
  steps: { done: boolean; fresh: boolean }[];
  done: number;
  total: number;
}

/**
 * Where the lesson just finished leaves her in its unit. Undefined while it is
 * being read; null when there is nothing to show — a round that isn't a lesson
 * on the road, or progress that couldn't be read.
 */
export function useUnitStanding(lessonId: string | null | undefined, enabled: boolean): UnitStanding | null | undefined {
  const { profile } = useAuth();
  const userId = profile?.id;
  const [standing, setStanding] = useState<UnitStanding | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    if (!lessonId || !userId) return setStanding(null);
    let live = true;
    Promise.all([loadCourse(), loadProgress(userId)])
      .then(([course, done]) => {
        if (!live) return;
        const unitId = course.path.find((l) => l.id === lessonId)?.unit.id;
        const own = unitId ? course.path.filter((l) => l.unit.id === unitId) : [];
        const steps = own.map((l) => ({ done: done.has(l.id), fresh: l.id === lessonId && done.has(l.id) }));
        const count = steps.filter((s) => s.done).length;
        // Nothing finished is nothing to cheer: a preview, or a check not passed.
        if (!own.length || count === 0) return setStanding(null);
        setStanding({ title: own[0].unit.title_en, steps, done: count, total: own.length });
      })
      .catch(() => live && setStanding(null));
    return () => {
      live = false;
    };
  }, [enabled, lessonId, userId]);

  return enabled ? standing : null;
}

function useEntrance(delay: number, travel: number) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: reduced ? 160 : 320, easing: EASE }));
  }, [delay, reduced, t]);

  return useAnimatedStyle(() => ({
    opacity: t.value,
    transform: reduced ? [] : [{ translateY: travel * (1 - t.value) }],
  }));
}

function Pip({ done, fresh }: { done: boolean; fresh: boolean }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(fresh ? 0 : 1);
  const scale = useSharedValue(fresh && !reduced ? 0.6 : 1);

  useEffect(() => {
    if (!fresh) return;
    t.value = withDelay(LAND, withTiming(1, { duration: 180, easing: EASE }));
    if (!reduced) scale.value = withDelay(LAND, withTiming(1, { duration: 280, easing: POP }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fill = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.pip}>
      {done ? (
        <Animated.View style={[StyleSheet.absoluteFill, styles.pipFill, fill]}>
          <LinearGradient colors={gradients.progress} style={[StyleSheet.absoluteFill, styles.pipFace]} />
        </Animated.View>
      ) : null}
    </View>
  );
}

export function UnitProgress({ standing, onNext }: { standing: UnitStanding; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { title, steps, done, total } = standing;
  const left = total - done;

  useEffect(() => {
    const t = setTimeout(success, reduced ? 0 : LAND);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eyebrow = useEntrance(0, 10);
  const count = useEntrance(STEP, 10);
  const row = useEntrance(STEP * 2, 10);
  const line = useEntrance(STEP * 3, 10);
  const action = useEntrance(STEP * 4, 10);

  const words = left === 0 ? 'Unit complete!' : left === 1 ? 'Just 1 left!' : `Only ${left} left!`;

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.eyebrow, eyebrow]} numberOfLines={2}>
        {title}
      </Animated.Text>

      <Animated.View
        style={[styles.countRow, count]}
        accessible
        accessibilityRole="header"
        accessibilityLabel={`${done} of ${total} classes done in your unit`}>
        <Text style={styles.count}>{done}</Text>
        <Text style={styles.total}>/{total}</Text>
      </Animated.View>
      <Animated.Text style={[styles.caption, count]}>classes in your unit</Animated.Text>

      <Animated.View style={[styles.pips, row]} accessible={false}>
        {steps.map((s, i) => (
          <Pip key={i} done={s.done} fresh={s.fresh} />
        ))}
      </Animated.View>

      <Animated.Text style={[styles.words, line]}>{words}</Animated.Text>

      <Animated.View style={[styles.actions, action]}>
        <Button title="Keep going" onPress={onNext} />
      </Animated.View>
    </View>
  );
}

/**
 * What a finished lesson ends on. The lesson that moved the streak gets
 * LessonComplete, and the celebration after it; every later one that day gets
 * her standing in the unit. A round with no unit to stand in — practice, her
 * mistakes — keeps LessonComplete, since it has nothing else to say.
 */
export function LessonEnd({
  lessonId,
  streak,
  celebrate,
  onNext,
}: {
  lessonId?: string | null;
  streak: number;
  /** This lesson moved the streak: the celebration follows. */
  celebrate: boolean;
  onNext: () => void;
}) {
  const standing = useUnitStanding(lessonId, !celebrate);
  // A blank beat while her progress is read, rather than one screen swapped for another.
  if (standing === undefined) return null;
  if (standing) return <UnitProgress standing={standing} onNext={onNext} />;
  return <LessonComplete streak={celebrate || streak <= 0 ? null : streak} onNext={onNext} />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  eyebrow: { ...font.display[800], fontSize: 18, color: colors.accent, letterSpacing: -0.2, textAlign: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'baseline' },
  count: {
    ...font.display[800],
    fontSize: 96,
    lineHeight: 100,
    letterSpacing: -3,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  total: { ...font.display[800], fontSize: 44, letterSpacing: -1, color: colors.muted, fontVariant: ['tabular-nums'] },
  caption: { ...font.body[700], fontSize: 16, color: colors.muted, marginTop: -8 },
  pips: { flexDirection: 'row', gap: 6, width: '100%', maxWidth: 320, marginTop: 16 },
  pip: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
  },
  pipFill: { borderRadius: 8 },
  pipFace: { borderRadius: 8 },
  words: {
    ...font.display[800],
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 12,
  },
  // `stretch` would override the wrap's centring, and maxWidth then leaves the
  // button pinned to the left edge. Centre it explicitly.
  actions: { alignSelf: 'center', gap: 8, maxWidth: 320, width: '100%', marginTop: 12 },
});
