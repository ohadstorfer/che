// The moving parts of the cheer screens (lesson-cheer.tsx) and the perfect
// lesson (perfect-lesson.tsx): how a word or a picture arrives, and the things
// that move behind him. All of it is transform and opacity on the UI thread,
// and with reduced motion each one either fades or stands still.
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { clay, colors, font, pastel } from '@/lib/theme';

export const OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const DRAWER = Easing.bezier(0.32, 0.72, 0, 1);

/** Rises a little and settles, after `delay` ms. */
export function In({ delay, children, style }: { delay: number; children: React.ReactNode; style?: object }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, reduced ? withTiming(1, { duration: 150 }) : withSpring(1, { duration: 460, dampingRatio: 0.62 }));
  }, [delay, reduced, t]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 2),
    transform: reduced ? [] : [{ translateY: (1 - t.value) * 18 }, { scale: 0.9 + t.value * 0.1 }],
  }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

/** Slapped down like a sticker: big and tilted, then settles. */
export function Slap({ delay, tilt, children, style }: { delay: number; tilt: number; children: React.ReactNode; style?: object }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: reduced ? 150 : 380, easing: OUT }));
  }, [delay, reduced, t]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 3),
    transform: [{ rotate: `${tilt}deg` }, { scale: reduced ? 1 : 1.6 - 0.6 * t.value }],
  }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

/** A word on a white sticker, slapped down. */
export function Stamp({ delay, tilt, children, size = 48 }: { delay: number; tilt: number; children: string; size?: number }) {
  return (
    <Slap delay={delay} tilt={tilt} style={styles.stamp}>
      <Text style={[styles.stampText, { fontSize: size, lineHeight: size * 1.1 }]}>{children}</Text>
    </Slap>
  );
}

/** Sun rays, turning slowly. */
export function Rays({ size, color = 'rgba(255,255,255,0.5)', top }: { size: number; color?: string; top?: number }) {
  const reduced = useReducedMotion();
  const r = useSharedValue(0);
  useEffect(() => {
    if (!reduced) r.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
  }, [reduced, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  const half = size / 2;
  const d = Array.from({ length: 16 }, (_, k) => {
    const a0 = ((k * 22.5 - 4) * Math.PI) / 180;
    const a1 = ((k * 22.5 + 4) * Math.PI) / 180;
    return `M${half} ${half}L${half + Math.cos(a0) * half} ${half + Math.sin(a0) * half}L${half + Math.cos(a1) * half} ${half + Math.sin(a1) * half}Z`;
  }).join('');
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, top != null && { top: top - half }, a]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/** Something falling past, looping: a yerba leaf, a gourd, a bit of confetti, or a picture. */
function Faller({
  x,
  delay,
  ms,
  height,
  spin = 540,
  rise,
  children,
}: {
  x: number;
  delay: number;
  ms: number;
  height: number;
  spin?: number;
  /** Floats up from the bottom instead, swaying, like a balloon. */
  rise?: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1));
  }, [delay, ms, reduced, t]);
  const a = useAnimatedStyle(() => {
    const y = rise ? height + 40 - t.value * (height + 140) : -60 + t.value * (height + 120);
    return {
      opacity: t.value === 0 ? 0 : 1,
      transform: [
        { translateY: y },
        { translateX: Math.sin(t.value * Math.PI * 4) * (rise ? 14 : 18) },
        { rotate: rise ? `${Math.sin(t.value * Math.PI * 4) * 10}deg` : `${t.value * spin}deg` },
      ],
    };
  });
  if (reduced) return null;
  return (
    <Animated.View style={[styles.faller, { left: x }, a]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

const SPRINKLE = [0.08, 0.22, 0.37, 0.52, 0.66, 0.81, 0.93, 0.15, 0.45, 0.73, 0.3, 0.6, 0.87, 0.04];

export function Rain({ width, height }: { width: number; height: number }) {
  return (
    <>
      {SPRINKLE.slice(0, 9).map((x, k) => (
        <Faller key={k} x={x * width} delay={200 + ((k * 137) % 600)} ms={1400 + ((k * 211) % 700)} height={height}>
          <View style={k % 3 === 1 ? styles.gourd : styles.leaf} />
        </Faller>
      ))}
    </>
  );
}

const CONFETTI = [colors.primary, pastel.butter, pastel.sky, pastel.sage, pastel.lav, pastel.peach, '#FFFFFF'];

export function Confetti({ width, height }: { width: number; height: number }) {
  return (
    <>
      {SPRINKLE.map((x, k) => (
        <Faller key={k} x={x * width} delay={(k * 97) % 500} ms={1500 + ((k * 173) % 900)} height={height} spin={k % 2 ? 720 : -540}>
          <View
            style={[
              k % 3 === 0 ? styles.confettiDot : styles.confettiPill,
              { backgroundColor: CONFETTI[k % CONFETTI.length] },
            ]}
          />
        </Faller>
      ))}
    </>
  );
}

/** Pictures falling (or, with `rise`, floating up) past him. */
export function Pictures({ sources, width, height, rise }: { sources: number[]; width: number; height: number; rise?: boolean }) {
  const n = rise ? 8 : 10;
  return (
    <>
      {SPRINKLE.slice(0, n).map((x, k) => {
        const size = 44 + ((k * 13) % 3) * 10;
        return (
          <Faller key={k} x={x * width - size / 2} delay={(k * 131) % 700} ms={(rise ? 2600 : 1700) + ((k * 211) % 800)} height={height} spin={k % 2 ? 260 : -200} rise={rise}>
            <Image source={sources[k % sources.length]} style={{ width: size, height: size }} contentFit="contain" />
          </Faller>
        );
      })}
    </>
  );
}

const BURST = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2 ? 0.16 : -0.1);
  const far = i % 3 === 0 ? 190 : i % 3 === 1 ? 150 : 120;
  return { x: Math.cos(angle) * far, y: Math.sin(angle) * far, spin: (i % 2 ? 1 : -1) * (140 + i * 12), color: CONFETTI[i % CONFETTI.length], star: i % 4 === 0 };
});

