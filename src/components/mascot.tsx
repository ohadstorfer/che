import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { EASE_OUT } from '@/components/onboarding-ui';
import { clay, colors, font, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The carpincho who walks her through onboarding: he asks the questions, and
// answers her answers. A figure beside a speech bubble, in a few poses.
// ---------------------------------------------------------------------------

/** His name. Not final: change it here and every line he says follows. */
export const MASCOT_NAME = 'Pancho';

export const POSE = {
  wave: require('@/assets/images/capybara/capybara-saludando-figure.webp'),
  cafe: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.webp'),
  sip: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.webp'),
  hand: require('@/assets/images/capybara/capybara-puteadas-figure.webp'),
  flag: require('@/assets/images/capybara/capybara-historia-figure.webp'),
  mate: require('@/assets/images/capybara/capybara-mate-figure.webp'),
  asado: require('@/assets/images/capybara/capybara-asado-figure.webp'),
  gol: require('@/assets/images/capybara/capybara-futbol-gol-figure.webp'),
  tango: require('@/assets/images/capybara/capybara-tango-figure.webp'),
} as const;
export type Pose = keyof typeof POSE;

// Pops from the corner nearest his mouth, the way a bubble would be blown.
// Never from nothing: 0.92 and transparent, so it reads as arriving.
const POP = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.92 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: EASE_OUT },
});
const FADE = new Keyframe({ 0: { opacity: 0 }, 100: { opacity: 1 } });
export const pop = (delay = 0, reduced?: boolean) => (reduced ? FADE.duration(180) : POP.delay(delay).duration(320));

/** A clay bubble. `tail` is the side he's on: left of it, or under it. */
export function SpeechBubble({
  children,
  tail = 'left',
  style,
}: {
  children: React.ReactNode;
  tail?: 'left' | 'bottom';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.bubble, tail === 'left' ? styles.bubbleLeft : null, style]}>
      {children}
      {tail === 'bottom' ? <View style={styles.tail} /> : null}
    </View>
  );
}

/**
 * He says something: a Spanish lead-in over the English line. Keyed by the
 * line, so a new line pops in fresh rather than the text swapping under a
 * bubble that doesn't move.
 */
export function MascotSays({
  pose,
  es,
  en,
  reduced,
  size = 'md',
}: {
  pose: Pose;
  es?: string;
  en: string;
  reduced?: boolean;
  size?: 'md' | 'sm';
}) {
  return (
    <View style={styles.row}>
      <Image
        source={POSE[pose]}
        style={size === 'md' ? styles.figure : styles.figureSm}
        contentFit="contain"
        accessibilityLabel={`${MASCOT_NAME} the carpincho`}
      />
      <Animated.View key={en} entering={pop(60, reduced)} style={styles.bubbleWrap}>
        <SpeechBubble>
          {es ? <Text style={styles.es}>{es}</Text> : null}
          <Text style={[styles.en, size === 'sm' && styles.enSm]} accessibilityRole="header" accessibilityLiveRegion="polite">
            {en}
          </Text>
        </SpeechBubble>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  figure: { width: 96, height: 128 },
  figureSm: { width: 84, height: 104 },
  bubbleWrap: { flex: 1, marginBottom: 26, transformOrigin: 'bottom left' },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    paddingVertical: 13,
    paddingHorizontal: 16,
    // Molded, like every other raised surface: no outline, just clay depth.
    boxShadow: clay.surface,
  },
  bubbleLeft: { borderBottomLeftRadius: 6 },
  tail: {
    position: 'absolute',
    left: '50%',
    bottom: -7,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderBottomRightRadius: 4,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
  },
  es: { ...font.body[800], fontSize: 13, letterSpacing: 0.2, color: colors.muted, marginBottom: 3 },
  en: { ...font.display[700], fontSize: 20, lineHeight: 25, letterSpacing: -0.3, color: colors.ink },
  enSm: { fontSize: 17, lineHeight: 23 },
});
