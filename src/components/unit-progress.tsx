import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { type ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { LessonComplete } from '@/components/lesson-complete';
import { RoundStats, type RoundStatsData } from '@/components/round-stats';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { loadCourse, loadProgress } from '@/lib/course';
import { success } from '@/lib/haptics';
import { clay, colors, font, gradients, pastel } from '@/lib/theme';
import { unitArt } from '@/lib/unit-art';

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
  /** "Section 1 · Unit 2": where the unit sits in the course. */
  place: string;
  /** The unit's own picture. */
  art: ImageSourcePropType;
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
        const { unit, section } = own[0];
        setStanding({
          title: unit.title_en,
          place: `Section ${section.ordinal} · Unit ${unit.ordinal}`,
          art: unitArt(unit.slug),
          steps,
          done: count,
          total: own.length,
        });
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

export function UnitProgress({
  standing,
  stats,
  onNext,
}: {
  standing: UnitStanding;
  stats?: RoundStatsData;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const { title, place, art, steps, done, total } = standing;
  const left = total - done;

  useEffect(() => {
    const t = setTimeout(success, reduced ? 0 : LAND);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = useEntrance(0, 14);
  const line = useEntrance(STEP * 3, 10);
  const action = useEntrance(STEP * (stats ? 6 : 4), 10);

  const chip = left === 0 ? 'Unit done!' : `${left} to go`;
  const tail = left === 0 ? 'On to the next one' : left === 1 ? 'One more and it’s yours' : 'And the unit is yours';

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.card, card]}
        accessible
        accessibilityRole="header"
        accessibilityLabel={`${place}, ${title}. ${done} of ${total} classes done`}>
        <Image source={art} style={styles.art} contentFit="contain" accessible={false} />
        <View style={styles.place}>
          <Text style={styles.placeText}>{place}</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>
        <View style={styles.countRow}>
          <Text style={styles.count}>{done}</Text>
          <Text style={styles.total}>of {total} classes</Text>
        </View>
        <View style={styles.pips}>
          {steps.map((s, i) => (
            <Pip key={i} done={s.done} fresh={s.fresh} />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.line, line]}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{chip}</Text>
        </View>
        <Text style={styles.tail}>{tail}</Text>
      </Animated.View>

      {stats ? <RoundStats stats={stats} delay={STEP * 4} /> : null}

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
  stats,
  onNext,
}: {
  lessonId?: string | null;
  streak: number;
  /** This lesson moved the streak: the celebration follows. */
  celebrate: boolean;
  /** How the round went: tiles under the headline, on either screen. */
  stats?: RoundStatsData;
  onNext: () => void;
}) {
  const standing = useUnitStanding(lessonId, !celebrate);
  // A blank beat while her progress is read, rather than one screen swapped for another.
  if (standing === undefined) return null;
  if (standing) return <UnitProgress standing={standing} stats={stats} onNext={onNext} />;
  return <LessonComplete streak={celebrate || streak <= 0 ? null : streak} stats={stats} onNext={onNext} />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, padding: 24, paddingTop: 72 },
  /** The unit as a sticker: peach, the thick ink outline, the hard shadow. */
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: pastel.peach,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: colors.ink,
    boxShadow: `5px 5px 0 ${colors.ink}`,
    padding: 22,
    paddingBottom: 24,
    gap: 12,
  },
  /** The unit's picture, stuck on the card's corner and spilling over it. */
  art: { position: 'absolute', right: -14, top: -62, width: 140, height: 140, transform: [{ rotate: '6deg' }] },
  place: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  placeText: { ...font.body[800], fontSize: 13, color: colors.ink },
  title: { ...font.display[900], fontSize: 27, lineHeight: 31, letterSpacing: -0.4, color: colors.ink, maxWidth: 215 },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  count: {
    ...font.display[900],
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  total: { ...font.display[800], fontSize: 24, letterSpacing: -0.4, color: colors.inkOnWash },
  pips: { flexDirection: 'row', gap: 5 },
  pip: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  pipFill: { borderRadius: 6 },
  pipFace: { borderRadius: 6 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  chip: {
    backgroundColor: pastel.butter,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    boxShadow: `3px 3px 0 ${colors.ink}`,
  },
  chipText: { ...font.display[800], fontSize: 18, color: colors.ink },
  tail: { ...font.body[700], fontSize: 16, color: colors.muted },
  // `stretch` would override the wrap's centring, and maxWidth then leaves the
  // button pinned to the left edge. Centre it explicitly.
  actions: { alignSelf: 'center', gap: 8, maxWidth: 360, width: '100%', marginTop: 8 },
});
