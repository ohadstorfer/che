import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui';
import { colors, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The reward screen for keeping the streak alive, ported from the choreography
// we used in the "che" app: the card lands, the flame pops and then breathes,
// yesterday's number slides up and out while today's rises to replace it, a +1
// drops in, and finally today's dot on the week strip fills.
//
// Timings are deliberately staggered — each beat lands after the eye has
// finished the previous one, so it reads as a sequence rather than a flash.
// ---------------------------------------------------------------------------

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const NUMBER_TRAVEL = 84;

/** Monday-first index of today. */
function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

// The native driver can't run on web, and animating there is still smooth
// because react-native-web compiles these to compositor-friendly transforms.
const NATIVE = Platform.OS !== 'web';

export function StreakCelebration({
  previous,
  streak,
  onDone,
}: {
  previous: number;
  streak: number;
  onDone: () => void;
}) {
  const today = todayIndex();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardShift = useRef(new Animated.Value(14)).current;
  const cardScale = useRef(new Animated.Value(0.98)).current;

  const flameOpacity = useRef(new Animated.Value(0)).current;
  const flamePop = useRef(new Animated.Value(0.6)).current;
  const flameFlicker = useRef(new Animated.Value(1)).current;
  const flameSway = useRef(new Animated.Value(0)).current;
  const flameLift = useRef(new Animated.Value(0)).current;

  const oldOpacity = useRef(new Animated.Value(1)).current;
  const oldShift = useRef(new Animated.Value(0)).current;
  const newOpacity = useRef(new Animated.Value(0)).current;
  const newShift = useRef(new Animated.Value(NUMBER_TRAVEL)).current;

  const plusScale = useRef(new Animated.Value(0)).current;
  const plusShift = useRef(new Animated.Value(-38)).current;
  const plusSpin = useRef(new Animated.Value(-15)).current;

  const dotScale = useRef(new Animated.Value(0)).current;
  const dotFill = useRef(new Animated.Value(0)).current;

  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loops: Animated.CompositeAnimation[] = [];

    const settleInstantly = () => {
      // Reduced motion: everything simply is where it ends up, no travel.
      [cardOpacity, flameOpacity, oldOpacity, newOpacity, actionsOpacity].forEach((v) =>
        v.setValue(1),
      );
      oldOpacity.setValue(0);
      [cardShift, oldShift, newShift, plusShift, plusSpin].forEach((v) => v.setValue(0));
      [cardScale, flamePop, plusScale, dotScale, dotFill].forEach((v) => v.setValue(1));
    };

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) {
        settleInstantly();
        return;
      }

      const timing = (
        value: Animated.Value,
        toValue: number,
        duration: number,
        delay = 0,
        easing: (v: number) => number = Easing.out(Easing.cubic),
      ) =>
        Animated.timing(value, {
          toValue,
          duration,
          delay,
          easing,
          useNativeDriver: NATIVE,
        });

      // 1. The card arrives.
      Animated.parallel([
        timing(cardOpacity, 1, 520, 120),
        timing(cardShift, 0, 560, 120),
        timing(cardScale, 1, 560, 120),
      ]).start();

      // 2. The flame pops...
      Animated.parallel([
        timing(flameOpacity, 1, 240, 260),
        Animated.sequence([
          Animated.delay(260),
          timing(flamePop, 1.14, 420, 0, Easing.bezier(0.2, 0.9, 0.2, 1.05)),
          timing(flamePop, 1, 340),
        ]),
      ]).start();

      // 3. ...and then breathes forever: three overlapping loops at different
      //    periods so the motion never visibly repeats.
      const breathe = (
        value: Animated.Value,
        frames: [number, number][],
      ): Animated.CompositeAnimation =>
        Animated.loop(
          Animated.sequence(
            frames.map(([to, duration]) =>
              Animated.timing(value, {
                toValue: to,
                duration,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: NATIVE,
              }),
            ),
          ),
        );

      const startBreathing = setTimeout(() => {
        loops = [
          breathe(flameFlicker, [
            [1.04, 900],
            [0.97, 1000],
            [1.03, 850],
            [0.98, 950],
          ]),
          breathe(flameSway, [
            [-4, 1800],
            [4, 1900],
            [-2, 1600],
            [2, 1700],
          ]),
          breathe(flameLift, [
            [-3, 1300],
            [0, 1250],
            [-1.5, 1100],
            [0, 1200],
          ]),
        ];
        loops.forEach((l) => l.start());
      }, 1100);

      // 4. The number swaps: the old one leaves upward, the new one follows it in.
      Animated.parallel([
        timing(oldOpacity, 0, 700, 780),
        timing(oldShift, -NUMBER_TRAVEL, 780, 780, Easing.bezier(0.4, 0, 0.2, 1)),
        timing(newOpacity, 1, 560, 780),
        timing(newShift, 0, 820, 780, Easing.bezier(0.2, 0.9, 0.2, 1.05)),
      ]).start();

      // 5. The +1 drops in and settles.
      Animated.parallel([
        Animated.sequence([
          Animated.delay(1080),
          timing(plusScale, 1.18, 330, 0, Easing.bezier(0.2, 0.9, 0.2, 1.4)),
          timing(plusScale, 1, 150),
        ]),
        timing(plusShift, 0, 380, 1080, Easing.bezier(0.2, 0.9, 0.2, 1.4)),
        Animated.sequence([
          Animated.delay(1080),
          timing(plusSpin, 8, 240),
          timing(plusSpin, 0, 240),
        ]),
      ]).start();

      // 6. Today's dot bounces in, then fills in.
      Animated.sequence([
        Animated.delay(1300),
        timing(dotScale, 1.18, 340, 0, Easing.bezier(0.2, 0.9, 0.2, 1.4)),
        timing(dotScale, 1, 180),
      ]).start();
      timing(dotFill, 1, 620, 1900).start();

      timing(actionsOpacity, 1, 400, 2100).start();
    });

    return () => loops.forEach((l) => l.stop());
  }, []);

  const flameStyle = {
    opacity: flameOpacity,
    transform: [
      { translateY: flameLift },
      {
        rotate: flameSway.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
      { scale: Animated.multiply(flamePop, flameFlicker) },
    ],
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.intro}>
        <Text style={styles.headline}>Sumaste</Text>
        <Text style={styles.headlineAccent}>otro día.</Text>
        <Text style={styles.subhead}>
          Llevás más tiempo del que pensás. Ya es una costumbre.
        </Text>
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardShift }, { scale: cardScale }],
          },
        ]}>
        {/* +1 */}
        <Animated.View
          style={[
            styles.plus,
            {
              transform: [
                { translateY: plusShift },
                { scale: plusScale },
                {
                  rotate: plusSpin.interpolate({
                    inputRange: [-20, 20],
                    outputRange: ['-20deg', '20deg'],
                  }),
                },
              ],
            },
          ]}>
          {/* Usually +1; a recovered streak leaps by the whole thawed run. */}
          <Text style={styles.plusText}>+{Math.max(streak - previous, 1)}</Text>
        </Animated.View>

        <View style={styles.flameSlot}>
          <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        </View>

        {/* The number swap happens inside a clipped window. */}
        <View style={styles.numberWindow}>
          <Animated.Text
            style={[
              styles.number,
              styles.numberAbsolute,
              { opacity: oldOpacity, transform: [{ translateY: oldShift }] },
            ]}>
            {previous}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.number,
              styles.numberAbsolute,
              { opacity: newOpacity, transform: [{ translateY: newShift }] },
            ]}>
            {streak}
          </Animated.Text>
        </View>

        <Text style={styles.caption}>
          {streak === 1 ? 'DÍA SEGUIDO' : 'DÍAS SEGUIDOS'}
        </Text>

        {/* Week strip */}
        <View style={styles.week}>
          {DAY_LABELS.map((label, i) => {
            const isToday = i === today;
            const filled = !isToday && i < today && today - i <= streak - 1;
            return (
              <View key={i} style={styles.day}>
                {isToday ? (
                  <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]}>
                    <View style={[styles.dotFace, styles.dotEmpty]} />
                    <Animated.View
                      style={[
                        styles.dotFace,
                        styles.dotOn,
                        { opacity: dotFill },
                      ]}
                    />
                  </Animated.View>
                ) : (
                  <View
                    style={[styles.dotStatic, filled ? styles.dotOn : styles.dotEmpty]}
                  />
                )}
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />

      {/* One door out: the map is where another round is offered, and going
          back to it is what shows her the step she just earned. */}
      <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
        <Button title="Yala!" onPress={onDone} />
      </Animated.View>
    </View>
  );
}

