// Mid-lesson cheers for answers in a row: a full colored screen at five in a
// row, at ten and every five after, and "back on track" in place of the five
// after a mistake. A hundred of them (lib/cheer-deck.ts), dealt so she
// doesn't see the same one again for a long while. It hides itself after a
// moment or on a tap.
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

import { Burst, Confetti, DRAWER, In, OUT, Pictures, Rain, Rays, Rings, Slap, Sparkles, Stamp, Stripes, Ticker } from '@/components/cheer-bits';
import { ART, BITS, type CheerDesign, type CheerWhen, dealCheer, type Scene, type Tint } from '@/lib/cheer-deck';
import { clay, colors, font, pastel } from '@/lib/theme';

export type Cheer = { design: CheerDesign; count: number; id: number };

/** How long a full screen stays before it hands back to the lesson. */
const HOLD = 1900;

/** Which moment, if any, this answer earns. `run` is the count of right answers
 *  in a row after this one; `comeback` means there was a miss before this run.
 *  Five in a row is the first: three came so soon it cheered nearly every
 *  lesson for nothing much. Ten is the big one — about as far as a lesson's
 *  dozen answers can carry a run — and every five after that in a long round. */
export function cheerFor(run: number, comeback: boolean): CheerWhen | null {
  if (run === 5 && comeback) return 'back';
  if (run === 5) return 'run';
  if (run >= 10 && run % 5 === 0) return 'big';
  return null;
}

/** The screen for this moment, off the deck. */
export const makeCheer = (when: CheerWhen, count: number): Cheer => ({
  design: dealCheer(when),
  count,
  id: Date.now(),
});

export function LessonCheer({ cheer, onDone }: { cheer: Cheer | null; onDone: () => void }) {
  if (!cheer) return null;
  return <FullScreen key={cheer.id} cheer={cheer} onDone={onDone} />;
}

// --- colour ---------------------------------------------------------------------

type Look = { bg: string; ink: string; soft: string; card: string };
const LOOK: Record<Tint, Look> = {
  rosa: {
    bg: colors.primary,
    ink: colors.onPrimary,
    soft: 'rgba(255,255,255,0.2)',
    card: pastel.peach,
  },
  butter: {
    bg: pastel.butter,
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.5)',
    card: pastel.peach,
  },
  sage: {
    bg: pastel.sage,
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.45)',
    card: pastel.butter,
  },
  mint: {
    bg: '#7FC79A',
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.35)',
    card: pastel.butter,
  },
  lav: {
    bg: pastel.lav,
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.45)',
    card: pastel.sky,
  },
  sky: {
    bg: pastel.sky,
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.45)',
    card: pastel.butter,
  },
  peach: {
    bg: pastel.peach,
    ink: colors.ink,
    soft: 'rgba(255,255,255,0.4)',
    card: pastel.lav,
  },
  flame: {
    bg: pastel.flame,
    ink: colors.ink,
    soft: 'rgba(255,224,138,0.45)',
    card: pastel.butter,
  },
  night: {
    bg: colors.ink,
    ink: colors.card,
    soft: 'rgba(255,224,138,0.14)',
    card: pastel.lav,
  },
  oat: {
    bg: colors.bg,
    ink: colors.ink,
    soft: 'rgba(180,74,96,0.12)',
    card: pastel.sage,
  },
};

/** Long lines come down a size so they stay on two lines. */
const titleSize = (s: string, base = 48) => (s.length > 22 ? Math.min(base, 32) : s.length > 13 ? Math.min(base, 40) : base);
const fill = (s: string | undefined, n: number) => s?.replace('{n}', String(n));

// --- how the colour arrives --------------------------------------------------------

