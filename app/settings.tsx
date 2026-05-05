import { useState } from "react";
import { View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Trash2,
  RotateCcw,
  LogOut,
  Mail,
  BookOpen,
} from "lucide-react-native";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import {
  Banner,
  Button,
  ConfirmDialog,
  Eyebrow,
  ListGroup,
  ListRow,
  MateLink,
  Screen,
  Text,
  UnderlineInput,
} from "@/components/ui";

type ConfirmState = {
  title: string;
  message: string;
  destructive?: boolean;
  onConfirm: () => void;
} | null;

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const userId = useStore((s) => s.userId);
  const user = useStore((s) => s.user);
  const authError = useStore((s) => s.authError);
  const resetStreak = useStore((s) => s.resetStreak);
  const clearAll = useStore((s) => s.clearAll);
  const signOutAndReset = useStore((s) => s.signOutAndReset);
  const sessions = useStore((s) => s.sessions);

  const [name, setName] = useState(settings.displayName);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const askConfirm = (state: NonNullable<ConfirmState>) => setConfirm(state);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  return (
    <Screen background="primary" padded={false}>
      <View
        style={
          {
            paddingHorizontal: theme.screenPadding.primary,
            paddingTop: 4,
            paddingBottom: 28,
            gap: theme.spacing.lg,
          } as ViewStyle
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MateLink label="← volver" variant="subhead" onPress={goBack} />
          <Eyebrow color="inkFaint">configuración</Eyebrow>
        </View>

        {authError ? (
          <Banner tone="error" title="Sesión Supabase" message={authError} />
        ) : null}

        {/* Mis ejercicios */}
        {sessions.length > 0 ? (
          <ListGroup header="ejercicios">
            <ListRow
              title="mis ejercicios"
              subtitle={`${sessions.length} ${sessions.length === 1 ? "sesión" : "sesiones"} guardadas`}
              leadingIcon={<BookOpen size={18} color={theme.colors.greenSoft} strokeWidth={2} />}
              showChevron
              onPress={() => router.push("/sessions")}
              isLast
            />
          </ListGroup>
        ) : null}

        {/* Account */}
        <ListGroup
          header="cuenta"
          footer="Tu progreso se sincroniza con Supabase."
        >
          <ListRow
            title={user?.email ?? "Cuenta"}
            subtitle="Sesión iniciada"
            leadingIcon={<Mail size={18} color={theme.colors.greenSoft} strokeWidth={2} />}
          />
          <ListRow
            title="Cerrar sesión"
            destructive
            leadingIcon={<LogOut size={18} color={theme.colors.terra} strokeWidth={2} />}
            onPress={() =>
              askConfirm({
                title: "Cerrar sesión",
                message: "Vas a salir de tu cuenta. Tus datos remotos siguen guardados.",
                onConfirm: () => void signOutAndReset(),
              })
            }
            isLast
          />
        </ListGroup>

        {/* Profile */}
        <View style={{ gap: theme.spacing.sm }}>
          <Eyebrow color="greenSoft">perfil</Eyebrow>
          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.greenLine, paddingTop: theme.spacing.sm, gap: theme.spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              <User size={16} color={theme.colors.greenSoft} strokeWidth={2} />
              <Text variant="footnote" color="inkSoft">
                tu nombre
              </Text>
            </View>
            <UnderlineInput
              value={name}
              onChangeText={setName}
              variant="body"
              color="ink"
              placeholder="cómo te llamamos"
              returnKeyType="done"
              onSubmitEditing={async () => {
                await setSettings({ displayName: name });
                setMsg("Nombre guardado");
              }}
            />
            <Button
              label="Guardar nombre"
              variant="tertiary"
              size="compact"
              fullWidth={false}
              onPress={async () => {
                await setSettings({ displayName: name });
                setMsg("Nombre guardado");
              }}
            />
          </View>
        </View>

        {msg ? (
          <Text variant="caption1" color="inkSoft">
            {msg}
          </Text>
        ) : null}

        {/* Destructive */}
        <ListGroup header="datos">
          <ListRow
            title="Resetear racha"
            destructive
            leadingIcon={<RotateCcw size={18} color={theme.colors.terra} strokeWidth={2} />}
            onPress={() =>
              askConfirm({
                title: "Resetear racha",
                message: "Tu racha actual va a volver a 0.",
                destructive: true,
                onConfirm: () => void resetStreak(),
              })
            }
          />
          <ListRow
            title="Borrar todo"
            destructive
            leadingIcon={<Trash2 size={18} color={theme.colors.terra} strokeWidth={2} />}
            onPress={() =>
              askConfirm({
                title: "Borrar todo",
                message: "Vas a perder racha, sesiones y configuración (local y en Supabase).",
                destructive: true,
                onConfirm: () => void clearAll(),
              })
            }
            isLast
          />
        </ListGroup>

        <Text variant="caption1" color="inkFaint" align="center" style={{ marginTop: theme.spacing.md }}>
          che — practicá español todos los días
        </Text>
      </View>

      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ""}
        message={confirm?.message}
        confirmLabel={confirm?.destructive ? "Sí, borrar" : "Sí"}
        cancelLabel="Cancelar"
        destructive={confirm?.destructive}
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </Screen>
  );
}
