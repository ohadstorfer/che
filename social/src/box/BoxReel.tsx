// "How X swears vs how Argentina swears" in a boxing ring (designed in the "Reels de Puteadas" artifact, 2026-11-06).
// Two whole, gloved Panchos face each other and bob on the spot like boxers. Each round: the bell, the left one
// shouts his insult and throws a weak punch ("pff"), the right one answers with the Argentinian one and lands it
// ("POW!"), and the left one's health bar drops. After the last round, K.O., then our own close (LinkEnd).
// Everything sits in the middle band of the frame (about y 330 to 1500) so no platform's top bar or captions cover it.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, tween, pop} from '../versus/VersusReel';
import {LinkEnd} from '../versus/LinkEnd';

const FPS = 30;
type Clip = {src: string; text: string; seconds: number; env: number[]; mouth: string};
export type Clips = Record<string, Clip>;
type Side = {name: string; flag: string; sprite: string; voice?: string};
export type Box = {id: string; left: Side; right: Side; hook: string[]; rounds: {say: string; ar: string; db: string}[]};

const SHAPE: Record<string, string> = {c: 'closed', h: 'half', a: 'a', e: 'e', i: 'i', o: 'o', u: 'u'};
const HOOK = 75, BELL = 40, KO = 90, END = 255;
// Swear words keep their first letter and lose the second on screen (the audio is not bleeped).
const BAD = /(?<![\p{L}])(pelotud\w*|putas?|reputísima|concha|conchetumare|cag\w*|mierda|gilipollas|soplapollas|joder|culo|culero|culiao|orto|sorete|pajero|follen|verga|ching\w*|pendejo|cabrón|madre)(?![\p{L}])/giu;
const censor = (s: string) => s.replace(BAD, m => /madre/i.test(m) ? m : m[0] + '*' + m.slice(2));

export function boxTimeline(reel: Box, clips: Clips) {
  let t = HOOK;
  const rounds = reel.rounds.map((r, i) => {
    const start = t, lVo = start + BELL, l = clips['l' + i].env.length, rv = clips['r' + i].env.length;
    const rVo = lVo + l + 10;
    t = rVo + rv + 16;
    return {...r, i, start, lVo, rVo, lHit: lVo + 9, rHit: rVo + 7, end: t};
  });
  return {rounds, ko: t, outro: t + KO, total: t + KO + END};
}

// Where they stand: sprite 420 x 711 drawn 390 wide.
const W = 390, H = Math.round(711 * W / 420), TOP = 830;
const PUNCH_EXTRA = 260; // the punching sprites are this much wider (box-sprites.py --punch)

const Boxer: React.FC<{side: Side; at: 'l' | 'r'; mouth: string; punch: number; hit: number; fall: number}> = ({side, at, mouth, punch, hit, fall}) => {
  const frame = useCurrentFrame();
  const dir = at === 'l' ? 1 : -1, ph = at === 'l' ? 0 : Math.PI;
  // a boxer's bounce: up and down on the beat, weight shifting side to side
  const still = 1 - fall;
  const bobY = (-Math.abs(Math.sin(frame / 5.5 + ph)) * 16 + 6) * still;
  const bobX = Math.sin(frame / 11 + ph) * 10 * still;
  const rock = Math.sin(frame / 11 + ph) * 1.6 * still;
  // the punch: wind up back, then a step at the other one and back; while the step lands he is drawn with the arm
  // stretched out straight (the -p- sprites, wider on the punching side, head in the same place)
  const lunge = interpolate(punch, [0, 0.25, 0.5, 1], [0, -40, 90, 0]) * dir;
  const tilt = interpolate(punch, [0, 0.25, 0.5, 1], [0, -4, 5, 0]) * dir;
  const arm = punch > 0.3 && punch < 0.8;
  // the hit: knocked back and shaken
  const shake = hit > 0 && hit < 1 ? Math.sin(hit * 40) * 26 * (1 - hit) - 30 * dir * (1 - hit) : 0;
  return <div style={{position: 'absolute', left: at === 'l' ? 90 : 600, top: TOP, width: W, height: H,
    transformOrigin: '50% 100%', zIndex: punch > 0 && punch < 1 ? 3 : 2,
    // knocked out: he staggers in and slumps back on the canvas, still in the frame (lying flat he would not fit)
    transform: `translate(${bobX + lunge + shake + fall * 170 * dir}px, ${bobY + fall * 150}px) rotate(${rock + tilt - fall * 38 * dir}deg)`}}>
    <Img src={staticFile(`pancho/${side.sprite}${arm ? '-p' : ''}-${SHAPE[mouth] ?? 'closed'}.png`)}
      style={{position: 'absolute', top: 0, left: arm && at === 'r' ? -PUNCH_EXTRA * W / 420 : 0, width: arm ? W * (420 + PUNCH_EXTRA) / 420 : W, height: H, filter: 'drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 18px 18px rgba(0,0,0,0.45))'}} />
  </div>;
};

