import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, type TextInput, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MascotSays } from '@/components/mascot';
import { IconButton, rise } from '@/components/onboarding-ui';
import { explainSave, keepAnswers, SaveButtons } from '@/components/save-account';
import { Button, Field } from '@/components/ui';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { goBack, resetTo } from '@/lib/nav';
import { type Answers, loadAnswers } from '@/lib/onboarding';
import { type SaveResult, saveWithEmail } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Save account — a guest (lib/guest.ts) adds a way to sign in to the account
// she already has. Ready opens it straight on the email form (its own screen
// has Apple and Google); Account opens it on all three, for a guest who said
// "Not now" then. Done, it goes back to where she came from, which now sees
// a saved account.
// ---------------------------------------------------------------------------

export default function SaveAccount() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{ mode?: string; from?: string }>();
  const fromAccount = params.from === 'account';
  const [mode, setMode] = useState<'social' | 'email'>(params.mode === 'email' ? 'email' : 'social');
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
        <IconButton icon="chevron-back" label="Back" onPress={() => (mode === 'email' && params.mode !== 'email' ? setMode('social') : leave())} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={rise(0, reduced)} style={{ marginLeft: -8, marginBottom: 18 }}>
            <MascotSays
              pose="tango"
              es="¡No lo pierdas!"
              en={fromAccount ? 'Save your progress, so it’s safe on any phone.' : 'Save your plan and I’ll keep it safe for you.'}
              size="sm"
              reduced={reduced}
            />
          </Animated.View>
          {mode === 'email' ? (
            <EmailForm answers={answers} cta={fromAccount ? 'Save my progress' : 'Save my plan'} reduced={reduced} onDone={done} />
          ) : (
            <Animated.View entering={rise(1, reduced)} style={{ flex: 1, justifyContent: 'flex-end' }}>
              <SaveButtons answers={answers} onEmail={() => setMode('email')} onDone={done} />
            </Animated.View>
          )}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EmailForm({
  answers,
  cta,
  reduced,
  onDone,
}: {
  answers: Answers | null;
  cta: string;
  reduced: boolean;
  onDone: (res: SaveResult) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const cleanEmail = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && password.length >= 6;

  const submit = async () => {
    if (!valid || busy) return;
    tap();
    setBusy(true);
    setError(null);
    const res = await saveWithEmail(cleanEmail, password);
    if (res.status === 'saved') await keepAnswers(res, answers);
    setBusy(false);
    if (res.status === 'error') return setError(explainSave(res.code === 'email_exists' ? 'email_exists' : res.message));
    if (res.status === 'confirm') return setNotice('We sent you a link to confirm your email. Open it and your plan is saved.');
    success();
    onDone(res);
  };

  const clear = () => {
    if (error) setError(null);
  };

  return (
    <Animated.View entering={rise(1, reduced)} style={{ gap: 16 }}>
      <Field
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clear();
        }}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!busy}
      />
      <Field
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear();
        }}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        editable={!busy}
        hint="At least 6 characters."
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <Button title={cta} onPress={submit} loading={busy} disabled={!valid} />
      {/* An email that has an account already: sign in to it. What she
          bought as a guest follows her there (premium.tsx, billing.adopt). */}
      <Pressable onPress={() => router.replace('/login')} hitSlop={8} style={styles.switch} accessibilityRole="button">
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchLink}>Sign in</Text>
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 },
  body: { padding: 24, paddingTop: 8, maxWidth: 520, width: '100%', alignSelf: 'center', flexGrow: 1, gap: 16 },
  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk },
  notice: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.primaryDark },
  switch: { alignSelf: 'center', paddingVertical: 6 },
  switchText: { ...font.body[600], fontSize: 15, color: colors.muted },
  switchLink: { ...font.body[800], color: colors.primary, fontSize: 15 },
  legal: { ...font.body[500], fontSize: 12.5, lineHeight: 17, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  legalLink: { color: colors.primaryDark, textDecorationLine: 'underline' },
});
