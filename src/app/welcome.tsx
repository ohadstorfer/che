import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClipCard } from '@/components/clip-card';
import { rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, font, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Welcome — the first screen of a fresh install. One claim and the clip that
// proves it: a textbook question, stickered over word by word with the Buenos
// Aires one, ending on Pancho's "¿Dale?". The button answers him, so it only
// arrives once he has asked. Signing in is here too, quietly.
// ---------------------------------------------------------------------------

export default function Welcome() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const [asked, setAsked] = useState(false);
  // Staff replaying onboarding from the admin screen start here too, and the
  // replay flag rides along so onboarding knows there is already an account.
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const next = replay ? '/onboarding?replay=1' : '/onboarding';

  // Onboarding is loaded while the clip plays, so "Dale" moves at once.
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
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Animated.Text entering={rise(1, reduced)} style={styles.title} accessibilityRole="header">
          Buenos Aires doesn&apos;t speak textbook Spanish.
        </Animated.Text>
        <Animated.Text entering={rise(2, reduced)} style={styles.sub}>
          Learn the one people here really use.
        </Animated.Text>
      </View>

      <View style={styles.clip}>
        <ClipCard
          source={require('@/assets/videos/onboarding-welcome.mp4')}
          label="A textbook question, ¿Tú eres de aquí?, stickered over word by word with the Buenos Aires one; then Pancho asks ¿Dale?"
          reduced={reduced}
          onEnded={() => setAsked(true)}
        />
      </View>

      <View style={styles.actions}>
        {asked ? (
          <Animated.View entering={reduced ? FadeIn.duration(200) : rise(0)}>
            <Button title="Dale, show me" onPress={go} />
          </Animated.View>
        ) : (
          <View style={styles.ctaSpace} />
        )}
        <Animated.View entering={rise(10, reduced)}>
          <Pressable onPress={() => router.push('/login')} hitSlop={8} style={styles.signin} accessibilityRole="button">
            <Text style={styles.signinText}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { alignItems: 'center', gap: 8, paddingTop: 30, paddingHorizontal: 26, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { ...type.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.7, color: colors.ink, textAlign: 'center' },
  sub: { ...font.body[600], fontSize: 16.5, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  clip: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 18, maxWidth: 480, width: '100%', alignSelf: 'center' },
  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 4, maxWidth: 480, width: '100%', alignSelf: 'center' },
  ctaSpace: { height: 54 },
  signin: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  signinText: { ...font.body[800], fontSize: 16, color: colors.primary },
});
