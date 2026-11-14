// "One Argentine word" carousel: one still per slide, 1080×1350 (Instagram 4:5).
// Cover → one slide per way the word is used (title, how, the big line, two chat bubbles, Pancho's tip) → save.
// Look: clean white page, navy condensed type, the flag's stripes as the band behind the big line,
// the Sol de Mayo in gold, handwritten translations. Fonts are the Mac's own (Avenir Next Condensed,
// Noteworthy), so render on this Mac.
import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1350;

type Line = {es: string; en: string};
export type UseSlide = {title: string; how: string; big: Line; examples: [Line, Line]; tip: string};
export type WordCarousel = {id: string; word: string; kicker: string; sub: string; marks?: string[]; uses: UseSlide[]};

const HEAD = '"Avenir Next Condensed", "Avenir Next", sans-serif';
const HAND = 'Noteworthy, "Chalkboard SE", cursive';

if (typeof document !== 'undefined') {
  const wait = delayRender('carousel fonts');
  Promise.all(['800 40px "Avenir Next Condensed"', '600 40px "Avenir Next Condensed"', '500 40px "Avenir Next Condensed"', '700 40px Noteworthy'].map(f => document.fonts.load(f)))
    .then(() => continueRender(wait), () => continueRender(wait));
}

const NAVY = '#0D1B4C', PAGE = '#FFFFFF', CELESTE = '#74ACDF', TINT = '#EAF4FC', HILITE = '#CFE6F9', SUN = '#F6B40E', SOFT = '#3C4A75';

/** Marks the taught word inside a line with a soft celeste box. */
const Mark: React.FC<{text: string; words: string[]}> = ({text, words}) => {
  const re = new RegExp(`(^|[^\\p{L}])(${words.join('|')})(?=[^\\p{L}]|$)`, 'giu');
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length;
    out.push(text.slice(last, start), <span key={start} style={{background: HILITE, borderRadius: '0.12em', padding: '0 0.08em', margin: '0 -0.08em'}}>{m[2]}</span>);
    last = start + m[2].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
};

/** Plain copy where **word** turns heavy. */
const Rich: React.FC<{text: string}> = ({text}) => <>{text.split(/\*\*(.+?)\*\*/).map((p, i) => i % 2 ? <b key={i} style={{fontWeight: 800, color: NAVY}}>{p}</b> : p)}</>;

/** The Sol de Mayo: a gold disc with straight and wavy rays, as on the flag. */
const Sun: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={style}>
    {Array.from({length: 32}, (_, k) => k % 2
      ? <path key={k} d="M0 -20 q3 -6 0 -12 q-3 -6 0 -13" fill="none" stroke={SUN} strokeWidth={3} strokeLinecap="round" transform={`rotate(${k * 11.25})`} />
      : <line key={k} x1={0} y1={-20} x2={0} y2={-47} stroke={SUN} strokeWidth={4} strokeLinecap="round" transform={`rotate(${k * 11.25})`} />)}
    <circle r={21} fill={SUN} />
  </svg>
);

const Flag: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.64} viewBox="0 0 90 58" style={{flexShrink: 0}}>
    <rect x={1.5} y={1.5} width={87} height={55} rx={6} fill="#fff" stroke={NAVY} strokeWidth={3} />
    <path d="M3 3 h84 v17 h-84 z M3 38 h84 v17 h-84 z" fill={CELESTE} />
    <circle cx={45} cy={29} r={5} fill={SUN} />
  </svg>
);

/** The flag's three stripes, full bleed: the big line sits on the white one. */
const Band: React.FC<{h: number; children: React.ReactNode}> = ({h, children}) => (
  <div style={{margin: '0 -72px'}}>
    <div style={{height: 34, background: CELESTE}} />
    <div style={{minHeight: h, background: PAGE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '22px 130px', textAlign: 'center'}}>{children}</div>
    <div style={{height: 34, background: CELESTE}} />
  </div>
);

