// Store screenshots in the standard look of the reels' close: the line on top, then a straight, big phone
// showing a real screen of the app (frames from screen recordings, status bar cleaned, see public/store).
import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from 'remotion';

if (typeof document !== 'undefined') {
  const wait = delayRender('store fonts');
  Promise.all([
    new FontFace('Gabarito', `url(${staticFile('fonts/Gabarito_900Black.ttf')})`, {weight: '900'}),
    new FontFace('Figtree', `url(${staticFile('fonts/Figtree_700Bold.ttf')})`, {weight: '700'}),
    new FontFace('Figtree', `url(${staticFile('fonts/Figtree_800ExtraBold.ttf')})`, {weight: '800'}),
  ].map(f => f.load().then(l => document.fonts.add(l)))).then(() => continueRender(wait), () => continueRender(wait));
}

const INK = '#3A2A20', ROSA = '#B44A60';
// widgets: the phone shows the Home Screen with Posta's widgets instead of a screen image.
export type Shot = {id: string; title: string; kicker?: string; screen?: string; widgets?: boolean; stores?: ('ios' | 'play')[]};
// Sizes: App Store iPhone 6.9" and Google Play phone (9:16).
export const SIZES = {ios: {w: 1260, h: 2736}, play: {w: 1080, h: 1920}} as const;

