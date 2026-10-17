import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { POSE } from '@/components/mascot';
import { EASE_OUT, rise } from '@/components/onboarding-ui';
import { FlagSun, OutlinedHeadline } from '@/components/sticker';
import { Button } from '@/components/ui';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Welcome — the first screen of a fresh install. One claim, told six times:
// the word a textbook teaches lands, a rosa line crosses it out, and the word
// Buenos Aires actually says is slapped on under it. Pancho has his mate
// below. The button is there from the start: the words are the pitch, not a
// gate. Signing in is here too, quietly.
// ---------------------------------------------------------------------------

type Pair = { book: string; street: string; means: string; tone: string; tilt: string; art?: ImageSourcePropType };

const PAIRS: Pair[] = [
  { book: 'autobús', street: 'bondi', means: 'the bus', tone: pastel.sky, tilt: '-3deg', art: require('@/assets/images/objects/buenos-aires-colectivo-figure.webp') },
  { book: 'dinero', street: 'guita', means: 'money', tone: pastel.sage, tilt: '3deg' },
  { book: 'cerveza', street: 'birra', means: 'beer', tone: pastel.butter, tilt: '2deg', art: require('@/assets/images/objects/birra-figure.webp') },
  { book: 'lío', street: 'quilombo', means: 'a total mess', tone: pastel.lav, tilt: '-2.5deg' },
  // "Oye" is how a textbook gets someone's attention; che does that job here.
  { book: 'oye', street: 'che', means: 'hey', tone: pastel.peach, tilt: '-2deg' },
  { book: 'trabajo', street: 'laburo', means: 'work', tone: pastel.sky, tilt: '3deg' },
];

// The story of one pair, in ms from its own start. Pairs start STAGGER apart.
const START = 250; // after the headline has risen
const STAGGER = 420;
const STRIKE_AT = 380; // the word has landed and been read
const FADE_AT = 640; // crossed out: it steps back
const SLAP_AT = 700; // and the street word goes on below

// The grid and Pancho are laid out at one natural size and scaled down as a
// block when the screen is short or narrow, so nothing overlaps or clips.
const COL = 170;
const COL_GAP = 12;
const ROW_GAP = 14;
const BOOK_H = 26;
const STICKER_H = 62;
const PAIR_H = BOOK_H + 4 + STICKER_H;
const GRID_W = COL * 2 + COL_GAP;
const GRID_H = PAIR_H * 3 + ROW_GAP * 2;
const PANCHO_H = 150;
const PANCHO_GAP = 22;
const BLOCK_H = GRID_H + PANCHO_GAP + PANCHO_H;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Welcome() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  // Staff replaying onboarding from the admin screen start here too, and the
  // replay flag rides along so onboarding knows there is already an account.
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const next = replay ? '/onboarding?replay=1' : '/onboarding';

  // Onboarding is loaded while the words land, so "Get started" moves at once.
  useEffect(() => {
    router.prefetch(next);
  }, [next]);

  // One tap, one onboarding: further taps are ignored until she is back here.
  const leaving = useRef(false);
  useFocusEffect(
    useCallback(() => {
      leaving.current = false;
    }, []),
  );
  const go = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.push(next);
  };

  // How much of the natural block fits the room left between headline and buttons.
  const [room, setRoom] = useState<{ w: number; h: number } | null>(null);
  const onRoom = (e: LayoutChangeEvent) => {
    // less the room's own padding
    const width = e.nativeEvent.layout.width - 36;
    const height = e.nativeEvent.layout.height - 24;
    setRoom((r) => (r && Math.abs(r.w - width) < 1 && Math.abs(r.h - height) < 1 ? r : { w: width, h: height }));
  };
  const k = room ? Math.min(1, room.w / GRID_W, room.h / BLOCK_H) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <FlagSun size={330} opacity={0.55} style={styles.sun} />

      <Animated.View entering={rise(0, reduced)} style={styles.head}>
        <OutlinedHeadline small="Spanish, the way" big="Argentina says it" />
      </Animated.View>

      <View style={styles.room} onLayout={onRoom}>
        {k > 0 ? (
          // Scaled about its centre; the outer box takes the scaled size so the layout stays honest.
          <View style={{ width: GRID_W * k, height: BLOCK_H * k }}>
            <View
              style={[
                styles.block,
                { left: (GRID_W * k - GRID_W) / 2, top: (BLOCK_H * k - BLOCK_H) / 2, transform: [{ scale: k }] },
              ]}>
              <Animated.View entering={reduced ? FadeIn.duration(200) : undefined} style={styles.grid}>
                {PAIRS.map((p, i) => (
                  <WordSwap key={p.street} pair={p} delay={START + i * STAGGER} reduced={reduced} />
                ))}
              </Animated.View>
              <Animated.View entering={reduced ? FadeIn.duration(200) : rise(4)} style={styles.panchoWrap}>
                <Image source={POSE.mate} style={styles.pancho} contentFit="contain" accessibilityLabel="Pancho the capybara with his mate" />
              </Animated.View>
            </View>
          </View>
        ) : null}
      </View>

      <Animated.View entering={rise(1, reduced)} style={styles.actions}>
        <Button title="Get started" onPress={go} />
        <Pressable onPress={() => router.push('/login')} hitSlop={8} style={styles.signin} accessibilityRole="button">
          <Text style={styles.signinText}>I already have an account</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

/**
 * The hand-drawn line through a word `w` wide: two gentle curves, and its
 * length (sampled, a few pixels over) so a dash of that length can draw it from
 * nothing to whole without a stub showing at either end.
 */
