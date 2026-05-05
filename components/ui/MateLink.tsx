import { Platform } from "react-native";
import { useTheme } from "@/lib/theme";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export function MateLink({
  label,
  onPress,
  variant = "footnote",
  color = "greenSoft",
}: {
  label: string;
  onPress?: () => void;
  variant?: "footnote" | "subhead" | "caption1";
  color?: "greenSoft" | "green" | "terra" | "inkSoft";
}) {
  const theme = useTheme();
  const c =
    color === "green"
      ? theme.colors.green
      : color === "terra"
        ? theme.colors.terra
        : color === "inkSoft"
          ? theme.colors.inkSoft
          : theme.colors.greenSoft;
  const t = theme.typography[variant];
  return (
    <Pressable
      onPress={onPress}
      feedback="opacity"
      haptic="selection"
      style={{ paddingVertical: 2 }}
    >
      <Text
        variant={variant}
        style={{
          color: c,
          fontFamily: theme.fontFamily,
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          textDecorationLine: "underline",
          textDecorationColor: theme.colors.greenLine,
          ...(Platform.OS === "web"
            ? ({
                textUnderlineOffset: 4,
                textDecorationThickness: "0.5px",
              } as never)
            : {}),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
