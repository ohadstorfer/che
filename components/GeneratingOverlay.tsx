import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme";
import { Eyebrow, Text, Wordmark } from "@/components/ui";

const RING_SIZE = 168;
const ARC_THICKNESS = 1.5;
const ORBIT_OUTER_OFFSET = 18;

const MESSAGES = [
  "eligiendo ejemplos rioplatenses",
  "armando los huecos",
  "puliendo los detalles",
  "revisando el voseo",
  "ya casi listo",
];

export function GeneratingOverlay() {
  const theme = useTheme();
  const arcRot = useSharedValue(0);
  const orbit1 = useSharedValue(0);
  const orbit2 = useSharedValue(0);
  const dotPulse = useSharedValue(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    arcRot.value = withRepeat(
      withTiming(360, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
    orbit1.value = withRepeat(
      withTiming(360, { duration: 4500, easing: Easing.linear }),
      -1,
      false,
    );
    orbit2.value = withRepeat(
      withTiming(-360, { duration: 5800, easing: Easing.linear }),
      -1,
      false,
    );
    dotPulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      2000,
    );
    return () => clearInterval(id);
  }, [arcRot, orbit1, orbit2, dotPulse]);

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arcRot.value}deg` }],
  }));
  const orbit1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit1.value}deg` }],
  }));
  const orbit2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbit2.value}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + dotPulse.value * 0.55,
    transform: [{ scale: 0.85 + dotPulse.value * 0.3 }],
  }));

  return (
    <View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        },
      ]}
    >
      {/* Animation block */}
      <View
        style={{
          width: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
          height: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Static base ring */}
        <View
          style={{
            position: "absolute",
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: ARC_THICKNESS,
            borderColor: theme.colors.greenLine,
          }}
        />

        {/* Rotating arc — top + left colored, others transparent */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              borderWidth: ARC_THICKNESS,
              borderTopColor: theme.colors.green,
              borderLeftColor: theme.colors.green,
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
            },
            arcStyle,
          ]}
        />

        {/* Outer orbital ring 1 (terra dot at top) */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
              height: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
              alignItems: "center",
            },
            orbit1Style,
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: theme.colors.terra,
              marginTop: -3,
            }}
          />
        </Animated.View>

        {/* Outer orbital ring 2 (green dot, opposite direction) */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
              height: RING_SIZE + ORBIT_OUTER_OFFSET * 2,
              alignItems: "flex-end",
              justifyContent: "center",
            },
            orbit2Style,
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.green,
              marginRight: -4,
            }}
          />
        </Animated.View>

        {/* Center wordmark */}
        <Wordmark size={42} />
      </View>

      {/* Text block */}
      <View style={{ marginTop: 48, alignItems: "center", gap: 4 }}>
        <Eyebrow color="greenSoft">ARMANDO TU EJERCICIO</Eyebrow>
        <Text
          variant="largeTitle"
          color="green"
          align="center"
          style={{ marginTop: 12 }}
        >
          Pensando algo{"\n"}a tu medida
        </Text>
        <Text
          variant="subhead"
          color="inkSoft"
          align="center"
          style={{ marginTop: 12 }}
        >
          Un momento — esto se cocina al toque.
        </Text>
      </View>

      {/* Status carousel */}
      <View
        style={{
          marginTop: 28,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Animated.View
          style={[
            {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.terra,
            },
            pulseStyle,
          ]}
        />
        <Text variant="footnote" color="inkSoft">
          {MESSAGES[msgIdx]}
        </Text>
      </View>

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          bottom: 56,
          alignItems: "center",
        }}
      >
        <Eyebrow color="inkFaint">YA CASI</Eyebrow>
      </View>
    </View>
  );
}