function strikeLine(w: number) {
  const p0 = [2, 11];
  const c1 = [w * 0.18, 6];
  const c2 = [w * 0.3, 13];
  const p1 = [w * 0.48, 9];
  const c3 = [w * 0.78, 6];
  const p2 = [w + 10, 10];
  const c2r = [2 * p1[0] - c2[0], 2 * p1[1] - c2[1]]; // what `S` reflects
  const at = (a: number[], b: number[], c: number[], d: number[], t: number, i: number) =>
    (1 - t) ** 3 * a[i] + 3 * (1 - t) ** 2 * t * b[i] + 3 * (1 - t) * t ** 2 * c[i] + t ** 3 * d[i];
  let length = 0;
  for (const [a, b, c, d] of [
    [p0, c1, c2, p1],
    [p1, c2r, c3, p2],
  ]) {
    for (let k = 1; k <= 24; k++) {
      const t0 = (k - 1) / 24;
      const t1 = k / 24;
      length += Math.hypot(at(a, b, c, d, t1, 0) - at(a, b, c, d, t0, 0), at(a, b, c, d, t1, 1) - at(a, b, c, d, t0, 1));
    }
  }
  return { d: `M ${p0} C ${c1} ${c2} ${p1} S ${c3} ${p2}`, length: length + 4 };
}

/**
 * One pair: the textbook word lands, a hand-drawn rosa line crosses it out
 * left to right, the word steps back, and the street word's sticker is
 * slapped on under it. With reduced motion it is all simply there.
 */
function WordSwap({ pair, delay, reduced }: { pair: Pair; delay: number; reduced: boolean }) {
  // The crossed-out word's width, so the line spans it whatever the font draws.
  const [w, setW] = useState(0);
  const line = strikeLine(w);
  // Set with the width, before the line first draws, so it never shows uncovered for a frame.
  const length = useSharedValue(0);
  const onWord = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    length.value = strikeLine(width).length;
    setW(width);
  };

  const book = useSharedValue(reduced ? 1 : 0);
  const dim = useSharedValue(reduced ? 1 : 0);
  const strike = useSharedValue(reduced ? 1 : 0);
  const slap = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    book.value = withDelay(delay, withTiming(1, { duration: 240, easing: EASE_OUT }));
    strike.value = withDelay(delay + STRIKE_AT, withTiming(1, { duration: 280, easing: EASE_OUT }));
    dim.value = withDelay(delay + FADE_AT, withTiming(1, { duration: 300, easing: EASE_OUT }));
    slap.value = withDelay(delay + SLAP_AT, withTiming(1, { duration: 320, easing: EASE_OUT }));
  }, [reduced, delay, book, strike, dim, slap]);

  const bookStyle = useAnimatedStyle(() => ({
    opacity: book.value * (1 - 0.3 * dim.value),
    transform: [{ translateY: 6 * (1 - book.value) }],
  }));
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: length.value * (1 - strike.value) }));
  const stickerStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, slap.value * 2),
    transform: [{ rotate: pair.tilt }, { scale: 0.9 + 0.1 * slap.value }],
  }));

  return (
    <View
      style={styles.pair}
      accessible
      accessibilityLabel={`${pair.book}, crossed out. ${pair.street}: ${pair.means}.`}>
      <Animated.View style={[styles.bookWrap, bookStyle]} onLayout={onWord}>
        <Text style={styles.book}>{pair.book}</Text>
        {w > 0 ? (
          <Svg width={w + 12} height={18} style={styles.strike} pointerEvents="none">
            <AnimatedPath
              d={line.d}
              stroke={colors.primary}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={[line.length, line.length]}
              animatedProps={lineProps}
            />
          </Svg>
        ) : null}
      </Animated.View>
      <Animated.View style={[styles.sticker, { backgroundColor: pair.tone }, pair.art ? null : styles.stickerPlain, stickerStyle]}>
        {pair.art ? <Image source={pair.art} style={styles.art} contentFit="contain" accessible={false} /> : null}
        <View>
          <Text style={styles.street}>{pair.street}</Text>
          <Text style={styles.means}>{pair.means}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  sun: { left: -150, bottom: 150 },
  head: { paddingTop: 18, paddingHorizontal: 26, maxWidth: 400, width: '100%', alignSelf: 'center' },
  room: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  block: { position: 'absolute', width: GRID_W, height: BLOCK_H, alignItems: 'center' },
  grid: { width: GRID_W, height: GRID_H, flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP },
  pair: { width: COL, height: PAIR_H, alignItems: 'center', gap: 4 },
  bookWrap: { height: BOOK_H, justifyContent: 'center', paddingHorizontal: 4 },
  book: { ...font.display[800], fontSize: 21, lineHeight: BOOK_H, letterSpacing: -0.2, color: colors.muted },
  strike: { position: 'absolute', left: -2, top: 5 },
  sticker: {
    height: STICKER_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: 22,
    boxShadow: clay.surface,
  },
  stickerPlain: { paddingLeft: 18, paddingRight: 18 },
  art: { width: 46, height: 46 },
  street: { ...font.display[900], fontSize: 27, lineHeight: 29, letterSpacing: -0.4, color: colors.onPastel },
  means: { ...font.body[800], fontSize: 13, lineHeight: 16, color: 'rgba(58, 42, 32, 0.65)' },
  panchoWrap: { marginTop: PANCHO_GAP },
  pancho: { width: Math.round((PANCHO_H * 280) / 384), height: PANCHO_H },
  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 4, maxWidth: 480, width: '100%', alignSelf: 'center' },
  signin: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  signinText: { ...font.body[800], fontSize: 16, color: colors.primary },
});
