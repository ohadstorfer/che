import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { signInWithEmailPassword, signUpWithEmailPassword } from "@/lib/auth";
import {
  Banner,
  Button,
  Eyebrow,
  Screen,
  Text,
  TextField,
  Wordmark,
} from "@/components/ui";

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const refreshUser = useStore((s) => s.refreshUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goHome = () => router.replace("/home");

  const onSignIn = async () => {
    setBusy(true);
    setError(null);
    const res = await signInWithEmailPassword(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "No se pudo iniciar sesión");
      return;
    }
    await refreshUser();
    setBusy(false);
    goHome();
  };

  const onSignUp = async () => {
    setBusy(true);
    setError(null);
    const res = await signUpWithEmailPassword(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "No se pudo crear la cuenta");
      return;
    }
    await refreshUser();
    setBusy(false);
    goHome();
  };

  return (
    <Screen background="primary" padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View
          style={
            {
              flex: 1,
              paddingHorizontal: theme.screenPadding.primary,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
              gap: theme.spacing.lg,
            } as ViewStyle
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Wordmark />
          </View>

          <View style={{ marginTop: 60, gap: theme.spacing.xs }}>
            <Eyebrow color="greenSoft">Bienvenido</Eyebrow>
            <Text variant="largeTitle" color="green">
              Entrá a tu cuenta
            </Text>
            <Text variant="subhead" color="inkSoft" style={{ marginTop: 8 }}>
              Iniciá sesión con tu mail, o creá una cuenta nueva.
            </Text>
          </View>

          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="vos@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              leadingIcon={<Mail size={18} color={theme.colors.labelSecondary} strokeWidth={2} />}
            />
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={() => {
                if (email.trim() && password) void onSignIn();
              }}
              leadingIcon={<Lock size={18} color={theme.colors.labelSecondary} strokeWidth={2} />}
            />

            {error ? <Banner tone="error" message={error} /> : null}

            <Button
              label={busy ? "Entrando…" : "Iniciar sesión"}
              onPress={onSignIn}
              loading={busy}
              disabled={!email.trim() || !password || busy}
            />
            <Button
              label="Crear cuenta"
              variant="secondary"
              onPress={onSignUp}
              disabled={!email.trim() || !password || busy}
            />
          </View>

          <View style={{ flex: 1 }} />

          <Text variant="footnote" color="inkFaint" align="center">
            — un ejercicio a la vez —
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
