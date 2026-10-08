import {
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { Gabarito_600SemiBold, Gabarito_700Bold, Gabarito_800ExtraBold, Gabarito_900Black } from '@expo-google-fonts/gabarito';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BootSplash } from '@/components/boot-splash';
import { ScreenBackground } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useBootReady } from '@/lib/boot';
import { useKeyboardViewportFit } from '@/lib/keyboard-viewport';
import { prefetchTabs } from '@/lib/prefetch';
import { PremiumProvider, usePremium } from '@/lib/premium';
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
  // Every screen is set in these; drawing before they land would flash the
  // system font and then reflow.
  const [fontsLoaded, fontError] = useFonts({
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Gabarito_600SemiBold,
    Gabarito_700Bold,
    Gabarito_800ExtraBold,
    Gabarito_900Black,
  });

  // On the web, keep the app inside whatever the keyboard leaves visible.
  useKeyboardViewportFit();

  // Register the service worker early so the PWA is installable and can
  // receive pushes even before notifications are enabled from the home screen.
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const fontsReady = fontsLoaded || !!fontError;

  return (
    // Gestures — the tiles she drags into order — do nothing at all, and say
    // nothing about why, unless this sits above everything that uses them.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Above the font gate: her session is read from storage while the
          fonts load, not after. */}
      <AuthProvider>
        <PremiumProvider>
        {/* The icon's gradient is painted once, edge to edge, and every screen
            sits on it transparently — so it never seams at the status bar and
            never re-renders on navigation. */}
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {fontsReady ? (
            <>
              <ScreenBackground />
              <ThemeProvider value={navigationTheme}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                  }}>
                  <Stack.Screen name="practice" options={{ gestureEnabled: false }} />
                  {/* The paywall rises over whatever asked for it; closing it is
                      its own button (which may first show the one-time offer),
                      so no swipe can skip past that. */}
                  <Stack.Screen name="paywall" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
                  {/* The sections map drops in from the top; the screen animates
                      itself (no native slide goes that way), over what's behind. */}
                  <Stack.Screen
                    name="sections"
                    options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false }}
                  />
                  {/* Her words rise from the bottom, over the road, and close back down. */}
                  <Stack.Screen name="my-words" options={{ animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                </Stack>
              </ThemeProvider>
            </>
          ) : null}
          {/* One place in the tree from the first render on, so the splash
              never remounts (and restarts) when the fonts land. */}
          <BootGate fontsReady={fontsReady} />
        </View>
        </PremiumProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

/** The other tabs are read once the splash has finished leaving. */
const PREFETCH_DELAY_MS = 400;

/**
 * Holds the launch splash until the first screen is standing: the fonts, her
 * session, and — signed in and headed for Course — the road placed on her
 * step (lib/boot.ts). Anywhere else she lands (welcome, onboarding, the
 * paywall, a deep link) has nothing to wait for. Once it lets go, the other
 * tabs are made ready behind Course (lib/prefetch.ts).
 */
function BootGate({ fontsReady }: { fontsReady: boolean }) {
  const { session, loading } = useAuth();
  const { limited } = usePremium();
  const pathname = usePathname();
  const ready = useBootReady();
  const toCourse = pathname === '/' || pathname === '/home';
  const hold = !fontsReady || loading || (!!session && toCourse && !ready);
  const userId = session?.user.id;

  useEffect(() => {
    if (hold || !userId) return;
    // After the splash's fade, so reading the lexicon can't stutter it.
    const t = setTimeout(() => prefetchTabs(userId, limited), PREFETCH_DELAY_MS);
    return () => clearTimeout(t);
  }, [hold, userId, limited]);

  return <BootSplash hold={hold} />;
}
