import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { type Course, currentIndex, loadCourse, loadProgress, sectionSummaries, type SectionSummary } from '@/lib/course';
import { goBack } from '@/lib/nav';
import { maxUnitsInTest } from '@/lib/placement';
import { SECTION_CAN_DO } from '@/lib/sections';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, gradients, pastelGrad, path, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The course as a map of sections, the way Duolingo lays it out: one card per
// section with how far she is through it and which units it spans. The path on
// Home holds a single section; this is where she sees all of them and moves
// between them. The section she is in is the one card in salvia clay, with what
// it lets her say in a speech bubble and the only primary button on the screen.
// Finished sections open straight onto their road; the ones ahead stay locked
// unless a jump test can reach them in one sitting.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

interface Data {
  course: Course;
  current: number;
}

export default function SectionsScreen() {
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
  const [data, setData] = useState<Data | null>(null);

  // The map of sections drops down from above, like a blind pulled over the
  // road, and goes back up the way it came. The stack shows it with no
  // animation of its own over a see-through backdrop; the motion is ours.
  // Strong ease-out in, a quicker ease-in out; reduced motion just fades.
  const { height } = useWindowDimensions();
  // Insets from the hook, not SafeAreaView: that one measures where it sits,
  // and it first sits a screen above the notch, so it would pad nothing.
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withTiming(1, { duration: reduced ? 180 : 420, easing: Easing.bezier(0.23, 1, 0.32, 1) });
  }, [shown, reduced]);
  const sheet = useAnimatedStyle(() =>
    reduced ? { opacity: shown.value } : { transform: [{ translateY: (shown.value - 1) * height }] },
  );
  const leave = (then: () => void) => {
    shown.value = withTiming(0, { duration: reduced ? 150 : 280, easing: Easing.bezier(0.55, 0, 1, 0.45) }, (done) => {
      if (done) runOnJS(then)();
    });
  };

  useEffect(() => {
    if (!profile) return;
    Promise.all([loadCourse(), loadProgress(profile.id)]).then(([course, done]) =>
      setData({ course, current: currentIndex(course.path, done) }),
    );
  }, [profile]);

  const summaries = data ? sectionSummaries(data.course, data.current) : [];
  const here = summaries.find((s) => s.state === 'current') ?? null;

  // A section ahead can be tested into when the test stays one sitting long:
  // the same rule as a jump from the path (learning-engine-spec §7).
  const jumpTarget = (s: SectionSummary) => {
    if (!here || s.state !== 'locked' || !data) return null;
    const hereUnit = data.course.path[data.current]?.unit;
    const target = s.units[0];
    if (!hereUnit || !target) return null;
    const span = data.course.units.filter(
      (u) => u.course_order >= hereUnit.course_order && u.course_order < target.course_order,
    ).length;
    return span > 0 && span <= maxUnitsInTest() ? target : null;
  };

  const open = (s: SectionSummary) =>
    leave(() => router.dismissTo({ pathname: '/home', params: { section: String(s.section.id) } }));

  return (
    <Animated.View style={[styles.sheet, sheet]}>
      <View style={[styles.safe, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => leave(() => goBack('/home'))}
            hitSlop={10}
            accessibilityLabel="Close"
            style={({ pressed }) => [styles.close, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
          <Text style={styles.topTitle} accessibilityRole="header">
            Rioplatense Spanish
          </Text>
          <View style={styles.close} />
        </View>

        {!data ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {summaries.map((s) => (
              <SectionCard
                key={s.section.id}
                summary={s}
                onOpen={s.state === 'locked' ? undefined : () => open(s)}
                jump={(() => {
                  const target = jumpTarget(s);
                  return target ? () => router.push(`/practice?test=jump&to=${target.id}`) : undefined;
                })()}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );
}

function SectionCard({
  summary,
  onOpen,
  jump,
}: {
  summary: SectionSummary;
  onOpen?: () => void;
  jump?: () => void;
}) {
  const { section, units, lessons, done, state } = summary;
  const current = state === 'current';
  const locked = state === 'locked';
  const first = units[0]?.course_order;
  const last = units[units.length - 1]?.course_order;
  const range = first == null ? '' : first === last ? `Unit ${first}` : `Units ${first} to ${last}`;
  const canDo = SECTION_CAN_DO[section.slug];
  const share = lessons ? done / lessons : 0;

  const label = `Section ${section.ordinal}, ${section.title_en}. ${range}. ${
    state === 'done' ? 'Finished' : locked ? 'Locked' : `${done} of ${lessons} lessons done`
  }`;
  const body = (
    <>
      {current ? (
        <LinearGradient pointerEvents="none" colors={pastelGrad.sage} style={StyleSheet.absoluteFill} />
      ) : null}
      {current && canDo ? (
        <View style={styles.bubbleRow}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{canDo}</Text>
            <View style={styles.bubbleTail} />
          </View>
        </View>
      ) : null}

      <View style={styles.cardHead}>
        <View style={styles.cardTitles}>
          <Text style={[styles.eyebrow, current && styles.onPastelMuted]}>SECTION {section.ordinal}</Text>
          <FitText style={[styles.title, locked && styles.lockedText]} lines={1}>
            {section.title_en}
          </FitText>
        </View>
        <View style={[styles.chip, current && styles.chipCurrent]}>
          <Text style={[styles.chipText, current && styles.onPastel]}>{range}</Text>
        </View>
      </View>

      {locked ? (
        <View style={styles.lockedRow}>
          <Ionicons name="lock-closed" size={15} color={path.lockedGlyph} />
          <Text style={styles.lockedLabel}>{section.cefr} · {units.length} units</Text>
          {jump ? (
            <Pressable
              onPress={jump}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Jump to section ${section.ordinal}`}
              style={({ pressed }) => [styles.jump, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
              <Ionicons name="play-skip-forward" size={12} color={colors.primaryDark} />
              <Text style={styles.jumpText}>Jump here</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(share, done > 0 ? 0.04 : 0) * 100}%` }]}>
              <LinearGradient pointerEvents="none" colors={gradients.deep} style={StyleSheet.absoluteFill} />
            </View>
          </View>
          {state === 'done' ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          ) : (
            <Text style={[styles.count, current && styles.onPastel]}>
              {done}/{lessons}
            </Text>
          )}
        </View>
      )}

      {current ? (
        <View style={styles.continue}>
          <LinearGradient pointerEvents="none" colors={gradients.deep} style={StyleSheet.absoluteFill} />
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
        </View>
      ) : null}
    </>
  );

  // A locked section isn't something to open, and its card holds a button of
  // its own (the jump), so it is a plain card rather than a pressable one.
  if (!onOpen) {
    return (
      <View style={[styles.card, locked && styles.cardLocked]} accessible={!jump} accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.card,
        current && styles.cardCurrent,
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...font.display[800], fontSize: 20, color: colors.ink, letterSpacing: -0.2 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 16, paddingBottom: 48, width: '100%', maxWidth: 560, alignSelf: 'center' },

  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: 20,
    gap: 14,
    // The gradient on the current card is clipped to the clay's corners.
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  cardCurrent: { backgroundColor: pastelGrad.sage[1] },
  /** Pressed flat into the page: no lift, nothing to open. */
  cardLocked: { backgroundColor: path.lockedFace, boxShadow: clay.flat },

  bubbleRow: { flexDirection: 'row' },
  bubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: clay.surface,
  },
  bubbleText: { ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.onPastel },
  // A small square turned on its corner: the bubble points down at the section
  // it is speaking for.
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    left: 22,
    width: 12,
    height: 12,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
  },

  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitles: { flex: 1, gap: 2 },
  eyebrow: { ...font.body[800], fontSize: 13, letterSpacing: 0.4, color: colors.muted },
  title: { ...font.display[800], fontSize: 26, lineHeight: 29, color: colors.ink, letterSpacing: -0.5 },
  lockedText: { color: colors.muted },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
  },
  chipCurrent: { backgroundColor: colors.chip, boxShadow: clay.surface },
  chipText: { ...font.body[800], fontSize: 12, color: colors.muted },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: {
    flex: 1,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  count: { ...font.body[800], fontSize: 13, color: colors.muted, minWidth: 44, textAlign: 'right' },

  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lockedLabel: { ...font.body[700], flex: 1, fontSize: 13, color: colors.muted },
  jump: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  jumpText: { ...font.body[800], fontSize: 12, color: colors.primaryDark },

  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    boxShadow: clay.button,
  },
  continueText: { ...font.body[800], fontSize: 16, color: colors.onPrimary },

  onPastel: { color: colors.onPastel },
  onPastelMuted: { color: colors.onPastel, opacity: 0.8 },
});
