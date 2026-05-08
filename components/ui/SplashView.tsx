import { Platform, View } from "react-native";
import { useTheme } from "@/lib/theme";
import { Wordmark } from "./Wordmark";

export function SplashView() {
  const theme = useTheme();
  const size = Platform.OS === "web" ? 120 : 96;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Wordmark size={size} />
    </View>
  );
}
