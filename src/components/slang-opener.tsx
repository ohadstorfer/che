import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Text as SvgText } from 'react-native-svg';

import { useSlap } from '@/components/sticker';
import { colors, font, press } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The first screen of a slang round. The whole screen turns butter and says
// one thing: this is slang, not a lesson. A pastel as a page is otherwise off
// limits (theme.ts keeps them for decoration), which is exactly why it reads
// as a different mode. One headline, one picture, one button.
// ---------------------------------------------------------------------------

const WORD = 'SLANG';
const W = 340;
const H = 132;
const SIZE = 112;
const STROKE = 9;

/** SLANG, cut out like a sticker: cream letters, an ink outline, a hard ink shadow. */
function Headline() {
  const shared = {
    x: W / 2,
    y: 100,
    textAnchor: 'middle' as const,
    fontFamily: 'Gabarito_900Black',
    fontSize: SIZE,
    letterSpacing: -3,
  };
  const ink = { fill: colors.ink, stroke: colors.ink, strokeWidth: STROKE, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* The shadow, the outline, then the letters: three copies of one word. */}
      <SvgText {...shared} {...ink} x={W / 2 + 5} y={107}>
        {WORD}
      </SvgText>
      <SvgText {...shared} {...ink}>
        {WORD}
      </SvgText>
      <SvgText {...shared} fill={colors.card}>
        {WORD}
      </SvgText>
    </Svg>
  );
}

/** The gaucho walks in under the headline: a short rise and a fade, once. */
function useRise(delay: number) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 280,
      delay,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [t, delay]);
  return { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] };
}

export function SlangOpener({ onStart }: { onStart: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const slap = useSlap(0, '-4deg');
  const rise = useRise(160);
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <Animated.View style={[styles.title, slap]} accessible accessibilityRole="header" accessibilityLabel="Slang exercise">
          <Headline />
          <Text style={styles.sub}>exercise</Text>
        </Animated.View>
        <Animated.View style={rise}>
          <Image
            source={require('@/assets/images/capybara/capybara-gaucho-figure.webp')}
            style={styles.art}
            contentFit="contain"
            accessible={false}
          />
        </Animated.View>
      </View>
      <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? press.scale : 1 }] },
            Platform.OS === 'web'
              ? ({
                  transitionProperty: 'transform',
                  transitionDuration: `${press.duration}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                } as object)
              : null,
          ]}>
          <Text style={styles.buttonText}>Let's go</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 6 },
  title: { alignItems: 'center' },
  sub: { ...font.display[800], fontSize: 26, lineHeight: 30, color: colors.ink, marginTop: 2 },
  art: { width: 260, height: 290 },
  footer: { paddingHorizontal: 20, paddingTop: 8, maxWidth: 560, width: '100%', alignSelf: 'center' },
  // Ink, not rosa: on butter the rosa button would be one more colour, and this screen has one.
  button: {
    minHeight: 58,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px rgba(58, 42, 32, 0.35)`,
  },
  buttonText: { ...font.body[800], fontSize: 18, color: colors.onPrimary },
});
