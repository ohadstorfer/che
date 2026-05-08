import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/theme";
import { SplashView } from "@/components/ui";

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync("#F1EEE6").catch(() => {});

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
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const onWelcome = pathname === "/";
    if (!userId && !onWelcome) {
      router.replace("/");
    } else if (userId && onWelcome) {
      router.replace("/home");
    }
  }, [hydrated, userId, pathname, router]);

  const onWelcome = pathname === "/";
  const needsRedirect = hydrated && Boolean(userId) && onWelcome;
  const showSplash = !hydrated || needsRedirect;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
        {showSplash ? (
          <View
            pointerEvents="auto"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <SplashView />
          </View>
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
