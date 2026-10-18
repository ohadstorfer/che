// Mid-lesson cheers for answers in a row (designs: claude.ai/artifact/NppSVsF875KihkdcsrhACi).
// A full colored screen for 3 and 6 in a row, 10 and every 5 after, and
// "back on track" in place of the 3 after a mistake. It hides itself after a
// moment or on a tap.
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { POSE } from '@/components/mascot';
import { clay, colors, font, pastel } from '@/lib/theme';

export type CheerKind = 'rosa' | 'stamps' | 'rain' | 'sun' | 'back';
export type Cheer = { kind: CheerKind; count: number; id: number };

const PANCHO = require('@/assets/images/onboarding/pancho-mate.png');
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const DRAWER = Easing.bezier(0.32, 0.72, 0, 1);
/** How long a full screen stays before it hands back to the lesson. */
const HOLD = 1800;

/** Which cheer, if any, this answer earns. `run` is the count of right answers
 *  in a row after this one; `comeback` means there was a miss before this run. */
export function cheerFor(run: number, comeback: boolean, nth: number): CheerKind | null {
  if (run === 3 && comeback) return 'back';
  if (run === 3 || run === 6) return (['rosa', 'stamps', 'rain'] as const)[nth % 3];
  if (run >= 10 && run % 5 === 0) return 'sun';
  return null;
}

export function LessonCheer({ cheer, onDone }: { cheer: Cheer | null; onDone: () => void }) {
  if (!cheer) return null;
  return <FullScreen key={cheer.id} cheer={cheer} onDone={onDone} />;
}

// --- pieces ------------------------------------------------------------------

/** Rises a little and settles, after `delay` ms. */
function In({ delay, children, style }: { delay: number; children: React.ReactNode; style?: object }) {
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

/** A word slapped down like a sticker: big and tilted, then settles. */
function Stamp({ delay, tilt, children }: { delay: number; tilt: number; children: string }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: reduced ? 150 : 380, easing: OUT }));
  }, [delay, reduced, t]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 3),
    transform: [{ rotate: `${tilt}deg` }, { scale: reduced ? 1 : 1.6 - 0.6 * t.value }],
  }));
  return (
    <Animated.View style={[styles.stamp, a]}>
      <Text style={styles.stampText}>{children}</Text>
    </Animated.View>
  );
}

/** The onboarding sun's rays, turning slowly. */
function Rays({ size }: { size: number }) {
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
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, a]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Path d={d} fill="rgba(255,255,255,0.5)" />
      </Svg>
    </Animated.View>
  );
}

/** Yerba leaves and little gourds falling past him. */
function Bit({ x, delay, ms, gourd, height }: { x: number; delay: number; ms: number; gourd?: boolean; height: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1));
  }, [delay, ms, t]);
  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: -30 + t.value * (height + 60) }, { rotate: `${t.value * 540}deg` }],
  }));
  return <Animated.View style={[gourd ? styles.gourd : styles.leaf, { left: x }, a]} pointerEvents="none" />;
}

// --- the full screens -----------------------------------------------------------

const BG: Record<CheerKind, string> = {
  rosa: colors.primary,
  sun: pastel.butter,
  stamps: '#7FC79A',
  rain: pastel.lav,
  back: pastel.peach,
};

