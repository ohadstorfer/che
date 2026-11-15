// "Guess before Drake" reel (9:16): a Drake carousel played as a quiz. Each round shows the textbook word
// on the "no" row, a 3-second countdown on the "yes" row, then the Argentine word pops in with a ding.
// Hook "Only 1% get 5/5" on top the whole time; ends on "comment your score" and the "Link in bio" close.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {END_FRAMES} from '../versus/EndCard';
import {LinkEnd} from '../versus/LinkEnd';
import type {DrakeCarousel} from './DrakeSlide';

const FPS = 30;
const HEAD = "'Gabarito', sans-serif";
const BODY = "'Figtree', system-ui, sans-serif";
// Posta's standard look (same as the end card): warm paper, ink sticker outlines, rosa accent.
const INK = '#3A2A20', FADED = '#7A6556', CARD = '#FFF9F3', ROSE = '#B44A60', STRIKE = '#C9553E', SOL = '#F5B400';
const STICK = `0 0 0 7px ${INK}, 9px 11px 0 7px ${INK}`;
const CHIP = `0 0 0 5px ${INK}, 6px 8px 0 5px ${INK}`;

if (typeof document !== 'undefined') {
  const wait = delayRender('quiz fonts');
  Promise.all([
    ...[700, 800].map(w => new FontFace('Figtree', `url(${staticFile(`fonts/Figtree_${w === 700 ? '700Bold' : '800ExtraBold'}.ttf`)})`, {weight: String(w)})),
    ...[800, 900].map(w => new FontFace('Gabarito', `url(${staticFile(`fonts/Gabarito_${w === 800 ? '800ExtraBold' : '900Black'}.ttf`)})`, {weight: String(w)})),
  ].map(f => f.load().then(l => document.fonts.add(l))))
    .then(() => continueRender(wait), () => continueRender(wait));
}

// Timeline in frames.
const HOOK = 60;          // headline + rows come in
const ASK = 90;           // 3-second countdown
const SHOW = 38;          // the answer stays up
const ROUND = ASK + SHOW;
const ROUNDS = 5;
const COMMENT = 80;
export const quizTimeline = () => {
  const rounds = HOOK;
  const comment = rounds + ROUNDS * ROUND;
  const outro = comment + COMMENT;
  return {rounds, comment, outro, total: outro + END_FRAMES};
};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (f: number, from: number, dur: number) => interpolate(f, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
const pop = (f: number, cfg = {damping: 11, stiffness: 180, mass: 0.7}) => spring({frame: f, fps: FPS, config: cfg});

const cap: React.CSSProperties = {fontFamily: HEAD, fontWeight: 900, lineHeight: 0.96, letterSpacing: -1, textTransform: 'uppercase', whiteSpace: 'nowrap'};
const PILL: React.CSSProperties = {fontFamily: BODY, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: 3, textTransform: 'uppercase', padding: '14px 24px', borderRadius: 999, whiteSpace: 'nowrap'};
// The text column is ~420px wide.
// The text column is ~390px wide: size by the longest word, and longer phrases wrap onto more lines.
const wordSize = (s: string) => Math.min(96, Math.floor(370 / (Math.max(...s.split(' ').map(w => w.length)) * 0.62)));
const WRAP: React.CSSProperties = {whiteSpace: 'normal', maxWidth: 390, textWrap: 'balance'} as React.CSSProperties;

// Everything sits inside the 4:5 crop the Instagram feed shows (y 285–1635) and below its avatar/name overlay.
const ROW = 400, ROW_L = 72, ROW_W = 936;
const Row: React.FC<{yes?: boolean; top: number; style?: React.CSSProperties; children: React.ReactNode}> = ({yes, top, style, children}) => (
  <div style={{position: 'absolute', left: ROW_L, top, width: ROW_W, height: ROW, borderRadius: 56, overflow: 'hidden', background: CARD, display: 'flex',
    boxShadow: STICK, ...style}}>
    <div style={{width: ROW, height: ROW, flexShrink: 0, background: SOL, overflow: 'hidden'}}>
      <Img src={staticFile(`drake/${yes ? 'yes' : 'no'}.jpg`)} style={{width: ROW, height: ROW, objectFit: 'cover'}} />
    </div>
    <div style={{position: 'relative', flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 28, textAlign: 'center'}}>{children}</div>
  </div>
);

/** The countdown: a ring that empties over 3 s and the number that pops each second. */
const Ring: React.FC<{f: number}> = ({f}) => {
  const n = 3 - Math.floor(f / FPS);
  const left = 1 - f / ASK;
  const r = 92, c = 2 * Math.PI * r;
  const s = 0.85 + 0.15 * pop(f % FPS, {damping: 9, stiffness: 260, mass: 0.5});
  return <div style={{position: 'relative', width: 230, height: 230}}>
    <svg width="230" height="230" viewBox="0 0 230 230" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
      <circle cx="115" cy="115" r={r} fill="none" stroke="#F3E2D3" strokeWidth="22" />
      <circle cx="115" cy="115" r={r} fill="none" stroke={n === 1 ? STRIKE : ROSE} strokeWidth="22" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left)} />
    </svg>
    <div style={{...cap, position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 120, color: INK, transform: `scale(${s})`}}>{Math.max(1, n)}</div>
  </div>;
};

