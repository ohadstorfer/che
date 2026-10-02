import { Image, type ImageSource } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { Flame } from '@/components/flame';
import { Button } from '@/components/ui';
import { success } from '@/lib/haptics';
import { colors, font, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The reward screen for keeping the streak alive, framed in filete porteño:
// the painted frames on Buenos Aires colectivos and shop signs.
//
// The frame draws itself first — the rosa border, then the durazno one inside
// it, then the corner curls in pairs, then the crown on top — so the eye
// follows the brush. When the frame closes, the flame and today's count pop
// into the middle (with a success tap) and the capybara arrives, then the
// banner unrolls, then the words and the button.
//
// The capybara has four ways in, and the count picks which: consecutive days
// never repeat, and the same day always plays the same one.
//
//   goal      cheering in the jersey, rising from behind the banner
//   flag      beside the sign, waving the flag over it
//   serenade  at the corner, strumming, notes floating up to the count
//   mate      dropping onto the top of the sign and settling in
//
// Strokes are drawn once and left alone. Everything after that moves by
// transform only — the capybara is one image, never redrawn — so it all runs
// on the UI thread.
// ---------------------------------------------------------------------------

/** Strong ease-out: all of the movement is spent in the first third. */
const EASE = Easing.bezier(0.23, 1, 0.32, 1);
/** A small overshoot, so things land rather than appear. */
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
const SWING = Easing.inOut(Easing.sin);

const DRAW = 1100;
const LAND = 900; // the frame is closed; the count pops in
const BANNER = 1300;
const WORDS = 1500;

// The frame is drawn in a 240 × 270 box and scaled to each variant's width.
const BOX_W = 240;
const BOX_H = 270;

// Dash lengths at least as long as each stroke, so offset = length hides it.
const STROKES = [
  { kind: 'rect', x: 20, y: 20, w: 200, h: 210, r: 30, color: colors.primary, width: 5, len: 780, delay: 0 },
  { kind: 'rect', x: 32, y: 32, w: 176, h: 186, r: 22, color: pastel.peach, width: 3, len: 700, delay: 120 },
  { kind: 'path', d: 'M44 66 C44 48 60 40 72 46 C82 51 80 64 70 64 C63 64 62 56 67 55', color: colors.success, width: 4, len: 140, delay: 300 },
  { kind: 'path', d: 'M196 66 C196 48 180 40 168 46 C158 51 160 64 170 64 C177 64 178 56 173 55', color: colors.success, width: 4, len: 140, delay: 300 },
  { kind: 'path', d: 'M44 184 C44 202 60 210 72 204 C82 199 80 186 70 186 C63 186 62 194 67 195', color: pastel.lav, width: 4, len: 140, delay: 420 },
  { kind: 'path', d: 'M196 184 C196 202 180 210 168 204 C158 199 160 186 170 186 C177 186 178 194 173 195', color: pastel.lav, width: 4, len: 140, delay: 420 },
  { kind: 'path', d: 'M96 40 C108 30 132 30 144 40', color: pastel.butter, width: 5, len: 80, delay: 520 },
] as const;

const RIBBON = 'M30 222 L50 214 L190 214 L210 222 L190 230 L190 252 L50 252 L50 230 Z';

type Motion = 'goal' | 'flag' | 'serenade' | 'mate';

interface Variant {
  motion: Motion;
  source: ImageSource;
  /** The figure's width ÷ height. */
  aspect: number;
  /** Frame width in points. */
  frame: number;
  /** Room left around the frame for the capybara, so it stays on screen. */
  room: ViewStyle;
  /** The capybara, as fractions of the frame: width and left of its width,
   *  bottom of its height. Negative reaches outside. */
  capy: { width: number; left: number; bottom: number; origin: string };
  /** The count's box, as fractions of the frame's height, and its sizes in box units. */
  count: { row: boolean; top: number; height: number; flame: number; number: number };
}

const COUNT_DEFAULT = { row: false, top: 0.21, height: 0.52, flame: 54, number: 60 };

const VARIANTS: Variant[] = [
  {
    motion: 'goal',
    source: require('@/assets/images/capybara/capybara-futbol-gol-figure.webp'),
    aspect: 312 / 384,
    frame: 250,
    room: {},
    capy: { width: 0.46, left: 0.27, bottom: 0.13, origin: 'bottom' },
    // The capybara takes the middle, so the count moves up into a row.
    count: { row: true, top: 0.11, height: 0.24, flame: 40, number: 46 },
  },
  {
    motion: 'flag',
    source: require('@/assets/images/capybara/capybara-historia-figure.webp'),
    aspect: 282 / 384,
    frame: 200,
    room: { marginLeft: 76 },
    capy: { width: 0.66, left: -0.4, bottom: -0.04, origin: '40% 100%' },
    count: { ...COUNT_DEFAULT, number: 54 },
  },
  {
    motion: 'serenade',
    source: require('@/assets/images/capybara/capybara-musica-figure.webp'),
    aspect: 343 / 384,
    frame: 200,
    room: { marginRight: 76 },
    capy: { width: 0.64, left: 0.8, bottom: -0.06, origin: 'bottom' },
    count: { ...COUNT_DEFAULT, number: 54 },
  },
  {
    motion: 'mate',
    source: require('@/assets/images/capybara/capybara-mate-figure.webp'),
    aspect: 280 / 384,
    frame: 210,
    room: { marginTop: 108 },
    capy: { width: 0.52, left: 0.26, bottom: 0.82, origin: 'bottom' },
    count: { ...COUNT_DEFAULT, number: 54 },
  },
];

// Notes float up and left out of the guitar, staggered: [delay, dx, dy, spin, colour].
const NOTES = [
  [1300, -70, -120, -18, colors.primary],
  [1550, -30, -150, 14, colors.accent],
  [1800, -95, -95, -10, colors.success],
  [2050, -50, -170, 20, pastel.lav],
] as const;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

function Stroke({ stroke, reduced }: { stroke: (typeof STROKES)[number]; reduced: boolean }) {
  const drawn = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    drawn.value = withDelay(stroke.delay, withTiming(1, { duration: DRAW, easing: EASE }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const props = useAnimatedProps(() => ({ strokeDashoffset: stroke.len * (1 - drawn.value) }));

  const common = {
    fill: 'none',
    stroke: stroke.color,
    strokeWidth: stroke.width,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: stroke.len,
    animatedProps: props,
  };
  return stroke.kind === 'rect' ? (
    <AnimatedRect x={stroke.x} y={stroke.y} width={stroke.w} height={stroke.h} rx={stroke.r} {...common} />
  ) : (
    <AnimatedPath d={stroke.d} {...common} />
  );
}

/** Fades in (and, motion allowing, rises or pops) after `delay`. */
function useEntrance(delay: number, from: { y?: number; scale?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      reduced ? 0 : delay,
      withTiming(1, { duration: reduced ? 160 : from.scale ? 520 : 400, easing: from.scale ? POP : EASE }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return useAnimatedStyle(() => ({
    // Clamped: the pop overshoots past 1, and opacity mustn't.
    opacity: Math.min(1, t.value),
    transform: reduced
      ? []
      : [
          { translateY: (from.y ?? 0) * (1 - t.value) },
          { scale: from.scale ? from.scale + (1 - from.scale) * t.value : 1 },
        ],
  }));
}

function Capybara({ variant, reduced }: { variant: Variant; reduced: boolean }) {
  const { motion, capy, frame } = variant;
  const width = capy.width * frame;
  const height = width / variant.aspect;
  const frameH = frame * (BOX_H / BOX_W);

  const enter = useSharedValue(0);
  /** The after-move: a hop, a wave, a strum, or the squash on landing. */
  const beat = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      enter.value = withTiming(1, { duration: 160 });
      return;
    }
    switch (motion) {
      case 'goal':
        enter.value = withDelay(LAND + 50, withTiming(1, { duration: 620, easing: POP }));
        beat.value = withDelay(
          1800,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) }),
              withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
            ),
            2,
          ),
        );
        break;
      case 'flag':
        enter.value = withDelay(LAND + 50, withTiming(1, { duration: 620, easing: POP }));
        beat.value = withDelay(1600, withRepeat(withTiming(1, { duration: 420, easing: SWING }), 6, true));
        break;
      case 'serenade':
        enter.value = withDelay(LAND + 50, withTiming(1, { duration: 560, easing: EASE }));
        beat.value = withDelay(1550, withRepeat(withTiming(1, { duration: 300, easing: SWING }), 8, true));
        break;
      case 'mate':
        // Falls (accelerating), then squashes on the sign and springs back.
        enter.value = withDelay(LAND + 100, withTiming(1, { duration: 340, easing: Easing.in(Easing.quad) }));
        beat.value = withDelay(
          LAND + 440,
          withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 280, easing: POP })),
        );
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const e = enter.value;
    const b = beat.value;
    const opacity = Math.min(1, motion === 'mate' ? e * 3 : e);
    if (reduced) return { opacity };
    switch (motion) {
      case 'goal':
        return {
          opacity,
          transform: [
            { translateY: 0.4 * height * (1 - e) - 0.09 * height * b },
            { scale: 0.92 + 0.08 * e },
          ],
        };
      case 'flag':
        return {
          opacity,
          transform: [{ translateY: 0.4 * height * (1 - e) }, { scale: 0.92 + 0.08 * e }, { rotate: `${-4 * b}deg` }],
        };
      case 'serenade':
        return {
          opacity,
          transform: [
            { translateX: 0.45 * width * (1 - e) },
            { translateY: b },
            { rotate: `${8 * (1 - e) + 1.8 * b}deg` },
          ],
        };
      case 'mate':
        return {
          opacity,
          transform: [{ translateY: -50 * (1 - e) }, { scaleX: 1 + 0.06 * b }, { scaleY: 1 - 0.1 * b }],
        };
    }
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width,
          height,
          left: capy.left * frame,
          bottom: capy.bottom * frameH,
          transformOrigin: capy.origin,
        },
        style,
      ]}>
      <Image source={variant.source} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} />
    </Animated.View>
  );
}

