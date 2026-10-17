import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MASCOT_NAME, pop, POSE } from '@/components/mascot';
import { IconButton, rise } from '@/components/onboarding-ui';
import { type Provider, SocialButtons } from '@/components/social-buttons';
import { tap } from '@/lib/haptics';
import { goBack, resetTo } from '@/lib/nav';
import { signInWithApple, signInWithGoogle } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, pastel, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Login — for the people who already have Posta. One tap with Apple (on Apple
// devices) or Google: those are the only ways in. A new account is not made
// here: that starts with onboarding, whose plan it saves.
// ---------------------------------------------------------------------------

/** Supabase's messages are English and technical; these are the ones people hit. */
function explain(message: string): string {
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'That sign-in option isn’t working right now. Try the other one.';
  if (/network|fetch/i.test(message)) return 'No connection. Try again.';
  return message;
}

/** Apple and Google make an account for whoever taps them. Someone who did
 *  that here without ever having one has no plan yet: she gets onboarding
 *  (which skips its account step for a signed-in person), not an empty Home. */
async function landAfterSocial() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const fresh = !!user && !user.user_metadata?.onboarding && Date.now() - new Date(user.created_at).getTime() < 2 * 60 * 1000;
  resetTo(fresh ? '/onboarding' : '/home');
}

export default function Login() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const social = async (which: Provider) => {
    if (busy) return;
    tap();
    setBusy(which);
    setError(null);
    const res = which === 'apple' ? await signInWithApple() : await signInWithGoogle();
    if (res.status === 'ok') return landAfterSocial();
    setBusy(null);
    if (res.status === 'error') setError(explain(res.message));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={() => goBack('/welcome')} />
      </View>
      <View style={styles.hero}>
        <Animated.View entering={pop(0, reduced)} style={styles.tile}>
          <View style={styles.pod} />
          <Image source={POSE.wave} style={styles.art} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho, waving`} />
        </Animated.View>
        <Animated.Text entering={rise(2, reduced)} style={styles.title} accessibilityRole="header">
          ¡Volviste!{'\n'}Welcome back.
        </Animated.Text>
        <Animated.Text entering={rise(3, reduced)} style={styles.sub}>
          Sign in to pick up where you left off.
        </Animated.Text>
      </View>
      <Animated.View entering={rise(5, reduced)} style={styles.actions}>
        {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        <SocialButtons busy={busy} onPress={(which) => void social(which)} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, maxWidth: 480, width: '100%', alignSelf: 'center' },
  // A sticker: flat sky, ink outline, set down a touch crooked.
  tile: {
    width: 300,
    maxWidth: '100%',
    height: 240,
    borderRadius: 46,
    backgroundColor: pastel.sky,
    boxShadow: clay.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transform: [{ rotate: '-1.5deg' }],
  },
  pod: { position: 'absolute', top: 30, width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.5)' },
  art: { width: 150, height: 214, marginBottom: -6 },
  title: { ...type.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.7, color: colors.ink, textAlign: 'center', marginTop: 26 },
  sub: { ...type.body, fontSize: 16.5, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 8 },
  actions: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, gap: 12, maxWidth: 480, width: '100%', alignSelf: 'center' },
  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk },
});
