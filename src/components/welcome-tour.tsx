import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { POSE, pop } from '@/components/mascot';
import { StickerFigure } from '@/components/sticker';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { tap } from '@/lib/haptics';
import { clay, colors, font, pastel, press, radius } from '@/lib/theme';
import { finishWelcomeTour, useTabBarRect } from '@/lib/welcome-tour';

// ---------------------------------------------------------------------------
// WelcomeTour
//
// Right after her first purchase, Pancho walks her round the four tabs. Each
// step really switches to its tab, so the real screen sits behind the dimmed
// overlay, and a hole is cut over that tab in the bar with a soft butter glow
// breathing around it. Finishing or skipping lands her on the Course tab.
//
// Design: canvas "Onboarding flow" → "14 Welcome tour, after the first
// purchase" (w01–w05).
// ---------------------------------------------------------------------------

const GUITAR = require('@/assets/images/capybara/capybara-musica-figure.webp');

/** The dim: the warm ink at two-thirds, as the design has it. */
const DIM = 'rgba(42, 30, 22, 0.66)';
/** A progress dot not yet reached: ink at a fifth, so it reads on cream. */
const DOT_OFF = 'rgba(58, 42, 32, 0.18)';

/** Moving on screen: ease-in-out, the tab bar's own pill curve. */
const MOVE = { duration: 240, easing: Easing.bezier(0.77, 0, 0.175, 1) };

type Chip = { label: string; tone: string };
type TabStep = {
  tab: number;
  route: '/home' | '/words' | '/culture' | '/hablar';
  title: string;
  body: string;
  chips?: Chip[];
  after?: string;
};

const STEPS: TabStep[] = [
  {
    tab: 0,
    route: '/home',
    title: 'This is your road.',
    body: 'Every unit mixes four kinds of lessons, each has its own grammar and vocabulary topic.',
    chips: [
      { label: 'Exercise', tone: pastel.sky },
      { label: 'Culture', tone: pastel.sage },
      { label: 'Slang', tone: pastel.peach },
      { label: 'Speaking', tone: pastel.lav },
    ],
  },
  {
    tab: 1,
    route: '/words',
    title: 'Your words and slang.',
    body: 'Every word you learn, with its photo. Plus slang packs: what Argentines really say.',
  },
  {
    tab: 2,
    route: '/culture',
    title: 'How life works here.',
    body: 'Mate, asado, tipping, saying hi with a kiss. Guess first, then learn why.',
  },
  {
    tab: 3,
    route: '/hablar',
    title: 'Call me anytime.',
    body: 'Talk out loud, I answer in Argentine Spanish and fix what sounds off. One chat a day is included.',
  },
];

