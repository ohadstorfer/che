import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

type Props = {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  centerSlot?: React.ReactNode;
  hairline?: boolean;
};

export function NavBar({ title, leading, trailing, centerSlot, hairline }: Props) {
  const theme = useTheme();
  const height = title || centerSlot ? 44 : 40;
  return (
    <View>
      <View
        style={
          {
            height,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 0,
          } as ViewStyle
        }
      >
        <View style={{ minWidth: 60, alignItems: "flex-start" }}>{leading}</View>
        <View style={{ flex: 1, alignItems: "center", paddingHorizontal: theme.spacing.sm }}>
          {centerSlot ??
            (title ? (
              <Text variant="headline" color="ink" numberOfLines={1}>
                {title}
              </Text>
            ) : null)}
        </View>
        <View style={{ minWidth: 60, alignItems: "flex-end" }}>{trailing}</View>
      </View>
      {hairline ? (
        <View style={{ height: 1, backgroundColor: theme.colors.greenLine }} />
      ) : null}
    </View>
  );
}
