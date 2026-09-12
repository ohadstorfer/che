import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Custom HTML shell for web: PWA manifest, iOS home-screen metadata, fonts.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <title>Che</title>
        <link rel="manifest" href="/manifest.json" />
        {/* On iOS up to 18 (and Android), this is the colour of the strip iOS
            reserves above the app under the `default` status bar style,
            re-read whenever it changes — screens claim their own through
            `useStatusBarColor`.

            iOS 26 has no per-screen channel at all (everything tested on
            device, 2026-08-20): the strip is ONE colour per session, sampled
            from the `body` background at page load and then frozen — meta
            swaps, manifest `theme_color`, later `body` repaints,
            `black-translucent` and appearing-fixed-element tricks are all
            ignored. The app's answer is design, not plumbing: the screen
            gradient is upside-down (see ScreenBackground), so every screen's
            top edge is pale and the one frozen colour fits them all. */}
        <meta name="theme-color" content="#F1EEE6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* `default` keeps the strip opaque and its clock dark on every iOS.
            (`black-translucent` was tried twice and lost twice: pre-iOS-26 it
            shortens the viewport by the status bar height, and iOS 26 simply
            ignores it and reserves the strip anyway.)

            iOS reads *this* tag only once, at Add to Home Screen. Changing it
            needs the PWA reinstalled; `theme-color` above does not. */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* The clock and battery sit on the strip, and iOS picks their tint
            from the page's scheme. The app is light only; saying so keeps
            them dark. */}
        <meta name="color-scheme" content="light" />
        <meta name="apple-mobile-web-app-title" content="Che" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <ScrollViewStyleReset />
        {/* Safari's `100%` chain comes up short of the viewport in standalone
            PWAs, leaving a strip of bare body under the app — and since `body`
            is `overflow:hidden`, that short root also clips the tab bar's
            shadow flat. Pinning the root to the viewport with `position:fixed`
            and all four offsets sidesteps the height chain entirely, so the app
            is exactly as tall as the page it was given, no more and no less.

            The four pinned edges are the resting state only: while the
            keyboard is up, `useKeyboardViewportFit` swaps `bottom` for a
            `height`/`top` pair taken from the visual viewport, so the app sits
            in the strip the keyboard leaves instead of underneath it. */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              'body{background-color:#F1EEE6}' +
              'html,body{height:100%;margin:0}' +
              '#root{position:fixed;top:0;right:0;bottom:0;left:0;height:auto}',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