export function WelcomeTour() {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const bar = useTabBarRect();
  // 0 is Pancho's hello; 1–4 are the tabs.
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<{
    x: number;
    y: number;
    h: number;
  } | null>(null);
  const rootRef = useRef<View>(null);

  const tabStep = step > 0 ? STEPS[step - 1] : null;

  // The tour starts on the Course tab, wherever she was.
  useEffect(() => {
    router.navigate(tabStep?.route ?? '/home');
  }, [tabStep?.route]);

  // Android back is Skip: the tour never traps her.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finishWelcomeTour();
      return true;
    });
    return () => sub.remove();
  }, []);

  // The hole, in this overlay's own coordinates.
  const hole =
    bar && origin && tabStep
      ? (() => {
          const slot = (bar.width - bar.pad * 2) / bar.count;
          const h = bar.height - bar.pad * 2 + 6;
          return {
            x: bar.x - origin.x + bar.pad + tabStep.tab * slot,
            y: bar.y - origin.y + bar.pad - 3,
            w: slot,
            h,
          };
        })()
      : null;

  const holeX = useSharedValue(hole?.x ?? 0);
  const placed = useRef(false);
  useEffect(() => {
    if (!hole) return;
    // The first placement lands; after that the hole slides from tab to tab.
    if (!placed.current || reduced) holeX.value = hole.x;
    else holeX.value = withTiming(hole.x, MOVE);
    placed.current = true;
  }, [hole?.x, reduced]);
  const holeMove = useAnimatedStyle(() => ({
    transform: [{ translateX: holeX.value }],
  }));

  // The glow breathes out and back: grows a little as it fades, like the
  // design's 9px halo. Off for reduced motion — a steady ring instead.
  const breath = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    breath.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduced]);
  const glow = useAnimatedStyle(() => ({
    opacity: reduced ? 0.95 : 0.95 * (1 - breath.value),
    transform: [{ translateX: holeX.value }, { scale: reduced ? 1 : 1 + 0.12 * breath.value }],
  }));

  // Skip, Got it! and "I'll explore on my own" all land her back on the
  // Course tab, wherever the tour had taken her.
  const finish = () => {
    tap();
    finishWelcomeTour();
    router.navigate('/home');
  };

  const next = () => {
    if (step === STEPS.length) return finish();
    tap();
    setStep(step + 1);
  };

  const name = profile?.display_name?.trim();

  return (
    <Animated.View
      ref={rootRef}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(160)}
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y, h }));
      }}
    >
      {/* Nothing under the overlay is tappable while the tour plays: a catcher
          beneath the bubble takes every stray touch. */}
      <Pressable style={StyleSheet.absoluteFill} accessible={false} />
      {hole ? (
        <>
          {/* A hole with the dim as its shadow: the spread covers the screen. */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hole,
              {
                top: hole.y,
                width: hole.w,
                height: hole.h,
                borderRadius: hole.h / 2,
              },
              holeMove,
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                top: hole.y - 3,
                width: hole.w + 6,
                height: hole.h + 6,
                borderRadius: hole.h / 2 + 3,
                marginLeft: -3,
              },
              glow,
            ]}
          />
        </>
      ) : (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />
      )}

      {step === 0 ? (
        <Animated.View
          key="hello"
          entering={pop(120, reduced)}
          exiting={FadeOut.duration(120)}
          style={[styles.float, { bottom: insets.bottom + 24 }]}
        >
          <View style={styles.hello}>
            <Text style={styles.helloTitle}>{name ? `Welcome, ${name}!` : 'Welcome!'}</Text>
            <Text style={styles.helloBody}>You’re in. Want a 20-second look around?</Text>
            <View style={{ marginTop: 18 }}>
              <Button title="Show me around" onPress={next} />
            </View>
            <Pressable onPress={finish} hitSlop={8} style={styles.ownWay} accessibilityRole="button">
              <Text style={styles.link}>I’ll explore on my own</Text>
            </Pressable>
          </View>
          {/* After the card, not inside it: the card's outline is a shadow, and
              it would be drawn across his feet. */}
          <StickerFigure source={POSE.wave} style={styles.helloArt} accessibilityLabel="Pancho the carpincho, waving" />
        </Animated.View>
      ) : tabStep && hole && origin ? (
        <Animated.View
          key={step}
          entering={pop(80, reduced)}
          exiting={FadeOut.duration(100)}
          style={[styles.float, { bottom: origin.h - hole.y + 16 }]}
        >
          <View style={styles.bubble}>
            <View
              style={[
                styles.tail,
                {
                  left: Math.min(Math.max(hole.x + hole.w / 2 - 16 - 9, 18), (bar?.width ?? 360) - 36),
                },
              ]}
            />
            <Text style={styles.title}>{tabStep.title}</Text>
            <Text style={styles.body}>{tabStep.body}</Text>
            {tabStep.chips ? (
              <View style={styles.chips}>
                {tabStep.chips.map((c) => (
                  <View key={c.label} style={[styles.chip, { backgroundColor: c.tone }]}>
                    <Text style={styles.chipText}>{c.label}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {tabStep.after ? <Text style={styles.after}>{tabStep.after}</Text> : null}
            <View style={styles.footer}>
              <View style={styles.dots} accessibilityLabel={`Step ${step} of ${STEPS.length}`}>
                {STEPS.map((s, i) => (
                  <View key={s.route} style={[styles.dot, i === step - 1 ? styles.dotOn : null]} />
                ))}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
                  <Text style={styles.link}>Skip</Text>
                </Pressable>
                <Pressable onPress={next} accessibilityRole="button">
                  {({ pressed }) => (
                    <View style={[styles.next, { transform: [{ scale: pressed ? press.scale : 1 }] }]}>
                      <Text style={styles.nextText}>{step === STEPS.length ? 'Got it!' : 'Next'}</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
          <StickerFigure source={GUITAR} style={styles.guitar} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hole: {
    position: 'absolute',
    left: 0,
    boxShadow: `0 0 0 3000px ${DIM}`,
  },
  glow: {
    position: 'absolute',
    left: 0,
    borderWidth: 3,
    borderColor: pastel.butter,
  },
  float: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  hello: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  helloArt: {
    position: 'absolute',
    // Standing on the card's top edge, not sunk into it: only the feet overlap.
    top: -200,
    alignSelf: 'center',
    width: 210,
    height: 210,
  },
  helloTitle: {
    ...font.display[900],
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: 'center',
  },
  helloBody: {
    ...font.body[600],
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkOnWash,
    textAlign: 'center',
  },
  ownWay: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 6,
  },
  link: {
    ...font.body[700],
    fontSize: 14,
    color: colors.muted,
  },
  bubble: {
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderRadius: 24,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  tail: {
    position: 'absolute',
    bottom: -9,
    width: 18,
    height: 18,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
    boxShadow: `2.5px 2.5px 0 0 ${colors.ink}`,
  },
  guitar: {
    position: 'absolute',
    right: -4,
    // Sitting on the bubble's edge, so the outline never cuts through him.
    top: -96,
    width: 102,
    height: 104,
  },
  title: {
    ...font.display[900],
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: colors.ink,
    paddingRight: 92,
  },
  body: {
    ...font.body[600],
    marginTop: 6,
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.inkOnWash,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    boxShadow: clay.trough,
  },
  chipText: {
    ...font.body[800],
    fontSize: 13,
    color: colors.ink,
  },
  after: {
    ...font.body[600],
    marginTop: 10,
    fontSize: 14,
    lineHeight: 19,
    color: colors.inkOnWash,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: DOT_OFF,
  },
  dotOn: {
    width: 18,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  next: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.chip,
  },
  nextText: {
    ...font.body[800],
    fontSize: 15,
    color: colors.onPrimary,
  },
});
