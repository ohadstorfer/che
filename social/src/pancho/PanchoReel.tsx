// "Textbook vs Pancho": the carpincho hears the textbook line, then says how
// it is said in Argentina. One pair on screen at a time. Everything is timed
// from the recorded clips (pancho-vo.mjs), so a new script needs no keyframing.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
type Clip = {src: string; text: string; seconds: number; env: number[]};
export type Clips = Record<string, Clip>;
export type Reel = {id: string; title: string; hook: string; outro: string;
  pairs: {textbook: string; argentine: string; english: string; pose: string}[]};

// The app's Arcilla theme (src/lib/theme.ts).
const C = {oat: '#F7EFE6', canvas: '#EFE4D8', card: '#FFF9F3', ink: '#3A2A20', muted: '#7A6556', rosa: '#B44A60',
  coral: '#C9553E', coralSoft: '#F6DDD5', sky: '#BDE0F8', butter: '#FFE9A6', peach: '#FFC4A3', sage: '#BDE1CB'};
const CLAY = 'inset 3px 4px 0 rgba(255,255,255,0.7), inset -4px -7px 14px rgba(120,70,40,0.10), 0 26px 48px -20px rgba(120,70,40,0.45)';
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
const BODY = 'Figtree, "Helvetica Neue", sans-serif';

const fonts: [string, string, number][] = [['Gabarito', 'Gabarito_800ExtraBold.ttf', 800], ['Gabarito', 'Gabarito_700Bold.ttf', 700],
  ['Figtree', 'Figtree_600SemiBold.ttf', 600], ['Figtree', 'Figtree_700Bold.ttf', 700]];
if (typeof document !== 'undefined') {
  const wait = delayRender('fonts');
  Promise.all(fonts.map(([family, file, weight]) => {
    const f = new FontFace(family, `url(${staticFile('fonts/' + file)})`, {weight: String(weight)});
    return f.load().then(l => document.fonts.add(l));
  })).then(() => continueRender(wait), () => continueRender(wait));
}

const f = (s: number) => Math.round(s * FPS);
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const INOUT = Easing.bezier(0.77, 0, 0.175, 1);
/** 0→1 over `dur` frames starting at `from`. */
const tween = (frame: number, from: number, dur: number, easing = OUT) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Where everything starts, from the clip lengths alone. */
export function timeline(reel: Reel, clips: Clips) {
  const hookVo = 10;
  let t = hookVo + f(clips.hook.seconds) + 10;
  const pairs = reel.pairs.map((p, i) => {
    const start = t, tVo = start + 6;
    const sw = tVo + f(clips[`t${i}`].seconds) + 7; // the switch to Argentina
    const aVo = sw + 6;
    t = aVo + f(clips[`a${i}`].seconds) + 26;
    return {...p, i, start, tVo, sw, aVo, end: t};
  });
  const outro = t, outroVo = outro + 12;
  return {hookVo, hookEnd: pairs[0].start, pairs, outro, outroVo, total: outroVo + f(clips.outro.seconds) + 40};
}

const BAR = [0.55, 1, 0.7, 0.9];
const Bars: React.FC<{amp: number; color: string}> = ({amp, color}) => (
  <div style={{display: 'flex', gap: 5, alignItems: 'center', height: 34}}>
    {BAR.map((k, i) => <div key={i} style={{width: 7, height: 34, borderRadius: 4, background: color, transform: `scaleY(${0.22 + 0.78 * Math.min(1, amp * k * 1.3)})`}} />)}
  </div>
);

const Chip: React.FC<{label: string; bg: string; color: string; show: number; amp: number}> = ({label, bg, color, show, amp}) => (
  <div style={{position: 'absolute', top: -44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: show, transform: `scale(${0.94 + 0.06 * show})`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, background: bg, color, fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, letterSpacing: 2.5,
      padding: '16px 34px', borderRadius: 999, boxShadow: 'inset 2px 3px 0 rgba(255,255,255,0.55), 0 10px 18px -10px rgba(120,70,40,0.5)'}}>
      {label}<Bars amp={amp} color={color} />
    </div>
  </div>
);

const fit = (text: string, max: number, width: number) => Math.min(max, Math.floor(width / (text.length * 0.54)));