/** One burst of bits from a point, once — the pop of a cork. */
export function Burst({ cx, cy, delay = 300, scale = 1 }: { cx: number; cy: number; delay?: number; scale?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withDelay(delay, withTiming(1, { duration: 900, easing: OUT }));
  }, [delay, reduced, t]);
  if (reduced) return null;
  return (
    <>
      {BURST.map((b, i) => (
        <BurstBit key={i} b={b} t={t} cx={cx} cy={cy} scale={scale} />
      ))}
    </>
  );
}

function BurstBit({ b, t, cx, cy, scale }: { b: (typeof BURST)[number]; t: SharedValue<number>; cx: number; cy: number; scale: number }) {
  const a = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value < 0.6 ? 1 : 1 - (t.value - 0.6) * 2.5,
    transform: [
      { translateX: b.x * scale * t.value },
      { translateY: b.y * scale * t.value + 30 * t.value * t.value },
      { rotate: `${b.spin * t.value}deg` },
      { scale: 1 - 0.3 * t.value },
    ],
  }));
  return (
    <Animated.View style={[styles.burstBit, { left: cx - 9, top: cy - 9 }, a]} pointerEvents="none">
      {b.star ? <Star size={18} color={b.color} /> : <View style={[styles.confettiPill, { backgroundColor: b.color }]} />}
    </Animated.View>
  );
}

/** A four-point sparkle. */
export function Star({ size, color }: { size: number; color: string }) {
  const h = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={`M${h} 0 Q${h * 1.12} ${h * 0.88} ${size} ${h} Q${h * 1.12} ${h * 1.12} ${h} ${size} Q${h * 0.88} ${h * 1.12} 0 ${h} Q${h * 0.88} ${h * 0.88} ${h} 0Z`} fill={color} />
    </Svg>
  );
}

const TWINKLES = [
  [0.12, 0.14, 22],
  [0.84, 0.1, 16],
  [0.9, 0.34, 26],
  [0.07, 0.42, 14],
  [0.2, 0.7, 20],
  [0.78, 0.66, 18],
  [0.5, 0.08, 14],
  [0.62, 0.86, 22],
  [0.32, 0.9, 14],
  [0.94, 0.82, 12],
] as const;