function Backdrop({ scene, bg, t, width, height }: { scene: Scene; bg: string; t: SharedValue<number>; width: number; height: number }) {
  const reduced = useReducedMotion();
  const big = Math.hypot(width, height) * 2;
  const slide = useAnimatedStyle(() => {
    const f = t.value;
    if (reduced || scene === 'fade') return { opacity: f };
    if (scene === 'rise') return { transform: [{ translateY: (1 - f) * height }] };
    if (scene === 'drop') return { transform: [{ translateY: (f - 1) * height }] };
    if (scene === 'left') return { transform: [{ translateX: (f - 1) * width }] };
    if (scene === 'right') return { transform: [{ translateX: (1 - f) * width }] };
    if (scene === 'tilt')
      return {
        transform: [{ translateY: (1 - f) * big * 0.75 }, { rotate: `${(1 - f) * -14}deg` }],
      };
    // sun and iris: a circle growing — from the Continue button she just
    // pressed, or from the middle.
    return { transform: [{ scale: 0.04 + f * 0.96 }] };
  });
  const doorL = useAnimatedStyle(() => ({
    transform: [{ translateX: reduced ? 0 : (t.value - 1) * (width / 2) }],
    opacity: reduced ? t.value : 1,
  }));
  const doorR = useAnimatedStyle(() => ({
    transform: [{ translateX: reduced ? 0 : (1 - t.value) * (width / 2) }],
    opacity: reduced ? t.value : 1,
  }));

  if (scene === 'doors') {
    return (
      <>
        <Animated.View style={[styles.door, { left: 0, width: width / 2 + 1, backgroundColor: bg }, doorL]} />
        <Animated.View style={[styles.door, { right: 0, width: width / 2 + 1, backgroundColor: bg }, doorR]} />
      </>
    );
  }
  if (scene === 'blinds' && !reduced) {
    const n = 7;
    const h = height / n;
    return (
      <>
        {Array.from({ length: n }, (_, k) => (
          <Slat key={k} k={k} n={n} t={t} top={k * h} h={h + 1} width={width} bg={bg} />
        ))}
      </>
    );
  }
  if ((scene === 'sun' || scene === 'iris') && !reduced) {
    const cy = scene === 'sun' ? height * 0.9 : height * 0.45;
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: big,
            height: big,
            borderRadius: big / 2,
            left: width / 2 - big / 2,
            top: cy - big / 2,
            backgroundColor: bg,
          },
          slide,
        ]}
      />
    );
  }
  if (scene === 'tilt' && !reduced) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: big,
            height: big,
            left: width / 2 - big / 2,
            top: height / 2 - big / 2,
            backgroundColor: bg,
          },
          slide,
        ]}
      />
    );
  }
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bg }, slide]} />;
}

/** One slat of the blinds, sliding in from alternate sides a beat after the one above. */
function Slat({ k, n, t, top, h, width, bg }: { k: number; n: number; t: SharedValue<number>; top: number; h: number; width: number; bg: string }) {
  const a = useAnimatedStyle(() => {
    const start = (k / n) * 0.45;
    const p = interpolate(t.value, [start, start + 0.55], [0, 1], 'clamp');
    return { transform: [{ translateX: (k % 2 ? 1 : -1) * (1 - p) * width }] };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top,
          width,
          height: h,
          backgroundColor: bg,
        },
        a,
      ]}
    />
  );
}

// --- the screen -------------------------------------------------------------------