/** "**word**" in the title turns rosa. */
const Title: React.FC<{text: string}> = ({text}) => (
  <>{text.split(/\*\*(.+?)\*\*/).map((part, i) => i % 2 ? <span key={i} style={{color: ROSA}}>{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>)}</>
);

/** A clean status bar drawn over the screen: 9:41, signal, wifi, full battery. */
const StatusBar: React.FC<{width: number}> = ({width}) => {
  const k = width / 1206; // the recordings are 1206 wide
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width, height: 160 * k, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${18 * k}px ${110 * k}px 0 ${150 * k}px`, boxSizing: 'border-box', color: INK}}>
      <div style={{fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif', fontWeight: 600, fontSize: 52 * k, letterSpacing: -0.5}}>9:41</div>
      <svg width={250 * k} height={44 * k} viewBox="0 0 250 44" fill={INK}>
        {[0, 1, 2, 3].map(i => <rect key={i} x={i * 17} y={30 - i * 9} width={12} height={12 + i * 9} rx={3} />)}
        <path d="M107 12a32 32 0 0 1 44 0l-5 5a25 25 0 0 0-34 0zM115 20a20 20 0 0 1 28 0l-5 5a13 13 0 0 0-18 0zM123 28a8 8 0 0 1 12 0l-6 6z" />
        <rect x={166} y={6} width={70} height={32} rx={9} fill="none" stroke={INK} strokeWidth={3} opacity={0.45} />
        <rect x={171} y={11} width={60} height={22} rx={5} />
        <rect x={239} y={16} width={5} height={12} rx={2} opacity={0.45} />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// The Home Screen with Posta's widgets, drawn from the widget's own art (targets/widget) in its
// own units: a widget is 340 units tall, like the SwiftUI layout in PostaWidget.swift.
// ---------------------------------------------------------------------------
type W = {scene: string; pancho: string; stand: {height: number; right: number; bottom: number}; streak: number; lit?: boolean};

const Flame: React.FC<{u: number; lit?: boolean}> = ({u, lit}) => (
  <svg width={26 * u} height={31 * u} viewBox="0 0 26 31" style={{overflow: 'visible'}}>
    <path d="M13 1.5c1.2 5.2 5.1 7.6 7.6 11.4 3 4.6 2 11.6-3.6 14.6-1.7.9-3.2 1.2-4 1.2C7 28.7 2.4 24.6 2.4 18.6c0-4.2 2.4-6.6 4.2-8.8.3 2.6 1.4 4.2 3 4.6-.6-4.6.6-9.6 3.4-12.9z"
      fill={lit ? '#F08A3C' : '#D9CFC4'} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
  </svg>
);

const Chip: React.FC<{u: number; n: number; lit?: boolean}> = ({u, n, lit}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 6 * u, padding: `${6 * u}px ${16 * u}px ${6 * u}px ${12 * u}px`, borderRadius: 999,
    background: lit ? '#FFE08A' : '#FFF9F3', boxShadow: `0 0 0 ${3 * u}px ${INK}`, fontFamily: 'Gabarito', fontWeight: 900, fontSize: 28 * u, color: INK}}>
    <Flame u={u} lit={lit} />{n}
  </div>
);

const Widget: React.FC<{w: W; u: number; wide: boolean; children: React.ReactNode}> = ({w, u, wide, children}) => {
  const H = 340 * u, Wd = wide ? 727 * u : H;
  return (
    <div style={{position: 'relative', width: Wd, height: H, borderRadius: 64 * u, overflow: 'hidden', background: '#FFF9F3',
      boxShadow: `0 ${10 * u}px ${30 * u}px rgba(40,25,15,0.18)`}}>
      <Img src={staticFile(w.scene)} style={{position: 'absolute', right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right bottom'}} />
      <Img src={staticFile(w.pancho)} style={{position: 'absolute', height: w.stand.height * u, right: w.stand.right * u, bottom: w.stand.bottom * u}} />
      <div style={{position: 'absolute', left: (wide ? 30 : 26) * u, top: 26 * u, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        <Chip u={u} n={w.streak} lit={w.lit} />
        {children}
      </div>
    </div>
  );
};

const Line: React.FC<{u: number; wide: boolean; text: string; width: number}> = ({u, wide, text, width}) => (
  <div style={{fontFamily: 'Gabarito', fontWeight: 900, fontSize: (wide ? 50 : 38) * u, letterSpacing: -(wide ? 1 : 0.5) * u, lineHeight: 1.05, color: INK,
    width: width * u, paddingTop: (wide ? 40 : 22) * u}}>{text}</div>
);

const WidgetHome: React.FC<{width: number}> = ({width}) => {
  const p = width / 440; // one iPhone point
  const T = 186; // a widget's height in points (big, so it reads at store size)
  const u = (T * p) / 340;
  const gap = 22 * p;
  const fig = 'Figtree, sans-serif';
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #F9D9BD 0%, #F4C6C9 45%, #CFE3D6 100%)'}}>
      <div style={{position: 'absolute', left: (440 - T * 727 / 340) / 2 * p, top: 78 * p, display: 'flex', flexDirection: 'column', gap}}>
        <Widget u={u} wide w={{scene: 'store/widget/scene-morning.png', pancho: 'store/widget/pancho-waving.png', stand: {height: 312, right: 44, bottom: -8}, streak: 12}}>
          <div style={{fontFamily: fig, fontWeight: 800, fontSize: 19 * u, letterSpacing: 1.5 * u, color: '#7A6556', paddingTop: 14 * u}}>WORD OF THE DAY</div>
          <div style={{fontFamily: 'Gabarito', fontWeight: 900, fontSize: 68 * u, letterSpacing: -1.5 * u, lineHeight: 1.1, color: INK}}>Chamuyo</div>
          <div style={{fontFamily: fig, fontWeight: 700, fontSize: 28 * u, color: '#6B5647', paddingTop: 4 * u}}>smooth talk, lies</div>
          <div style={{fontFamily: fig, fontWeight: 700, fontSize: 25 * u, color: INK, paddingTop: 24 * u, width: 400 * u}}>“Eso de que te llamó es puro chamuyo.”</div>
        </Widget>
        <div style={{display: 'flex', gap}}>
          <Widget u={u} wide={false} w={{scene: 'store/widget/scene-afternoon-small.png', pancho: 'store/widget/pancho-sideeye.png', stand: {height: 204, right: 18, bottom: -17}, streak: 12}}>
            <Line u={u} wide={false} text="So… nothing?" width={290} />
          </Widget>
          <Widget u={u} wide={false} w={{scene: 'store/widget/scene-sunset-small.png', pancho: 'store/widget/pancho-sad.png', stand: {height: 196, right: 30, bottom: 4}, streak: 12}}>
            <Line u={u} wide={false} text="Still waiting." width={290} />
          </Widget>
        </div>
        <Widget u={u} wide w={{scene: 'store/widget/scene-goal.png', pancho: 'store/widget/pancho-goal.png', stand: {height: 318, right: 82, bottom: -34}, streak: 13, lit: true}}>
          <Line u={u} wide text="Gooool! See you tomorrow." width={340} />
        </Widget>
      </div>
      {/* The app on the Home Screen, under its widgets. */}
      <div style={{position: 'absolute', left: (440 - T * 727 / 340) / 2 * p, top: 78 * p + 3 * T * p + 3 * gap + 14 * p, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * p}}>
        <Img src={staticFile('ugc/icon-manteca.png')} style={{width: 64 * p, height: 64 * p, borderRadius: 15 * p}} />
        <div style={{fontFamily: '-apple-system, "SF Pro Text", sans-serif', fontWeight: 500, fontSize: 12 * p, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.35)'}}>Posta</div>
      </div>
    </div>
  );
};

export const StoreShot: React.FC<{shot: Shot; size: keyof typeof SIZES}> = ({shot, size}) => {
  const {w, h} = SIZES[size];
  const ios = size === 'ios';
  // Phone: fills the frame under the title, 46:100 screen like the recordings.
  // The phone is as big as fits: its bottom edge stays just inside the frame.
  const fontSize = ios ? 104 : 76;
  const titleTop = ios ? 110 : 64;
  const phoneTop = ios ? 520 : 320;
  const phoneH = h - phoneTop - (ios ? 36 : 26);
  const bezel = ios ? 20 : 15;
  const screenH = phoneH - bezel * 2;
  const screenW = Math.round(screenH * 1206 / 2622);
  const phoneW = screenW + bezel * 2;
  const r = phoneW * 0.14;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', fontFamily: 'Gabarito, sans-serif', color: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: w * 0.07, right: w * 0.07, top: titleTop, height: phoneTop - titleTop - (ios ? 50 : 30), display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', fontWeight: 900, fontSize, lineHeight: 1.02, letterSpacing: -fontSize * 0.018, textWrap: 'balance'} as React.CSSProperties}>
        <div>
          {shot.kicker ? <div style={{fontSize: fontSize * 0.5, letterSpacing: fontSize * 0.04, textTransform: 'uppercase', color: '#8A6F5C', marginBottom: fontSize * 0.22, lineHeight: 1}}>{shot.kicker}</div> : null}
          <Title text={shot.title} />
        </div>
      </div>
      <div style={{position: 'absolute', left: (w - phoneW) / 2, top: phoneTop, width: phoneW, height: phoneH, borderRadius: r, background: '#1E1612',
        boxShadow: '0 50px 80px -30px rgba(20,15,10,0.55)'}}>
        <div style={{position: 'absolute', left: bezel, top: bezel, width: screenW, height: screenH, borderRadius: r - bezel, overflow: 'hidden', background: '#F7EFE6'}}>
          {shot.widgets
            ? <WidgetHome width={screenW} />
            : <Img src={staticFile(shot.screen!)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
          <StatusBar width={screenW} />
        </div>
        <div style={{position: 'absolute', left: phoneW / 2 - screenW * 0.155, top: bezel + screenW * 0.03, width: screenW * 0.31, height: screenW * 0.09, borderRadius: 999, background: '#0E0A08'}} />
      </div>
    </AbsoluteFill>
  );
};


// ---------------------------------------------------------------------------
// App Store "Header and Search Results" creative asset: one 16:9 PNG (5244 × 2950) serves both.
// The header crops it to 21:9 (keeps the middle 2247 px of height), search results to 3:2 (keeps the
// middle 4425 px of width), so everything that matters sits inside that centre box.
// ---------------------------------------------------------------------------
export const HEADER = {w: 5244, h: 2950};

const Phone: React.FC<{screen: string; height: number; style?: React.CSSProperties}> = ({screen, height, style}) => {
  const bezel = Math.round(height * 0.0095);
  const screenH = height - bezel * 2;
  const screenW = Math.round(screenH * 1206 / 2622);
  const w = screenW + bezel * 2;
  const r = w * 0.14;
  return (
    <div style={{position: 'absolute', width: w, height, borderRadius: r, background: '#1E1612', boxShadow: '0 60px 110px -40px rgba(20,15,10,0.6)', ...style}}>
      <div style={{position: 'absolute', left: bezel, top: bezel, width: screenW, height: screenH, borderRadius: r - bezel, overflow: 'hidden', background: '#F7EFE6'}}>
        <Img src={staticFile(screen)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <StatusBar width={screenW} />
      </div>
      <div style={{position: 'absolute', left: w / 2 - screenW * 0.155, top: bezel + screenW * 0.03, width: screenW * 0.31, height: screenW * 0.09, borderRadius: 999, background: '#0E0A08'}} />
    </div>
  );
};

export const StoreHeader: React.FC = () => {
  const {w, h} = HEADER;
  const safeX = (w - 4425) / 2, safeY = (h - 2247) / 2; // 410, 351
  const ph = 1980; // phone height, inside the 2247 px band
  const top = safeY + (2247 - ph) / 2 + 40;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', fontFamily: 'Gabarito, sans-serif', color: INK, overflow: 'hidden'}}>
      {/* The line, left half of the safe box. */}
      <div style={{position: 'absolute', left: safeX + 120, top: safeY, width: 2050, height: 2247, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 112, letterSpacing: 8, textTransform: 'uppercase', color: '#8A6F5C', marginBottom: 40}}>Learn Argentinian Spanish</div>
        <div style={{fontWeight: 900, fontSize: 250, lineHeight: 0.98, letterSpacing: -5}}>
          The Spanish Argentina <span style={{color: ROSA}}>actually</span> speaks.
        </div>
      </div>
      {/* Three real screens, fanned out on the right half. */}
      <Phone screen="store/screen-03.png" height={ph * 0.9} style={{left: 2700, top: top + 120, transform: 'rotate(-8deg)'}} />
      <Phone screen="store/screen-04.png" height={ph * 0.9} style={{left: 3780, top: top + 120, transform: 'rotate(8deg)'}} />
      <Phone screen="store/screen-01.png" height={ph} style={{left: 3200, top}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// A clean screen for the landing page's own phone frames: the recording with the 9:41 status bar
// drawn in, nothing else (the site draws the phone and the island). 780 wide = 2× a 390-pt phone.
// ---------------------------------------------------------------------------
export const LANDING_SCREEN = {w: 780, h: Math.round(780 * 2622 / 1206)};
export const LandingScreen: React.FC<{screen: string}> = ({screen}) => (
  <AbsoluteFill style={{background: '#F7EFE6'}}>
    <Img src={staticFile(screen)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <StatusBar width={LANDING_SCREEN.w} />
  </AbsoluteFill>
);
