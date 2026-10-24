import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { clay, colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// RoundStats — what the round was, in three tiles under the end screen's
// headline: how much of it she got right first time, how long it took, and
// how many words it went over. The numbers are the reward Duolingo ends on;
// "Lesson complete!" says it happened, these say how it went.
//
// Each tile wears its own pastel as a header band, and the label in it says
// something about the number rather than only naming it — "Perfect" at 100%,
// "Speedy" under two minutes — which is what makes it worth a glance.
// ---------------------------------------------------------------------------

export interface RoundStatsData {
  /** First-try answers right, 0–100; null when nothing was graded. */
  accuracy: number | null;
  /** From the first exercise on screen to the last answer. */
  seconds: number;
  /** Words the round asked about. */
  words: number;
  /** Of those, the ones she met for the first time. */
  newWords: number;
}

const EASE = Easing.bezier(0.23, 1, 0.32, 1);
/** Between one tile and the next: read as a row arriving, not three at once. */
const STAGGER = 70;

/** The cheer a round's accuracy earns, for the line above the title. */
export const accuracyCheer = (accuracy: number | null) =>
  accuracy === 100 ? 'Perfect lesson!' : accuracy != null && accuracy >= 90 ? 'Amazing!' : null;

export function RoundStats({ stats, delay = 0 }: { stats: RoundStatsData; delay?: number }) {
  const { accuracy, seconds, words, newWords } = stats;
  const accuracyLabel = accuracy === 100 ? 'Perfect' : accuracy != null && accuracy >= 90 ? 'Amazing' : 'Accuracy';
  const timeLabel = seconds > 0 && seconds < 120 ? 'Speedy' : 'Time';
  const tiles: Tile[] = [
    ...(accuracy != null
      ? [{ label: accuracyLabel, value: `${accuracy}%`, icon: 'locate' as const, tint: pastel.sage }]
      : []),
    { label: timeLabel, value: clock(seconds), icon: 'stopwatch' as const, tint: pastel.sky },
    newWords > 0
      ? { label: 'New words', value: `${newWords}`, icon: 'sparkles' as const, tint: pastel.butter }
      : { label: 'Words', value: `${words}`, icon: 'book' as const, tint: pastel.butter },
  ];
  return (
    <View style={styles.row} accessibilityRole="summary">
      {tiles.map((tile, i) => (
        <StatTile key={tile.label} tile={tile} delay={delay + i * STAGGER} />
      ))}
    </View>
  );
}

type Tile = { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>['name']; tint: string };

function StatTile({ tile, delay }: { tile: Tile; delay: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: reduced ? 160 : 320, easing: EASE })));
  }, [delay, reduced, t]);
  // Rises a little and settles from 0.94: a tile arriving, not one appearing.
  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: reduced ? [] : [{ translateY: 10 * (1 - t.get()) }, { scale: 0.94 + 0.06 * t.get() }],
  }));
  return (
    <Animated.View
      style={[styles.tile, { backgroundColor: tile.tint }, style]}
      accessible
      accessibilityLabel={`${tile.label}: ${tile.value}`}>
      <Text style={styles.label} numberOfLines={1}>
        {tile.label}
      </Text>
      <View style={styles.body}>
        <Ionicons name={tile.icon} size={18} color={colors.ink} />
        <Text style={styles.value} numberOfLines={1}>
          {tile.value}
        </Text>
      </View>
    </Animated.View>
  );
}

/** "0:48", "3:12", "12:05". */
function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  // As wide as the button under it, so the two read as one column.
  row: { flexDirection: 'row', gap: 8, width: '100%', maxWidth: 320, marginTop: 8 },
  tile: {
    flex: 1,
    borderRadius: radius.md,
    paddingTop: 6,
    paddingHorizontal: 3,
    paddingBottom: 3,
    boxShadow: clay.surface,
  },
  label: {
    ...font.body[800],
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 5,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md - 3,
    backgroundColor: colors.card,
  },
  value: { ...font.display[800], fontSize: 20, color: colors.ink, fontVariant: ['tabular-nums'] },
});
