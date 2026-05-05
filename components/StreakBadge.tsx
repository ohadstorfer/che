import { View } from "react-native";
import { Flame } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Eyebrow, Text } from "@/components/ui";

type Props = {
  streak: number;
  longest?: number;
  size?: "sm" | "lg" | "nav";
  celebrate?: boolean;
};

export function StreakBadge({ streak, longest, size = "lg" }: Props) {
  const theme = useTheme();
  const label = streak === 1 ? "día seguido" : "días seguidos";

  if (size === "nav") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Flame size={16} color={theme.colors.terra} strokeWidth={2} />
        <Text variant="subhead" weight="semibold" color="ink">
          {streak}
        </Text>
      </View>
    );
  }

  if (size === "sm") {
    return (
      <Text variant="caption2" color="greenSoft" uppercase style={{ letterSpacing: 2 }}>
        {streak} {label}
      </Text>
    );
  }

  return (
    <View style={{ alignItems: "center", gap: theme.spacing.xs }}>
      <Eyebrow color="greenSoft">racha</Eyebrow>
      <Text variant="largeTitle" color="green">
        {streak}
      </Text>
      <Text variant="subhead" color="inkSoft">
        {label}
      </Text>
      {longest !== undefined && longest > 0 && longest !== streak ? (
        <Text variant="caption1" color="inkFaint" style={{ marginTop: 2 }}>
          récord · {longest}
        </Text>
      ) : null}
    </View>
  );
}
