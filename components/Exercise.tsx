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

function getCorrectAnswers(exercise: ExerciseType, blankCount: number): string[] {
  if (exercise.correct_answers && exercise.correct_answers.length > 0) {
    return exercise.correct_answers;
  }
  if (blankCount <= 1) return [exercise.correct_answer];
  // Defensive fallback: same answer for every blank (legacy data with 2+ blanks).
  return Array(blankCount).fill(exercise.correct_answer);
}

function getAcceptableForBlank(
  exercise: ExerciseType,
  blankIdx: number,
  blankCount: number,
): string[] {
  const perBlank = exercise.acceptable_answers_per_blank;
  if (perBlank && perBlank[blankIdx]) return perBlank[blankIdx];
  if (blankCount <= 1) return exercise.acceptable_answers ?? [];
  return [];
}

export function ExerciseCard({ exercise, index, total, onNext }: Props) {
  const theme = useTheme();
  const promptParts = useMemo(() => splitOnBlanks(exercise.prompt), [exercise.prompt]);
  const blankCount = useMemo(
    () => promptParts.filter((p) => p === null).length,
    [promptParts],
  );
  const hasBlank = blankCount > 0;

  const [values, setValues] = useState<string[]>(() =>
    Array(Math.max(blankCount, 1)).fill(""),
  );
  const [phase, setPhase] = useState<Phase>("answering");
  const [showEnglish, setShowEnglish] = useState(false);
  const [showHebrew, setShowHebrew] = useState(false);
  const externalInputRef = useRef<TextInput>(null);
  const blankInputRefs = useRef<(TextInput | null)[]>([]);

  const shake = useSharedValue(0);

  useEffect(() => {
    setValues(Array(Math.max(blankCount, 1)).fill(""));
    setPhase("answering");
    setShowEnglish(false);
    setShowHebrew(false);
    shake.value = 0;
    const t = setTimeout(() => {
      if (hasBlank) {
        blankInputRefs.current[0]?.focus();
      } else {
        externalInputRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [exercise.id, blankCount, hasBlank, shake]);

  const correctAnswers = useMemo(
    () => getCorrectAnswers(exercise, blankCount),
    [exercise, blankCount],
  );

  const verify = (revealed = false) => {
    if (revealed) {
      setPhase("revealed");
      return;
    }
    let allOk = true;
    if (hasBlank) {
      for (let i = 0; i < blankCount; i++) {
        const ok = isAnswerCorrect(
          values[i] ?? "",
          correctAnswers[i] ?? "",
          getAcceptableForBlank(exercise, i, blankCount),
        );
        if (!ok) {
          allOk = false;
          break;
        }
      }
    } else {
      allOk = isAnswerCorrect(
        values[0] ?? "",
        exercise.correct_answer,
        exercise.acceptable_answers,
      );
    }
    if (allOk) {
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

  const blankColor = isAnswered
    ? isCorrect
      ? theme.colors.green
      : theme.colors.terra
    : theme.colors.green;

  const canSubmit = hasBlank
    ? values.slice(0, blankCount).every((v) => v.trim().length > 0)
    : (values[0] ?? "").trim().length > 0;

  const correctAnswerDisplay = hasBlank
    ? correctAnswers.join(" / ")
    : exercise.correct_answer;

  const setBlankValue = (i: number, v: string) => {
    setValues((prev) => {
      const next = prev.slice();
      next[i] = v;
      if (next.length < blankCount) {
        for (let k = next.length; k < blankCount; k++) next[k] = "";
      }
      return next;
    });
  };

  const onBlankSubmit = (i: number) => {
    if (i + 1 < blankCount) {
      blankInputRefs.current[i + 1]?.focus();
    } else if (canSubmit) {
      verify(false);
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, cardAnimatedStyle]}>
      {/* Content section — packed (related items stay close) */}
      <View style={{ gap: theme.spacing.md + 4 }}>
        {hasBlank ? (
          <PromptWithBlanks
            parts={promptParts}
            values={values}
            setValue={setBlankValue}
            blankColor={blankColor}
            isAnswered={isAnswered}
            phase={phase}
            correctAnswers={correctAnswers}
            inputRefs={blankInputRefs}
            onSubmitBlank={onBlankSubmit}
          />
        ) : (
          <Text variant="body" color="ink" style={{ fontSize: 19, lineHeight: 28 }}>
            {exercise.prompt}
          </Text>
        )}

        {!isAnswered && !hasBlank ? (
          <UnderlineInput
            ref={externalInputRef}
            value={values[0] ?? ""}
            onChangeText={(v) => setBlankValue(0, v)}
            variant="callout"
            weight="medium"
            color="green"
            placeholder="tu respuesta"
            autoCorrect={false}
            autoCapitalize="none"
            multiline={exercise.type === "free_production"}
            onSubmitEditing={() => {
              if ((values[0] ?? "").trim()) verify(false);
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
                    {correctAnswerDisplay}
                  </Text>{" "}
                  {hasBlank && blankCount > 1 ? "son las formas." : "es la forma."}
                </>
              ) : (
                <>
                  La respuesta era{" "}
                  <Text variant="headline" weight="bold" color="terra">
                    {correctAnswerDisplay}
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
            {!isCorrect && phase !== "revealed" && !hasBlank ? (
              <Text variant="footnote" color="inkFaint">
                Tu respuesta: {(values[0] ?? "").trim() || "—"}
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
              disabled={!canSubmit}
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

type PromptWithBlanksProps = {
  parts: (string | null)[];
  values: string[];
  setValue: (i: number, v: string) => void;
  blankColor: string;
  isAnswered: boolean;
  phase: Phase;
  correctAnswers: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  onSubmitBlank: (i: number) => void;
};

function PromptWithBlanks({
  parts,
  values,
  setValue,
  blankColor,
  isAnswered,
  phase,
  correctAnswers,
  inputRefs,
  onSubmitBlank,
}: PromptWithBlanksProps) {
  const theme = useTheme();
  const tokens: { kind: "text"; text: string }[] | { kind: "blank"; idx: number }[] = [];
  let blankIdx = 0;
  const flat: ({ kind: "text"; text: string } | { kind: "blank"; idx: number })[] = [];
  for (const p of parts) {
    if (p === null) {
      flat.push({ kind: "blank", idx: blankIdx });
      blankIdx++;
    } else {
      // Split text into word tokens so flexWrap works at word boundaries.
      const words = p.split(/(\s+)/).filter((w) => w.length > 0);
      for (const w of words) flat.push({ kind: "text", text: w });
    }
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      {flat.map((tok, i) => {
        if (tok.kind === "text") {
          const isWhitespace = /^\s+$/.test(tok.text);
          if (isWhitespace) {
            return (
              <Text
                key={i}
                variant="body"
                color="ink"
                style={{ fontSize: 19, lineHeight: 32 }}
              >
                {" "}
              </Text>
            );
          }
          return (
            <Text
              key={i}
              variant="body"
              color="ink"
              style={{ fontSize: 19, lineHeight: 32 }}
            >
              {tok.text}
            </Text>
          );
        }
        const i_ = tok.idx;
        const value = values[i_] ?? "";
        const showCorrect = phase === "revealed";
        const display = showCorrect ? correctAnswers[i_] ?? "" : value;
        return (
          <View
            key={i}
            style={{
              minWidth: 88,
              borderBottomWidth: 1.5,
              borderBottomColor: blankColor,
              marginHorizontal: 3,
              paddingHorizontal: 4,
              justifyContent: "flex-end",
            }}
          >
            {isAnswered ? (
              <Text
                variant="body"
                style={{
                  fontSize: 19,
                  lineHeight: 32,
                  fontWeight: "600",
                  color: blankColor,
                  textAlign: "center",
                }}
              >
                {display || "—"}
              </Text>
            ) : (
              <TextInput
                ref={(el) => {
                  inputRefs.current[i_] = el;
                }}
                value={value}
                onChangeText={(v) => setValue(i_, v)}
                onSubmitEditing={() => onSubmitBlank(i_)}
                returnKeyType={i_ + 1 < correctAnswers.length ? "next" : "go"}
                blurOnSubmit={i_ + 1 >= correctAnswers.length}
                autoCorrect={false}
                autoCapitalize="none"
                style={[
                  {
                    fontSize: 19,
                    lineHeight: 28,
                    fontWeight: "600",
                    color: blankColor,
                    fontFamily: theme.fontFamily,
                    textAlign: "center",
                    padding: 0,
                    minWidth: 80,
                  },
                  Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : null,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
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
