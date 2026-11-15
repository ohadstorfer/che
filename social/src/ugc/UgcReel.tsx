// The AI-UGC reel: a few seconds of an AI-made learner reacting in a selfie video with the hook
// written over her, then the "A · Crema" end card from the Posta End Cards canvas, alive: Pancho
// pouring mate (a transparent video) and the app demo playing in a phone.
import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
export const CARD = 5.5 * FPS;

// The 8-second fast cut of real classes (end/app-highlights.mp4), played once in the end card's phone.
export const HIGHLIGHTS = {src: 'end/app-highlights.mp4', seconds: 8};

// seconds: how long her clip stays on (4.5 unless set); speed slows it down; hookTop moves the text off her face.
// highlights: the phone plays the classes highlights once (and the card lasts long enough) instead of the looping demo.
export type Ugc = {id: string; hook: string; girl: string; seconds?: number; speed?: number; hookTop?: number; highlights?: boolean};

export const girlFrames = (reel: Ugc) => Math.round((reel.seconds ?? 4.5) * FPS);
const STORE = Math.round((HIGHLIGHTS.seconds + 0.5) * FPS);
const LINK = 1 * FPS; // the "Link in bio" screen after the App Store close
export const cardFrames = (reel: Ugc) => reel.highlights ? STORE + LINK : CARD;

if (typeof document !== 'undefined') {
  const wait = delayRender('ugc fonts');
  Promise.all([
    ...[700, 800].map(w => new FontFace('Figtree', `url(${staticFile(`fonts/Figtree_${w === 700 ? '700Bold' : '800ExtraBold'}.ttf`)})`, {weight: String(w)})),
    ...[800, 900].map(w => new FontFace('Gabarito', `url(${staticFile(`fonts/Gabarito_${w === 800 ? '800ExtraBold' : '900Black'}.ttf`)})`, {weight: String(w)})),
  ].map(face => face.load().then(l => document.fonts.add(l)))).then(() => continueRender(wait), () => continueRender(wait));
}

const INK = '#3A2A20', SURFACE = '#FFF9F3', ROSA = '#B44A60';
// The app's sticker depth (theme.ts `clay`), scaled from phone points to the 1080 frame.
const STICK = `0 0 0 7px ${INK}, 9px 11px 0 7px ${INK}`;
const CHIP = `0 0 0 5px ${INK}, 6px 8px 0 5px ${INK}`;

// A thin round black outline, the way Instagram's "Classic" text style draws it.
const outline = (r: number) => Array.from({length: 16}, (_, k) => `${(Math.cos(k * Math.PI / 8) * r).toFixed(1)}px ${(Math.sin(k * Math.PI / 8) * r).toFixed(1)}px 0 #000`).join(', ');

/** The hook the way it's typed in the Instagram editor: Classic style, white with a black edge, in the middle of the screen. */
const Hook: React.FC<{text: string; top?: number}> = ({text, top = 640}) => (
  <div style={{position: 'absolute', left: 110, right: 110, top, textAlign: 'center', fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', fontWeight: 700,
    fontSize: 66, lineHeight: 1.16, letterSpacing: -0.5, color: '#fff', textShadow: `${outline(3)}, 0 2px 6px rgba(0,0,0,0.5)`}}>{text}</div>
);

const Girl: React.FC<{reel: Ugc}> = ({reel}) => (
  <AbsoluteFill style={{background: '#111'}}>
    <OffthreadVideo src={staticFile(reel.girl)} muted playbackRate={reel.speed ?? 1} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <Hook text={reel.hook} top={reel.hookTop} />
  </AbsoluteFill>
);

/** A sticker slapped down: drops in a little big and tilted, then settles. */
const useSlap = (delay: number, tilt: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180}});
  return {opacity: frame < delay ? 0 : 1, transform: `rotate(${tilt}deg) scale(${interpolate(t, [0, 1], [1.25, 1])})`};
};

