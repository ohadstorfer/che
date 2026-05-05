import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { Exercise as ExerciseType } from "@/types/exercise";
import { containsHebrew, isAnswerCorrect } from "@/lib/answer";
import { useTheme } from "@/lib/theme";
import { Button, MateLink, Text, UnderlineInput } from "@/components/ui";

type Props = {
  exercise: ExerciseType;
  index: number;
  total: number;
  onNext: (wasCorrect: boolean) => void;
};

type Phase = "answering" | "correct" | "incorrect" | "revealed";

function fireHaptic(kind: "success" | "error") {
  if (Platform.OS === "web") return;
  try {
    void Haptics.notificationAsync(
      kind === "success"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  } catch {}
}

export function ExerciseCard({ exercise, index, total, onNext }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [showEnglish, setShowEnglish] = useState(false);
  const [showHebrew, setShowHebrew] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const shake = useSharedValue(0);

  useEffect(() => {
    setValue("");
    setPhase("answering");
    setShowEnglish(false);
    setShowHebrew(false);
    shake.value = 0;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [exercise.id, shake]);

  const promptParts = useMemo(() => splitOnBlanks(exercise.prompt), [exercise.prompt]);
  const hasBlank = promptParts.includes(null);

  const verify = (revealed = false) => {
    if (revealed) {
      setPhase("revealed");
      return;
    }
    const ok = isAnswerCorrect(value, exercise.correct_answer, exercise.acceptable_answers);
    if (ok) {
      setPhase("correct");
      fireHaptic("success");
    } else {
      setPhase("incorrect");
      shake.value = withSequence(
        withTiming(-6, { duration: 60, easing: Easing.linear }),
        withTiming(6, { duration: 60, easing: Easing.linear }),
        withTiming(-5, { duration: 60, easing: Easing.linear }),
        withTiming(5, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 60, easing: Easing.linear }),
      );
      fireHaptic("error");
    }
  };

  const next = () => onNext(phase === "correct");

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const isAnswered = phase !== "answering";
  const isCorrect = phase === "correct";

  // Blank fill state — green by default, green when correct, terra otherwise.
  const blankColor = isAnswered
    ? isCorrect
      ? theme.colors.green
      : theme.colors.terra
    : theme.colors.green;

  const blankText = isAnswered
    ? phase === "revealed"
      ? exercise.correct_answer
      : value || "—"
    : value || " ";

  return (
    <Animated.View style={[{ flex: 1 }, cardAnimatedStyle]}>
      {/* Content section — packed (related items stay close) */}
      <View style={{ gap: theme.spacing.md + 4 }}>
        <Text variant="body" color="ink" style={{ fontSize: 19, lineHeight: 28 }}>
          {hasBlank
            ? promptParts.map((part, i) =>
                part === null ? (
                  <Text
                    key={i}
                    style={{
                      fontSize: 19,
                      lineHeight: 28,
                      fontWeight: "600",
                      color: blankColor,
                      borderBottomWidth: 1.5,
                      borderBottomColor: blankColor,
                      minWidth: 96,
                      textAlign: "center",
                      paddingHorizontal: 6,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {`  ${blankText}  `}
                  </Text>
                ) : (
                  <Text key={i} style={{ fontSize: 19, lineHeight: 28 }}>
                    {part}
                  </Text>
                ),
              )
            : exercise.prompt}
        </Text>

        {!isAnswered ? (
          <UnderlineInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            variant="callout"
            weight="medium"
            color="green"
            placeholder="tu respuesta"
            autoCorrect={false}
            autoCapitalize="none"
            multiline={exercise.type === "free_production"}
            onSubmitEditing={() => {
              if (value.trim()) verify(false);
            }}
          />
        ) : null}

        {isAnswered ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="headline" color={isCorrect ? "green" : "terra"}>
              {isCorrect ? (
                <>
                  Justo.{" "}
                  <Text variant="headline" weight="bold" color="green">
                    {exercise.correct_answer}
                  </Text>{" "}
                  es la forma.
                </>
              ) : (
                <>
                  La respuesta era{" "}
                  <Text variant="headline" weight="bold" color="terra">
                    {exercise.correct_answer}
                  </Text>
                  .
                </>
              )}
            </Text>
            {exercise.explanation ? (
              <Text variant="footnote" color="inkSoft">
                {exercise.explanation}
              </Text>
            ) : null}
            {!isCorrect && phase !== "revealed" ? (
              <Text variant="footnote" color="inkFaint">
                Tu respuesta: {value.trim() || "—"}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Translation toggles — visible always */}
        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
          <View style={{ flexDirection: "row", gap: 18 }}>
            <MateLink
              label={showEnglish ? "ocultar inglés" : "ver inglés"}
              onPress={() => setShowEnglish((s) => !s)}
            />
            {containsHebrew(exercise.hebrew_idiomatic) ? (
              <MateLink
                label={showHebrew ? "ocultar hebreo" : "ver hebreo"}
                onPress={() => setShowHebrew((s) => !s)}
              />
            ) : null}
          </View>

          {showEnglish && exercise.english_idiomatic ? (
            <Text variant="subhead" color="inkSoft" style={{ marginTop: 4 }}>
              {exercise.english_idiomatic}
            </Text>
          ) : null}
          {showHebrew && containsHebrew(exercise.hebrew_idiomatic) ? (
            <Text variant="subhead" color="inkSoft" rtl style={{ marginTop: 4 }}>
              {exercise.hebrew_idiomatic}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Spacer — pushes action area to bottom */}
      <View style={{ flex: 1, minHeight: theme.spacing.xl }} />

      {/* Action section — anchored at bottom (thumb-reach zone) */}
      <View style={{ gap: theme.spacing.sm + 4 }}>
        {phase === "answering" ? (
          <>
            <Button
              label="Comprobar"
              onPress={() => verify(false)}
              disabled={!value.trim()}
            />
            <View style={{ alignSelf: "center" }}>
              <MateLink
                label="no sé — mostrame la respuesta"
                onPress={() => verify(true)}
              />
            </View>
          </>
        ) : (
          <Button label={index + 1 === total ? "Terminar" : "Continuar"} onPress={next} />
        )}
      </View>
    </Animated.View>
  );
}

function splitOnBlanks(prompt: string): (string | null)[] {
  const parts: (string | null)[] = [];
  const regex = /_{2,}/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(prompt)) !== null) {
    if (m.index > lastIdx) parts.push(prompt.slice(lastIdx, m.index));
    parts.push(null);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < prompt.length) parts.push(prompt.slice(lastIdx));
  if (parts.length === 0) parts.push(prompt);
  return parts;
}
