import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// useStatusBarColor
//
// iOS reserves a strip above a standalone PWA. Who colours it depends on the
// iOS version, and the two regimes want opposite things:
//
// - Up to iOS 18 (and Android/Chrome): the strip follows the `theme-color`
//   meta tag and is re-read whenever the tag changes, so each screen claims
//   its own colour on focus and the strip tracks navigation.
//
// - iOS 26: the strip is ONE colour per session — sampled from the `body`
//   background at page load, then frozen. Nothing moves it afterwards: meta
//   swaps, manifest `theme_color`, `body` repaints, `black-translucent`, and
//   appearing-fixed-element tricks were all tested dead on device
//   (2026-08-20). The app absorbs this by design instead: the screen gradient
//   is upside-down (see ScreenBackground), every screen's top edge is pale
//   `bg`, and the frozen colour fits them all. The claims below still matter
//   there for exactly one moment — page load, when the sample is taken.
//
// Every screen that reaches the top edge has to call this, including the ones
// that only ever show a spinner: the strip holds the last claim, so a screen
// that stays silent wears whichever colour it was pushed from.
//
// Deliberately no cleanup on blur. Restoring "whatever was there before" races
// with the next screen's claim (React Navigation doesn't order blur teardown
// against focus setup), and the restore would sometimes land last and undo it.
// A screen that cares always sets; the strip simply holds the last claim until
// someone else makes one.
// ---------------------------------------------------------------------------
export function useStatusBarColor(color: string) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web' || typeof document === 'undefined') return;
      // Editing `content` in place is the obvious way to do this, and iOS
      // misses it in a standalone PWA more often than it catches it — the
      // strip keeps whatever colour it sampled around page load. Swapping the
      // element out is noticed where a mutation is not, so the tag is replaced
      // rather than edited. (Belt and braces: whichever screen the app opens
      // on also claims early enough that the load-time sample is already
      // right — see index.tsx.)
      document.querySelector('meta[name="theme-color"]')?.remove();
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', color);
      document.head.appendChild(meta);
      // For iOS 26's load-time body sample (see the header comment).
      document.body.style.backgroundColor = color;
    }, [color]),
  );
}
