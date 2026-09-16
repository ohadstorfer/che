import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, MoraFace } from '@/components/ui';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { colors, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Login — email and password, the accounts Che already has. One form for both
// ways in: signing in is the default, and creating an account is the same two
// fields with the other button, so nobody has to find a second screen.
// ---------------------------------------------------------------------------

type Mode = 'signin' | 'signup';

/** Supabase's messages are English and technical; these are the ones people hit. */
function explain(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/already registered|already exists/i.test(message)) return 'That email already has an account. Try signing in.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email from the message we sent, then come back.';
  if (/password should be at least/i.test(message)) return 'The password needs at least 6 characters.';
  if (/network|fetch/i.test(message)) return 'No connection. Try again.';
  return message;
}

export default function Login() {
  useStatusBarColor(colors.bg);
  const [mode, setMode] = useState<Mode>('signin');
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
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: err } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        : await supabase.auth.signUp({ email: cleanEmail, password });
    setBusy(false);
    if (err) return setError(explain(err.message));
    // A project that confirms emails creates the account without a session.
    if (!data.session) return setNotice('We sent you an email to confirm the account. Then sign in.');
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <MoraFace size={116} />
            <Text style={styles.title}>Che</Text>
            <Text style={styles.subtitle}>A little Argentine Spanish every day</Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(null);
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
                if (error) setError(null);
              }}
              secureTextEntry
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              textContentType={mode === 'signin' ? 'password' : 'newPassword'}
              returnKeyType="go"
              onSubmitEditing={submit}
              editable={!busy}
              hint={mode === 'signup' ? 'Al menos 6 caracteres.' : undefined}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <Button
              title={mode === 'signin' ? 'Sign in' : 'Create account'}
              onPress={submit}
              loading={busy}
              disabled={!valid}
            />
            <Pressable
              onPress={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setNotice(null);
              }}
              hitSlop={8}
              style={styles.switch}>
              <Text style={styles.switchText}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchLink}>{mode === 'signin' ? 'Create one' : 'Sign in'}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 36, gap: 8 },
  title: { fontSize: 34, color: colors.primary, fontWeight: '700', marginTop: 10 },
  subtitle: { ...type.body, color: colors.muted },
  form: { gap: 16 },
  error: { fontSize: 14, lineHeight: 20, color: colors.dangerInk },
  notice: { fontSize: 14, lineHeight: 20, color: colors.primaryDark },
  switch: { alignSelf: 'center', paddingVertical: 6 },
  switchText: { fontSize: 15, color: colors.muted },
  switchLink: { color: colors.primary, fontWeight: '700' },
});
