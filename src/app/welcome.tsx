import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { In, Slap } from '@/components/cheer-bits';
import { EASE_OUT, rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { trackStep } from '@/lib/funnel';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel } from '@/lib/theme';
import { prefetchRemoteConfig } from '@/lib/remote-config';

// ---------------------------------------------------------------------------
// Welcome — the first screen of a fresh install. The promise, in the same
// three lines the paywall opens with, centred: two big lines rise in, and
// "In a few minutes a day." is slapped on as a rosa sticker, the way the
// festejos land their titles. Under it, two rows of Argentina on stickers
// (mate, asado, alfajor…) drift past, each its own way and speed, each with
// its word. The button is there from the start. Signing in is here, quietly.
// ---------------------------------------------------------------------------

/** The paywall's headline, word for word: the first promise and the last one match. */
const HERO = ['Understand Argentines.', 'Sound like one.', 'In a few minutes a day.'];

/** Each sticker has its own colour, picked so no two neighbours match, the seam where the loop wraps included. */
type Thing = { word: string; art: ImageSourcePropType; tone: string };

const ROWS: Thing[][] = [
  [
    { word: 'mate', art: require('@/assets/images/objects/mate-figure.webp'), tone: pastel.butter },
    { word: 'asado', art: require('@/assets/images/objects/asado-figure.webp'), tone: pastel.sky },
    { word: 'alfajor', art: require('@/assets/images/objects/alfajor-figure.webp'), tone: pastel.peach },
    { word: 'empanadas', art: require('@/assets/images/objects/empanadas-figure.webp'), tone: pastel.sage },
    { word: 'dulce de leche', art: require('@/assets/images/objects/dulce-de-leche-figure.webp'), tone: pastel.lav },
    { word: 'medialunas', art: require('@/assets/images/objects/medialuna-figure.webp'), tone: pastel.peach },
  ],
  [
    { word: 'bondi', art: require('@/assets/images/objects/buenos-aires-colectivo-figure.webp'), tone: pastel.sage },
    { word: 'tango', art: require('@/assets/images/objects/tango-figure.webp'), tone: pastel.lav },
    { word: 'choripán', art: require('@/assets/images/objects/choripan-figure.webp'), tone: pastel.butter },
    { word: 'fútbol', art: require('@/assets/images/objects/futbol-figure.webp'), tone: pastel.sky },
    { word: 'facturas', art: require('@/assets/images/objects/facturas-figure.webp'), tone: pastel.peach },
    { word: 'fernet', art: require('@/assets/images/objects/fernet-figure.webp'), tone: pastel.lav },
  ],
];

const TILTS = ['-4deg', '3deg', '-2deg', '4deg', '-3deg', '2deg'];

const TILE = 118;
const GAP = 16;
/** One pass of a row: every sticker once. The row is drawn twice so the loop never shows a seam. */
const PASS = ROWS[0].length * (TILE + GAP);
/** Seconds for one pass, per row: slow, and never the same, so the rows don't march in step. */
const SECONDS = [34, 40];

export default function Welcome() {
  // Onboarding's dashboard knobs, asked now so its first question knows whether it is left out.
  useEffect(() => prefetchRemoteConfig(), []);
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  // Staff replaying onboarding from the admin screen start here too, and the
  // replay flag rides along so onboarding knows there is already an account.
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const next = replay ? '/onboarding?replay=1' : '/onboarding';

  // Onboarding is loaded while the stickers drift, so "Get started" moves at once.
  useEffect(() => {
    router.prefetch(next);
    if (!replay) trackStep('welcome');
  }, [next, replay]);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.middle}>
        <View style={styles.head} accessibilityRole="header" accessible accessibilityLabel={HERO.join(' ')}>
          <In delay={80}>
            <Text style={styles.hero} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {HERO[0]}
            </Text>
          </In>
          <In delay={220}>
            <Text style={styles.hero} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {HERO[1]}
            </Text>
          </In>
          <Slap delay={520} tilt={-3} style={styles.sticker}>
            <Text style={styles.stickerText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {HERO[2]}
            </Text>
          </Slap>
        </View>

        <View style={styles.rows} accessible accessibilityLabel="Mate, asado, alfajor, empanadas, tango and more of Argentina">
          {ROWS.map((row, r) => (
            <Row key={r} things={row} index={r} reduced={reduced} />
          ))}
        </View>
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
 * One row, drifting forever: the middle row goes right, the others left.
 * Linear, because it's constant motion. It fades in a beat after the
 * headline, row by row. With reduced motion it stands still.
 */
function Row({ things, index, reduced }: { things: Thing[]; index: number; reduced: boolean }) {
  const toRight = index % 2 === 1;
  const x = useSharedValue(toRight ? -PASS : 0);
  useEffect(() => {
    if (reduced) return;
    x.value = withRepeat(withTiming(toRight ? 0 : -PASS, { duration: SECONDS[index] * 1000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(x);
  }, [index, reduced, toRight, x]);

  const shown = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) shown.value = withDelay(850 + index * 140, withTiming(1, { duration: 420, easing: EASE_OUT }));
  }, [index, reduced, shown]);

  const drift = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateX: x.value - (toRight ? 0 : index * 40) }, { translateY: 10 * (1 - shown.value) }],
  }));

  // Drawn twice for a seamless loop. Colour and tilt follow the sticker, not its
  // place in the doubled list, so nothing changes when the loop wraps.
  const twice = [...things, ...things];
  return (
    <Animated.View entering={reduced ? FadeIn.duration(200) : undefined} style={[styles.row, drift]}>
      {twice.map((t, i) => (
        <View
          key={`${t.word}-${i}`}
          style={[styles.tile, { backgroundColor: t.tone, transform: [{ rotate: TILTS[((i % things.length) + index) % TILTS.length] }] }]}>
          <Image source={t.art} style={styles.art} contentFit="contain" accessible={false} />
          <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {t.word}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  // Headline and stickers sit together in the middle of what the buttons leave.
  middle: { flex: 1, justifyContent: 'center', gap: 40 },
  head: { paddingHorizontal: 24, maxWidth: 440, width: '100%', alignSelf: 'center', alignItems: 'center' },
  hero: { ...font.display[900], fontSize: 40, lineHeight: 44, letterSpacing: -1, color: colors.ink, textAlign: 'center' },
  sticker: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.primary, boxShadow: clay.surface, maxWidth: '100%' },
  stickerText: { ...font.display[900], fontSize: 27, lineHeight: 32, letterSpacing: -0.4, color: colors.onPrimary, textAlign: 'center' },
  rows: { gap: 18 },
  row: { flexDirection: 'row', gap: GAP, paddingHorizontal: GAP / 2 },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingHorizontal: 8,
    boxShadow: clay.surface,
  },
  art: { width: 74, height: 74 },
  word: { ...font.display[800], fontSize: 15, lineHeight: 18, color: colors.onPastel, marginTop: 2 },
  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 4, maxWidth: 480, width: '100%', alignSelf: 'center' },
  signin: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  signinText: { ...font.body[800], fontSize: 16, color: colors.primary },
});