function FullScreen({ cheer, onDone }: { cheer: Cheer; onDone: () => void }) {
  const kind = cheer.kind;
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const fill = useSharedValue(0); // the color arriving
  const shown = useSharedValue(1); // the whole screen, for the exit
  const leaving = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;
  const finish = () => done.current();

  const leave = () => {
    if (leaving.current) return;
    leaving.current = true;
    shown.value = withTiming(0, { duration: 180, easing: OUT }, (fin) => fin && runOnJS(finish)());
  };

  useEffect(() => {
    fill.value = reduced ? withTiming(1, { duration: 180 }) : withTiming(1, { duration: kind === 'sun' ? 560 : 440, easing: DRAWER });
    const t = setTimeout(leave, HOLD);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whole = useAnimatedStyle(() => ({ opacity: shown.value }));
  const big = Math.hypot(width, height) * 2;
  const color = useAnimatedStyle(() => {
    if (reduced || kind === 'stamps' || kind === 'rain') return { opacity: fill.value };
    if (kind === 'rosa') return { transform: [{ translateY: (1 - fill.value) * height }] };
    // The sun grows out of the Continue button she just pressed.
    return { transform: [{ scale: 0.04 + fill.value * 0.96 }] };
  });
  const doorL = useAnimatedStyle(() => ({ transform: [{ translateX: reduced ? 0 : (fill.value - 1) * (width / 2) }], opacity: reduced ? fill.value : 1 }));
  const doorR = useAnimatedStyle(() => ({ transform: [{ translateX: reduced ? 0 : (1 - fill.value) * (width / 2) }], opacity: reduced ? fill.value : 1 }));

  const ink = kind === 'rosa' ? colors.onPrimary : colors.ink;
  const D = 380; // content starts once the color is mostly in

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.full, whole]} accessibilityViewIsModal accessibilityLiveRegion="assertive">
      {kind === 'back' ? (
        <>
          <Animated.View style={[styles.door, { left: 0, width: width / 2 + 1, backgroundColor: BG.back }, doorL]} />
          <Animated.View style={[styles.door, { right: 0, width: width / 2 + 1, backgroundColor: BG.back }, doorR]} />
        </>
      ) : kind === 'sun' ? (
        <Animated.View
          style={[
            { position: 'absolute', width: big, height: big, borderRadius: big / 2, left: width / 2 - big / 2, top: height * 0.9 - big / 2, backgroundColor: BG.sun },
            color,
          ]}
        />
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: BG[kind] }, color]} />
      )}

      {kind === 'sun' ? <Rays size={Math.max(width, height) * 1.3} /> : null}
      {kind === 'rain'
        ? [0.1, 0.26, 0.43, 0.6, 0.76, 0.88, 0.18, 0.53, 0.69].map((x, k) => (
            <Bit key={k} x={x * width} delay={200 + ((k * 137) % 600)} ms={1400 + ((k * 211) % 700)} gourd={k % 3 === 1} height={height} />
          ))
        : null}

      <Pressable style={styles.content} onPress={leave} accessibilityRole="button" accessibilityLabel="Keep going">
        {kind === 'rosa' ? (
          <>
            <In delay={D}><Image source={POSE.gol} style={styles.art} contentFit="contain" /></In>
            <In delay={D + 90}><Text style={[styles.big, { color: ink }]}>{cheer.count} in a row!</Text></In>
            <In delay={D + 180}><Text style={[styles.small, { color: ink }]}>You’re on fire!</Text></In>
          </>
        ) : kind === 'sun' ? (
          <>
            <In delay={D + 100}><Text style={styles.count}>{cheer.count}</Text></In>
            <In delay={D + 200}><Text style={[styles.big, { fontSize: 36 }]}>in a row!</Text></In>
            <In delay={D + 300}><Image source={PANCHO} style={[styles.art, { height: 150 }]} contentFit="contain" /></In>
          </>
        ) : kind === 'stamps' ? (
          <>
            <View style={styles.stampRow}>
              <Stamp delay={220} tilt={-6}>Nailed</Stamp>
              <Stamp delay={400} tilt={4}>it!</Stamp>
            </View>
            <In delay={700}><Text style={[styles.big, { fontSize: 32 }]}>{cheer.count} in a row</Text></In>
            <In delay={800}><Image source={POSE.wave} style={[styles.art, { height: 150 }]} contentFit="contain" /></In>
          </>
        ) : kind === 'rain' ? (
          <>
            <In delay={260}><Image source={PANCHO} style={styles.art} contentFit="contain" /></In>
            <In delay={350}><Text style={styles.big}>{cheer.count} in a row!</Text></In>
            <In delay={440}><Text style={styles.small}>You’re doing great.</Text></In>
          </>
        ) : (
          <>
            <In delay={D}><Image source={POSE.wave} style={styles.art} contentFit="contain" /></In>
            <In delay={D + 90}><Text style={[styles.big, { fontSize: 42 }]}>Back on track!</Text></In>
            <In delay={D + 180} style={{ transform: [{ rotate: '-3deg' }] }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cheer.count} in a row</Text>
              </View>
            </In>
          </>
        )}
        <Text style={[styles.tap, { color: ink }]}>Tap to keep going</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: { zIndex: 50, elevation: 50, overflow: 'hidden' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
  art: { width: 180, height: 190 },
  big: { ...font.display[900], fontSize: 48, lineHeight: 50, color: colors.ink, textAlign: 'center' },
  small: { ...font.body[700], fontSize: 18, color: colors.ink, textAlign: 'center' },
  count: { ...font.display[900], fontSize: 128, lineHeight: 130, color: colors.ink },
  tap: { ...font.body[700], position: 'absolute', bottom: 48, fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.7 },
  stampRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  stamp: { backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, boxShadow: clay.surface },
  stampText: { ...font.display[900], fontSize: 48, color: colors.ink },
  badge: { backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, boxShadow: clay.surface },
  badgeText: { ...font.display[900], fontSize: 26, color: colors.ink },
  door: { position: 'absolute', top: 0, bottom: 0 },
  leaf: { position: 'absolute', top: 0, width: 13, height: 7, borderRadius: 7, backgroundColor: '#7BB661', borderWidth: 1.5, borderColor: colors.ink },
  gourd: { position: 'absolute', top: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A0612F', borderWidth: 1.5, borderColor: colors.ink },
});
