// "Textbook vs Argentina" carousel on the Drake meme: one still per slide, 1080×1350 (Instagram 4:5).
// Cover (or the "Stop saying" cover) → one word pair per slide → the Posta ending.
import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1350;

type Pair = {no: string; yes: string; en: string};
export type DrakeCarousel = {id: string; topic: string; coverNo: string; coverYes: string; stopNo?: string; stopYes?: string; pairs: Pair[]};

const HEAD = "'Gabarito', sans-serif";
const BODY = "'Figtree', system-ui, sans-serif";
const INK = '#3A2A20', FADED = '#7A6556', CARD = '#FFF9F3', ROSE = '#B44A60', STRIKE = '#C9553E';

if (typeof document !== 'undefined') {
  const wait = delayRender('drake fonts');
  Promise.all([
    ...[700, 800].map(w => new FontFace('Figtree', `url(${staticFile(`fonts/Figtree_${w === 700 ? '700Bold' : '800ExtraBold'}.ttf`)})`, {weight: String(w)})),
    ...[800, 900].map(w => new FontFace('Gabarito', `url(${staticFile(`fonts/Gabarito_${w === 800 ? '800ExtraBold' : '900Black'}.ttf`)})`, {weight: String(w)})),
  ].map(f => f.load().then(l => document.fonts.add(l))))
    .then(() => continueRender(wait), () => continueRender(wait));
}

const Page: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #BDE0F8, #A1D1F3)', fontFamily: HEAD, color: INK, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

/** One row of the meme: Drake's photo on the left, the text on a soft card to the right. */
const Row: React.FC<{yes?: boolean; top: number; size?: number; gap?: number; children: React.ReactNode}> = ({yes, top, size = 496, gap = 30, children}) => (
  <div style={{position: 'absolute', left: 72, top, width: 936, height: size, borderRadius: 56, overflow: 'hidden', background: CARD, display: 'flex',
    boxShadow: 'inset 3px 4px 0 rgba(255,255,255,0.7), inset -4px -7px 14px rgba(120,70,40,0.10), 0 26px 44px -22px rgba(40,60,90,0.55)'}}>
    <div style={{width: size, height: size, flexShrink: 0, background: '#F5B400', overflow: 'hidden'}}>
      <Img src={staticFile(`drake/${yes ? 'yes' : 'no'}.jpg`)} style={{width: size, height: size, objectFit: 'cover'}} />
    </div>
    <div style={{flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap, padding: 40, textAlign: 'center'}}>{children}</div>
  </div>
);

const Stripes: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 2 / 3, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0}}>
    <div style={{flexGrow: 1, background: '#74ACDF'}} /><div style={{flexGrow: 1, background: '#FFFFFF'}} /><div style={{flexGrow: 1, background: '#74ACDF'}} />
  </div>
);

const Footer: React.FC<{n?: number; total?: number}> = ({n, total}) => (
  <div style={{position: 'absolute', left: 72, top: 1244, width: 936, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: BODY, lineHeight: 1, whiteSpace: 'nowrap'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 54, height: 54, borderRadius: 14}} />
      <div style={{fontFamily: HEAD, fontWeight: 900, fontSize: 36, color: INK}}>Posta</div>
      <div style={{fontWeight: 700, fontSize: 28, color: '#4F4038'}}>Learn Argentine Spanish</div>
    </div>
    {n ? <div style={{fontWeight: 800, fontSize: 30, color: INK}}>{n} / {total}</div> : (
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 30, color: INK}}>
        <div>Swipe</div>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </div>
    )}
  </div>
);

const Topic: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, top: 1128, width: 1080, display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 72, padding: '0 34px', borderRadius: 999, background: ROSE, fontFamily: BODY, fontWeight: 800, fontSize: 34, lineHeight: 1, color: '#fff', whiteSpace: 'nowrap',
      boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.28), inset 0 -5px 10px rgba(80,10,30,0.25), 0 14px 22px -10px rgba(160,50,75,0.6)'}}>
      <Stripes w={45} /><div>{text}</div>
    </div>
  </div>
);

const cap: React.CSSProperties = {fontWeight: 900, lineHeight: 0.98, letterSpacing: -1, textTransform: 'uppercase'};
const struck = (thick: number): React.CSSProperties => ({textDecoration: 'line-through', textDecorationColor: STRIKE, textDecorationThickness: thick});

const Cover: React.FC<{c: DrakeCarousel}> = ({c}) => (
  <Page>
    <Row top={84} gap={26}><div style={{...cap, fontSize: 56, color: FADED}}>{c.coverNo}</div></Row>
    <Row yes top={604} gap={26}><div style={{...cap, fontSize: 56, color: INK}}>{c.coverYes}</div></Row>
    <Topic text={c.topic} />
    <Footer />
  </Page>
);