const Dots: React.FC<{done: number; current: number; f: number}> = ({done, current, f}) => (
  <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
    {Array.from({length: ROUNDS}, (_, i) => {
      const filled = i < done;
      const now = i === current && !filled;
      const s = filled && i === done - 1 ? 0.6 + 0.4 * pop(f) : 1;
      return <div key={i} style={{width: 34, height: 34, borderRadius: 17, background: filled ? ROSE : CARD, border: `5px solid ${now || filled ? INK : 'rgba(58,42,32,0.25)'}`, transform: `scale(${s})`, boxSizing: 'border-box'}} />;
    })}
  </div>
);

export const QuizReel: React.FC<{c: DrakeCarousel}> = ({c}) => {
  const frame = useCurrentFrame();
  const tl = quizTimeline();
  const pairs = c.pairs.slice(0, ROUNDS);

  const inRounds = frame >= tl.rounds && frame < tl.comment;
  const round = inRounds ? Math.floor((frame - tl.rounds) / ROUND) : frame < tl.rounds ? 0 : ROUNDS - 1;
  const rf = inRounds ? (frame - tl.rounds) % ROUND : frame < tl.rounds ? -1 : ROUND - 1; // frame within the round
  const p = pairs[round];
  const revealed = rf >= ASK;
  const rv = revealed ? rf - ASK : -1;
  const done = frame >= tl.comment ? ROUNDS : round + (revealed ? 1 : 0);

  // No entrance (2026-11-06, as in the versus reels): frame 0 is the cover Facebook and X show (and Instagram's
  // default), so the hook, the dots and both rows are there from the start. The rows leave at the comment beat.
  const rowsIn = 1;
  const rowsOut = tween(frame, tl.comment, 14);
  const rowY = (1 - rowsIn) * 1300 + rowsOut * 1400;
  // A new word slides in at the start of each round.
  const swap = rf >= 0 ? tween(rf, 0, 10) : 1;
  const strike = revealed ? tween(rv, 0, 8) : 0;
  const ans = revealed ? pop(rv) : 0;
  const bump = revealed ? 1 + 0.04 * Math.sin(Math.min(1, rv / 10) * Math.PI) : 1;
  const ringOut = revealed ? tween(rv, 0, 6) : 0;

  const cf = frame - tl.comment;

  return <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EFE6, #EFE4D8)', overflow: 'hidden', fontFamily: HEAD, color: INK}}>
    {/* header: the hook stays on screen */}
    {frame < tl.outro && <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      <div style={{...cap, fontSize: 112, letterSpacing: -2}}>
        Only <span style={{color: ROSE}}>1%</span> get 5/5</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: BODY, fontWeight: 800, fontSize: 38, lineHeight: 1}}>
        <div>How do Argentines say it?</div>
      </div>
      <div><Dots done={done} current={round} f={revealed ? rv : 99} /></div>
    </div>}

    {/* the meme rows */}
    {frame < tl.outro && rowsOut < 1 && <div style={{position: 'absolute', inset: 0, transform: `translateY(${rowY}px)`}}>
      <Row top={670}>
        <div style={{...PILL, color: '#94371F', background: '#F9DDD5'}}>Tourist</div>
        <div style={{position: 'relative', opacity: swap, transform: `translateX(${(1 - swap) * 80}px)`}}>
          {/* a line-through strikes every line of a wrapped phrase; it fades in red at the reveal */}
          <div style={{...cap, ...WRAP, fontSize: wordSize(p.no), color: revealed ? FADED : INK, textDecoration: 'line-through', textDecorationThickness: Math.max(6, Math.round(wordSize(p.no) * 0.11)),
            textDecorationColor: `rgba(201,85,62,${strike})`}}>{p.no}</div>
        </div>
      </Row>
      <Row yes top={1116} style={{transform: `scale(${bump})`}}>
        {revealed ? <>
          <div style={{...PILL, display: 'flex', alignItems: 'center', gap: 12, color: '#2F5E43', background: '#D3EBDD', opacity: tween(rv, 2, 8)}}><div>Argentina</div></div>
          <div style={{...cap, ...WRAP, fontSize: wordSize(p.yes), color: INK, transform: `scale(${0.3 + 0.7 * ans})`}}>{p.yes}</div>
        </> : rf >= 0 ? <div style={{opacity: 1 - ringOut}}><Ring f={rf} /></div>
          : <div style={{...cap, fontSize: 200, color: ROSE}}>?</div>}
      </Row>
      {/* the English meaning under the meme */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1550, display: 'flex', justifyContent: 'center', opacity: revealed ? tween(rv, 6, 8) : 0, transform: `translateY(${revealed ? (1 - tween(rv, 6, 10)) * 20 : 20}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', height: 76, padding: '0 38px', borderRadius: 999, background: CARD, fontFamily: BODY, fontWeight: 700, fontSize: 38, lineHeight: 1, color: INK, whiteSpace: 'nowrap',
          boxShadow: CHIP}}>{p.en}</div>
      </div>
    </div>}

    {/* comment beat */}
    {frame >= tl.comment && frame < tl.outro && <div style={{position: 'absolute', left: 72, right: 72, top: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50, textAlign: 'center'}}>
      <div style={{...cap, whiteSpace: 'normal', fontSize: 130, letterSpacing: -2, transform: `scale(${0.5 + 0.5 * pop(cf - 6)})`, opacity: tween(cf, 6, 6)}}>How many did you get?</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 104, padding: '0 46px', borderRadius: 999, background: ROSE, color: '#fff', fontFamily: BODY, fontWeight: 800, fontSize: 46, lineHeight: 1, whiteSpace: 'nowrap',
        opacity: tween(cf, 16, 10), transform: `translateY(${(1 - tween(cf, 16, 14)) * 40}px)`,
        boxShadow: CHIP}}>
        <div>Comment your score</div>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      </div>
    </div>}

    {/* the new "Link in bio" close shared with the versus reels */}
    <Sequence from={tl.outro}><LinkEnd title="Want to sound like a *real Argentinian?*" /></Sequence>

    {/* sound */}
    <Audio src={staticFile('music/cumbia-loop-01.wav')} loop volume={f => interpolate(f, [0, 10, tl.total - 25, tl.total], [0, 0.21, 0.21, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    <Sequence from={0} durationInFrames={12}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
    {pairs.map((_, i) => {
      const at = tl.rounds + i * ROUND;
      return <React.Fragment key={i}>
        {[0, 1, 2].map(s => <Sequence key={s} from={at + s * FPS} durationInFrames={4}><Audio src={staticFile('sfx/tick.wav')} volume={0.7} /></Sequence>)}
        <Sequence from={at + ASK} durationInFrames={22}><Audio src={staticFile('sfx/ding.wav')} volume={0.6} /></Sequence>
      </React.Fragment>;
    })}
    <Sequence from={tl.comment} durationInFrames={12}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
  </AbsoluteFill>;
};