const DOT = 22;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  intro: { marginTop: 18, gap: 3 },
  headline: { fontSize: 34, fontWeight: '700', color: colors.ink, letterSpacing: -0.8 },
  headlineAccent: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.8,
  },
  subhead: { fontSize: 15, color: colors.muted, marginTop: 10, lineHeight: 21 },

  card: {
    marginTop: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
    ...shadow.raised,
  },
  plus: {
    position: 'absolute',
    top: 14,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  plusText: { color: colors.onPrimary, fontSize: 13, fontWeight: '800' },

  flameSlot: { height: 108, alignItems: 'center', justifyContent: 'center' },
  flame: { fontSize: 76, lineHeight: 92 },

  numberWindow: {
    height: NUMBER_TRAVEL,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  numberAbsolute: { position: 'absolute' },
  number: {
    fontSize: 78,
    lineHeight: 84,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -3,
  },
  caption: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.muted,
    marginTop: 10,
  },

  week: {
    marginTop: 20,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  day: { alignItems: 'center', gap: 6, flex: 1 },
  dot: { width: DOT, height: DOT },
  // Today's dot layers an empty ring and a rose fill that cross-fades on top;
  // the other days are a single flat circle.
  dotFace: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    position: 'absolute',
  },
  dotStatic: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 1.5 },
  dotEmpty: { borderColor: colors.border, backgroundColor: 'transparent' },
  dotOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayLabel: { fontSize: 11, color: colors.faint, fontWeight: '600', letterSpacing: 1.2 },

  actions: { gap: 8, marginTop: 24 },
});