function FullScreen({ cheer, onDone }: { cheer: Cheer; onDone: () => void }) {
  const c = cheer.design;
  const n = cheer.count;
  const look = LOOK[c.tint];
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const t = useSharedValue(0); // the color arriving
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
    const slow = c.scene === 'sun' || c.scene === 'iris' || c.scene === 'blinds' || c.scene === 'tilt';
    t.value = reduced ? withTiming(1, { duration: 180 }) : withTiming(1, { duration: slow ? 560 : 440, easing: DRAWER });
    const timer = setTimeout(leave, HOLD + (c.words?.length ?? 0) * 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whole = useAnimatedStyle(() => ({ opacity: shown.value }));
  const decoIn = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.5, 1], [0, 1], 'clamp'),
  }));
  // The medal's ribbon: rosa, unless that is the screen's own colour.
  const ribbon = c.tint === 'rosa' ? pastel.sky : colors.primary;
  const D = reduced ? 120 : 360; // content starts once the color is mostly in
  const mid = height * 0.45;
  const title = fill(c.title, n) ?? '';
  const line = fill(c.line, n);
  const bits = (c.bits ?? ['alfajor', 'empanada', 'medialuna']).map((b) => BITS[b]);

  const text = (s: string, size: number, delay: number) => (
    <In delay={delay}>
      <Text style={[styles.big, { color: look.ink, fontSize: size, lineHeight: size * 1.06 }]}>{s}</Text>
    </In>
  );
  const small = (s: string | undefined, delay: number) =>
    s ? (
      <In delay={delay}>
        <Text style={[styles.small, { color: look.ink }]}>{s}</Text>
      </In>
    ) : null;
  const art = (delay: number, h = 190) => (
    <In delay={delay}>
      <Image source={ART[c.art]} style={[styles.art, { height: h, width: h * 0.95 }]} contentFit="contain" />
    </In>
  );
  const chip = (s: string, delay: number, tilt = -3) => (
    <Slap delay={delay} tilt={tilt} style={styles.chip}>
      <Text style={styles.chipText}>{s}</Text>
    </Slap>
  );

  let body: React.ReactNode;
  switch (c.layout) {
    case 'count':
      body = (
        <>
          <In delay={D + 60}>
            <Text style={[styles.count, { color: look.ink }]}>{n}</Text>
          </In>
          {text(title, 36, D + 160)}
          {art(D + 260, 150)}
        </>
      );
      break;
    case 'stamps':
      body = (
        <>
          <View style={styles.stampRow}>
            {(c.words ?? ['Yes!']).map((w, k) => (
              <Stamp key={k} delay={D - 140 + k * 170} tilt={[-6, 4, -3, 5][k % 4]} size={(c.words?.length ?? 1) > 2 ? 40 : 48}>
                {w}
              </Stamp>
            ))}
          </View>
          {text(title, 32, D + 160 + (c.words?.length ?? 1) * 110)}
          {small(line, D + 220 + (c.words?.length ?? 1) * 110)}
          {art(D + 260 + (c.words?.length ?? 1) * 110, 150)}
        </>
      );
      break;
    case 'badge':
      body = (
        <>
          {art(D)}
          {text(title, titleSize(title, 42), D + 90)}
          {chip(`${n} in a row`, D + 220)}
        </>
      );
      break;
    case 'polaroid':
      body = (
        <>
          <Slap delay={D - 80} tilt={-4} style={styles.polaroid}>
            <View style={[styles.photo, { backgroundColor: look.card }]}>
              <Image source={ART[c.art]} style={styles.photoArt} contentFit="contain" />
            </View>
            <Text style={[styles.caption, { fontSize: titleSize(title, 28) }]}>{title}</Text>
          </Slap>
          {small(line, D + 300)}
        </>
      );
      break;
    case 'bubble':
      body = (
        <>
          <Slap delay={D - 60} tilt={-2} style={styles.bubble}>
            <Text style={styles.bubbleText}>{c.words?.[0]}</Text>
            <View style={styles.bubbleTail} />
          </Slap>
          {art(D + 120, 170)}
          {small(line, D + 220)}
          {chip(title, D + 320, 3)}
        </>
      );
      break;
    case 'medal':
      body = (
        <>
          {art(D, 150)}
          <Slap delay={D + 120} tilt={-8} style={styles.medalWrap}>
            <View style={[styles.ribbon, { backgroundColor: ribbon,  left: 30, transform: [{ rotate: '16deg' }] }]} />
            <View style={[styles.ribbon, { backgroundColor: ribbon,  right: 30, transform: [{ rotate: '-16deg' }] }]} />
            <View style={styles.medal}>
              <View style={styles.medalRim} />
              <Text style={styles.medalCount}>{n}</Text>
              <Text style={styles.medalLabel}>in a row</Text>
            </View>
          </Slap>
          {text(title, titleSize(title, 44), D + 320)}
        </>
      );
      break;
    default:
      body = (
        <>
          {art(D)}
          {text(title, titleSize(title), D + 90)}
          {small(line, D + 180)}
        </>
      );
  }

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.full, whole]} accessibilityViewIsModal accessibilityLiveRegion="assertive">
      <Backdrop scene={c.scene} bg={look.bg} t={t} width={width} height={height} />

      {/* What moves behind him comes in with the colour, not ahead of it. */}
      <Animated.View style={[StyleSheet.absoluteFill, decoIn]} pointerEvents="none">
        {c.deco === 'rays' ? <Rays size={Math.max(width, height) * 1.3} color={look.soft} /> : null}
        {c.deco === 'rain' ? <Rain width={width} height={height} /> : null}
        {c.deco === 'confetti' ? <Confetti width={width} height={height} /> : null}
        {c.deco === 'burst' ? <Burst cx={width / 2} cy={mid} delay={D} /> : null}
        {c.deco === 'rings' ? <Rings cx={width / 2} cy={mid} color={look.soft} /> : null}
        {c.deco === 'sparkles' ? <Sparkles width={width} height={height} color={c.tint === 'night' ? pastel.butter : '#FFFFFF'} /> : null}
        {c.deco === 'stripes' ? <Stripes width={width} height={height} color={look.soft} /> : null}
        {c.deco === 'food' ? <Pictures sources={bits} width={width} height={height} /> : null}
        {c.deco === 'balloons' ? <Pictures sources={bits} width={width} height={height} rise /> : null}
        {c.deco === 'ticker' ? (
          <>
            <Ticker word={c.words?.[0] ?? 'YES'} y={height * 0.09} width={width} tilt={-6} />
            <Ticker word={c.words?.[0] ?? 'YES'} y={height * 0.84} width={width} tilt={5} reverse />
          </>
        ) : null}
      </Animated.View>

      <Pressable style={styles.content} onPress={leave} accessibilityRole="button" accessibilityLabel={`${title}. Keep going`}>
        {body}
        <Text style={[styles.tap, { color: look.ink }]}>Tap to keep going</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: { zIndex: 50, elevation: 50, overflow: 'hidden' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  art: { width: 180, height: 190 },
  big: {
    ...font.display[900],
    fontSize: 48,
    lineHeight: 50,
    color: colors.ink,
    textAlign: 'center',
  },
  small: {
    ...font.body[700],
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  count: {
    ...font.display[900],
    fontSize: 128,
    lineHeight: 130,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  tap: {
    ...font.body[700],
    position: 'absolute',
    bottom: 48,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  stampRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 340,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    boxShadow: clay.surface,
  },
  chipText: { ...font.display[900], fontSize: 26, color: colors.ink },
  door: { position: 'absolute', top: 0, bottom: 0 },
  polaroid: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 12,
    paddingBottom: 14,
    width: 250,
    alignItems: 'center',
    gap: 10,
    boxShadow: clay.float,
  },
  photo: {
    width: '100%',
    height: 210,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  photoArt: { width: 180, height: 190 },
  caption: {
    ...font.display[900],
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 32,
  },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
    maxWidth: 320,
    boxShadow: clay.float,
    marginBottom: 6,
  },
  bubbleText: {
    ...font.display[900],
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -9,
    left: '50%',
    marginLeft: -9,
    width: 18,
    height: 18,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.ink,
  },
  medalWrap: { width: 170, height: 190, alignItems: 'center' },
  ribbon: {
    position: 'absolute',
    bottom: 0,
    width: 36,
    height: 80,
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 4,
  },
  medal: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: pastel.butter,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.float,
  },
  medalRim: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    bottom: 9,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: 'rgba(58,42,32,0.25)',
    borderStyle: 'dashed',
  },
  medalCount: {
    ...font.display[900],
    fontSize: 64,
    lineHeight: 66,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  medalLabel: {
    ...font.body[800],
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