const EndCard: React.FC<{highlights?: boolean}> = ({highlights}) => {
  const bubble = useSlap(2, -2);
  const card = useSlap(10, 1.5);
  const stores = useSlap(16, 0);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', fontFamily: 'Gabarito, sans-serif', color: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -200, top: 640, width: 860, height: 860, borderRadius: 430, opacity: 0.55, background: '#FEBE9B'}} />
      <div style={{position: 'absolute', left: 700, top: 470, width: 700, height: 700, borderRadius: 350, opacity: 0.6, background: '#FFE089'}} />
      <div style={{position: 'absolute', left: 610, top: 540, width: 430, height: 864, borderRadius: 72, background: '#1E1612', boxShadow: '0 40px 70px -26px rgba(20,15,10,0.6)', transform: 'rotate(5deg)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 10, top: 10, width: 410, height: 844, borderRadius: 62, overflow: 'hidden', background: '#F7EFE6'}}>
          {highlights
            ? <OffthreadVideo src={staticFile(HIGHLIGHTS.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            : <Loop durationInFrames={Math.round(4.5 * FPS)}>
                <OffthreadVideo src={staticFile('end/app-demo.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'contain'}} />
              </Loop>}
        </div>
        <div style={{position: 'absolute', left: 155, top: 22, width: 120, height: 34, borderRadius: 999, background: '#0E0A08'}} />
      </div>
      <OffthreadVideo src={staticFile('end/pancho-mate-alpha.webm')} transparent muted
        style={{position: 'absolute', left: 50, top: 590, width: 580, height: 799, filter: 'drop-shadow(0 18px 20px rgba(30,20,10,0.30))'}} />
      <div style={{position: 'absolute', left: 69, top: 150, width: 942, height: 330, boxSizing: 'border-box', padding: '0 48px', borderRadius: 56, background: SURFACE,
        boxShadow: STICK, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...bubble}}>
        <div style={{fontWeight: 900, fontSize: 68, lineHeight: 1.02, letterSpacing: -1, width: 860}}>There’s an app for learning Argentinian Spanish!</div>
        <svg width={140} height={130} viewBox="0 0 140 130" style={{position: 'absolute', left: 200, top: 322, overflow: 'visible'}}>
          <path d="M9 11 L119 11 L39 111 Z" fill={INK} />
          <path d="M0 0 L110 0 L30 100 Z" fill={SURFACE} />
          <path d="M4.5 15 L30 100 L98 15" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1390, width: 920, height: 240, boxSizing: 'border-box', padding: '0 44px', borderRadius: 56, background: SURFACE,
        boxShadow: STICK, display: 'flex', alignItems: 'center', gap: 36, ...card}}>
        <Img src={staticFile('ugc/icon-manteca.png')} style={{width: 164, height: 164, borderRadius: 36, boxShadow: CHIP}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: ROSA}}>Posta</div>
          <div style={{fontWeight: 800, fontSize: 50, lineHeight: 1, whiteSpace: 'nowrap'}}>Learn Argentinian Spanish</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1668, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, ...stores}}>
        <div style={{fontFamily: 'Figtree, sans-serif', fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: 4, textTransform: 'uppercase', background: SURFACE, padding: '14px 30px', borderRadius: 999, boxShadow: CHIP}}>Coming soon to</div>
        <div style={{display: 'flex', gap: 24}}>
          <Img src={staticFile('end/badge-app-store.svg')} style={{height: 104, width: 311}} />
          <Img src={staticFile('end/badge-google-play.png')} style={{height: 104, width: 349}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The App Store-style close: the line on top, then the phone standing straight and big, playing the class highlights. */
const StoreCard: React.FC = () => {
  const title = useSlap(2, -1.5);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: frame - 6, fps, config: {damping: 16, stiffness: 120}});
  const W = 720, H = 1500, BEZEL = 16;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', fontFamily: 'Gabarito, sans-serif', color: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -260, top: 900, width: 900, height: 900, borderRadius: 450, opacity: 0.55, background: '#FEBE9B'}} />
      <div style={{position: 'absolute', left: 640, top: 520, width: 760, height: 760, borderRadius: 380, opacity: 0.6, background: '#FFE089'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 96, textAlign: 'center', fontWeight: 900, fontSize: 84, lineHeight: 1.0, letterSpacing: -1.5, ...title}}>
        There’s an app for learning <span style={{color: ROSA}}>Argentinian Spanish!</span>
      </div>
      <div style={{position: 'absolute', left: (1080 - W) / 2, top: 360, width: W, height: H, borderRadius: 104, background: '#1E1612',
        boxShadow: '0 50px 80px -30px rgba(20,15,10,0.6)', overflow: 'hidden', transform: `translateY(${interpolate(rise, [0, 1], [260, 0])}px)`}}>
        <div style={{position: 'absolute', left: BEZEL, top: BEZEL, right: BEZEL, bottom: BEZEL, borderRadius: 90, overflow: 'hidden', background: '#F7EFE6'}}>
          <OffthreadVideo src={staticFile(HIGHLIGHTS.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        {/* Covers the recording's own island and its red recording dot. */}
        <div style={{position: 'absolute', left: 204, top: 22, width: 300, height: 70, borderRadius: 999, background: '#0E0A08'}} />
      </div>
    </AbsoluteFill>
  );
};

/** One last second: the app icon and "Link in bio", slapped down like the other stickers. */
export const LinkInBio: React.FC = () => {
  const icon = useSlap(0, -3);
  const label = useSlap(4, 2);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', fontFamily: 'Gabarito, sans-serif', color: INK, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70}}>
      <div style={{position: 'absolute', left: -260, top: 900, width: 900, height: 900, borderRadius: 450, opacity: 0.55, background: '#FEBE9B'}} />
      <div style={{position: 'absolute', left: 640, top: 520, width: 760, height: 760, borderRadius: 380, opacity: 0.6, background: '#FFE089'}} />
      <Img src={staticFile('ugc/icon-manteca.png')} style={{width: 300, height: 300, borderRadius: 66, boxShadow: STICK, ...icon}} />
      <div style={{background: SURFACE, borderRadius: 56, boxShadow: STICK, padding: '34px 70px', fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: -2, ...label}}>
        Link in <span style={{color: ROSA}}>bio</span> 👆
      </div>
    </AbsoluteFill>
  );
};

export const UgcReel: React.FC<{reel: Ugc}> = ({reel}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={girlFrames(reel)}><Girl reel={reel} /></Sequence>
    {reel.highlights
      ? <>
          <Sequence from={girlFrames(reel)} durationInFrames={STORE}><StoreCard /></Sequence>
          <Sequence from={girlFrames(reel) + STORE}><LinkInBio /></Sequence>
        </>
      : <Sequence from={girlFrames(reel)}><EndCard /></Sequence>}
  </AbsoluteFill>
);
