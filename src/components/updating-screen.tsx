import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUpdatePhase } from '@/lib/app-updates';
import { colors, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The splash that keeps going while a must-wait update downloads
// (lib/app-updates.ts): a fresh install's first open, or an OTA marked
// critical. Modelled on Deel's (the user's recording, 2026-11-19): no new
// screen, no bar, no percentage — the launch splash itself, Pancho still
// breathing in the splash's own place and size, and one small "Updating…"
// at the bottom. It reads as the app taking a moment longer to open, not as
// a chore. When the update is down the app restarts into it; at the cap
// (25 s) it simply goes on.
//
// It sits under the launch splash, so the hand-off at the splash's 3 s cap
// can't be seen: the only thing that changes is the word appearing.
// ---------------------------------------------------------------------------

// The native splash's pictures and sizes (components/boot-splash.tsx).
const ICON =
  Platform.OS === 'android'
    ? require('@/assets/images/splash-pancho-android.png')
    : require('@/assets/images/splash-pancho.png');
const SIZE = Platform.OS === 'android' ? { width: 192, height: 192 } : { width: 260, height: 260 };
/** The splash's own breath: 2.2 s a cycle, 4% up. */
const BREATHE_MS = 1100;
const BREATHE_SCALE = 1.04;

export function UpdatingScreen() {
  const phase = useUpdatePhase();
  if (Platform.OS === 'web' || phase !== 'waiting') return null;
  return <Waiting />;
}

function Waiting() {
  const insets = useSafeAreaInsets();
  const breath = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reduced) return;
    const step = (toValue: number) =>
      Animated.timing(breath, { toValue, duration: BREATHE_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    const loop = Animated.loop(Animated.sequence([step(1), step(0)]));
    loop.start();
    return () => loop.stop();
  }, [breath, reduced]);

  // "Updating…" eases in; it is the one thing that tells this from the splash.
  useEffect(() => {
    const t = Animated.timing(word, {
      toValue: 1,
      duration: 300,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    });
    t.start();
    return () => t.stop();
  }, [word]);

  const scale = reduced ? 1 : breath.interpolate({ inputRange: [0, 1], outputRange: [1, BREATHE_SCALE] });

  return (
    <View style={styles.root} accessibilityViewIsModal accessible accessibilityLabel="Updating Posta">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={ICON} style={SIZE} contentFit="contain" accessible={false} />
      </Animated.View>
      <Animated.Text style={[styles.word, { bottom: insets.bottom + 40, opacity: word }]}>Updating…</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastel.butter,
  },
  word: {
    position: 'absolute',
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: colors.muted,
  },
});

