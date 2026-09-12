import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PasswordDots } from '@/components/password-dots';
import { Button, MoraFace } from '@/components/ui';
import { loginEmails } from '@/lib/accounts';
import { supabase } from '@/lib/supabase';
import { colors, type } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';

export default function Login() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Two accounts, one password field: whichever address the password belongs
  // to is the one that gets signed in. At most two round-trips.
  const signIn = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    for (const email of loginEmails) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (!err) {
        setBusy(false);
        router.replace('/home');
        return;
      }
    }
    setBusy(false);
    setError(
      loginEmails.length
        ? 'Contraseña incorrecta.'
        : 'Falta configurar EXPO_PUBLIC_LOGIN_EMAILS.',
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <MoraFace size={116} />
            <Text style={styles.title}>Moribreo</Text>
            <Text style={styles.subtitle}>Un poquito de hebreo cada día</Text>
          </View>

          <View style={styles.form}>
            <PasswordDots
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              onSubmitEditing={signIn}
              editable={!busy}
              error={error}
            />
            <Button title="Entrar" onPress={signIn} loading={busy} disabled={!password} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 440, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginBottom: 36, gap: 8 },
  // Inherits what the Hebrew greeting used to carry: big, rose, bold.
  title: { fontSize: 34, color: colors.primary, fontWeight: '700', marginTop: 10 },
  subtitle: { ...type.body, color: colors.muted },
  form: { gap: 16 },
});
