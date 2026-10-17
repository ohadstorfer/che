import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MascotSays } from '@/components/mascot';
import { IconButton, rise } from '@/components/onboarding-ui';
import { SaveButtons } from '@/components/save-account';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { goBack, resetTo } from '@/lib/nav';
import { type Answers, loadAnswers } from '@/lib/onboarding';
import type { SaveResult } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Save account — a guest (lib/guest.ts) adds a way to sign in to the account
// she already has, with Apple or Google. Account opens it, for a guest who
// said "Not now" on Ready. Done, it goes back to where she came from, which now sees
// a saved account.
// ---------------------------------------------------------------------------

export default function SaveAccount() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromAccount = params.from === 'account';
  const [answers, setAnswers] = useState<Answers | null>(null);

  useEffect(() => {
    void loadAnswers().then(setAnswers);
  }, []);

  const leave = () => goBack(fromAccount ? '/account' : '/ready');
  const done = (res: SaveResult) => {
    // An account she already had, with its own course: that's where she goes.
    if (res.status === 'switched' && res.returning) return resetTo('/home');
    leave();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={leave} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={{ marginLeft: -8, marginBottom: 18 }}>
          <MascotSays
            pose="tango"
            es="¡No lo pierdas!"
            en={fromAccount ? 'Save your progress, so it’s safe on any phone.' : 'Save your plan and I’ll keep it safe for you.'}
            size="sm"
            reduced={reduced}
          />
        </Animated.View>
        <Animated.View entering={rise(1, reduced)} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <SaveButtons answers={answers} onDone={done} />
        </Animated.View>
        <Text style={styles.legal}>
          By continuing you agree to the{' '}
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}>
            Terms
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 },
  body: { padding: 24, paddingTop: 8, maxWidth: 520, width: '100%', alignSelf: 'center', flexGrow: 1, gap: 16 },
  legal: { ...font.body[500], fontSize: 12.5, lineHeight: 17, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  legalLink: { color: colors.primaryDark, textDecorationLine: 'underline' },
});
