import { useEffect } from 'react';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// useKeyboardViewportFit
//
// On the web the app is a `position: fixed` box pinned to all four edges of
// the layout viewport (see +html.tsx). iOS never resizes that viewport when
// the keyboard comes up — it only shrinks the *visual* viewport — so the app
// keeps laying itself out at full height and the keyboard simply covers the
// bottom of it. Nothing scrolls out from under it, because as far as the app
// is concerned nothing moved. `KeyboardAvoidingView` is no help: it listens to
// React Native's `Keyboard` module, which on react-native-web never fires.
//
// Worse, iOS then tries to reveal the focused field by scrolling the *page* —
// and a fixed root has nothing to scroll, so the whole app slides off-centre
// instead, which is how the keyboard's accessory bar ended up sitting on top
// of the password field.
//
// So the root is tied to the visual viewport instead: as tall as what is left
// visible, offset by however far iOS has scrolled. Every screen then lays out
// inside the space the keyboard leaves, and the ScrollViews that were already
// there start scrolling, because now there is something to scroll.
// ---------------------------------------------------------------------------
export function useKeyboardViewportFit() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const viewport = window.visualViewport;
    const root = document.getElementById('root');
    if (!viewport || !root) return;

    const apply = () => {
      // `bottom` has to go: with it still pinned, `height` is ignored.
      root.style.bottom = 'auto';
      root.style.height = `${viewport.height}px`;
      root.style.top = `${viewport.offsetTop}px`;
    };

    apply();
    // `resize` is the keyboard opening and closing; `scroll` is iOS dragging
    // the visual viewport around inside the layout one while it is open.
    viewport.addEventListener('resize', apply);
    viewport.addEventListener('scroll', apply);

    return () => {
      viewport.removeEventListener('resize', apply);
      viewport.removeEventListener('scroll', apply);
      // Back to the stylesheet's four pinned edges.
      root.style.bottom = '';
      root.style.height = '';
      root.style.top = '';
    };
  }, []);
}
