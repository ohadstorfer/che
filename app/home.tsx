import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowUp, Bell, Settings as SettingsIcon } from "lucide-react-native";
import { useStore } from "@/lib/store";
import { generateExercises } from "@/lib/claude";
import { useTheme } from "@/lib/theme";
import { greeting } from "@/lib/greeting";
import { StreakBadge } from "@/components/StreakBadge";
import { StreakCelebration } from "@/components/StreakCelebration"; // TEMP — borrar
import { GeneratingOverlay } from "@/components/GeneratingOverlay";
import {
  Banner,
  Eyebrow,
  IconButton,
  Pressable,
  Screen,
  Text,
  Wordmark,
} from "@/components/ui";
import {
  ensureSubscribed,
  isIos,
  isStandalone,
  isSubscriptionActive,
  isWeb,
} from "@/lib/notifications";
import type { GenerateResponse } from "@/types/exercise";

type Length = "corto" | "standard";

const LENGTH_COUNT: Record<Length, number> = {
  corto: 6,
  standard: 12,
};

function sliceToCount(data: GenerateResponse, count: number): GenerateResponse {
  const sections: GenerateResponse["sections"] = [];
  let remaining = count;
  for (const sec of data.sections) {
    if (remaining <= 0) break;
    const take = Math.min(sec.exercises.length, remaining);
    if (take > 0) {
      sections.push({ ...sec, exercises: sec.exercises.slice(0, take) });
      remaining -= take;
    }
  }
  return { ...data, sections };
}

type NotifState =
  | { kind: "loading" }
  | { kind: "needs-install" }
  | { kind: "needs-activate" }
  | { kind: "active" }
  | { kind: "error"; reason: string };