const stroke = (px: number): React.CSSProperties => ({color: '#fff', WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'} as React.CSSProperties);

const Bars: React.FC<{hp: [number, number]; left: Side; right: Side}> = ({hp, left, right}) => <>
  {(['l', 'r'] as const).map(at => <div key={at} style={{position: 'absolute', top: 340, [at === 'l' ? 'left' : 'right']: 40, width: 470, textAlign: at === 'l' ? 'left' : 'right'}}>
    <div style={{font: `900 40px ${DISPLAY}`, letterSpacing: 2, marginBottom: 8, ...stroke(10)}}>{at === 'l' ? `${left.flag} ${left.name}` : `${right.name} ${right.flag}`}</div>
    <div style={{height: 58, border: '7px solid #fff', background: '#3a0b0b', borderRadius: 14, overflow: 'hidden', display: 'flex', justifyContent: at === 'l' ? 'flex-start' : 'flex-end', boxShadow: '0 6px 0 #000'}}>
      <div style={{height: '100%', width: `${hp[at === 'l' ? 0 : 1]}%`, background: `linear-gradient(${at === 'l' ? 90 : 270}deg, #ff3b3b, #ffd34d)`}} />
    </div>
  </div>)}
</>;

const Star: React.FC<{x: number; y: number; word: string; t: number; big: boolean}> = ({x, y, word, t, big}) => {
  if (t <= 0 || t > 1.4) return null;
  const s = spring({frame: t * FPS, fps: FPS, config: {damping: 9, stiffness: 220}}), size = big ? 380 : 270;
  const clip = 'polygon(50% 0,61% 30%,95% 16%,74% 44%,100% 60%,68% 66%,78% 100%,50% 76%,22% 100%,32% 66%,0 60%,26% 44%,5% 16%,39% 30%)';
  return <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: 6, opacity: interpolate(t, [1.1, 1.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    transform: `scale(${0.2 + 0.8 * s}) rotate(${(1 - s) * -20}deg)`}}>
    <div style={{position: 'absolute', inset: 0, background: '#ffd34d', clipPath: clip}} />
    <div style={{position: 'absolute', inset: size * 0.07, background: '#ff3b3b', clipPath: clip}} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `900 ${big ? 92 : 70}px ${DISPLAY}`, transform: 'rotate(-10deg)', ...stroke(12)}}>{word}</div>
  </div>;
};