/** Sparkles twinkling in place around the edges. */
export function Sparkles({ width, height, color = '#FFFFFF' }: { width: number; height: number; color?: string }) {
  return (
    <>
      {TWINKLES.map(([x, y, s], k) => (
        <Twinkle key={k} x={x * width} y={y * height} size={s} delay={(k * 170) % 900} color={color} />
      ))}
    </>
  );
}

function Twinkle({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 420, easing: OUT }), withTiming(0.25, { duration: 520 })), -1));
  }, [delay, reduced, t]);
  const a = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.5 + t.value * 0.5 }, { rotate: `${t.value * 45}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x - size / 2, top: y - size / 2 }, a]} pointerEvents="none">
      <Star size={size} color={color} />
    </Animated.View>
  );
}

/** Rings going out from a point, one after another. */
export function Rings({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <>
      {[0, 1, 2].map((k) => (
        <Ring key={k} cx={cx} cy={cy} color={color} delay={250 + k * 420} />
      ))}
    </>
  );
}

function Ring({ cx, cy, color, delay }: { cx: number; cy: number; color: string; delay: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1260, easing: OUT }), -1));
  }, [delay, reduced, t]);
  const a = useAnimatedStyle(() => ({ opacity: t.value === 0 ? 0 : 0.7 * (1 - t.value), transform: [{ scale: 0.3 + t.value * 1.7 }] }));
  if (reduced) return null;
  const S = 260;
  return <Animated.View style={[styles.ring, { left: cx - S / 2, top: cy - S / 2, width: S, height: S, borderRadius: S / 2, borderColor: color }, a]} pointerEvents="none" />;
}

/** Wide diagonal stripes, drifting. */
export function Stripes({ width, height, color }: { width: number; height: number; color: string }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const W = 56; // one stripe and its gap
  useEffect(() => {
    if (!reduced) t.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1);
  }, [reduced, t]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: -t.value * W * 2 }] }));
  const span = width + height + W * 4;
  const d = Array.from({ length: Math.ceil(span / (W * 2)) + 2 }, (_, k) => {
    const x = k * W * 2;
    return `M${x} 0L${x + W} 0L${x + W - height} ${height}L${x - height} ${height}Z`;
  }).join('');
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: span + height, height }, a]} pointerEvents="none">
      <Svg width={span + height} height={height}>
        <Path d={d} fill={color} transform={`translate(${height} 0)`} />
      </Svg>
    </Animated.View>
  );
}

/** A band of one word over and over, scrolling, stuck across the screen at a tilt. */
export function Ticker({ word, y, width, tilt, reverse }: { word: string; y: number; width: number; tilt: number; reverse?: boolean }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const unit = word.length * 26 + 60;
  useEffect(() => {
    if (!reduced) t.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1);
  }, [reduced, t]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: (reverse ? t.value - 1 : -t.value) * unit }] }));
  const n = Math.ceil((width * 1.6) / unit) + 2;
  return (
    <View style={[styles.ticker, { top: y, width: width * 1.6, left: -width * 0.3, transform: [{ rotate: `${tilt}deg` }] }]} pointerEvents="none">
      <Animated.View style={[styles.tickerRow, a]}>
        {Array.from({ length: n }, (_, k) => (
          <Text key={k} style={[styles.tickerText, { width: unit }]} numberOfLines={1}>
            {word} ✦
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, boxShadow: clay.surface },
  stampText: { ...font.display[900], color: colors.ink, textAlign: 'center' },
  faller: { position: 'absolute', top: 0 },
  leaf: { width: 13, height: 7, borderRadius: 7, backgroundColor: '#7BB661', borderWidth: 1.5, borderColor: colors.ink },
  gourd: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#A0612F', borderWidth: 1.5, borderColor: colors.ink },
  confettiDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: colors.ink },
  confettiPill: { width: 8, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.ink },
  burstBit: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 4 },
  ticker: { position: 'absolute', height: 52, backgroundColor: colors.card, overflow: 'hidden', justifyContent: 'center', boxShadow: `0 0 0 2.5px ${colors.ink}` },
  tickerRow: { flexDirection: 'row' },
  tickerText: { ...font.display[900], fontSize: 30, color: colors.ink, textAlign: 'center' },
});
