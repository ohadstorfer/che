import { ScrollView, View, type ScrollViewProps, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  edges?: readonly Edge[];
  background?: "primary" | "grouped";
  padded?: boolean;
  topInset?: boolean;
  bottomInset?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  edges,
  background = "primary",
  padded = true,
  topInset = true,
  bottomInset = true,
  scrollViewProps,
}: Props) {
  const theme = useTheme();
  const bg =
    background === "grouped" ? theme.colors.backgroundSecondary : theme.colors.background;

  const resolvedEdges: readonly Edge[] =
    edges ??
    ([
      ...(topInset ? (["top"] as const) : []),
      "left",
      "right",
      ...(bottomInset ? (["bottom"] as const) : []),
    ] as const);

  const padding = padded
    ? {
        paddingHorizontal: theme.screenPadding.primary,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
      }
    : undefined;

  // Baseline top buffer — keeps headers off the status bar / browser chrome
  // on platforms where the safe-area top inset is 0 (web, most Android).
  const topBuffer = topInset ? 64 : 0;

  if (scroll) {
    return (
      <SafeAreaView edges={resolvedEdges} style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flex: 1, paddingTop: topBuffer }}>
          <ScrollView
            contentContainerStyle={[padding, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={resolvedEdges} style={{ flex: 1, backgroundColor: bg }}>
      <View style={[{ flex: 1, paddingTop: topBuffer }, padding as ViewStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
