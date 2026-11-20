import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MASCOT_NAME, pop, POSE } from '@/components/mascot';
import { IconButton, rise } from '@/components/onboarding-ui';
import { type Provider, SocialButtons } from '@/components/social-buttons';
import { tap } from '@/lib/haptics';
import { goBack, resetTo } from '@/lib/nav';
import { signInWithApple, signInWithGoogle } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { colors, font, OUTLINE, pastel, type } from '@/lib/theme';

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
  useStatusBarColor(pastel.lav);
  const insets = useSafeAreaInsets();
  // Pancho scales with the screen: about 24% of its height (196×203 on an
  // 844 pt phone, as drawn), so the sheet and its buttons stay the clear focus.
  // Clamped so a small phone still shows his head and a big one doesn't make
  // him a poster. The disc behind him keeps the drawn proportions too.
  const { height } = useWindowDimensions();
  const artH = Math.round(Math.min(230, Math.max(150, height * 0.24)));
  const art = { width: Math.round(artH * 0.965), height: artH, marginBottom: -Math.round(artH * 0.128) };
  const podSize = Math.round(artH * 1.48);
  const pod = { width: podSize, height: podSize, borderRadius: podSize / 2, bottom: -Math.round(artH * 0.365) };
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
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={() => goBack('/welcome')} />
      </SafeAreaView>
      {/* Pancho stands on the sheet, his feet tucked behind its edge. */}
      <View style={styles.hero}>
        <View style={[styles.pod, pod]} />
        <Animated.View entering={pop(0, reduced)}>
          <Image source={POSE.wave} style={art} contentFit="cover" contentPosition="top" accessibilityLabel={`${MASCOT_NAME} the carpincho, waving`} />
        </Animated.View>
      </View>
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>
        <Animated.Text entering={rise(2, reduced)} style={styles.title} accessibilityRole="header">
          Welcome back
        </Animated.Text>
        <Animated.Text entering={rise(3, reduced)} style={styles.sub}>
          Sign in and your streak, words and lessons are right where you left them.
        </Animated.Text>
        <Animated.View entering={rise(5, reduced)} style={styles.actions}>
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
          <SocialButtons busy={busy} onPress={(which) => void social(which)} />
          <Text style={styles.newHere}>
            New here?{' '}
            <Text style={styles.link} onPress={() => router.push('/onboarding')} accessibilityRole="link" suppressHighlighting>
              Start learning
            </Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pastel.lav },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', zIndex: 0 },
  pod: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.35)' },
  // The sheet: oat, ink outline, rising from the bottom edge.
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    boxShadow: `0 0 0 ${OUTLINE}px ${colors.ink}`,
    paddingHorizontal: 24,
    paddingTop: 30,
    zIndex: 1,
  },
  title: { ...type.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.8, color: colors.ink, maxWidth: 480, width: '100%', alignSelf: 'center' },
  sub: { ...type.body, fontSize: 16.5, lineHeight: 23, color: colors.muted, marginTop: 8, maxWidth: 480, width: '100%', alignSelf: 'center' },
  actions: { paddingTop: 22, gap: 12, maxWidth: 480, width: '100%', alignSelf: 'center' },
  newHere: { ...type.body, fontSize: 14.5, lineHeight: 20, color: colors.muted, textAlign: 'center', marginTop: 6 },
  link: { ...font.body[700], color: colors.primary },
  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk },
});