const Footer: React.FC<{n?: number; total?: number; swipe?: boolean; save?: boolean}> = ({n, total, swipe, save}) => (
  <div style={{position: 'absolute', left: 72, right: 72, bottom: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: HEAD, fontWeight: 600, fontSize: 30, color: SOFT}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Flag w={46} /><span>@postaspanish</span></div>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      {save ? <span style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: NAVY}}>
        <svg width="30" height="34" viewBox="0 0 20 24" fill={SUN} stroke={NAVY} strokeWidth="2.4" strokeLinejoin="round"><path d="M3 2h14v20l-7-5-7 5z" /></svg>Save for later
      </span> : n ? <span>{n} / {total}</span> : null}
      {swipe && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
    </div>
  </div>
);

const Page: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: PAGE, color: NAVY, fontFamily: HEAD, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

const Cover: React.FC<{c: WordCarousel; total: number}> = ({c, total}) => (
  <Page>
    <div style={{position: 'absolute', left: 72, right: 72, top: 70, bottom: 120, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 800, fontSize: 34, letterSpacing: 4, textTransform: 'uppercase', color: CELESTE}}>
        <Flag w={64} /><span>Argentine Spanish</span>
      </div>
      <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 70, lineHeight: 1.12, marginTop: 50, maxWidth: 820}}>{c.kicker}</div>
      <div style={{position: 'relative', marginTop: 40}}>
        <Band h={430}>
          <div style={{fontWeight: 800, fontSize: Math.min(340, Math.round(1500 / c.word.length)), lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: -4, textTransform: 'uppercase'}}>{c.word}</div>
        </Band>
        <Sun size={280} style={{position: 'absolute', right: -150, top: -110}} />
      </div>
      <div style={{marginTop: 70, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{fontWeight: 800, fontSize: 76, lineHeight: 1, textTransform: 'uppercase'}}>{c.sub}</div>
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke={SUN} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M13 5l7 7-7 7" /></svg>
      </div>
    </div>
    <Img src={staticFile('pancho/gesto-mano.png')} style={{position: 'absolute', right: 40, bottom: 96, height: 300}} />
    <Footer n={1} total={total} />
  </Page>
);

const Bubble: React.FC<{e: Line; words: string[]; right: boolean}> = ({e, words, right}) => (
  <div style={{alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: '86%', padding: '22px 32px 20px', background: right ? NAVY : TINT, color: right ? '#fff' : NAVY,
    borderRadius: 38, [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 10}}>
    <div style={{fontWeight: 800, fontSize: 48, lineHeight: 1.1}}>{right ? e.es : <Mark text={e.es} words={words} />}</div>
    <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 34, lineHeight: 1.2, marginTop: 6, color: right ? '#BFDDF5' : SOFT}}>{e.en}</div>
  </div>
);

// One line when it fits the band (~0.43em per letter across 820px); longer lines go to two at 104.
const bigSize = (es: string) => es.length > 22 ? 104 : Math.min(156, Math.floor(1800 / es.length));

