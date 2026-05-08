import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Flame } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Eyebrow, Pressable, Text } from "@/components/ui";

type Props = {
  oldStreak: number;
  newStreak: number;
  onClose: () => void;
};

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function todayIdx(): number {
  // JS getDay: 0=Sun..6=Sat. Display: L=0..D=6.
  return (new Date().getDay() + 6) % 7;
}

export function StreakCelebration({ oldStreak, newStreak, onClose }: Props) {
  const theme = useTheme();
  const tIdx = todayIdx();

  return (
    <View
      style={
        {
          flex: 1,
          paddingHorizontal: theme.screenPadding.primary,
          paddingTop: 4,
          paddingBottom: 36,
        } as ViewStyle
      }
    >
      <View style={{ marginTop: 32, gap: 6 }}>
        <Eyebrow color="greenSoft">terminaste, che</Eyebrow>
        <Text variant="largeTitle" color="green">
          Sumaste
        </Text>
        <Text variant="largeTitle" color="terra">
          otro día.
        </Text>
        <Text variant="subhead" color="inkSoft" style={{ marginTop: 12 }}>
          Llevás más tiempo del que pensás. Una buena costumbre, ya.
        </Text>
      </View>

      <Card oldStreak={oldStreak} newStreak={newStreak} todayIdxPos={tIdx} />

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={onClose}
        feedback="scale"
        haptic="impactLight"
        style={{
          marginTop: 32,
          backgroundColor: theme.colors.green,
          borderRadius: 18,
          paddingVertical: 18,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text variant="subhead" weight="semibold" color="bone">
          Daleeee
        </Text>
      </Pressable>
    </View>
  );
}

function Card({
  oldStreak,
  newStreak,
  todayIdxPos,
}: {
  oldStreak: number;
  newStreak: number;
  todayIdxPos: number;
}) {
  const theme = useTheme();

  // Animations
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(12);
  const cardScale = useSharedValue(0.985);

  const flameScale = useSharedValue(0.6);
  const flameOpacity = useSharedValue(0);
  const flameFlicker = useSharedValue(1);
  const flameSway = useSharedValue(0);
  const flameLift = useSharedValue(0);

  const oldOpacity = useSharedValue(1);
  const oldTranslateY = useSharedValue(0);
  const newOpacity = useSharedValue(0);
  const newTranslateY = useSharedValue(88);
  const plusScale = useSharedValue(0);
  const plusRotate = useSharedValue(-15);
  const plusTranslateY = useSharedValue(-40);
  const todayDotScale = useSharedValue(0);
  const todayRedOpacity = useSharedValue(0);
  const todayGreenOpacity = useSharedValue(0);

  useEffect(() => {
    // Card lands
    cardOpacity.value = withDelay(550, withTiming(1, { duration: 600 }));
    cardTranslateY.value = withDelay(550, withTiming(0, { duration: 600 }));
    cardScale.value = withDelay(550, withTiming(1, { duration: 600 }));

    // Flame pops at +600ms relative to card
    flameOpacity.value = withDelay(600, withTiming(1, { duration: 250 }));
    flameScale.value = withDelay(
      600,
      withSequence(
        withTiming(1.12, { duration: 440, easing: Easing.bezier(0.2, 0.9, 0.2, 1.05) }),
        withTiming(1, { duration: 360, easing: Easing.bezier(0.2, 0.9, 0.2, 1) }),
      ),
    );

    // Flame dance: slow, calm rhythm — flicker (scale), sway (rotate), lift (translateY)
    flameFlicker.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(0.97, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(1.03, { duration: 850, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(0.98, { duration: 950, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        ),
        -1,
        false,
      ),
    );
    flameSway.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 1800, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(4, { duration: 1900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(-2, { duration: 1600, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(2, { duration: 1700, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        ),
        -1,
        false,
      ),
    );
    flameLift.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 1300, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(0, { duration: 1250, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(-1.5, { duration: 1100, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(0, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        ),
        -1,
        false,
      ),
    );

    // Number swap: old slides up + fades, new slides up from below
    oldOpacity.value = withDelay(1100, withTiming(0, { duration: 900 }));
    oldTranslateY.value = withDelay(
      1100,
      withTiming(-88, { duration: 900, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
    );
    newOpacity.value = withDelay(1100, withTiming(1, { duration: 700 }));
    newTranslateY.value = withDelay(
      1100,
      withTiming(0, { duration: 1000, easing: Easing.bezier(0.2, 0.9, 0.2, 1.05) }),
    );

    // +1 badge: drop from above, pop, rotate to settle
    plusScale.value = withDelay(
      1400,
      withSequence(
        withTiming(1.18, { duration: 350, easing: Easing.bezier(0.2, 0.9, 0.2, 1.4) }),
        withTiming(1, { duration: 150 }),
      ),
    );
    plusTranslateY.value = withDelay(
      1400,
      withTiming(0, { duration: 400, easing: Easing.bezier(0.2, 0.9, 0.2, 1.4) }),
    );
    plusRotate.value = withDelay(
      1400,
      withSequence(
        withTiming(8, { duration: 250 }),
        withTiming(0, { duration: 250, easing: Easing.bezier(0.2, 0.9, 0.2, 1) }),
      ),
    );

    // Today's dot: empty → red (bounce in) → green
    todayDotScale.value = withDelay(
      1600,
      withSequence(
        withTiming(1.18, { duration: 360, easing: Easing.bezier(0.2, 0.9, 0.2, 1.4) }),
        withTiming(1, { duration: 190 }),
      ),
    );
    todayRedOpacity.value = withDelay(1600, withTiming(1, { duration: 350 }));
    todayGreenOpacity.value = withDelay(
      2400,
      withTiming(1, { duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }, { scale: cardScale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [
      { translateY: flameLift.value },
      { rotate: `${flameSway.value}deg` },
      { scale: flameScale.value * flameFlicker.value },
    ],
  }));

  const oldNumStyle = useAnimatedStyle(() => ({
    opacity: oldOpacity.value,
    transform: [{ translateY: oldTranslateY.value }],
  }));
  const newNumStyle = useAnimatedStyle(() => ({
    opacity: newOpacity.value,
    transform: [{ translateY: newTranslateY.value }],
  }));

  const plusStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: plusTranslateY.value },
      { scale: plusScale.value },
      { rotate: `${plusRotate.value}deg` },
    ],
  }));

  const todayDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: todayDotScale.value }],
  }));
  const todayRedStyle = useAnimatedStyle(() => ({
    opacity: todayRedOpacity.value,
  }));
  const todayGreenStyle = useAnimatedStyle(() => ({
    opacity: todayGreenOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          marginTop: 28,
          backgroundColor: "#FBF9F3",
          borderWidth: 1,
          borderColor: theme.colors.greenLine,
          borderRadius: 24,
          paddingHorizontal: 22,
          paddingTop: 26,
          paddingBottom: 24,
          alignItems: "center",
          shadowColor: theme.colors.green,
          shadowOpacity: 0.08,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 12 },
          elevation: 6,
        },
        cardStyle,
      ]}
    >
      {/* +1 badge */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 12,
            right: 24,
            backgroundColor: theme.colors.terra,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            shadowColor: theme.colors.terra,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          },
          plusStyle,
        ]}
      >
        <Text variant="caption1" weight="bold" color="bone">
          +1
        </Text>
      </Animated.View>

      {/* Flame */}
      <View
        style={{
          width: 132,
          height: 132,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View style={flameStyle}>
          <Flame
            size={104}
            color={theme.colors.terra}
            strokeWidth={1.75}
            fill={theme.colors.terra}
            fillOpacity={0.18}
          />
        </Animated.View>
      </View>

      {/* Streak number — old slides up out, new slides up in */}
      <View
        style={{
          height: 88,
          marginTop: 6,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          alignSelf: "stretch",
        }}
      >
        <Animated.View style={[{ position: "absolute" }, oldNumStyle]}>
          <Digit value={oldStreak} />
        </Animated.View>
        <Animated.View style={[{ position: "absolute" }, newNumStyle]}>
          <Digit value={newStreak} />
        </Animated.View>
      </View>

      <Text
        variant="caption2"
        color="greenSoft"
        uppercase
        style={{ marginTop: 14, letterSpacing: 2 }}
      >
        días seguidos
      </Text>

      {/* Day strip */}
      <View
        style={{
          marginTop: 18,
          flexDirection: "row",
          alignSelf: "stretch",
          justifyContent: "space-between",
        }}
      >
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIdxPos;
          const isOn =
            !isToday && i < todayIdxPos && todayIdxPos - i <= newStreak - 1;
          return (
            <View key={i} style={{ alignItems: "center", gap: 6, flex: 1 }}>
              {isToday ? (
                <Animated.View
                  style={[
                    { width: 22, height: 22 },
                    todayDotStyle,
                  ]}
                >
                  {/* Base: empty ring */}
                  <View
                    style={{
                      position: "absolute",
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: theme.colors.greenLine,
                      backgroundColor: "transparent",
                    }}
                  />
                  {/* Mid: red fill fades in first */}
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 1.5,
                        borderColor: theme.colors.terra,
                        backgroundColor: theme.colors.terra,
                      },
                      todayRedStyle,
                    ]}
                  />
                  {/* Top: green fill fades in last */}
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 1.5,
                        borderColor: theme.colors.green,
                        backgroundColor: theme.colors.green,
                      },
                      todayGreenStyle,
                    ]}
                  />
                </Animated.View>
              ) : (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: isOn ? theme.colors.green : "transparent",
                    borderWidth: 1.5,
                    borderColor: isOn ? theme.colors.green : theme.colors.greenLine,
                  }}
                />
              )}
              <Text
                variant="caption2"
                color="inkFaint"
                uppercase
                style={{ letterSpacing: 1.4 }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function Digit({ value }: { value: number }) {
  return (
    <Text
      variant="largeTitle"
      color="green"
      style={{ fontSize: 88, lineHeight: 88, fontWeight: "700", letterSpacing: -3.5 }}
    >
      {value}
    </Text>
  );
}
