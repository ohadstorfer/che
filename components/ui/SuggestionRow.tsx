import { View } from "react-native";
import { useTheme } from "@/lib/theme";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export function SuggestionRow({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      feedback="opacity"
      haptic="selection"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.greenLight,
        }}
      />
      <Text variant="body" color="ink">
        {label}
      </Text>
    </Pressable>
  );
}
