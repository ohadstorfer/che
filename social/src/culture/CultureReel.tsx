// Culture reel (9:16): scenes from reels.mjs, then the shared end card. Silent of voice: soft cumbia + sfx.
// Key text stays inside the 4:5 feed crop (y 285–1635).
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {EndCard, END_FRAMES} from '../versus/EndCard';

const FPS = 30;
const HEAD = "'Gabarito', sans-serif";
const BODY = "'Figtree', system-ui, sans-serif";
const INK = '#3A2A20', MUTED = '#7A6556', CARD = '#FFF9F3', PAPER = '#F7EFE6', PAPER2 = '#EFE4D8', ROSA = '#B44A60', SALVIA = '#3F7A57', OK_BG = '#E3F0E7';
const STICK = `0 0 0 7px ${INK}, 9px 11px 0 7px ${INK}`;
const CHIP = `0 0 0 5px ${INK}, 6px 8px 0 5px ${INK}`;
const BG: Record<string, {bg: string; fg: string; es: string; sub: string}> = {
  paper: {bg: `linear-gradient(${PAPER}, ${PAPER2})`, fg: INK, es: ROSA, sub: MUTED},
  ink: {bg: INK, fg: CARD, es: '#FFB8C6', sub: '#D9C7B8'},
  rosa: {bg: ROSA, fg: '#fff', es: '#FFE089', sub: '#FBE3E8'},
  salvia: {bg: SALVIA, fg: '#fff', es: '#FFE089', sub: '#E3F0E7'},
};

if (typeof document !== 'undefined') {
  const wait = delayRender('culture fonts');
  Promise.all([
    ...[700, 800].map(w => new FontFace('Figtree', `url(${staticFile(`fonts/Figtree_${w === 700 ? '700Bold' : '800ExtraBold'}.ttf`)})`, {weight: String(w)})),
    ...[800, 900].map(w => new FontFace('Gabarito', `url(${staticFile(`fonts/Gabarito_${w === 800 ? '800ExtraBold' : '900Black'}.ttf`)})`, {weight: String(w)})),
  ].map(f => f.load().then(l => document.fonts.add(l)))).then(() => continueRender(wait), () => continueRender(wait));
}

type Scene = {k: string; s: number; [key: string]: any};
export type CultureReelData = {id: string; scenes: Scene[]};

export const cultureTimeline = (r: CultureReelData) => {
  let at = 0;
  const starts = r.scenes.map(sc => { const a = at; at += Math.round(sc.s * FPS); return a; });
  return {starts, outro: at, total: at + END_FRAMES};
};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (f: number, from: number, dur = 14) => interpolate(f, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
const pop = (f: number) => spring({frame: f, fps: FPS, config: {damping: 12, stiffness: 190, mass: 0.7}});
const rise = (f: number, from: number, by = 50): React.CSSProperties => { const t = tween(f, from); return {opacity: t, transform: `translateY(${(1 - t) * by}px)`}; };
const popIn = (f: number, from: number): React.CSSProperties => { const p = pop(f - from); return {opacity: Math.min(1, p * 1.4), transform: `scale(${0.6 + 0.4 * p})`}; };
// Size by the text's length so one line of a few words is huge and a sentence still fits 900px.
const fit = (s: string, max: number, min = 54) => Math.max(min, Math.min(max, Math.round(2600 / Math.sqrt(Math.max(4, s.length)) * 0.62)));

const Col: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 34}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '320px 90px', gap, textAlign: 'center'}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{text: string; f: number; at?: number}> = ({text, f, at = 0}) => (
  <div style={{...popIn(f, at), fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 4, textTransform: 'uppercase', color: MUTED, background: CARD, borderRadius: 999, padding: '14px 30px', boxShadow: CHIP}}>{text}</div>
);
const H: React.FC<{text: string; size: number; color: string; style?: React.CSSProperties}> = ({text, size, color, style}) => (
  <div style={{fontFamily: HEAD, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -1.5, color, textWrap: 'balance', ...style} as React.CSSProperties}>{text}</div>
);
const P: React.FC<{text: string; color: string; style?: React.CSSProperties}> = ({text, color, style}) => (
  <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 46, lineHeight: 1.25, color, maxWidth: 860, textWrap: 'balance', ...style} as React.CSSProperties}>{text}</div>
);

