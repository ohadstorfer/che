// The same "X vs Y" reel, with an AI-generated clip of the two characters in place of the code puppets.
// The clip (public/veo/<dir>/f0001.jpg ...) shows them taking turns talking; `cues` says at which second of the
// clip each one starts a turn, and the recorded lines are laid on those moments. The clip is played once per
// `cues.length` pairs and then again from the start, with a short cross-fade, until the pairs run out.
// Lip-sync is whatever the clip drew: the mouths move while the voice plays, they do not follow the letters.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EndCard, END_FRAMES} from './EndCard';
import {C, DISPLAY, FPS, Word, fit, pop, tween, Versus, Clips} from './VersusReel';

export type Veo = {dir: string; fps: number; loopSeconds: number; cues: {l: number; r: number}[]};
const FADE = 6;

export function veoTimeline(reel: Versus & {veo: Veo}) {
  const {veo} = reel, loop = Math.round(veo.loopSeconds * FPS);
  const pairs = reel.pairs.map((p, i) => {
    const base = Math.floor(i / veo.cues.length) * loop, cue = veo.cues[i % veo.cues.length], next = veo.cues[(i % veo.cues.length) + 1];
    return {...p, i, start: base + Math.max(0, Math.round(cue.l * FPS) - 4), lVo: base + Math.round(cue.l * FPS), rVo: base + Math.round(cue.r * FPS),
      end: base + (next ? Math.round(next.l * FPS) - 6 : loop)};
  });
  const outro = Math.ceil(reel.pairs.length / veo.cues.length) * loop;
  return {pairs, loop, outro, total: outro + END_FRAMES};
}

export const VeoReel: React.FC<{reel: Versus & {veo: Veo}; clips: Clips}> = ({reel, clips}) => {
  const frame = useCurrentFrame();
  const tl = veoTimeline(reel), {veo} = reel;
  const pair = tl.pairs.find(p => frame >= p.start && frame < p.end);
  const still = (f: number) => staticFile(`veo/${veo.dir}/f${String(Math.max(1, Math.floor(f / FPS * veo.fps) + 1)).padStart(4, '0')}.jpg`);
  const at = Math.min(frame, tl.outro - 1) % tl.loop, lap = Math.floor(Math.min(frame, tl.outro - 1) / tl.loop);
  const cover: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};
  const talk = (from: number, len: number) => tween(frame, from - 3, 6) * (1 - tween(frame, from + len + 2, 8));
  const head = (delay: number) => { const s = pop(frame - delay); return {opacity: tween(frame, delay, 6), transform: `translateY(${(1 - s) * -30}px) scale(${0.92 + 0.08 * s})`}; };

  return <AbsoluteFill style={{background: C.sageBottom, overflow: 'hidden', fontFamily: DISPLAY}}>
    <Img src={still(at)} style={cover} />
    {/* the first frames of each later lap fade in over the last frame of the lap before */}
    {lap > 0 && at < FADE ? <Img src={still(tl.loop - 1)} style={{...cover, opacity: 1 - at / FADE}} /> : null}

    <div style={{position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 66}}>
      {(['l', 'r'] as const).map(side => {
        const s = side === 'l' ? reel.left : reel.right;
        const talking = pair ? talk(side === 'l' ? pair.lVo : pair.rVo, clips[`${side}${pair.i}`].env.length) : 0;
        return <div key={side} style={{order: side === 'l' ? 0 : 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, ...head(side === 'l' ? 2 : 10)}}>
          <Word text={s.word} size={158} side={side} style={{transform: `skewX(-8deg) scale(${1 + talking * 0.07})`}} />
          <div style={{fontSize: 82, lineHeight: 1, filter: 'drop-shadow(0 5px 5px rgba(40,60,45,0.3))'}}>{s.flags}</div>
        </div>;
      })}
      <div style={{order: 1, marginTop: 12, background: C.card, color: C.ink, fontWeight: 900, fontStyle: 'italic', fontSize: 88, lineHeight: 1, padding: '22px 30px 26px', borderRadius: 34,
        boxShadow: 'inset 3px 4px 0 rgba(255,255,255,0.7), 0 18px 30px -14px rgba(40,70,50,0.55)', ...head(6)}}>VS</div>
    </div>

    {pair ? (() => {
      const out = 1 - tween(frame, pair.end - 6, 6, Easing.in(Easing.quad));
      const en = tween(frame, pair.start, 9);
      const word = (side: 'l' | 'r', text: string, from: number) => {
        const s = pop(frame - from);
        return <div style={{position: 'absolute', top: 1330, left: side === 'l' ? '25.5%' : '74.5%', opacity: tween(frame, from, 5) * out,
          transform: `translateX(-50%) skewX(-8deg) scale(${0.86 + 0.14 * s}) rotate(${(1 - s) * (side === 'l' ? -5 : 5)}deg)`, zIndex: 2}}>
          <Word text={text} size={fit(text, 122, 500)} side={side} />
        </div>;
      };
      return <>
        <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: en * out, transform: `translateY(${(1 - en) * 16}px)`, zIndex: 2}}>
          <div style={{fontWeight: 800, fontStyle: 'italic', fontSize: 78, lineHeight: 1, color: '#fff', WebkitTextStroke: `11px ${C.ink}`, paintOrder: 'stroke fill', transform: 'skewX(-8deg)'}}>({pair.english})</div>
        </div>
        {word('l', pair.left, pair.lVo)}
        {word('r', pair.right, pair.rVo)}
      </>;
    })() : null}

    {frame >= tl.outro ? <EndCard frame={frame - tl.outro} soon={!reel.live} /> : null}

    {tl.pairs.flatMap(p => [[p.lVo, clips[`l${p.i}`]], [p.rVo, clips[`r${p.i}`]]] as const)
      .map(([from, c]) => <Sequence key={c.src} from={from} durationInFrames={c.env.length + 4}><Audio src={staticFile(c.src)} /></Sequence>)}
  </AbsoluteFill>;
};
