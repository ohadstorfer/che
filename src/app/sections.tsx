import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { type Course, currentIndex, loadCourse, loadProgress, sectionSummaries, type SectionSummary } from '@/lib/course';
import { goBack } from '@/lib/nav';
import { maxUnitsInTest } from '@/lib/placement';
import { SECTION_CAN_DO } from '@/lib/sections';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, press, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The course as a map of sections, the way Duolingo lays it out: one card per
// section with how far she is through it and which units it spans. The path on
// Home holds a single section; this is where she sees all of them and moves
// between them. The section she is in is the one card in green, with what it
// lets her say in a speech bubble and the only primary button on the screen.
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

  const open = (s: SectionSummary) => router.navigate({ pathname: '/home', params: { section: String(s.section.id) } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => goBack('/home')}
          hitSlop={10}
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.close, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
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
    </SafeAreaView>
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
          <Text style={[styles.eyebrow, current && styles.onPrimaryMuted]}>SECTION {section.ordinal}</Text>
          <Text style={[styles.title, current && styles.onPrimary, locked && styles.lockedText]} numberOfLines={1}>
            {section.title_en}
          </Text>
        </View>
        <View style={[styles.chip, current && styles.chipCurrent]}>
          <Text style={[styles.chipText, current && styles.onPrimary]}>{range}</Text>
        </View>
      </View>

      {locked ? (
        <View style={styles.lockedRow}>
          <Ionicons name="lock-closed" size={15} color={colors.faint} />
          <Text style={styles.lockedLabel}>{section.cefr} · {units.length} units</Text>
          {jump ? (
            <Pressable
              onPress={jump}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Jump to section ${section.ordinal}`}
              style={({ pressed }) => [styles.jump, { transform: [{ scale: pressed ? 0.95 : 1 }] }, webPress]}>
              <Ionicons name="play-skip-forward" size={12} color={colors.primaryDark} />
              <Text style={styles.jumpText}>Jump here</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.progressRow}>
          <View style={[styles.track, current && styles.trackCurrent]}>
            <View
              style={[
                styles.fill,
                current && styles.fillCurrent,
                { width: `${Math.max(share, done > 0 ? 0.04 : 0) * 100}%` },
              ]}
            />
          </View>
          {state === 'done' ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          ) : (
            <Text style={[styles.count, styles.onPrimaryMuted]}>
              {done}/{lessons}
            </Text>
          )}
        </View>
      )}

      {current ? (
        <View style={styles.continue}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
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
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
        webPress,
      ]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 14, paddingBottom: 48, width: '100%', maxWidth: 560, alignSelf: 'center' },

  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
    ...shadow.card,
  },
  cardCurrent: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  cardLocked: { backgroundColor: colors.bg, shadowOpacity: 0, elevation: 0 },

  bubbleRow: { flexDirection: 'row' },
  bubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleText: { fontSize: 16, lineHeight: 22, color: colors.ink },
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
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: colors.faint },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  lockedText: { color: colors.muted },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipCurrent: { backgroundColor: 'rgba(241, 238, 230, 0.16)', borderColor: 'rgba(241, 238, 230, 0.28)' },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.muted },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  trackCurrent: { backgroundColor: 'rgba(241, 238, 230, 0.22)' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  fillCurrent: { backgroundColor: colors.onPrimary },
  count: { fontSize: 13, fontWeight: '700', minWidth: 44, textAlign: 'right' },

  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lockedLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.faint },
  jump: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  jumpText: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },

  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.onPrimary,
  },
  continueText: { fontSize: 16, fontWeight: '800', color: colors.primary },

  onPrimary: { color: colors.onPrimary },
  onPrimaryMuted: { color: colors.onPrimary, opacity: 0.78 },
});
