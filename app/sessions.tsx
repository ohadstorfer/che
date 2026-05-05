import { useMemo, useState } from "react";
import { View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { NoteRow } from "@/components/NoteRow";
import { Eyebrow, MateLink, Screen, Text, UnderlineInput } from "@/components/ui";
import type { SessionRecord } from "@/types/exercise";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);
  return `${day} · ${month} · ${year}`;
}

function previewOf(s: SessionRecord): string {
  const first = s.data?.sections?.[0]?.exercises?.[0]?.prompt;
  if (first) return first.replace(/_+/g, "___").trim();
  return s.prompt;
}

export default function SessionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sessions = useStore((s) => s.sessions);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      const hay = `${s.topic} ${s.prompt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sessions, query]);

  const goHome = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  return (
    <Screen background="primary" padded={false} scroll={false}>
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
        <MateLink label="← inicio" variant="subhead" onPress={goHome} />

        <View style={{ marginTop: 18, gap: 6 }}>
          <Eyebrow color="greenSoft">tus prácticas</Eyebrow>
          <Text variant="largeTitle" color="green">
            Mis ejercicios
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <UnderlineInput
            value={query}
            onChangeText={setQuery}
            variant="callout"
            weight="regular"
            color="ink"
            placeholder="buscar"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        <View style={{ flex: 1, marginTop: theme.spacing.lg }}>
          {filtered.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.sm,
              }}
            >
              <Text variant="title3" color="inkSoft">
                {query ? "Sin resultados" : "Todavía no hay ejercicios"}
              </Text>
              {!query ? (
                <Text variant="subhead" color="inkFaint" align="center">
                  Volvé al inicio para generar el primero.
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.greenLine }}>
              {filtered.map((s, i) => (
                <NoteRow
                  key={s.id}
                  title={s.topic || s.prompt}
                  date={formatDate(s.createdAt)}
                  preview={previewOf(s)}
                  onPress={() => router.push(`/session/${s.id}`)}
                  isLast={i === filtered.length - 1}
                />
              ))}
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: theme.spacing.md,
          }}
        >
          <Text variant="caption1" color="inkFaint">
            {sessions.length} {sessions.length === 1 ? "nota" : "notas"}
          </Text>
          <MateLink label="+ nuevo" onPress={() => router.replace("/home")} />
        </View>
      </View>
    </Screen>
  );
}