const Use: React.FC<{c: WordCarousel; u: UseSlide; n: number; total: number}> = ({c, u, n, total}) => (
  <Page>
    <div style={{position: 'absolute', left: 72, right: 72, top: 64, bottom: 116, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 4, color: CELESTE, textTransform: 'uppercase'}}>{c.word} · {String(n - 1).padStart(2, '0')}</div>
        <div style={{fontWeight: 800, fontSize: u.title.length > 16 ? 92 : 108, lineHeight: 1, letterSpacing: -1, textTransform: 'uppercase', marginTop: 8}}>{u.title}</div>
        <div style={{width: 120, height: 12, borderRadius: 6, background: SUN, marginTop: 16}} />
        <div style={{fontWeight: 500, fontSize: 40, lineHeight: 1.22, color: SOFT, marginTop: 20}}><Rich text={u.how} /></div>
      </div>
      <div style={{position: 'relative'}}>
        <Band h={u.big.es.length > 14 ? 310 : 260}>
          <div style={{fontWeight: 800, fontSize: bigSize(u.big.es), lineHeight: 1.02, letterSpacing: -2, whiteSpace: 'pre-line'}}>{u.big.es.replace(/ —/g, '\n—')}</div>
          <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 50, lineHeight: 1.1, marginTop: 10}}>{u.big.en}</div>
        </Band>
        <Sun size={150} style={{position: 'absolute', right: -70, top: -58}} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <Bubble e={u.examples[0]} words={c.marks ?? [c.word]} right={false} />
        <Bubble e={u.examples[1]} words={c.marks ?? [c.word]} right />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <Img src={staticFile('pancho/gesto-mano.png')} style={{height: 128, flexShrink: 0}} />
        <div style={{fontWeight: 500, fontSize: 36, lineHeight: 1.22, color: SOFT, borderLeft: `6px solid ${SUN}`, paddingLeft: 22}}>
          <b style={{fontWeight: 800, color: NAVY}}>Pancho’s tip: </b><Rich text={u.tip} />
        </div>
      </div>
    </div>
    <Footer n={n} total={total} swipe />
  </Page>
);

// Last slide: the invitation to download, on the same page as the rest. Pancho and the app sit on the flag band.
const Download: React.FC<{total: number}> = ({total}) => (
  <Page>
    <div style={{position: 'absolute', left: 72, right: 72, top: 64}}>
      <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 4, color: CELESTE, textTransform: 'uppercase'}}>The Posta app</div>
      <div style={{fontWeight: 800, fontSize: 108, lineHeight: 1, letterSpacing: -1, textTransform: 'uppercase', marginTop: 8}}>Download Posta</div>
      <div style={{width: 120, height: 12, borderRadius: 6, background: SUN, marginTop: 16}} />
      <div style={{fontWeight: 500, fontSize: 40, lineHeight: 1.22, color: SOFT, marginTop: 20}}>Learn <b style={{fontWeight: 800, color: NAVY}}>Argentine Spanish</b> for real: lessons, slang and conversations with Pancho.</div>
    </div>
    <div style={{position: 'absolute', left: 72, right: 72, top: 450}}>
      <Band h={510}>{null}</Band>
    </div>
    <Sun size={150} style={{position: 'absolute', right: -70, top: 392}} />
    <Img src={staticFile('pancho/mate.png')} style={{position: 'absolute', left: 70, top: 490, height: 520}} />
    <div style={{position: 'absolute', left: 640, top: 384, width: 340, height: 704, borderRadius: 58, background: NAVY, boxShadow: '0 30px 50px -24px rgba(13,27,76,0.55)', transform: 'rotate(4deg)'}}>
      <Img src={staticFile('end/culture.jpg')} style={{position: 'absolute', left: 9, top: 9, width: 322, height: 686, borderRadius: 50, objectFit: 'cover'}} />
    </div>
    <div style={{position: 'absolute', left: 72, top: 1132, display: 'flex', alignItems: 'center', gap: 18}}>
      <Img src={staticFile('end/badge-google-play.png')} style={{height: 88, width: 295}} />
      {/* on Google Play already, so only the App Store still waits */}
      <div style={{position: 'relative'}}>
        <Img src={staticFile('end/badge-app-store.svg')} style={{display: 'block', height: 88, width: 263}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontWeight: 800, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: SOFT}}>Coming soon</div>
      </div>
    </div>
    <div style={{position: 'absolute', right: 72, top: 1142, fontFamily: HAND, fontWeight: 700, fontSize: 52, lineHeight: 1.1}}>link in bio</div>
    <Footer save />
  </Page>
);

/** Slide `slide` (0-based) of carousel `c`. */
export const WordSlide: React.FC<{c: WordCarousel; slide: number}> = ({c, slide}) => {
  const total = c.uses.length + 2;
  if (slide === 0) return <Cover c={c} total={total} />;
  if (slide === total - 1) return <Download total={total} />;
  return <Use c={c} u={c.uses[slide - 1]} n={slide + 1} total={total} />;
};
