import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Burst, Rays, Slap, Sparkles } from '@/components/cheer-bits';
import { Flame } from '@/components/flame';
import { RoundStats, type RoundStatsData, accuracyCheer } from '@/components/round-stats';
import { Button } from '@/components/ui';
import { ART, type Art } from '@/lib/cheer-deck';
import { success } from '@/lib/haptics';
import { clay, colors, font, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// LessonComplete — the beat between the last exercise and whatever comes next.
//
// A sticker card with Pancho on it, rays turning slowly behind him. He pops up
// into the card, and the moment he lands three things happen together,
// because they are one event: a handful of bits burst from behind him, the
// rosa check stuck on the card's corner draws itself, and the phone gives a
// success tap. A tag slaps onto the other corner with the cheer. Then the
// words and the round's numbers follow, a beat apart.
//
// The card changes from lesson to lesson — who he is and the colour he's on —
// so lesson thirty doesn't look like lesson one. A perfect round gets the
// gold card and the sparkles.
//
// It is the end of the day's first lesson only — the ones after it end on her
// standing in the unit (unit-progress.tsx). Nothing here is on a timer.
// ---------------------------------------------------------------------------

/** Strong ease-out: all of the movement is spent in the first third. */
const EASE = Easing.bezier(0.23, 1, 0.32, 1);
/** A small overshoot for the check landing, so it feels pressed, not placed. */
const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
const STEP = 90;
const LAND = 380; // when he has landed and the burst fires

const CARD_H = 250;
const CHECK_SIZE = 64;
// The check is drawn in a 112 box; on the badge it is CHECK_SIZE across.
const K = CHECK_SIZE / 112;
const CHECK = 'M36 58 L51 73 L78 43';
// The check's stroke runs from x=31 to x=83; the wipe that draws it starts and
// ends just outside that.
const WIPE_FROM = 28 * K;
const WIPE_TO = 88 * K;

const CHEERS = ['Nice work!', 'Nailed it!', 'Great job!', 'Well done!', 'Look at you!', '¡Bien ahí!', 'So good!', '¡Joya!'];

/** Who is on the card, and the colour he's on. */
const CARDS: { art: Art; tint: string }[] = [
  { art: 'wave', tint: pastel.sky },
  { art: 'tango', tint: pastel.lav },
  { art: 'mate', tint: pastel.sage },
  { art: 'kick', tint: pastel.peach },
  { art: 'musica', tint: pastel.butter },
  { art: 'asado', tint: pastel.peach },
  { art: 'gaucho', tint: pastel.sky },
  { art: 'empanadas', tint: pastel.sage },
  { art: 'alfajor', tint: pastel.lav },
  { art: 'sip', tint: pastel.butter },
];
const PERFECT_CARD = { art: 'gol' as Art, tint: pastel.butter };

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
  stats,
  onNext,
}: {
  streak: number | null;
  /** How the round went: tiles under the headline. */
  stats?: RoundStatsData;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const cardW = Math.min(320, width - 48);
  const perfect = stats?.accuracy === 100;
  // A round with no misses says so; otherwise one of the rotating cheers.
  const [cheer] = useState(() => (stats && accuracyCheer(stats.accuracy)) ?? CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  const [card] = useState(() => (perfect ? PERFECT_CARD : CARDS[Math.floor(Math.random() * CARDS.length)]));

  const cardIn = useSharedValue(0);
  const hop = useSharedValue(reduced ? 1 : 0);
  const badge = useSharedValue(reduced ? 1 : 0);
  const ripple = useSharedValue(0);
  const draw = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    cardIn.value = withTiming(1, { duration: reduced ? 160 : 300, easing: EASE });
    if (reduced) {
      success();
      return;
    }
    hop.value = withDelay(120, withSpring(1, { duration: 520, dampingRatio: 0.58 }));
    badge.value = withDelay(LAND, withTiming(1, { duration: 260, easing: POP }));
    ripple.value = withDelay(LAND + 120, withTiming(1, { duration: 620, easing: EASE }));
    draw.value = withDelay(LAND + 160, withTiming(1, { duration: 300, easing: EASE }));
    const t = setTimeout(success, LAND + 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardIn.value,
    transform: reduced ? [] : [{ translateY: 16 * (1 - cardIn.value) }, { scale: 0.96 + 0.04 * cardIn.value }],
  }));
  // Up from under the card's bottom edge, a little past, and back.
  const heroStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, hop.value * 3),
    transform: [{ translateY: (1 - hop.value) * 120 }, { scale: 0.85 + 0.15 * hop.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, badge.value * 2),
    transform: [{ scale: 0.6 + 0.4 * badge.value }, { rotate: `${(1 - badge.value) * -30}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: ripple.value === 0 ? 0 : 0.6 * (1 - ripple.value),
    transform: [{ scale: 1 + 0.9 * ripple.value }],
  }));
  // The check is drawn by a wipe, left to right, which is the way its stroke
  // runs: a window slides across while the check inside it stays put. It was a
  // dash offset set through animated props, and on the phone that never drew.
  const wipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: WIPE_FROM + (WIPE_TO - WIPE_FROM) * draw.value - CHECK_SIZE }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: CHECK_SIZE - WIPE_FROM - (WIPE_TO - WIPE_FROM) * draw.value }],
  }));

  const title = useEntrance(LAND + 200, 10);
  const line = useEntrance(LAND + 200 + STEP, 10);
  const tilesAt = LAND + 200 + STEP * (streak ? 2 : 1);
  const action = useEntrance(tilesAt + (stats ? STEP * 3 : 0), 10);

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width: cardW }]} accessible={false}>
        <Animated.View style={[styles.card, { backgroundColor: card.tint }, cardStyle]}>
          {/* Clipped inside so the rays stay on the card; the sticker shadow is on the card itself. */}
          <Burst cx={cardW / 2} cy={CARD_H * 0.5} delay={LAND} scale={0.85} />
          <View style={styles.clip} pointerEvents="none">
            <Rays size={cardW * 1.8} color="rgba(255,255,255,0.55)" top={CARD_H * 0.62} />
            {perfect ? <Sparkles width={cardW} height={CARD_H} /> : null}
            <View style={styles.floor} />
            <Animated.View style={[styles.hero, heroStyle]}>
              <Image source={ART[card.art]} style={styles.heroArt} contentFit="contain" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* The tag and the check sit beside the card, not in it: inside, the card's
            sticker outline was drawn over them. */}
        <Slap delay={LAND + 60} tilt={-7} style={[styles.tag, perfect && styles.tagPerfect]}>
          <Text style={[styles.tagText, perfect && styles.tagTextPerfect]}>{cheer}</Text>
        </Slap>

        <View style={styles.badgeSpot}>
          <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
          <Animated.View style={[styles.badge, badgeStyle]}>
            <View style={styles.wipe}>
              <Animated.View style={wipeStyle}>
                <View style={styles.wipe}>
                  <Animated.View style={checkStyle}>
                    <Svg width={CHECK_SIZE} height={CHECK_SIZE} viewBox="0 0 112 112">
                      <Path d={CHECK} stroke={colors.onPrimary} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  </Animated.View>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </View>

      <Animated.Text style={[styles.title, title]} accessibilityRole="header">
        Lesson complete!
      </Animated.Text>

      {streak ? (
        <Animated.View style={[styles.streakChip, line]}>
          <Flame size={20} />
          <Text style={styles.streak}>
            {streak} day{streak === 1 ? '' : 's'} in a row
          </Text>
        </Animated.View>
      ) : null}

      {stats ? <RoundStats stats={stats} delay={tilesAt} /> : null}

      <Animated.View style={[styles.actions, action]}>
        <Button title="Keep going" onPress={onNext} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  stage: { height: CARD_H, marginBottom: 10 },
  card: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, boxShadow: clay.float },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, overflow: 'hidden', alignItems: 'center' },
  // A darker band he stands on, so he isn't floating in the colour.
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, backgroundColor: 'rgba(58,42,32,0.08)' },
  hero: { position: 'absolute', left: 0, right: 0, bottom: 10, alignItems: 'center' },
  heroArt: { width: 190, height: 210 },
  tag: { position: 'absolute', top: -14, left: -10, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, boxShadow: clay.chip },
  tagPerfect: { backgroundColor: colors.primary },
  tagText: { ...font.display[900], fontSize: 20, lineHeight: 26, color: colors.ink },
  tagTextPerfect: { color: colors.onPrimary },
  badgeSpot: { position: 'absolute', right: -12, bottom: -16, width: CHECK_SIZE, height: CHECK_SIZE, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.button,
  },
  wipe: { width: CHECK_SIZE, height: CHECK_SIZE, overflow: 'hidden' },
  ripple: {
    position: 'absolute',
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  title: { ...font.display[900], fontSize: 34, lineHeight: 38, letterSpacing: -0.6, color: colors.ink, textAlign: 'center' },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    boxShadow: clay.chip,
  },
  streak: { ...font.body[800], fontSize: 16, color: colors.primary },
  // `stretch` would override the wrap's centring, and maxWidth then leaves the
  // button pinned to the left edge. Centre it explicitly.
  actions: { alignSelf: 'center', gap: 8, maxWidth: 320, width: '100%', marginTop: 8 },
});
