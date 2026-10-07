// "X vs Y": two Panchos side by side. The left one says his word, the right one
// answers with the Argentine one, pair after pair. Everything is timed from the
// recorded clips (versus-vo.mjs), so a new script needs no keyframing.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {EndCard, END_FRAMES} from './EndCard';
import {Puppet, blink, Rig} from './Puppet';

export const FPS = 30;
// `mouth` is one letter per frame saying which mouth to draw (see vo-lib.mjs); older recordings do not have it.
type Clip = {src: string; text: string; seconds: number; env: number[]; mouth?: string};
export type Clips = Record<string, Clip>;
// `sprite` is a set of three drawings in public/pancho that differ only in the mouth:
// <sprite>-closed.png, -half.png, -open.png (cut by cut-capys.py). `height` is how tall it is drawn.
type Side = {word: string; flags: string; sprite: string; height: number; voice: string; rig: Rig};
// `steady` keeps both the same size all the way through; without it the one talking steps up and the other steps back.
// `live` drops "Coming soon to" from the ending, for when the app is on the stores.
export type Versus = {id: string; left: Side; right: Side; sound?: boolean; steady?: boolean; live?: boolean;
  pairs: {left: string; right: string; english: string; sayLeft: string; sayRight: string}[]};

// The app's Arcilla theme (src/lib/theme.ts); coral and blue tell the two sides apart.
export const C = {sageTop: '#BDE1CB', sageBottom: '#8FC4A5', card: '#FFF9F3', ink: '#3A2A20', rosa: '#B44A60',
  coral: '#C9553E', coralFill: '#FFE3DA', blue: '#2F7FC0', blueFill: '#E2F2FF'};
export const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';

if (typeof document !== 'undefined') {
  const wait = delayRender('fonts');
  Promise.all([['Gabarito_900Black.ttf', 900], ['Gabarito_800ExtraBold.ttf', 800]].map(([file, weight]) => {
    const f = new FontFace('Gabarito', `url(${staticFile('fonts/' + file)})`, {weight: String(weight)});
    return f.load().then(l => document.fonts.add(l));
  })).then(() => continueRender(wait), () => continueRender(wait));
}

const f = (s: number) => Math.round(s * FPS);
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** 0→1 over `dur` frames starting at `from`. */
export const tween = (frame: number, from: number, dur: number, easing = OUT) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const pop = (frame: number) => spring({frame, fps: FPS, config: {damping: 12, stiffness: 190, mass: 0.7}});

/** Where everything starts, from the clip lengths alone. */
export function timeline(reel: Versus, clips: Clips) {
  let t = 26;
  const pairs = reel.pairs.map((p, i) => {
    const start = t, lVo = start + 5;
    const rVo = lVo + f(clips[`l${i}`].seconds) + 8;
    t = rVo + f(clips[`r${i}`].seconds) + 22;
    return {...p, i, start, lVo, rVo, end: t};
  });
  return {pairs, outro: t, total: t + END_FRAMES};
}

/** Outlined, slanted display type, like the poster. */
export const Word: React.FC<{text: string; size: number; side: 'l' | 'r'; style?: React.CSSProperties}> = ({text, size, side, style}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: size, lineHeight: 1, letterSpacing: 1, whiteSpace: 'nowrap',
    color: side === 'l' ? C.coralFill : C.blueFill, WebkitTextStroke: `${Math.round(size * 0.085)}px ${side === 'l' ? C.coral : C.blue}`, paintOrder: 'stroke fill',
    filter: 'drop-shadow(0 7px 0 rgba(40,60,45,0.28))', ...style}}>{text}</div>
);

export const fit = (text: string, max: number, width: number) => Math.min(max, Math.floor(width / (text.length * 0.62)));

