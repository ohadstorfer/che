import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { POSE } from '@/components/mascot';
import { IconButton, rise } from '@/components/onboarding-ui';
import { SaveButtons } from '@/components/save-account';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { track } from '@/lib/funnel';
import { isGuest } from '@/lib/guest';
import { success, tap } from '@/lib/haptics';
import { resetTo } from '@/lib/nav';
import { type Answers, loadAnswers } from '@/lib/onboarding';
import { PASS_DAYS, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, pastel, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The free week (hard paywall only; lib/premium.tsx): the first unit and one
// chat with Pancho, for a week or until she has done both. Offered from the
// day after onboarding, by the paywall and by the day-1 notification
// (lib/free-unit-reminder). She takes it with a saved account, then Ready.
// ---------------------------------------------------------------------------

const ROWS: { icon: keyof typeof MaterialCommunityIcons.glyphMap; tone: string; text: string }[] = [
  { icon: 'book-open-variant', tone: pastel.peach, text: 'Your first unit: 8 lessons of real Argentine Spanish' },
  { icon: 'chat-processing-outline', tone: pastel.sky, text: 'One chat with Pancho, out loud' },
  { icon: 'credit-card-off-outline', tone: pastel.sage, text: 'No card, nothing to cancel' },
];

export default function FreeUnit() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const { session } = useAuth();
  const { pass, claimPass, refreshPass } = usePremium();
  const guest = isGuest(session);
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadAnswers().then(setAnswers);
    void refreshPass();
  }, [refreshPass]);

  const back = () => (router.canGoBack() ? router.back() : resetTo('/home'));

  const start = async () => {
    if (busy) return;
    tap();
    setBusy(true);
    setError(null);
    const after = await claimPass();
    setBusy(false);
    if (after?.state !== 'active') {
      return setError(after ? 'This free week isn’t available on this account.' : 'Could not start it. Check your connection and try again.');
    }
    success();
    track('free_pass_claimed', { guest });
    // Ready turns her reminder on and starts lesson 1.
    resetTo('/ready?pass=1');
  };

  const state = pass?.state ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton icon="close" label="Close" onPress={back} tint={colors.muted} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={styles.hero}>
          <View style={styles.heroPod} />
          <Image source={POSE.gol} style={styles.heroArt} contentFit="contain" accessible={false} />
        </Animated.View>
        <Animated.Text entering={rise(1, reduced)} style={styles.title} accessibilityRole="header">
          Try Posta free for a week
        </Animated.Text>
        <Animated.Text entering={rise(2, reduced)} style={styles.sub}>
          {`${PASS_DAYS} days, on us. When the week is over, or you've done it all, Premium opens the rest.`}
        </Animated.Text>

        <Animated.View entering={rise(3, reduced)} style={styles.rows}>
          {ROWS.map((r) => (
            <View key={r.icon} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: r.tone }]}>
                <MaterialCommunityIcons name={r.icon} size={20} color={colors.onPastel} />
              </View>
              <Text style={styles.rowText}>{r.text}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {state === null ? (
          <ActivityIndicator color={colors.muted} />
        ) : state !== 'offer' ? (
          <>
            <Text style={styles.note}>
              {state === 'soon'
                ? 'Your free week opens tomorrow.'
                : state === 'active'
                  ? 'Your free week has already started.'
                  : 'This free week isn’t available on this account.'}
            </Text>
            <Button title={state === 'active' ? 'Go to my unit' : 'Back'} onPress={() => (state === 'active' ? resetTo('/home') : back())} />
          </>
        ) : guest ? (
          <>
            <Text style={styles.note}>Save your account to start. It keeps your progress.</Text>
            <SaveButtons answers={answers} onDone={() => void start()} />
          </>
        ) : (
          <Button title="Start my free week" onPress={() => void start()} loading={busy} disabled={busy} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, minHeight: 44 },
  body: { paddingHorizontal: 24, paddingBottom: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  hero: { height: 176, alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  heroPod: { position: 'absolute', bottom: 0, width: 150, height: 150, borderRadius: 75, backgroundColor: pastel.sage, boxShadow: clay.surface },
  heroArt: { width: 138, height: 172 },
  title: { ...type.display, fontSize: 30, lineHeight: 34, color: colors.ink, textAlign: 'center', marginTop: 18 },
  sub: { ...type.body, fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 6 },
  rows: { gap: 12, marginTop: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 14, boxShadow: clay.flat },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', boxShadow: clay.chip },
  rowText: { ...type.body, flex: 1, fontSize: 15.5, lineHeight: 21, color: colors.ink },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 6, gap: 10, maxWidth: 520, width: '100%', alignSelf: 'center' },
  note: { ...type.body, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center' },
  error: { ...type.body, fontSize: 14, lineHeight: 20, color: colors.dangerInk, textAlign: 'center' },
});