const Hook: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
  const p = pop(f), zoom = interpolate(f, [0, sc.s * FPS], [1, 1.08]);
  return <AbsoluteFill style={{background: sc.dark ? INK : `linear-gradient(${PAPER}, ${PAPER2})`}}>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 240}}>
      <Img src={staticFile(sc.img)} style={{width: 860, height: 1000, objectFit: 'contain', mixBlendMode: 'multiply', transform: `translateY(${(1 - p) * 300}px) scale(${zoom})`, transformOrigin: 'bottom center'}} />
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 300, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <div style={{...popIn(f, 4), background: '#fff', borderRadius: 34, padding: '30px 38px', boxShadow: STICK, textAlign: 'center'}}>
        <H text={sc.text} size={fit(sc.text, 92, 66)} color={INK} />
      </div>
      {sc.sub && <div style={rise(f, 14)}><Kicker text={sc.sub} f={f} at={14} /></div>}
    </div>
  </AbsoluteFill>;
};

const Fact: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
  const c = BG[sc.bg ?? 'paper'];
  let at = 0; const next = () => (at += 7);
  return <AbsoluteFill style={{background: c.bg}}><Col>
    {sc.img && <Img src={staticFile(sc.img)} style={{...popIn(f, 0), width: 420, height: 420, objectFit: 'contain', mixBlendMode: 'multiply'}} />}
    {sc.kicker && <Kicker text={sc.kicker} f={f} at={next()} />}
    {sc.huge && <H text={sc.huge} size={300} color={c.es} style={{...popIn(f, next()), lineHeight: 0.9}} />}
    {sc.es && sc.esAt === 'first' && <H text={sc.es} size={fit(sc.es, 130, 80)} color={c.es} style={popIn(f, next())} />}
    {sc.big && <H text={sc.big} size={fit(sc.big, 128, 80)} color={c.fg} style={rise(f, next())} />}
    {sc.es && !sc.esAt && <H text={sc.es} size={fit(sc.es, 120, 76)} color={c.es} style={popIn(f, next() + 4)} />}
    {sc.text && <P text={sc.text} color={c.sub} style={rise(f, next())} />}
    {sc.es && sc.esAt === 'last' && <H text={sc.es} size={fit(sc.es, 110, 76)} color={c.es} style={popIn(f, next() + 6)} />}
  </Col></AbsoluteFill>;
};

// "What they say" on top, an arrow, "what it means" below. Fernet's uses two kickers instead.
const Pair: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
  const c = BG[sc.bg ?? 'paper'];
  if (sc.kicker2) return <AbsoluteFill style={{background: c.bg}}><Col gap={30}>
    <Kicker text={sc.kicker} f={f} />
    <H text={sc.big} size={96} color={c.fg} style={rise(f, 6)} />
    <div style={{height: 50}} />
    <Kicker text={sc.kicker2} f={f} at={30} />
    <H text={sc.es} size={124} color={c.es} style={popIn(f, 36)} />
  </Col></AbsoluteFill>;
  return <AbsoluteFill style={{background: c.bg}}><Col gap={26}>
    <div style={{...popIn(f, 0), fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: c.sub}}>They say</div>
    <H text={sc.es} size={fit(sc.es, 120, 84)} color={c.es} style={popIn(f, 4)} />
    <div style={{...rise(f, 18), fontFamily: HEAD, fontWeight: 900, fontSize: 110, color: c.sub, lineHeight: 1}}>↓</div>
    <div style={{...popIn(f, 26), fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: c.sub}}>It means</div>
    <H text={sc.big} size={fit(sc.big, 150, 92)} color={c.fg} style={popIn(f, 30)} />
    {sc.text && <P text={sc.text} color={c.sub} style={rise(f, 40)} />}
  </Col></AbsoluteFill>;
};

const ASK = 3 * FPS + 12; // the options come in, then a 3-second countdown
const Quiz: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
  const shown = f >= ASK, left = Math.max(1, 3 - Math.floor((f - 12) / FPS));
  const r = tween(f, ASK, 10);
  return <AbsoluteFill style={{background: `linear-gradient(${PAPER}, ${PAPER2})`}}><Col gap={30}>
    <Kicker text={sc.kicker} f={f} />
    <H text={sc.q} size={sc.es ? 64 : fit(sc.q, 100, 76)} color={sc.es ? MUTED : INK} style={rise(f, 3)} />
    {sc.es && <H text={sc.es} size={112} color={ROSA} style={popIn(f, 6)} />}
    {sc.q2 && <H text={sc.q2} size={76} color={INK} style={rise(f, 9)} />}
    <div style={{display: 'flex', flexDirection: 'column', gap: 30, width: 860, marginTop: 14}}>
      {sc.opts.map((o: string, i: number) => {
        const ok = i === sc.ok;
        return <div key={o} style={{...rise(f, 10 + i * 4, 40), opacity: tween(f, 10 + i * 4) * (shown && !ok ? 1 - 0.65 * r : 1),
          background: shown && ok ? OK_BG : CARD, borderRadius: 34, padding: '30px 36px', boxShadow: shown && ok ? `0 0 0 7px ${SALVIA}, 9px 11px 0 7px ${SALVIA}` : STICK,
          fontFamily: HEAD, fontWeight: 800, fontSize: 58, color: shown && ok ? SALVIA : INK, transform: `scale(${shown && ok ? 1 + 0.05 * pop(f - ASK) : 1})`}}>{shown && ok ? '✓ ' : ''}{o}</div>;
      })}
    </div>
    <div style={{height: 150, display: 'flex', alignItems: 'center'}}>
      {!shown && f >= 12 && <div style={{width: 130, height: 130, borderRadius: 999, background: ROSA, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 80, boxShadow: CHIP, transform: `scale(${0.85 + 0.15 * pop((f - 12) % FPS)})`}}>{left}</div>}
      {shown && <P text={sc.why} color={MUTED} style={rise(f, ASK + 4)} />}
    </div>
  </Col></AbsoluteFill>;
};

