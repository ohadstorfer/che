import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MASCOT_NAME, pop, POSE, SpeechBubble } from '@/components/mascot';
import { rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, font, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Welcome — the first screen of a fresh install. The carpincho says hello and
// what he's here for; he asks every question after this one. Signing in is
// here too, quietly, for the people who already have Che.
// ---------------------------------------------------------------------------

export default function Welcome() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Animated.View entering={pop(250, reduced)} style={{ transformOrigin: 'bottom center' }}>
          <SpeechBubble tail="bottom" style={styles.bubble}>
            <Text style={styles.hola}>¡Buenas! Soy {MASCOT_NAME}.</Text>
            <Text style={styles.holaEn}>Hi! I&apos;m {MASCOT_NAME}.</Text>
          </SpeechBubble>
        </Animated.View>
        <Animated.View entering={rise(0, reduced)}>
          <Image source={POSE.wave} style={styles.art} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho, waving`} />
        </Animated.View>
        <Animated.Text entering={rise(3, reduced)} style={styles.title} accessibilityRole="header">
          I&apos;ll help you learn real Argentine Spanish.
        </Animated.Text>
        <Animated.Text entering={rise(4, reduced)} style={styles.sub}>
          Vos, lunfardo and the way Buenos Aires actually talks. Not the textbook.
        </Animated.Text>
      </View>

      <Animated.View entering={rise(6, reduced)} style={styles.actions}>
        <Button title="Dale, let's go" onPress={() => router.push('/onboarding')} />
        <Pressable onPress={() => router.push('/login')} hitSlop={8} style={styles.signin} accessibilityRole="button">
          <Text style={styles.signinText}>I already have an account</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, maxWidth: 480, width: '100%', alignSelf: 'center' },
  bubble: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22 },
  hola: { ...font.display[800], fontSize: 21, letterSpacing: -0.3, color: colors.primaryDark },
  holaEn: { ...font.body[600], fontSize: 14, color: colors.muted, marginTop: 2 },
  art: { width: 180, height: 230, marginTop: 18 },
  title: { ...type.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: colors.ink, textAlign: 'center', marginTop: 22 },
  sub: { ...type.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 8, maxWidth: 480, width: '100%', alignSelf: 'center' },
  signin: { alignSelf: 'center', paddingVertical: 12 },
  signinText: { ...font.body[800], fontSize: 16, color: colors.primary },
});
