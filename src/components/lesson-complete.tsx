import { Image } from 'expo-image';
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

import { Button } from '@/components/ui';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// LessonComplete — the beat between the last exercise and whatever comes next.
//
// The clip carries the whole screen, so it lands first and the words follow it
// in: 90ms apart is enough for the eye to read them as a sequence rather than
// as one flash, and short enough that the button is tappable before anyone
// thinks to reach for it.
//
// Nothing here is on a timer. She leaves when she taps — either home, or into
// the streak celebration if this was the first lesson of the day.
// ---------------------------------------------------------------------------

const CLIP = require('@/assets/videos/shawarma-finish.webp');

/** Strong ease-out: all of the movement is spent in the first third. */
const EASE = Easing.bezier(0.23, 1, 0.32, 1);
const STEP = 90;

function useEntrance(delay: number, travel: number) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: reduced ? 160 : 320, easing: EASE }));
  }, [delay, reduced, t]);

  return useAnimatedStyle(() => ({
    opacity: t.value,
    // Reduced motion keeps the fade — it explains the change — and drops the
    // movement, which is the part that makes people ill.
    transform: reduced ? [] : [{ translateY: travel * (1 - t.value) }],
  }));
}

export function LessonComplete({
  /** Shown only when the streak celebration is not about to say it better. */
  streak,
  onNext,
}: {
  streak: number | null;
  onNext: () => void;
}) {
  const clip = useEntrance(0, 12);
  const title = useEntrance(STEP, 10);
  const line = useEntrance(STEP * 2, 10);
  const action = useEntrance(STEP * (streak ? 3 : 2), 10);

  return (
    <View style={styles.wrap}>
      <Animated.View style={clip}>
        <Image source={CLIP} style={styles.clip} contentFit="contain" accessible={false} />
      </Animated.View>

      <Animated.Text style={[styles.title, title]}>Lección completa!</Animated.Text>

      {streak ? (
        <Animated.Text style={[styles.streak, line]}>
          🔥 Racha: {streak} {streak === 1 ? 'día' : 'días'}
        </Animated.Text>
      ) : null}

      <Animated.View style={[styles.actions, action]}>
        <Button title="Dale!" onPress={onNext} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  clip: { width: 260, height: 260 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  streak: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  // `stretch` would override the wrap's centring, and maxWidth then leaves the
  // button pinned to the left edge. Centre it explicitly.
  actions: { alignSelf: 'center', gap: 8, maxWidth: 320, width: '100%', marginTop: 8 },
});
