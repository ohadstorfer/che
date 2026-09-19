import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ScreenBackground } from '@/components/ui';
import { AuthProvider } from '@/lib/auth';
import { useKeyboardViewportFit } from '@/lib/keyboard-viewport';
import { colors } from '@/lib/theme';

// React Navigation paints its own opaque screen background (#f2f2f2 by
// default), which would sit on top of the gradient. Handing it a transparent
// background lets the one root gradient show through every screen, and lines
// its remaining colours up with the app palette.
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: colors.card,
    text: colors.ink,
    border: colors.border,
    primary: colors.primary,
    notification: colors.danger,
  },
};

export default function RootLayout() {
  // On the web, keep the app inside whatever the keyboard leaves visible.
  useKeyboardViewportFit();

  // Register the service worker early so the PWA is installable and can
  // receive pushes even before notifications are enabled from the home screen.
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    // Gestures — the tiles she drags into order — do nothing at all, and say
    // nothing about why, unless this sits above everything that uses them.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {/* The icon's gradient is painted once, edge to edge, and every screen
            sits on it transparently — so it never seams at the status bar and
            never re-renders on navigation. */}
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <ScreenBackground />
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}>
              <Stack.Screen name="practice" options={{ gestureEnabled: false }} />
            </Stack>
          </ThemeProvider>
        </View>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