// TEMP — togglear a `true` para previsualizar la pantalla de racha
const SHOW_STREAK_PREVIEW = false;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const saveSession = useStore((s) => s.saveSession);
  const streak = useStore((s) => s.streak);
  const userId = useStore((s) => s.userId);
  const settings = useStore((s) => s.settings);
  const [text, setText] = useState("");
  const [length, setLength] = useState<Length>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<NotifState>({ kind: "loading" });
  const [activating, setActivating] = useState(false);
  const [showStreakPreview, setShowStreakPreview] = useState(false); // TEMP — borrar
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        if (!cancelled) setNotif({ kind: "loading" });
        return;
      }
      if (isWeb() && isIos() && !isStandalone()) {
        if (!cancelled) setNotif({ kind: "needs-install" });
        return;
      }
      const active = await isSubscriptionActive(userId);
      if (cancelled) return;
      setNotif({ kind: active ? "active" : "needs-activate" });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onActivate = async () => {
    if (!userId || activating) return;
    setActivating(true);
    const res = await ensureSubscribed({
      userId,
      reminderTime: settings.reminderTime,
    });
    setActivating(false);
    if (res.ok) setNotif({ kind: "active" });
    else setNotif({ kind: "error", reason: res.reason });
  };

  const submitTopic = async (topic: string) => {
    const value = topic.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateExercises(value);
      const sliced = sliceToCount(data, LENGTH_COUNT[length]);
      const record = await saveSession(value, sliced);
      router.replace(`/session/${record.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  };

  const onPressStart = () => {
    const value = text.trim() || "subjuntivo presente";
    void submitTopic(value);
  };

  const canSubmit = text.trim().length > 0 && !loading;

  return (
    <Screen background="primary" padded={false} bottomInset={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={
            {
              flex: 1,
              paddingHorizontal: theme.screenPadding.primary,
              paddingTop: 4,
              paddingBottom: 28,
            } as ViewStyle
          }
        >
          {/* Header: wordmark + streak + settings */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Wordmark />
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              {streak.currentStreak > 0 ? (
                <StreakBadge streak={streak.currentStreak} size="nav" />
              ) : null}
              <IconButton
                icon={
                  <SettingsIcon size={20} color={theme.colors.inkFaint} strokeWidth={2} />
                }
                onPress={() => router.push("/settings")}
              />
            </View>
          </View>

          {/* Notification activation banner */}
          {notif.kind === "needs-install" || notif.kind === "needs-activate" || notif.kind === "error" ? (
            <Pressable
              onPress={notif.kind === "needs-activate" || notif.kind === "error" ? onActivate : undefined}
              feedback={notif.kind === "needs-activate" ? "scale" : "none"}
              haptic={notif.kind === "needs-activate" ? "impactLight" : undefined}
              style={{
                marginTop: 16,
                borderWidth: 1,
                borderColor: theme.colors.greenLine,
                borderRadius: 14,
                backgroundColor: theme.colors.bone,
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: activating ? 0.6 : 1,
              }}
            >
              <Bell size={18} color={theme.colors.greenSoft} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text variant="footnote" weight="semibold" color="green">
                  {notif.kind === "needs-install"
                    ? "agregá la app a tu pantalla de inicio"
                    : notif.kind === "error"
                      ? "no se pudo activar — tocá para reintentar"
                      : activating
                        ? "activando..."
                        : "activá las notificaciones"}
                </Text>
                <Text variant="caption1" color="inkSoft">
                  {notif.kind === "needs-install"
                    ? "Compartir → Agregar a inicio. Después abrila desde el ícono."
                    : notif.kind === "error"
                      ? notif.reason
                      : "Recordatorios cada 30 min desde las 8 a.m."}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {/* Greeting block */}
          <View style={{ marginTop: 72 }}>
            <Eyebrow color="greenSoft">{greeting()}</Eyebrow>
            <View style={{ marginTop: 6 }}>
              <Text variant="largeTitle" color="green">
                ¿Qué te gustaría
              </Text>
              <Text variant="largeTitle" color="green">
                practicar?
              </Text>
            </View>
            <Text variant="subhead" color="inkSoft" style={{ marginTop: 16 }}>
              {streak.currentStreak > 0 ? (
                <>
                  Llevás{" "}
                  <Text variant="subhead" color="green" weight="semibold">
                    {streak.currentStreak === 1
                      ? "un día"
                      : `${streak.currentStreak} días`}
                  </Text>{" "}
                  seguidos. Tomate el tiempo que necesites.
                </>
              ) : (
                <>Tomate el tiempo que necesites.</>
              )}
            </Text>
          </View>

          {/* Theme card */}
          <View style={{ marginTop: 40 }}>
            
            <View
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: theme.colors.greenLine,
                borderRadius: 18,
                backgroundColor: theme.colors.bone,
                padding: 20,
                gap: 20,
              }}
            >
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                editable={!loading}
                placeholder="¿qué te gustaría practicar hoy?"
                placeholderTextColor={theme.colors.inkFaint}
                multiline
                onSubmitEditing={() => void submitTopic(text)}
                style={[
                  {
                    minHeight: 56,
                    fontSize: theme.typography.body.fontSize,
                    lineHeight: theme.typography.body.lineHeight,
                    color: theme.colors.ink,
                    fontFamily: theme.fontFamily,
                    padding: 0,
                  },
                  Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : null,
                ]}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <LengthPill
                    label="corto"
                    selected={length === "corto"}
                    onPress={() => setLength("corto")}
                  />
                  <LengthPill
                    label="standard"
                    selected={length === "standard"}
                    onPress={() => setLength("standard")}
                  />
                </View>

                <Pressable
                  onPress={onPressStart}
                  disabled={!canSubmit}
                  feedback="scale"
                  haptic="impactLight"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: canSubmit
                      ? theme.colors.green
                      : theme.colors.greenLight,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: canSubmit ? 1 : 0.55,
                  }}
                >
                  <ArrowUp
                    size={18}
                    color={theme.colors.bone}
                    strokeWidth={2.5}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {error ? (
            <View style={{ marginTop: 20 }}>
              <Banner tone="error" title="No se pudo generar" message={error} />
            </View>
          ) : null}

          <View style={{ flex: 1 }} />

          {/* TEMP — botón para previsualizar StreakCelebration (controlado por SHOW_STREAK_PREVIEW) */}
          {SHOW_STREAK_PREVIEW ? (
            <Pressable
              onPress={() => setShowStreakPreview(true)}
              feedback="scale"
              haptic="impactLight"
              style={{
                alignSelf: "center",
                marginBottom: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.terra,
                backgroundColor: "transparent",
              }}
            >
              <Text variant="caption1" weight="semibold" color="terra">
                debug · ver pantalla de racha
              </Text>
            </Pressable>
          ) : null}

          <Text
            variant="footnote"
            color="inkFaint"
            align="center"
          >
            — un ejercicio a la vez —
          </Text>
        </View>
      </KeyboardAvoidingView>
      {loading ? <GeneratingOverlay /> : null}
      {/* TEMP — overlay del preview (controlado por SHOW_STREAK_PREVIEW) */}
      {SHOW_STREAK_PREVIEW && showStreakPreview ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.bone,
          }}
        >
          <Screen background="primary" padded={false} bottomInset={false}>
            <StreakCelebration
              key={String(showStreakPreview)}
              oldStreak={2}
              newStreak={3}
              onClose={() => setShowStreakPreview(false)}
            />
          </Screen>
        </View>
      ) : null}
    </Screen>
  );
}

function LengthPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      feedback="opacity"
      haptic="selection"
      style={{
        height: 32,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.green,
        backgroundColor: selected ? theme.colors.green : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        variant="footnote"
        weight="semibold"
        color={selected ? "bone" : "green"}
      >
        {label}
      </Text>
    </Pressable>
  );
}
