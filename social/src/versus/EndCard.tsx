// The ending of a reel: a headline, a wheel of four app screens that turns one place
// a second, the app's name, and the store badges. `frame` counts from the card's first frame.
import React from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile} from 'remotion';

const FPS = 30;
const C = {sageTop: '#BDE1CB', sageBottom: '#8FC4A5', card: '#FFF9F3', ink: '#3A2A20', muted: '#7A6556', rosa: '#B44A60'};
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
const BODY = 'Figtree, "Helvetica Neue", sans-serif';
const CLAY = 'inset 3px 4px 0 rgba(255,255,255,0.7), inset -4px -7px 14px rgba(120,70,40,0.10), 0 26px 48px -20px rgba(60,50,30,0.5)';

if (typeof document !== 'undefined') {
  const wait = delayRender('end card fonts');
  Promise.all([['Figtree_600SemiBold.ttf', 600], ['Figtree_800ExtraBold.ttf', 800]].map(([file, weight]) => {
    const f = new FontFace('Figtree', `url(${staticFile('fonts/' + file)})`, {weight: String(weight)});
    return f.load().then(l => document.fonts.add(l));
  })).then(() => continueRender(wait), () => continueRender(wait));
}

const SCREENS = [['Course', 'course'], ['AI chat', 'chat'], ['Culture', 'culture'], ['Slang', 'slang']] as const;
const WHEEL_AT = 18; // when the first screen is settled
const STEP = FPS; // one second a screen
/** How long the card runs: its entrance, every screen once, and a short hold. */
export const END_FRAMES = WHEEL_AT + SCREENS.length * STEP + 12;

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
const rise = (frame: number, from: number, by = 40): React.CSSProperties => { const t = tween(frame, from, 14); return {opacity: t, transform: `translateY(${(1 - t) * by}px)`}; };

// A phone's place on the wheel: 0 is the middle, 1 the right, 2 hidden behind, 3 the left (4 is the middle again).
const AT = [0, 1, 2, 3, 4];
const PW = 397, PH = 837; // the glass is the shape of a real screenshot (1206 x 2622)
const place = (rel: number) => ({
  x: interpolate(rel, AT, [0, PW * 0.72, 0, -PW * 0.72, 0]),
  scale: interpolate(rel, AT, [1, 0.76, 0.6, 0.76, 1]),
  rot: interpolate(rel, AT, [0, 6, 0, -6, 0]),
  opacity: interpolate(rel, AT, [1, 1, 0, 1, 1]),
  dim: interpolate(rel, AT, [1, 0.86, 0.8, 0.86, 1]),
});

// `soon` shows "Coming soon to" over the store badges; pass false once the app is on the stores.
export const EndCard: React.FC<{frame: number; soon?: boolean}> = ({frame, soon = true}) => {
  const step = Math.min(SCREENS.length - 1, Math.max(0, Math.floor((frame - WHEEL_AT) / STEP)));
  // The wheel's turn so far, in screens: each step starts with a half-second move to the next one.
  const turned = step === 0 ? 0 : step - 1 + tween(frame, WHEEL_AT + step * STEP, 16);
  const phones = spring({frame: frame - 8, fps: FPS, config: {damping: 14, stiffness: 150, mass: 0.8}});

  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.sageTop}, ${C.sageBottom})`, opacity: tween(frame, 0, 8), overflow: 'hidden', fontFamily: DISPLAY, color: C.ink, zIndex: 10}}>
    {/* the headline: the same plain display type as the app's name below, in ink */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontWeight: 900, fontSize: 100, lineHeight: 1, letterSpacing: -1.5, whiteSpace: 'nowrap', color: C.ink, ...rise(frame, 2, -30)}}>
      Want to learn more?</div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 14, ...rise(frame, 8, 20)}}>
      {SCREENS.map(([name], k) => <div key={name} style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, lineHeight: 1, padding: '16px 28px', borderRadius: 999,
        background: k === step ? C.rosa : 'rgba(255,255,255,0.42)', color: k === step ? '#fff' : C.ink}}>{name}</div>)}
    </div>

    <div style={{position: 'absolute', left: (1080 - PW) / 2, top: 440, width: PW, height: PH, opacity: Math.min(1, phones * 1.4), transform: `translateY(${(1 - phones) * 120}px)`}}>
      {SCREENS.map(([name, file], k) => {
        const p = place((((k - turned) % 4) + 4) % 4);
        return <div key={name} style={{position: 'absolute', inset: 0, borderRadius: 66, background: '#1E1612', boxShadow: '0 40px 70px -26px rgba(40,30,20,0.6)',
          transform: `translateX(${p.x}px) scale(${p.scale}) rotate(${p.rot}deg)`, opacity: p.opacity, filter: `brightness(${p.dim})`, zIndex: Math.round(p.scale * 100)}}>
          <Img src={staticFile(`end/${file}.jpg`)} style={{position: 'absolute', left: 11, top: 11, width: PW - 22, height: PH - 22, borderRadius: 56, objectFit: 'cover', objectPosition: 'top center'}} />
        </div>;
      })}
    </div>

    <div style={{position: 'absolute', left: 80, top: 1350, width: 920, height: 260, boxSizing: 'border-box', padding: '0 44px', borderRadius: 64, background: C.card, boxShadow: CLAY,
      display: 'flex', alignItems: 'center', gap: 38, zIndex: 200, ...rise(frame, 12, 50)}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 172, height: 172, borderRadius: 38, boxShadow: '0 22px 40px -18px rgba(58,42,32,0.55)'}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={{fontWeight: 900, fontSize: 106, lineHeight: 1, color: C.rosa}}>Posta</div>
        <div style={{fontWeight: 800, fontSize: 52, lineHeight: 1, whiteSpace: 'nowrap'}}>Learn Argentine Spanish</div>
      </div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 1640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, ...rise(frame, 16, 30)}}>
      {soon ? <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: 4, textTransform: 'uppercase', color: C.muted, background: C.card, padding: '14px 30px', borderRadius: 999,
        boxShadow: '0 10px 18px -10px rgba(40,30,20,0.5)'}}>Coming soon to</div> : null}
      <div style={{display: 'flex', gap: 24}}>
        {[['badge-app-store.svg', 311], ['badge-google-play.png', 349]].map(([file, w]) => <Img key={file} src={staticFile(`end/${file}`)}
          style={{height: 104, width: w as number, borderRadius: 16, boxShadow: '0 0 0 2px rgba(255,255,255,0.28), 0 16px 24px -12px rgba(20,15,10,0.6)'}} />)}
      </div>
    </div>
  </AbsoluteFill>;
};
