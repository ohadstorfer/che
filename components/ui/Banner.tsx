import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

type Tone = "info" | "success" | "error" | "flame";

type Props = {
  tone?: Tone;
  title?: string;
  message: string;
  leading?: React.ReactNode;
};

export function Banner({ tone = "info", title, message, leading }: Props) {
  const theme = useTheme();

  const palette: Record<Tone, { text: Parameters<typeof Text>[0]["color"]; titleColor: Parameters<typeof Text>[0]["color"] }> = {
    info: { text: "inkSoft", titleColor: "ink" },
    success: { text: "inkSoft", titleColor: "green" },
    error: { text: "terra", titleColor: "terra" },
    flame: { text: "terra", titleColor: "terra" },
  };
  const p = palette[tone];
  const accent =
    tone === "error" || tone === "flame"
      ? theme.colors.terra
      : tone === "success"
        ? theme.colors.green
        : theme.colors.greenLine;

  return (
    <View
      style={
        {
          paddingVertical: theme.spacing.sm,
          paddingLeft: theme.spacing.md,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.spacing.sm + 4,
          borderLeftWidth: 2,
          borderLeftColor: accent,
        } as ViewStyle
      }
    >
      {leading ? <View style={{ paddingTop: 1 }}>{leading}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text variant="footnote" weight="semibold" color={p.titleColor}>
            {title}
          </Text>
        ) : null}
        <Text variant="footnote" color={p.text}>
          {message}
        </Text>
      </View>
    </View>
  );
}
