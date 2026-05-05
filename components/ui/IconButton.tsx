import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Pressable } from "./Pressable";

type Props = {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: "plain" | "tinted" | "filled";
  size?: number;
  haptic?: "selection" | "impactLight" | "impactMedium" | "none";
};

export function IconButton({
  icon,
  onPress,
  variant = "plain",
  size = 36,
  haptic = "selection",
}: Props) {
  const theme = useTheme();
  const bg =
    variant === "filled"
      ? theme.colors.primary
      : variant === "tinted"
        ? theme.colors.fill
        : "transparent";
  return (
    <Pressable
      onPress={onPress}
      haptic={haptic}
      feedback={variant === "plain" ? "opacity" : "scale"}
      style={
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        } as ViewStyle
      }
    >
      <View>{icon}</View>
    </Pressable>
  );
}