// Each drawing runs off its own side of the frame (it was cut there), so everything
// pivots on that outer bottom corner and the cut edge never comes into view.
const BLEED = 40;
const Capy: React.FC<{side: Side; at: 'l' | 'r'; amp: number; mouth: string; talking: number; listening: number; enter: number; steady?: boolean}> = ({side, at, amp, mouth, talking, listening, enter, steady}) => {
  const frame = useCurrentFrame();
  const dir = at === 'l' ? 1 : -1; // lean toward the other one
  const phase = at === 'l' ? 0 : 1.9;
  const breathe = Math.sin(frame / 15 + phase) * 0.006;
  // A slow sway from the feet up, never quite repeating; he leans in to speak and nods along with his own voice.
  const lean = 5 * Math.sin(frame / 38 + phase) + 2.5 * Math.sin(frame / 17 + phase * 2) + dir * (talking * 9 + amp * 6 + listening * 1.5 * Math.sin(frame / 8));
  // The raised hand waves hello at the start, then only stirs, and lifts a little when he talks.
  const hello = Math.sin(Math.max(0, frame - 8) / 2.6) * 10 * interpolate(frame, [8, 14, 44, 58], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wave = hello + 1.6 * Math.sin(frame / 19 + phase) - talking * 3 - amp * 3;
  // The one talking steps up, the one listening steps back (unless the reel is `steady`).
  const size = steady ? 1 : 1 + 0.12 * talking - 0.1 * listening;
  return <div style={{position: 'absolute', bottom: 96, [at === 'l' ? 'left' : 'right']: -BLEED, zIndex: talking > listening ? 1 : 0,
    transformOrigin: at === 'l' ? '0% 100%' : '100% 100%',
    transform: `translateY(${(1 - enter) * 70 - amp * 8}px) scale(${size}) scale(${1 - amp * 0.01 - breathe * 0.5}, ${1 + amp * 0.02 + breathe})`,
    opacity: Math.min(1, enter * 1.6), filter: `drop-shadow(0 14px 16px rgba(40,70,50,0.28))`}}>
    <Puppet id={`bend-${at}`} sprite={side.sprite} rig={side.rig} height={side.height} mouth={mouth} lean={lean} lid={blink(frame, at === 'l' ? 1 : 2.2)} wave={wave} />
  </div>;
};

export const VersusReel: React.FC<{reel: Versus; clips: Clips}> = ({reel, clips}) => {
  const frame = useCurrentFrame();
  const tl = timeline(reel, clips);
  const pair = tl.pairs.find(p => frame >= p.start && frame < p.end);
  const inOutro = frame >= tl.outro;

  // How loud each side is this frame, and whether it is his turn.
  const ampOf = (at: number, c: Clip) => { const i = frame - at; return i >= 0 && i < c.env.length ? ((c.env[i - 1] ?? 0) + c.env[i] * 2 + (c.env[i + 1] ?? 0)) / 4 : 0; };
  const turn = (at: number, c: Clip) => tween(frame, at - 3, 6) * (1 - tween(frame, at + c.env.length + 2, 8));
  // The mouth for this frame: the shape recorded for the letter being said, or, for a clip
  // recorded without letter times, a guess from the loudness (held two frames, as cartoons are).
  const mouthOf = (at: number, c: Clip) => { const i = frame - at; if (i < 0 || i >= c.env.length) return 'c';
    if (c.mouth) return c.mouth[i] ?? 'c';
    const j = i - (i % 2), v = Math.max(c.env[j], c.env[j + 1] ?? 0); return v > 0.5 ? 'a' : v > 0.14 ? 'h' : 'c'; };
  let ampL = 0, ampR = 0, talkL = 0, talkR = 0, mouthL = 'c', mouthR = 'c';
  if (pair) {
    const l = clips[`l${pair.i}`], r = clips[`r${pair.i}`];
    ampL = ampOf(pair.lVo, l); ampR = ampOf(pair.rVo, r); talkL = turn(pair.lVo, l); talkR = turn(pair.rVo, r);
    mouthL = mouthOf(pair.lVo, l); mouthR = mouthOf(pair.rVo, r);
  }

  const head = (delay: number) => { const s = pop(frame - delay); return {opacity: tween(frame, delay, 6), transform: `translateY(${(1 - s) * -30}px) scale(${0.92 + 0.08 * s})`}; };

  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.sageTop}, ${C.sageBottom})`, overflow: 'hidden', fontFamily: DISPLAY}}>
    <div style={{position: 'absolute', width: 760, height: 760, borderRadius: 380, left: -250, top: 640 + Math.sin(frame / 50) * 12, background: 'rgba(255,255,255,0.28)'}} />
    <div style={{position: 'absolute', width: 700, height: 700, borderRadius: 350, right: -230, top: 720 + Math.cos(frame / 60) * 12, background: 'rgba(255,255,255,0.2)'}} />
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 70, height: 70, borderRadius: '50%', background: 'rgba(40,70,50,0.22)', filter: 'blur(12px)'}} />

    {/* X vs Y */}
    <div style={{position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 66}}>
      {(['l', 'r'] as const).map(at => {
        const side = at === 'l' ? reel.left : reel.right, talking = at === 'l' ? talkL : talkR;
        // Long title words (ESPAÑA vs ARGENTINA) shrink together, in equal columns so the VS tile stays centred.
        const size = Math.min(fit(reel.left.word, 158, 370), fit(reel.right.word, 158, 370));
        return <div key={at} style={{order: at === 'l' ? 0 : 2, width: size < 158 ? 410 : undefined, marginInline: size < 158 ? -13 : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, ...head(at === 'l' ? 2 : 10)}}>
          <Word text={side.word} size={size} side={at} style={{transform: `skewX(-8deg) scale(${1 + talking * 0.07})`}} />
          <div style={{fontSize: 82, lineHeight: 1, filter: 'drop-shadow(0 5px 5px rgba(40,60,45,0.3))'}}>{side.flags}</div>
        </div>;
      })}
      <div style={{order: 1, marginTop: 12, background: C.card, color: C.ink, fontWeight: 900, fontStyle: 'italic', fontSize: 88, lineHeight: 1, padding: '22px 30px 26px', borderRadius: 34,
        boxShadow: 'inset 3px 4px 0 rgba(255,255,255,0.7), 0 18px 30px -14px rgba(40,70,50,0.55)', ...head(6)}}>VS</div>
    </div>

    <Capy side={reel.left} at="l" amp={ampL} mouth={mouthL} talking={talkL} listening={talkR} enter={tween(frame, 0, 16)} steady={reel.steady} />
    <Capy side={reel.right} at="r" amp={ampR} mouth={mouthR} talking={talkR} listening={talkL} enter={tween(frame, 5, 16)} steady={reel.steady} />

    {/* this pair: the meaning above their heads, each word on its speaker */}
    {pair ? (() => {
      const out = 1 - tween(frame, pair.end - 6, 6, Easing.in(Easing.quad));
      const en = tween(frame, pair.start, 9);
      const word = (at: 'l' | 'r', text: string, from: number) => {
        const s = pop(frame - from);
        return <div style={{position: 'absolute', top: 1330, left: at === 'l' ? '25.5%' : '74.5%', opacity: tween(frame, from, 5) * out,
          transform: `translateX(-50%) skewX(-8deg) scale(${0.86 + 0.14 * s}) rotate(${(1 - s) * (at === 'l' ? -5 : 5)}deg)`, zIndex: 2}}>
          <Word text={text} size={fit(text, 122, 500)} side={at} />
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

    {inOutro ? <EndCard frame={frame - tl.outro} soon={!reel.live} /> : null}

    {reel.sound === false ? null : tl.pairs.flatMap(p => [[p.lVo, clips[`l${p.i}`]], [p.rVo, clips[`r${p.i}`]]] as [number, Clip][])
      .map(([at, c]) => <Sequence key={c.src} from={at} durationInFrames={c.env.length + 4}><Audio src={staticFile(c.src)} /></Sequence>)}
  </AbsoluteFill>;
};