const StopCover: React.FC<{c: DrakeCarousel}> = ({c}) => (
  <Page>
    <Row top={84} gap={0}><div style={{...cap, ...struck(8), fontSize: 64, color: FADED}}>{c.stopNo ?? 'Stop saying these'}</div></Row>
    <div style={{position: 'absolute', left: 836, top: 34, transform: 'rotate(10deg)'}}>
      <svg width="200" height="200" viewBox="0 0 100 100">
        <polygon points="29,2 71,2 98,29 98,71 71,98 29,98 2,71 2,29" fill="#B23B26" stroke="#FFFFFF" strokeWidth="5" />
        <text x="50" y="61" textAnchor="middle" fontFamily="Gabarito, sans-serif" fontWeight="900" fontSize="30" fill="#FFFFFF">STOP</text>
      </svg>
    </div>
    <Row yes top={604} gap={0}><div style={{...cap, fontSize: 64, color: INK}}>{c.stopYes ?? 'Say this in Argentina'}</div></Row>
    <Topic text={c.topic} />
    <Footer />
  </Page>
);

// The text column is 360px wide: size the line by its longest word (~0.62em per capital in Gabarito Black).
const wordSize = (s: string) => Math.min(88, Math.floor(360 / (Math.max(...s.split(' ').map(w => w.length)) * 0.62)));

const PairSlide: React.FC<{p: Pair; n: number; total: number}> = ({p, n, total}) => (
  <Page>
    <Row top={84}>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: 3, textTransform: 'uppercase', color: '#94371F', background: '#F9DDD5', padding: '14px 24px', borderRadius: 999, whiteSpace: 'nowrap'}}>Textbook</div>
      <div style={{...cap, ...struck(9), lineHeight: 0.96, fontSize: wordSize(p.no), color: FADED}}>{p.no}</div>
    </Row>
    <Row yes top={604}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: BODY, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: 3, textTransform: 'uppercase', color: '#2F5E43', background: '#D3EBDD', padding: '14px 24px', borderRadius: 999, whiteSpace: 'nowrap'}}>
        <Stripes w={36} /><div>Argentina</div>
      </div>
      <div style={{...cap, lineHeight: 0.96, fontSize: wordSize(p.yes), color: INK}}>{p.yes}</div>
    </Row>
    <div style={{position: 'absolute', left: 0, top: 1128, width: 1080, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', height: 72, padding: '0 36px', borderRadius: 999, background: CARD, fontFamily: BODY, fontWeight: 700, fontSize: 36, lineHeight: 1, color: INK, whiteSpace: 'nowrap',
        boxShadow: 'inset 2px 3px 0 rgba(255,255,255,0.7), 0 14px 22px -12px rgba(40,60,90,0.55)'}}>{p.en}</div>
    </div>
    <Footer n={n} total={total} />
  </Page>
);

const End: React.FC = () => (
  <Page>
    <Row top={84} size={470} gap={26}><div style={{...cap, ...struck(8), fontSize: 62, color: FADED}}>Sounding like a textbook</div></Row>
    <Row yes top={578} size={470} gap={20}>
      <Img src={staticFile('posta-icon.png')} style={{width: 120, height: 120, borderRadius: 28, boxShadow: '0 18px 30px -16px rgba(58,42,32,0.55)'}} />
      <div style={{fontWeight: 900, fontSize: 100, lineHeight: 0.9, letterSpacing: -2, color: ROSE}}>Posta</div>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: INK}}>Learn Argentine Spanish</div>
    </Row>
    <div style={{position: 'absolute', left: 0, top: 1084, width: 1080, display: 'flex', justifyContent: 'center', gap: 24}}>
      <Img src={staticFile('end/badge-google-play.png')} style={{height: 92, width: 309, borderRadius: 16, boxShadow: '0 16px 24px -12px rgba(20,15,10,0.6)'}} />
      {/* on Google Play already, so only the App Store still waits */}
      <div style={{position: 'relative'}}>
        <Img src={staticFile('end/badge-app-store.svg')} style={{display: 'block', height: 92, width: 275, borderRadius: 16, boxShadow: '0 16px 24px -12px rgba(20,15,10,0.6)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 102, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#4F4038'}}>Coming soon</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, top: 1250, width: 1080, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, fontFamily: BODY, fontWeight: 800, fontSize: 38, lineHeight: 1, color: INK, whiteSpace: 'nowrap'}}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
      <div>Send this to a friend learning Spanish</div>
    </div>
  </Page>
);

/** Slide `slide` (0-based) of carousel `c`; slide -1 is the alternative "Stop saying" cover. */
export const DrakeSlide: React.FC<{c: DrakeCarousel; slide: number}> = ({c, slide}) => {
  const total = c.pairs.length + 2;
  if (slide === -1) return <StopCover c={c} />;
  if (slide === 0) return <Cover c={c} />;
  if (slide === total - 1) return <End />;
  return <PairSlide p={c.pairs[slide - 1]} n={slide + 1} total={total} />;
};
