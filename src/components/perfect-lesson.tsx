import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Burst, DRAWER, In, Rays, Slap, Sparkles, Star } from '@/components/cheer-bits';
import { Button } from '@/components/ui';
import { ART, BITS } from '@/lib/cheer-deck';
import { success } from '@/lib/haptics';
import { clay, colors, font, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// PerfectLesson — a lesson with not one miss gets its own moment, before the
// usual end screen. Gold comes up out of the middle, the rays turn, three
// stars slap down one after the other with a tap each, and Pancho lifts the
// cup. The end screen after it still says "Perfect lesson!": this is the
// party, that is the receipt.
//
// Nothing here is on a timer: she goes on when she taps.
// ---------------------------------------------------------------------------

const GOLD = pastel.butter;
const STARS = [
  { tilt: -14, size: 62, lift: 18 },
  { tilt: 0, size: 84, lift: 0 },
  { tilt: 14, size: 62, lift: 18 },
];

export function PerfectLesson({ onNext }: { onNext: () => void }) {
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const t = useSharedValue(0);
  const big = Math.hypot(width, height) * 2;

  useEffect(() => {
    t.value = reduced ? withTiming(1, { duration: 200 }) : withDelay(60, withTiming(1, { duration: 620, easing: DRAWER }));
    if (reduced) {
      success();
      return;
    }
    // One tap for each star as it lands.
    const taps = STARS.map((_, k) => setTimeout(success, 520 + k * 200));
    return () => taps.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grow = useAnimatedStyle(() => (reduced ? { opacity: t.value } : { transform: [{ scale: 0.04 + t.value * 0.96 }] }));

  return (
    <View style={styles.full}>
      <Animated.View
        style={[{ position: 'absolute', width: big, height: big, borderRadius: big / 2, left: width / 2 - big / 2, top: height * 0.38 - big / 2, backgroundColor: GOLD }, grow]}
      />
      <Rays size={Math.max(width, height) * 1.4} color="rgba(255,255,255,0.55)" top={height * 0.38} />
      <Sparkles width={width} height={height} />
      <Burst cx={width / 2} cy={height * 0.38} delay={480} scale={1.3} />

      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.content} onPress={onNext} accessibilityLabel="Perfect lesson. No mistakes.">
          <View style={styles.stars}>
            {STARS.map((s, k) => (
              <Slap key={k} delay={460 + k * 200} tilt={s.tilt} style={{ marginTop: s.lift }}>
                <View style={styles.starSticker}>
                  <Star size={s.size} color={colors.ink} />
                  <View style={styles.starFace}>
                    <Star size={s.size - 10} color={k === 1 ? colors.primary : pastel.peach} />
                  </View>
                </View>
              </Slap>
            ))}
          </View>

          <In delay={900}>
            <View style={styles.stage}>
              <Image source={ART.gol} style={styles.pancho} contentFit="contain" />
              <Image source={BITS.copa} style={styles.cup} contentFit="contain" />
            </View>
          </In>

          <Slap delay={1050} tilt={-3} style={styles.banner}>
            <Text style={styles.bannerText}>Perfect lesson!</Text>
          </Slap>
          <In delay={1250}>
            <Text style={styles.line}>Not a single mistake.</Text>
          </In>
        </Pressable>

        <In delay={1450} style={styles.actions}>
          <Button title="Continue" onPress={onNext} />
        </In>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  stars: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 4 },
  // A star is drawn twice — ink behind, colour on top — so it reads as a sticker with an outline.
  starSticker: { alignItems: 'center', justifyContent: 'center' },
  starFace: { position: 'absolute' },
  stage: { width: 240, height: 200, alignItems: 'center', justifyContent: 'flex-end' },
  pancho: { width: 190, height: 200 },
  cup: { position: 'absolute', right: 6, bottom: 10, width: 84, height: 100, transform: [{ rotate: '10deg' }] },
  banner: { backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 22, paddingVertical: 10, boxShadow: clay.float },
  bannerText: { ...font.display[900], fontSize: 38, lineHeight: 42, color: colors.onPrimary, textAlign: 'center' },
  line: { ...font.body[800], fontSize: 18, color: colors.ink, textAlign: 'center' },
  actions: { alignSelf: 'center', width: '100%', maxWidth: 320, paddingHorizontal: 24, paddingBottom: 16 },
});

