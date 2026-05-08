import { useEffect, useMemo, useRef, useState } from "react";
import { View, type ViewStyle } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { ExerciseCard } from "@/components/Exercise";
import { StreakCelebration } from "@/components/StreakCelebration";
import {
  Button,
  ConfirmDialog,
  Eyebrow,
  MateLink,
  ProgressBar,
  Screen,
  Text,
} from "@/components/ui";

function topicLabel(t: string): string {
  const cleaned = (t || "").trim().toLowerCase();
  if (!cleaned) return "práctica";
  return cleaned;
}

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const sessions = useStore((s) => s.sessions);
  const recordResult = useStore((s) => s.recordResult);
  const streak = useStore((s) => s.streak);

  const session = useMemo(() => sessions.find((s) => s.id === id), [sessions, id]);

  const flatExercises = useMemo(() => {
    if (!session) return [];
    return session.data.sections.flatMap((sec) =>
      sec.exercises.map((ex) => ({
        ...ex,
        section_title: ex.section_title || sec.title,
        section_description: ex.section_description || sec.description,
        instruction:
          ex.instruction || ex.section_description || sec.description,
      })),
    );
  }, [session]);

  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [recorded, setRecorded] = useState<{ isFirstToday: boolean; bumped: boolean } | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const recordedRef = useRef(false);

  const sessionId = session?.id;
  const total = flatExercises.length;

  const goToSessions = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/sessions");
  };

  useEffect(() => {
    if (!done || !sessionId || recordedRef.current) return;
    recordedRef.current = true;
    recordResult(sessionId, correctCount, total).then(({ isFirstToday, bumped }) =>
      setRecorded({ isFirstToday, bumped }),
    );
  }, [done, sessionId, correctCount, total, recordResult]);

  if (!session) {
    return (
      <Screen background="primary" padded={false}>
        <ContainerPad>
          <BackRow onBack={goToSessions} />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.md,
            }}
          >
            <Text variant="title2" color="green">
              Ejercicio no encontrado
            </Text>
            <Button label="Volver" onPress={goToSessions} fullWidth={false} />
          </View>
        </ContainerPad>
      </Screen>
    );
  }

  if (flatExercises.length === 0) {
    return (
      <Screen background="primary" padded={false}>
        <ContainerPad>
          <BackRow onBack={goToSessions} />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.md,
            }}
          >
            <Text variant="title2" color="green">
              Este ejercicio está vacío
            </Text>
            <Button label="Volver" onPress={goToSessions} fullWidth={false} />
          </View>
        </ContainerPad>
      </Screen>
    );
  }

  if (done) {
    if (recorded?.isFirstToday && recorded.bumped) {
      const newStreak = streak.currentStreak;
      const oldStreak = Math.max(0, newStreak - 1);
      return (
        <Screen background="primary" padded={false} scroll={false}>
          <StreakCelebration
            oldStreak={oldStreak}
            newStreak={newStreak}
            onClose={goToSessions}
          />
        </Screen>
      );
    }

    const pct = Math.round((correctCount / total) * 100);
    return (
      <Screen background="primary" padded={false} scroll={false}>
        <ContainerPad>
          <BackRow onBack={goToSessions} />

          <View style={{ marginTop: 40, gap: theme.spacing.sm }}>
            <Eyebrow color="greenSoft">ronda completada</Eyebrow>
            <Text variant="largeTitle" color="green">
              {correctCount} / {total}
            </Text>
            <Text variant="subhead" color="inkSoft">
              {pct}% de respuestas correctas.
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <View style={{ gap: theme.spacing.sm + 4 }}>
            <Button label="ver mis ejercicios" onPress={goToSessions} />
            <Button
              label="repetir"
              variant="tertiary"
              onPress={() => {
                setIdx(0);
                setCorrectCount(0);
                setDone(false);
                setRecorded(null);
                recordedRef.current = false;
              }}
            />
            <Button
              label="crear otro"
              variant="tertiary"
              onPress={() => router.replace("/home")}
            />
          </View>
        </ContainerPad>
      </Screen>
    );
  }

  const current = flatExercises[idx];
  const topic = current.section_title || session.topic;

  return (
    <Screen background="primary" padded={false} scroll={false}>
      <ContainerPad>
        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MateLink label="← volver" variant="subhead" onPress={() => setExitOpen(true)} />
          <Text variant="caption1" color="inkFaint">
            ejercicio {idx + 1} de {total}
          </Text>
        </View>

        {/* Progress */}
        <View style={{ marginTop: 22 }}>
          <ProgressBar value={idx + 1} total={total} />
        </View>

        {/* Eyebrow + Title (tight pair) */}
        <View style={{ marginTop: 40 }}>
          <Eyebrow color="greenSoft">tema · {topicLabel(topic)}</Eyebrow>
          {current.instruction ? (
            <Text variant="title1" color="green" style={{ marginTop: 8 }}>
              {current.instruction}
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: 32, flex: 1 }}>
          <ExerciseCard
            key={current.id}
            exercise={current}
            index={idx}
            total={total}
            onNext={(wasCorrect) => {
              if (wasCorrect) setCorrectCount((c) => c + 1);
              if (idx + 1 >= total) {
                setDone(true);
              } else {
                setIdx(idx + 1);
              }
            }}
          />
        </View>
      </ContainerPad>

      <ConfirmDialog
        visible={exitOpen}
        title="¿Salir del ejercicio?"
        message="Vas a perder el progreso."
        confirmLabel="Salir"
        cancelLabel="Seguir practicando"
        destructive
        onConfirm={() => {
          setExitOpen(false);
          goToSessions();
        }}
        onCancel={() => setExitOpen(false)}
      />
    </Screen>
  );
}

function ContainerPad({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
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
      {children}
    </View>
  );
}

function BackRow({ onBack }: { onBack: () => void }) {
  return <MateLink label="← volver" variant="subhead" onPress={onBack} />;
}
