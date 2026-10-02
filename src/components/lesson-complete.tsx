import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Flame } from '@/components/flame';
import { Button } from '@/components/ui';
import { success } from '@/lib/haptics';
import { clay, colors, font, gradients, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// LessonComplete — the beat between the last exercise and whatever comes next.
//
// A rosa clay badge presses in, and the moment it lands three things happen
// together, because they are one event: a ring ripples out, a handful of
// pastel bits burst from behind it, and the phone gives a success tap. Then
// the check draws itself — the badge is the "done", the stroke is the proof.
// The words follow 90ms apart, so the eye reads them as a sequence.
//
// The burst plays once; nothing loops. This screen is seen after every lesson,
// so it has to stay short enough not to feel like a toll.
//
// Nothing here is on a timer. She leaves when she taps — either home, or into
// the streak celebration if this was the first lesson of the day.
// ---------------------------------------------------------------------------

/** Strong ease-out: all of the movement is spent in the first third. */
const EASE = Easing.bezier(0.23, 1, 0.32, 1);
/** A small overshoot for the badge landing, so it feels pressed, not placed. */
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
const STEP = 90;

const BADGE = 112;
const LAND = 260; // when the badge has landed and the burst fires
const CHECK = 'M36 58 L51 73 L78 43';
const CHECK_LEN = 64;

// Rotated so it doesn't read as boilerplate on lesson thirty.
const CHEERS = ['Nice work!', 'Nailed it!', 'Great job!', 'Well done!', 'Look at you!'];

// Fixed rather than random so the burst has a shape: twelve bits, evenly
// around, alternating near and far so it never reads as a perfect ring.
const BITS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
  const far = i % 3 === 0 ? 118 : i % 3 === 1 ? 96 : 84;
  const hues = [pastel.peach, pastel.sage, pastel.butter, pastel.lav, pastel.sky, pastel.flame];
  return {
    x: Math.cos(angle) * far,
    y: Math.sin(angle) * far,
    spin: (i % 2 ? 1 : -1) * (120 + i * 14),
    color: hues[i % hues.length],
    pill: i % 2 === 0,
  };
});

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

function Bit({ bit, burst }: { bit: (typeof BITS)[number]; burst: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = burst.value;
    return {
      // Fully there for the first half of the flight, then gone by the end.
      opacity: t < 0.5 ? Math.min(1, t * 6) : 1 - (t - 0.5) * 2,
      transform: [
        { translateX: bit.x * t },
        // A little gravity: the bits drift down as they slow.
        { translateY: bit.y * t + 18 * t * t },
        { rotate: `${bit.spin * t}deg` },
        { scale: 1 - 0.3 * t },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bit, bit.pill ? styles.pill : styles.dot, { backgroundColor: bit.color }, style]}
    />
  );
}

export function LessonComplete({
  /** Shown only when the streak celebration is not about to say it better. */
  streak,
  onNext,
}: {
  streak: number | null;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);

  const badgeIn = useSharedValue(0);
  const badgeScale = useSharedValue(reduced ? 1 : 0.7);
  const ripple = useSharedValue(0);
  const burst = useSharedValue(0);
  const draw = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    badgeIn.value = withTiming(1, { duration: 180, easing: EASE });
    if (reduced) {
      success();
      return;
    }
    badgeScale.value = withTiming(1, { duration: LAND, easing: POP });
    ripple.value = withDelay(LAND - 40, withTiming(1, { duration: 620, easing: EASE }));
    burst.value = withDelay(LAND - 40, withTiming(1, { duration: 760, easing: EASE }));
    draw.value = withDelay(LAND + 40, withTiming(1, { duration: 300, easing: EASE }));
    const t = setTimeout(success, LAND);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeIn.value,
    transform: [{ scale: badgeScale.value }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: ripple.value === 0 ? 0 : 0.5 * (1 - ripple.value),
    transform: [{ scale: 1 + 0.7 * ripple.value }],
  }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - draw.value) }));

  const eyebrow = useEntrance(LAND + 40, 10);
  const title = useEntrance(LAND + 40 + STEP, 10);
  const line = useEntrance(LAND + 40 + STEP * 2, 10);
  const action = useEntrance(LAND + 40 + STEP * (streak ? 3 : 2), 10);

  return (
    <View style={styles.wrap}>
      <View style={styles.stage} accessible={false}>
        {reduced ? null : BITS.map((b, i) => <Bit key={i} bit={b} burst={burst} />)}
        <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
        <Animated.View style={[styles.badge, badgeStyle]}>
          <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, styles.badgeFace]} />
          <Svg width={BADGE} height={BADGE} viewBox={`0 0 ${BADGE} ${BADGE}`}>
            <AnimatedPath
              d={CHECK}
              stroke={colors.onPrimary}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={CHECK_LEN}
              animatedProps={checkProps}
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.eyebrow, eyebrow]}>{cheer}</Animated.Text>
      <Animated.Text style={[styles.title, title]}>Lesson complete!</Animated.Text>

      {streak ? (
        <Animated.View style={[styles.streakRow, line]}>
          <Flame size={22} />
          <Text style={styles.streak}>
            {streak} day{streak === 1 ? '' : 's'} in a row
          </Text>
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.actions, action]}>
        <Button title="Keep going" onPress={onNext} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  // Room for the burst to fly without being clipped by the words below.
  stage: { width: 260, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.button,
  },
  // Rounded on the gradient itself, not clipped on the badge: clipping would
  // swallow the clay shadow too.
  badgeFace: { borderRadius: BADGE / 2 },
  ripple: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  bit: { position: 'absolute' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pill: { width: 7, height: 16, borderRadius: 4 },
  eyebrow: { ...font.display[800], fontSize: 18, color: colors.accent, letterSpacing: -0.2 },
  title: { ...font.display[800], fontSize: 30, lineHeight: 34, letterSpacing: -0.5, color: colors.ink, textAlign: 'center' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streak: { ...font.body[800], fontSize: 18, color: colors.primary },
  // `stretch` would override the wrap's centring, and maxWidth then leaves the
  // button pinned to the left edge. Centre it explicitly.
  actions: { alignSelf: 'center', gap: 8, maxWidth: 320, width: '100%', marginTop: 12 },
});
