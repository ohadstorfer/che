import { Image } from 'expo-image';
import { Animated as RNAnimated, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { POSE } from '@/components/mascot';
import { EASE_OUT } from '@/components/onboarding-ui';
import { Headline } from '@/components/slang-opener';
import { useSlap } from '@/components/sticker';
import { tap } from '@/lib/haptics';
import { colors, font, pastel, press } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The door to her first class, in onboarding, right after "Building your
// course". Built like the slang opener (slang-opener.tsx): the whole page in
// one pastel (lavender here), a sticker headline slapped down, one picture,
// one ink button. "Skip the class" jumps over the
// class to the notifications step.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'transform', transitionDuration: `${press.duration}ms`, transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' } as object)
    : null;

/** Without `onSkip` there is no skip link (app_config `first_class_skip` = false). */
export function FirstClassOpener({ onStart, onSkip }: { onStart: () => void; onSkip?: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const slap = useSlap(0, '-4deg');
  // On a short phone Pancho gives way first, so the button never leaves the screen.
  const art = Math.max(110, Math.min(220, height - 620));
  const up = (ms: number) => (reduced ? FadeIn.duration(150) : FadeInDown.duration(320).delay(ms).easing(EASE_OUT));

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View accessible accessibilityRole="header" accessibilityLabel="Your first class">
          {/* RN Animated (useSlap), not Reanimated: the same slap as the slang opener. */}
          <RNAnimated.View style={slap}>
            <Text style={styles.your}>your</Text>
            <Headline word="FIRST" size={96} />
            <View style={styles.second}>
              <Headline word="CLASS" size={96} />
            </View>
          </RNAnimated.View>
        </View>
        {/* Said up front that it is a taste, not a test (2026-11-18). The
            part chips were dropped the same day. */}
        <Animated.View entering={up(120)} style={styles.time}>
          <Text style={styles.timeText}>QUICK TASTE · 2 MIN</Text>
        </Animated.View>
        <Animated.Text entering={up(200)} style={styles.line}>
          A little of everything in Posta.
        </Animated.Text>
        <Animated.View entering={up(160)}>
          <Image source={POSE.gol} style={{ width: art * 0.9, height: art, marginTop: 14 }} contentFit="contain" accessibilityLabel="Pancho celebrating" />
        </Animated.View>
      </View>
      <View style={[styles.footer, { paddingBottom: 12 + bottom }]}>
        <Pressable
          onPress={() => {
            tap();
            onStart();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
          <Text style={styles.buttonText}>Let’s go</Text>
        </Pressable>
        {onSkip ? (
          <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={6} style={styles.skip}>
            <Text style={styles.skipText}>Skip the class</Text>
          </Pressable>
        ) : (
          // The link's room stays, so the button doesn't sit lower when it is gone.
          <View style={styles.skip} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: pastel.lav },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 24 },
  your: { ...font.display[800], fontSize: 26, lineHeight: 30, color: colors.ink, textAlign: 'center', marginBottom: -26 },
  second: { marginTop: -34 },
  time: {
    marginTop: -2,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: colors.card,
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  timeText: { ...font.body[800], fontSize: 12, letterSpacing: 0.8, color: colors.ink },
  line: { ...font.body[700], fontSize: 17, lineHeight: 23, color: colors.ink, textAlign: 'center', maxWidth: 300, marginTop: -8 },
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 2, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center' },
  // Ink, as on the slang opener: the page already has its one colour.
  button: {
    alignSelf: 'stretch',
    minHeight: 58,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px rgba(58, 42, 32, 0.35)`,
  },
  buttonText: { ...font.body[800], fontSize: 18, color: colors.onPrimary },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  skipText: { ...font.body[700], fontSize: 14, color: colors.ink, opacity: 0.8 },
});
