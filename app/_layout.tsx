import "../global.css";
import { useEffect } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/theme";

export default function RootLayout() {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const userId = useStore((s) => s.userId);
  const router = useRouter();
  const pathname = usePathname();
  const theme = getTheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const onWelcome = pathname === "/";
    if (!userId && !onWelcome) {
      router.replace("/");
    } else if (userId && onWelcome) {
      router.replace("/home");
    }
  }, [hydrated, userId, pathname, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="sessions" />
          <Stack.Screen name="session/[id]" />
          <Stack.Screen
            name="settings"
            options={{
              contentStyle: { backgroundColor: theme.colors.backgroundSecondary },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
