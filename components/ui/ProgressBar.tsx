import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme";

type Props = {
  value: number;
  total: number;
  tone?: "primary" | "success";
};

export function ProgressBar({ value, total, tone = "primary" }: Props) {
  const theme = useTheme();
  const progress = useSharedValue(0);
  const target = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;

  useEffect(() => {
    progress.value = withTiming(target, { duration: 350 });
  }, [target, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const fillColor = tone === "success" ? theme.colors.green : theme.colors.green;

  return (
    <View
      style={{
        width: "100%",
        height: 1,
        backgroundColor: theme.colors.boneShade,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            height: 1,
            backgroundColor: fillColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
