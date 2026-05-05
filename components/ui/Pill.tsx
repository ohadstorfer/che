import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Pressable } from "./Pressable";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  size?: "default" | "compact";
};

export function Pill({ label, active, onPress, leadingIcon, disabled, size = "default" }: Props) {
  const theme = useTheme();
  const height = size === "compact" ? 28 : 32;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      haptic="selection"
      feedback="scale"
      style={
        {
          height,
          paddingHorizontal: theme.spacing.md - 4,
          borderRadius: theme.radii.pill,
          backgroundColor: active ? theme.colors.primaryMuted : theme.colors.backgroundSecondary,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs + 2,
          opacity: disabled ? 0.4 : 1,
          alignSelf: "flex-start",
        } as ViewStyle
      }
    >
      {leadingIcon ? <View>{leadingIcon}</View> : null}
      <Text
        variant={size === "compact" ? "caption1" : "footnote"}
        weight="semibold"
        color={active ? "primary" : "label"}
      >
        {label}
      </Text>
    </Pressable>
  );
}