function Note({ note, from }: { note: (typeof NOTES)[number]; from: { left: number; bottom: number } }) {
  const [delay, dx, dy, spin, color] = note;
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1500, easing: EASE }), 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => {
    const v = t.value;
    return {
      // In over the first fifth, held, out over the last third.
      opacity: v === 0 ? 0 : v < 0.2 ? v / 0.2 : v > 0.7 ? (1 - v) / 0.3 : 1,
      transform: [{ translateX: dx * v }, { translateY: dy * v }, { rotate: `${spin * v}deg` }, { scale: 0.8 + 0.3 * v }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 16, height: 20, ...from }, style]}>
      <Svg width={16} height={20} viewBox="0 0 20 24">
        <Ellipse cx={6} cy={19} rx={5.5} ry={4.2} fill={color} rotation={-20} origin="6, 19" />
        <Rect x={10} y={2} width={2.4} height={17} rx={1} fill={color} />
        <Path d="M12.4 2 C18 3.5 19.5 7 18.5 11 C17.5 8 15.5 6.8 12.4 6.6 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function StreakCelebration({
  streak,
  onDone,
}: {
  /** The count before this round. Callers pass it; the frame shows only today's. */
  previous?: number;
  streak: number;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const variant = VARIANTS[Math.abs(streak) % VARIANTS.length];
  const W = variant.frame;
  const K = W / BOX_W;
  const H = BOX_H * K;
  const count = variant.count;

  const center = useEntrance(LAND, { scale: 0.8 });
  const banner = useEntrance(BANNER, { y: 10, scale: 0.85 });
  const words = useEntrance(WORDS, { y: 10 });
  const action = useEntrance(WORDS + 300, { y: 10 });

  useEffect(() => {
    const t = setTimeout(success, reduced ? 0 : LAND);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const caption = streak === 1 ? 'DAY IN A ROW' : 'DAYS IN A ROW';

  const bannerView = (
    <Animated.View
      style={[styles.banner, { top: 214 * K, left: 20 * K, width: 200 * K, height: 38 * K }, banner]}>
      <Svg width={200 * K} height={38 * K} viewBox="20 214 200 38" style={StyleSheet.absoluteFill}>
        <G>
          <Path d={RIBBON} fill={colors.primary} />
          <Path d="M50 214 L50 252 M190 214 L190 252" stroke={colors.primaryDark} strokeWidth={2} />
        </G>
      </Svg>
      <Text style={[styles.bannerText, { fontSize: 12 * K, letterSpacing: 2.5 * K }]}>{caption}</Text>
    </Animated.View>
  );
  const capybara = <Capybara variant={variant} reduced={reduced} />;
  // The cheering capybara stands behind the banner; the others are in front of the sign.
  const behindBanner = variant.motion === 'goal';

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.headline, words]} accessibilityRole="header">
        What a <Text style={styles.headlineAccent}>streak!</Text>
      </Animated.Text>

      <View style={styles.stage}>
        <View
          style={[{ width: W, height: H }, variant.room]}
          accessible
          accessibilityLabel={`${streak} ${caption.toLowerCase()}`}>
          <Svg width={W} height={H} viewBox={`0 0 ${BOX_W} ${BOX_H}`} style={StyleSheet.absoluteFill}>
            {STROKES.map((s, i) => (
              <Stroke key={i} stroke={s} reduced={reduced} />
            ))}
          </Svg>

          <Animated.View
            style={[
              styles.count,
              count.row && styles.countRow,
              { top: count.top * H, height: count.height * H },
              center,
            ]}>
            <Flame size={count.flame * K} />
            <Text style={[styles.number, { fontSize: count.number * K, lineHeight: count.number * K * 1.08 }]}>
              {streak}
            </Text>
          </Animated.View>

          {behindBanner ? capybara : null}
          {bannerView}
          {behindBanner ? null : capybara}

          {variant.motion === 'serenade' && !reduced
            ? NOTES.map((n, i) => <Note key={i} note={n} from={{ left: 1.0 * W, bottom: 0.22 * H }} />)
            : null}
        </View>
      </View>

      <Animated.View style={[styles.actions, action]}>
        <Button title="Let's go!" onPress={onDone} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headline: {
    ...font.display[800],
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 18,
  },
  // The streak's own warm hue, not rosa: rosa is only ever something to press.
  headlineAccent: { color: colors.accent },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Sits in the frame's open middle, between the top and bottom curls.
  count: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: { flexDirection: 'row', gap: 6 },
  number: {
    ...font.display[800],
    color: colors.accent,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  banner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    ...font.body[800],
    color: colors.card,
  },

  actions: { gap: 8, marginTop: 24 },
});
