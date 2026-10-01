import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet } from 'react-native';

import { preloadImages } from '@/lib/preload-images';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// BootSplash — the capybara on the oat while the first screen gets ready
// underneath (lib/boot.ts). It is the same picture, size and place as the
// native splash, so on the phones the hand-off can't be seen. On the web he is
// in the page itself (+html.tsx), there from the first frame, before the
// script has even loaded — the app only decides when he goes.
//
// He breathes while he waits — that is what reads as "coming" rather than
// "stuck" — and when the screen is ready he lifts away in one quick fade over
// it. The wait is capped: past MAX_HOLD_MS he goes anyway, and whatever is
// still missing fills in where it belongs.
// ---------------------------------------------------------------------------

const ICON = require('@/assets/images/splash-icon.png');
/** The native splash's `imageWidth` in app.json. */
const SIZE = 180;
const MAX_HOLD_MS = 3000;
/** Half a breath; the web's CSS keyframes run the same 2.2s cycle. */
const BREATHE_MS = 1100;
const EXIT_MS = 240;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const native = Platform.OS !== 'web';
const BREATHE_SCALE = 1.04;

// Course's own first pictures, fetched while he is up so the road is revealed
// with them already in place.
preloadImages([
  require('@/assets/images/capybara-avatar.png'),
  require('@/assets/images/capybara/capybara-saludando-figure.webp'),
]);

/** True once the splash has waited as long as it ever will. */
function useCapped() {
  const [capped, setCapped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCapped(true), MAX_HOLD_MS);
    return () => clearTimeout(t);
  }, []);
  return capped;
}

/** The web's splash is the page's own `#boot-splash`; this only lets it go. */
function WebBootSplash({ hold }: { hold: boolean }) {
  const capped = useCapped();
  const leaving = !hold || capped;
  useEffect(() => {
    if (!leaving) return;
    const el = document.getElementById('boot-splash');
    const lift = document.getElementById('boot-splash-lift');
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const curve = 'cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.pointerEvents = 'none';
    el.style.transition = `opacity ${EXIT_MS}ms ${curve}`;
    if (lift) lift.style.transition = `transform ${EXIT_MS}ms ${curve}`;
    // A frame apart, so the transition has a starting point to run from.
    requestAnimationFrame(() => {
      el.style.opacity = '0';
      if (lift && !reduced) lift.style.transform = 'scale(1.08)';
    });
    const t = setTimeout(() => el.remove(), EXIT_MS + 60);
    return () => clearTimeout(t);
  }, [leaving]);
  return null;
}

function NativeBootSplash({ hold }: { hold: boolean }) {
  const capped = useCapped();
  const [gone, setGone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const breath = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const leaving = !hold || capped;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (leaving || reduced) return;
    const step = (toValue: number) =>
      Animated.timing(breath, {
        toValue,
        duration: BREATHE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: native,
      });
    const loop = Animated.loop(Animated.sequence([step(1), step(0)]));
    loop.start();
    return () => loop.stop();
  }, [breath, leaving, reduced]);

  useEffect(() => {
    if (!leaving) return;
    const out = Animated.timing(exit, {
      toValue: 1,
      duration: EXIT_MS,
      easing: EASE_OUT,
      useNativeDriver: native,
    });
    out.start(({ finished }) => finished && setGone(true));
    return () => out.stop();
  }, [exit, leaving]);

  if (gone) return null;

  const opacity = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  // Reduced motion keeps the fade and drops the movement.
  const scale = reduced
    ? 1
    : Animated.multiply(
        breath.interpolate({ inputRange: [0, 1], outputRange: [1, BREATHE_SCALE] }),
        exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
      );

  return (
    <Animated.View
      pointerEvents={leaving ? 'none' : 'auto'}
      style={[styles.root, { opacity }]}
      accessible
      accessibilityLabel="Loading"
      accessibilityElementsHidden={leaving}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={ICON} style={styles.icon} contentFit="contain" priority="high" accessible={false} />
      </Animated.View>
    </Animated.View>
  );
}

export const BootSplash = Platform.OS === 'web' ? WebBootSplash : NativeBootSplash;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  icon: { width: SIZE, height: SIZE },
});
