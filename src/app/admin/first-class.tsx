import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import {
  AdminScreen,
  Muted,
  RowLink,
  Section,
  adminStyles,
} from "@/components/admin";
import { FirstClassLesson } from "@/components/first-class";
import {
  type DbRow,
  type Source,
  fetchRows,
  forgetFirstClass,
  pickRow,
  resolveRow,
} from "@/lib/first-class-script";
import { LEVEL, type Level } from "@/lib/onboarding";
import { supabase } from "@/lib/supabase";
import { colors, radius } from "@/lib/theme";

// ---------------------------------------------------------------------------
// Staff replay of the first class (the one inside onboarding), with the admin
// extras. Pick the level and the source: Local is the class built into the
// app, Database the `first_classes` row that level would get (whatever the
// switch, app_config `first_class_source`, says). Each row is checked here, so
// a broken edit shows its error before anyone flips the switch.
// ?part=slang (or culture, done) opens it at that part; ?source=db&level=none
// skips the picker. Nothing is graded or saved.
// ---------------------------------------------------------------------------

type Rows = (DbRow & { published: boolean })[];

type Params = { part?: string; source?: string; level?: string };

export default function FirstClassAdmin() {
  const params = useLocalSearchParams<Params>();
  // A new link while it is open starts over with that link's choices.
  return <Preview key={`${params.part}|${params.source}|${params.level}`} params={params} />;
}

function Preview({ params }: { params: Params }) {
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/admin");
  const [level, setLevel] = useState<Level>(
    (LEVEL.find((l) => l.value === params.level)?.value ?? "none") as Level,
  );
  const [playing, setPlaying] = useState<Source | null>(
    params.source === "db" || params.source === "local"
      ? params.source
      : params.part
        ? "local"
        : null,
  );
  const [run, setRun] = useState(0);
  const [rows, setRows] = useState<Rows | null>(null);
  const [switchValue, setSwitchValue] = useState<string>("…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playing) return;
    forgetFirstClass();
    fetchRows()
      .then(setRows)
      .catch((e) => setError(String(e?.message ?? e)));
    void supabase
      .from("app_config")
      .select("value")
      .eq("key", "first_class_source")
      .maybeSingle()
      .then(({ data }) =>
        setSwitchValue(data?.value === "db" ? "db" : "local"),
      );
  }, [playing]);

  if (playing) {
    return (
      <FirstClassLesson
        key={run}
        part={params.part}
        level={level}
        source={playing}
        admin
        onClose={() =>
          params.source || params.part ? close() : setPlaying(null)
        }
        onFinish={() =>
          Alert.alert(
            "First class done",
            "In onboarding, Continue goes to the day 1 streak screen.",
          )
        }
      />
    );
  }

  const published = rows?.filter((r) => r.published) ?? [];
  const chosen = pickRow(published, level);
  const check = (r: DbRow, l: Level) => {
    try {
      return {
        ok: true as const,
        screens: resolveRow(r, l, null).screens.map((s) => s.id),
      };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  };
  const play = (s: Source) => {
    setRun((n) => n + 1);
    setPlaying(s);
  };

  return (
    <AdminScreen
      title="First class"
      subtitle={`Switch (app_config first_class_source): ${switchValue}`}
    >
      <Section title="Level">
        <View style={[adminStyles.wrap, { paddingVertical: 8 }]}>
          {LEVEL.map((l) => (
            <Pressable
              key={l.value}
              onPress={() => setLevel(l.value)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: radius.pill,
                  backgroundColor: l.value === level ? colors.ink : colors.card,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text
                style={{
                  color: l.value === level ? colors.bg : colors.ink,
                  fontSize: 14,
                }}
              >
                {l.short}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>
      <Section title="Play">
        <RowLink onPress={() => play("local")}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={adminStyles.cellEs}>Local</Text>
            <Muted>The class built into the app.</Muted>
          </View>
        </RowLink>
        <RowLink onPress={chosen ? () => play("db") : undefined}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={adminStyles.cellEs}>
              Database{chosen ? ` · ${chosen.id}` : ""}
            </Text>
            <Muted>
              {error
                ? `Could not read first_classes: ${error}`
                : !rows
                  ? "Loading…"
                  : chosen
                    ? (() => {
                        const c = check(chosen, level);
                        return c.ok
                          ? c.screens.join(" → ")
                          : `Broken, onboarding would play Local: ${c.error}`;
                      })()
                    : "No published row for this level: onboarding would play Local."}
            </Muted>
          </View>
        </RowLink>
      </Section>
      <Section title="Rows in first_classes">
        {(rows ?? []).map((r) => {
          const bad = LEVEL.map((l) => ({
            l: l.value,
            c: check(r, l.value),
          })).filter((x) => !x.c.ok);
          return (
            <RowLink key={r.id}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={adminStyles.cellEs}>
                  {r.id}
                  {r.published ? "" : " (draft)"}
                </Text>
                <Muted>
                  {r.levels?.length
                    ? `Levels: ${r.levels.join(", ")}`
                    : "Everyone without a row of their own"}
                  {bad.length
                    ? ` · ⚠ ${bad.map((b) => `${b.l}: ${!b.c.ok ? b.c.error : ""}`).join(" · ")}`
                    : " · OK for every level"}
                </Muted>
              </View>
            </RowLink>
          );
        })}
      </Section>
    </AdminScreen>
  );
}
