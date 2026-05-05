import { Text as RNText } from "react-native";
import { useTheme } from "@/lib/theme";

export function Wordmark({ size = 20 }: { size?: number }) {
  const theme = useTheme();
  const t = theme.typography.title3;
  return (
    <RNText
      style={{
        fontSize: size,
        lineHeight: t.lineHeight,
        fontWeight: "600",
        letterSpacing: t.letterSpacing ?? -0.2,
        color: theme.colors.green,
        fontFamily: theme.fontFamily,
      }}
    >
      che
      <RNText style={{ color: theme.colors.terra }}>.</RNText>
    </RNText>
  );
}