// The class's question as it looks in the app: a phone with the culture card and the right answer.
const App: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
  const p = pop(f), ans = 30;
  return <AbsoluteFill style={{background: ROSA}}>
    <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', ...rise(f, 0)}}><H text="Learn it in Posta" size={84} color="#fff" /></div>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 170}}>
      <div style={{width: 660, height: 1180, borderRadius: 80, background: CARD, boxShadow: `0 0 0 16px ${INK}, 18px 22px 0 16px ${INK}`, transform: `translateY(${(1 - p) * 500}px) rotate(${(1 - p) * 6}deg)`,
        display: 'flex', flexDirection: 'column', padding: '90px 48px 60px', gap: 34}}>
        <div style={{height: 16, borderRadius: 99, background: PAPER2}}><div style={{width: '62%', height: '100%', borderRadius: 99, background: ROSA}} /></div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: ROSA}}>{sc.label}</div>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 48, lineHeight: 1.12, color: INK}}>{sc.q}</div>
        <div style={{flexGrow: 1}} />
        {sc.opts.map((o: string, i: number) => { const ok = i === sc.ok, on = f >= ans, t = tween(f, ans, 10);
          return <div key={o} style={{...rise(f, 6 + i * 4, 30), opacity: tween(f, 6 + i * 4) * (on && !ok ? 1 - 0.6 * t : 1), transform: `scale(${on && ok ? 1 + 0.04 * pop(f - ans) : 1})`,
            background: on && ok ? OK_BG : '#fff', borderRadius: 28, padding: '26px 28px', boxShadow: on && ok ? `0 0 0 5px ${SALVIA}` : `0 0 0 4px ${PAPER2}`,
            fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: on && ok ? SALVIA : INK}}>{on && ok ? '✓ ' : ''}{o}</div>; })}
        <div style={{background: ROSA, borderRadius: 999, padding: '26px 0', textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 36, color: '#fff', boxShadow: `0 8px 0 #8A3347`}}>Continue</div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};

const VIEW: Record<string, React.FC<{sc: Scene; f: number}>> = {hook: Hook, fact: Fact, pair: Pair, quiz: Quiz, app: App};

export const CultureReel: React.FC<{reel: CultureReelData}> = ({reel}) => {
  const frame = useCurrentFrame();
  const tl = cultureTimeline(reel);
  return <AbsoluteFill style={{background: PAPER}}>
    {reel.scenes.map((sc, i) => {
      const V = VIEW[sc.k], from = tl.starts[i], len = Math.round(sc.s * FPS);
      return <Sequence key={i} from={from} durationInFrames={len}><V sc={sc} f={frame - from} /></Sequence>;
    })}
    {frame >= tl.outro && <EndCard frame={frame - tl.outro} soon={false} />}
    <Audio src={staticFile('music/cumbia-loop-soft.wav')} loop volume={0.35} />
    {tl.starts.slice(1).concat(tl.outro).map(at => <Sequence key={`w${at}`} from={at - 3} durationInFrames={20}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>)}
    {reel.scenes.map((sc, i) => sc.k === 'app' ? <Sequence key={`a${i}`} from={tl.starts[i] + 30} durationInFrames={30}><Audio src={staticFile('sfx/ding.wav')} volume={0.6} /></Sequence> : sc.k !== 'quiz' ? null : <React.Fragment key={`q${i}`}>
      {[0, 1, 2].map(n => <Sequence key={n} from={tl.starts[i] + 12 + n * FPS} durationInFrames={12}><Audio src={staticFile('sfx/tick.wav')} volume={0.5} /></Sequence>)}
      <Sequence from={tl.starts[i] + ASK} durationInFrames={30}><Audio src={staticFile('sfx/ding.wav')} volume={0.6} /></Sequence>
    </React.Fragment>)}
  </AbsoluteFill>;
};
