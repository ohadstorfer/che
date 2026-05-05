import { Text as RNText, type StyleProp, type TextStyle } from "react-native";
import { useTheme } from "@/lib/theme";

type EyebrowColor = "greenSoft" | "inkFaint" | "ink" | "green";

export function Eyebrow({
  children,
  color = "greenSoft",
  style,
}: {
  children: React.ReactNode;
  color?: EyebrowColor;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const t = theme.typography.eyebrow;
  const c =
    color === "ink"
      ? theme.colors.ink
      : color === "green"
        ? theme.colors.green
        : color === "inkFaint"
          ? theme.colors.inkFaint
          : theme.colors.greenSoft;
  return (
    <RNText
      style={[
        {
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          fontWeight: "500",
          letterSpacing: t.letterSpacing,
          textTransform: "uppercase",
          color: c,
          fontFamily: theme.fontFamily,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