export const BoxReel: React.FC<{reel: Box; clips: Clips}> = ({reel, clips}) => {
  const frame = useCurrentFrame();
  const tl = boxTimeline(reel, clips);
  const n = tl.rounds.length;
  const round = tl.rounds.find(r => frame >= r.start && frame < r.end);
  const mouthAt = (at: number, c: Clip) => { const i = frame - at; return i >= 0 && i < c.mouth.length ? c.mouth[i] : 'c'; };
  const along = (at: number, dur: number) => (frame - at) / dur; // 0..1 while it runs

  // Health: each weak left punch takes 15 off Argentina; each Argentinian one takes an equal share of Spain's, to 0 at the last.
  let hpL = 100, hpR = 100;
  for (const r of tl.rounds) {
    hpR -= 15 * tween(frame, r.lHit, 8);
    hpL -= (100 / n) * tween(frame, r.rHit, 10);
  }

  let mouthL = 'c', mouthR = 'c', punchL = 0, punchR = 0, hitL = 0, hitR = 0;
  if (round) {
    const l = clips['l' + round.i], r = clips['r' + round.i];
    mouthL = mouthAt(round.lVo, l); mouthR = mouthAt(round.rVo, r);
    const p = (hit: number) => { const t = along(hit - 7, 16); return t > 0 && t < 1 ? t : 0; };
    punchL = p(round.lHit); punchR = p(round.rHit);
    const h = (hit: number) => { const t = along(hit, 14); return t > 0 && t < 1 ? t : 0; };
    hitR = h(round.lHit); hitL = h(round.rHit);
  }
  const fall = tween(frame, tl.ko + 2, 16);
  const inKo = frame >= tl.ko && frame < tl.outro;

  return <AbsoluteFill style={{background: '#0b1630', overflow: 'hidden', fontFamily: DISPLAY}}>
    <Img src={staticFile('versus/bg-ring.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.3))'}} />

    <Bars hp={[Math.max(0, hpL), hpR]} left={reel.left} right={reel.right} />

    {/* the hook is on screen from frame 0: it is the cover the feeds show */}
    {frame < HOOK ? <div style={{position: 'absolute', left: 70, right: 70, top: 470, textAlign: 'center', opacity: 1 - tween(frame, HOOK - 8, 8), zIndex: 5}}>
      {reel.hook.map((line, i) => <div key={i} style={{marginBottom: 18}}>
        <span style={{background: '#fff', color: '#111', font: `900 76px/1.55 ${DISPLAY}`, padding: '6px 22px', borderRadius: 18, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'} as React.CSSProperties}>{line}</span>
      </div>)}
    </div> : null}

    <Boxer side={reel.left} at="l" mouth={mouthL} punch={punchL} hit={hitL} fall={fall} />
    <Boxer side={reel.right} at="r" mouth={mouthR} punch={punchR} hit={hitR} fall={0} />

    {round ? (() => {
      const b = frame - round.start;
      const out = 1 - tween(frame, round.end - 6, 6);
      const bubble = (at: 'l' | 'r', text: string, from: number, color: string) => {
        const s = pop(frame - from);
        return frame < from ? null : <div style={{position: 'absolute', top: 560, [at === 'l' ? 'left' : 'right']: 30, width: 500, textAlign: 'center', zIndex: 5, opacity: out,
          font: `900 ${text.length > 26 ? 60 : text.length > 16 ? 70 : 82}px/1.05 ${DISPLAY}`, color, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 #000',
          transform: `scale(${0.6 + 0.4 * s})`} as React.CSSProperties}>{censor(text)}</div>;
      };
      return <>
        {b < 14 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.9 * (1 - b / 14), zIndex: 8}} /> : null}
        {b < BELL ? <>
          <div style={{position: 'absolute', right: 70, top: 500, font: `900 92px ${DISPLAY}`, color: '#ffd34d', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', zIndex: 9,
            opacity: interpolate(b, [0, 4, 30, 38], [0, 1, 1, 0], {extrapolateRight: 'clamp'}), transform: `rotate(${8 + b * 0.15}deg) scale(${0.4 + 0.6 * pop(b)})`} as React.CSSProperties}>DING!</div>
          <div style={{position: 'absolute', left: 290, top: 640, width: 500, padding: '40px 20px', background: '#fff', color: '#111', textAlign: 'center', font: `900 110px/0.9 ${DISPLAY}`,
            border: '10px solid #111', borderRadius: 24, boxShadow: '16px 18px 0 #e2457a', zIndex: 9,
            opacity: interpolate(b, [0, 5, 30, 38], [0, 1, 1, 0], {extrapolateRight: 'clamp'}), transform: `rotate(-4deg) scale(${0.3 + 0.7 * pop(b)}) translateY(${-tween(b, 30, 8) * 80}px)`}}>
            <div style={{font: `800 36px ${DISPLAY}`, letterSpacing: 7, color: '#e2457a', marginBottom: 10}}>{round.i === n - 1 ? 'FINAL ROUND' : 'ROUND'}</div>{round.i + 1}
          </div>
        </> : null}
        {bubble('l', round.say, round.lVo, '#fff')}
        {bubble('r', round.ar, round.rVo, '#ffd34d')}
        <Star x={795} y={1000} word="pff" t={(frame - round.lHit) / FPS} big={false} />
        <Star x={285} y={990} word="POW!" t={(frame - round.rHit) / FPS} big />
      </>;
    })() : null}

    {inKo ? (() => {
      const k = frame - tl.ko, s = pop(k - 4);
      return <>
        <div style={{position: 'absolute', left: 40, right: 40, top: 480, textAlign: 'center', font: `900 210px/0.95 ${DISPLAY}`, color: '#ffd34d', WebkitTextStroke: '18px #000', paintOrder: 'stroke fill', zIndex: 7,
          transform: `scale(${0.5 + 0.5 * s}) rotate(${(1 - s) * -8}deg)`, opacity: Math.min(1, k / 3)} as React.CSSProperties}>K.O.!</div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 700, textAlign: 'center', zIndex: 7, opacity: tween(frame, tl.ko + 18, 10), transform: `translateY(${(1 - tween(frame, tl.ko + 18, 10)) * 40}px)`}}>
          {['Which one hits harder?', `Comment ${reel.left.flag} or ${reel.right.flag}`].map(line => <div key={line} style={{marginBottom: 14}}>
            <span style={{background: '#fff', color: '#111', font: `900 58px/1.5 ${DISPLAY}`, padding: '6px 22px', borderRadius: 16}}>{line}</span></div>)}
        </div>
      </>;
    })() : null}

    <Sequence from={tl.outro}><LinkEnd title="Want to sound like a *real Argentinian?*" /></Sequence>

    {tl.rounds.flatMap(r => [
      <Sequence key={`b${r.i}`} from={r.start} durationInFrames={70}><Audio src={staticFile('sfx/bell.wav')} volume={0.55} /></Sequence>,
      <Sequence key={`l${r.i}`} from={r.lVo} durationInFrames={clips['l' + r.i].env.length + 4}><Audio src={staticFile(clips['l' + r.i].src)} /></Sequence>,
      <Sequence key={`pl${r.i}`} from={r.lHit} durationInFrames={12}><Audio src={staticFile('sfx/punch.wav')} volume={0.35} /></Sequence>,
      <Sequence key={`r${r.i}`} from={r.rVo} durationInFrames={clips['r' + r.i].env.length + 4}><Audio src={staticFile(clips['r' + r.i].src)} /></Sequence>,
      <Sequence key={`pr${r.i}`} from={r.rHit} durationInFrames={12}><Audio src={staticFile('sfx/punch.wav')} volume={0.9} /></Sequence>,
    ])}
    <Sequence from={tl.ko} durationInFrames={70}><Audio src={staticFile('sfx/bell.wav')} volume={0.6} /></Sequence>
  </AbsoluteFill>;
};
