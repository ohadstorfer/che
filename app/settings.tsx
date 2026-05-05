import { useState } from "react";
import { View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import {
  Bell,
  Clock,
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
  Switch,
  Text,
  UnderlineInput,
} from "@/components/ui";
import {
  isNative,
  isWeb,
  registerPushSubscription,
  subscribeWebPush,
  unsubscribeWebPush,
  updateSubscription,
} from "@/lib/notifications";

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

  const [time, setTime] = useState(settings.reminderTime);
  const [name, setName] = useState(settings.displayName);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const askConfirm = (state: NonNullable<ConfirmState>) => setConfirm(state);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  const onToggleNotifications = async (next: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      const merged = await setSettings({ notificationsEnabled: next });
      if (next) {
        if (isNative()) {
          if (!userId) {
            await setSettings({ notificationsEnabled: false });
            setMsg(authError ? `No se pudo iniciar sesión: ${authError}` : "No hay sesión iniciada");
            return;
          }
          const res = await registerPushSubscription({
            userId,
            reminderTime: merged.reminderTime,
            notificationsEnabled: true,
          });
          if (!res.ok) {
            await setSettings({ notificationsEnabled: false });
            setMsg(`No se pudo activar: ${res.reason}`);
          } else {
            setMsg("Notificaciones activadas");
          }
        } else if (isWeb()) {
          if (!userId) {
            await setSettings({ notificationsEnabled: false });
            setMsg(authError ? `No se pudo iniciar sesión: ${authError}` : "No hay sesión iniciada");
            return;
          }
          const res = await subscribeWebPush({
            userId,
            reminderTime: merged.reminderTime,
            notificationsEnabled: true,
          });
          if (!res.ok) {
            await setSettings({ notificationsEnabled: false });
            setMsg(res.reason);
          } else {
            setMsg("Notificaciones activadas");
          }
        }
      } else {
        if (isNative() && userId) {
          await updateSubscription({ userId, notificationsEnabled: false });
        }
        if (isWeb() && userId) await unsubscribeWebPush(userId);
        setMsg("Recordatorios desactivados");
      }
    } finally {
      setBusy(false);
    }
  };

  const onSaveTime = async () => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setMsg("Formato inválido (usá HH:MM)");
      return;
    }
    const merged = await setSettings({ reminderTime: time });
    if (settings.notificationsEnabled && userId) {
      await updateSubscription({ userId, reminderTime: merged.reminderTime });
    }
    setMsg("Horario guardado");
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

        {/* Reminders */}
        <ListGroup
          header="recordatorios"
          footer={
            isWeb()
              ? "En iPhone, agregá la app a tu pantalla de inicio (Compartir → Agregar a inicio) antes de activar."
              : "Push real vía Supabase + Expo Push."
          }
        >
          <ListRow
            title="Notificación diaria"
            subtitle="Recordatorio para mantener tu racha"
            leadingIcon={<Bell size={18} color={theme.colors.greenSoft} strokeWidth={2} />}
            trailing={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={onToggleNotifications}
                disabled={busy}
              />
            }
          />
          <View style={{ paddingVertical: 12, gap: theme.spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              <Clock size={18} color={theme.colors.greenSoft} strokeWidth={2} />
              <Text variant="body" color="ink">
                hora del recordatorio
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <UnderlineInput
                  value={time}
                  onChangeText={setTime}
                  variant="body"
                  color="ink"
                  placeholder="19:00"
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <Button
                label="guardar"
                variant="tertiary"
                size="compact"
                fullWidth={false}
                onPress={onSaveTime}
              />
            </View>
          </View>
        </ListGroup>

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