const Pancho: React.FC<{pose: string; since: number; amp: number; shake: number}> = ({pose, since, amp, shake}) => {
  const frame = useCurrentFrame();
  const close = pose === 'gesto-mano'; // an upper-body drawing: bring him nearer, hide the cut behind the card
  const pop = spring({frame: since, fps: FPS, config: {damping: 13, stiffness: 190, mass: 0.7}});
  const breathe = Math.sin(frame / 11) * 0.007;
  const rot = Math.sin(frame / 13) * 0.7 + Math.sin(since / 1.6) * 2.4 * shake + amp * 1.1;
  const h = close ? 860 : 770;
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 1920 - (close ? 1290 : 1158), display: 'flex', justifyContent: 'center'}}>
    <Img src={staticFile(`pancho/${pose}.png`)} style={{height: h, transformOrigin: '50% 100%',
      transform: `translateY(${(1 - pop) * 46 - amp * 13}px) scale(${0.9 + 0.1 * pop}) scale(${1 - amp * 0.014}, ${1 + amp * 0.034 + breathe}) rotate(${rot}deg)`,
      filter: 'drop-shadow(0 18px 18px rgba(120,70,40,0.22))'}} />
  </div>;
};

export const PanchoReel: React.FC<{reel: Reel; clips: Clips}> = ({reel, clips}) => {
  const frame = useCurrentFrame();
  const tl = timeline(reel, clips);

  // Who is speaking, and how loud, this frame.
  const spoken: [number, Clip][] = [[tl.hookVo, clips.hook], [tl.outroVo, clips.outro],
    ...tl.pairs.flatMap(p => [[p.tVo, clips[`t${p.i}`]], [p.aVo, clips[`a${p.i}`]]] as [number, Clip][])];
  let amp = 0;
  for (const [at, c] of spoken) {
    const i = frame - at;
    if (i >= 0 && i < c.env.length) amp = ((c.env[i - 1] ?? 0) + c.env[i] * 2 + (c.env[i + 1] ?? 0)) / 4;
  }

  const pair = tl.pairs.find(p => frame >= p.start && frame < p.end);
  const inOutro = frame >= tl.outro;
  const poses: [number, string][] = [[0, 'saludando'], ...tl.pairs.flatMap(p => [[p.start, 'gesto-mano'], [p.sw, p.pose]] as [number, string][]), [tl.outro, 'saludando']];
  const [since, pose] = poses.filter(([at]) => at <= frame).pop()!;
  const listening = pair && frame < pair.sw ? 1 - tween(frame, pair.start + 4, 26, Easing.linear) : 0;

  const intro = tween(frame, 0, 14);
  const leave = tween(frame, tl.outro, 12, INOUT); // title and card make way for the sign-off
  const done = tl.pairs.filter(p => frame >= p.sw).length;

  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.oat}, ${C.canvas})`, overflow: 'hidden'}}>
    {/* soft pastel shapes, barely moving */}
    <div style={{position: 'absolute', width: 900, height: 900, borderRadius: 450, left: -330, top: 250 + Math.sin(frame / 50) * 14, background: C.butter, opacity: 0.55}} />
    <div style={{position: 'absolute', width: 760, height: 760, borderRadius: 380, right: -300, top: 760 + Math.cos(frame / 60) * 16, background: C.sky, opacity: 0.6}} />
    <div style={{position: 'absolute', width: 520, height: 520, borderRadius: 260, right: -120, top: 120 + Math.sin(frame / 70) * 10, background: C.peach, opacity: 0.4}} />
    <div style={{position: 'absolute', left: 190, top: 420, width: 700, height: 700, borderRadius: 350, background: 'rgba(255,255,255,0.5)',
      transform: `scale(${1 + leave * 0.12 + amp * 0.012})`}} />

    {/* title */}
    <div style={{position: 'absolute', top: 178, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
      opacity: intro * (1 - leave), transform: `translateY(${(1 - intro) * -24 - leave * 20}px)`}}>
      <div style={{background: C.card, color: C.ink, fontFamily: DISPLAY, fontWeight: 800, fontSize: 62, letterSpacing: 1.5, padding: '22px 46px', borderRadius: 40, boxShadow: CLAY}}>
        {reel.title} 🇦🇷</div>
      <div style={{display: 'flex', gap: 12}}>
        {tl.pairs.map(p => <div key={p.i} style={{height: 14, width: p === pair ? 54 : 14, borderRadius: 7, background: p.i < done || p === pair ? C.rosa : 'rgba(58,42,32,0.16)'}} />)}
      </div>
    </div>

    <div style={{position: 'absolute', left: 300, top: 1118, width: 480, height: 64, borderRadius: '50%', background: 'rgba(120,70,40,0.16)', filter: 'blur(10px)', transform: `scaleX(${1 - amp * 0.05})`}} />
    <Pancho pose={pose} since={frame - since} amp={amp} shake={listening} />

    {/* the card: one pair at a time */}
    <div style={{position: 'absolute', left: 80, top: 1212, width: 920, height: 388, background: C.card, borderRadius: 60, boxShadow: CLAY,
      opacity: intro * (1 - leave), transform: `translateY(${(1 - intro) * 60 + leave * 80}px)`}}>
      {!pair && !inOutro ? (() => {
        const out = 1 - tween(frame, tl.hookEnd - 6, 6, Easing.in(Easing.quad));
        return <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: out}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 92, color: C.ink, opacity: tween(frame, 6, 9), transform: `translateY(${(1 - tween(frame, 6, 9)) * 18}px)`}}>¿Español de libro?</div>
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 46, color: C.muted, opacity: tween(frame, 38, 9), transform: `translateY(${(1 - tween(frame, 38, 9)) * 14}px)`}}>Here’s how we really say it 👇</div>
        </div>;
      })() : null}
      {pair ? (() => {
        const lf = frame - pair.start, sw = pair.sw - pair.start;
        const enter = tween(lf, 0, 9), out = 1 - tween(frame, pair.end - 6, 6, Easing.in(Easing.quad));
        const move = tween(lf, sw, 11, INOUT);
        const strike = tween(lf, sw - 5, 7);
        const arg = spring({frame: lf - sw - 2, fps: FPS, config: {damping: 12, stiffness: 180, mass: 0.8}});
        const tSize = fit(pair.textbook, 108, 800), aSize = fit(pair.argentine, 124, 820);
        return <div style={{position: 'absolute', inset: 0, opacity: out, transform: `translateY(${(1 - out) * -10}px)`}}>
          <Chip label="TEXTBOOK 📕" bg={C.coralSoft} color={C.coral} show={enter * (1 - tween(lf, sw, 5))} amp={lf < sw ? amp : 0} />
          <Chip label="ARGENTINA 🇦🇷" bg={C.sky} color={C.ink} show={tween(lf, sw + 2, 7)} amp={lf >= sw ? amp : 0} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 138 - move * 96, display: 'flex', justifyContent: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 18}px)`}}>
            <div style={{position: 'relative', fontFamily: DISPLAY, fontWeight: 800, fontSize: tSize, lineHeight: 1, color: move > 0.5 ? C.muted : C.ink, transform: `scale(${1 - move * 0.56})`, whiteSpace: 'nowrap'}}>
              {pair.textbook}
              <div style={{position: 'absolute', left: -14, right: -14, top: '52%', height: 9, borderRadius: 5, background: C.coral, transformOrigin: '0 50%', transform: `scaleX(${strike})`}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: tween(lf, sw + 2, 5)}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: aSize, lineHeight: 1, color: C.rosa, whiteSpace: 'nowrap', transform: `scale(${0.88 + 0.12 * arg})`}}>{pair.argentine}</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 296, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 46, color: C.muted,
            opacity: tween(lf, 4, 9), transform: `translateY(${(1 - tween(lf, 4, 9)) * 12}px)`}}>({pair.english})</div>
        </div>;
      })() : null}
    </div>

    {/* sign-off */}
    {inOutro ? (() => {
      const lf = frame - tl.outro;
      const a = tween(lf, 8, 12), b = tween(lf, 16, 12), c = tween(lf, 26, 12);
      return <div style={{position: 'absolute', left: 0, right: 0, top: 1215, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 1.02, color: C.ink, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 22}px)`}}>Nos vemos<br />en <span style={{color: C.rosa}}>Posta</span></div>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 44, color: C.muted, marginTop: 22, opacity: b, transform: `translateY(${(1 - b) * 16}px)`}}>Argentine Spanish, the way it’s spoken</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 40, background: C.rosa, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, padding: '20px 40px 20px 22px', borderRadius: 999,
          boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.28), inset 0 -5px 10px rgba(80,10,30,0.25), 0 16px 26px -10px rgba(160,50,75,0.6)', opacity: c, transform: `translateY(${(1 - c) * 16}px) scale(${0.96 + 0.04 * c})`}}>
          <Img src={staticFile('posta-icon.png')} style={{width: 76, height: 76, borderRadius: 38}} />Follow for more</div>
      </div>;
    })() : null}

    {spoken.map(([at, c]) => <Sequence key={c.src} from={at} durationInFrames={c.env.length + 4}><Audio src={staticFile(c.src)} /></Sequence>)}
  </AbsoluteFill>;
};
