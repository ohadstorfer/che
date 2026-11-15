// "Argentine insults, translated literally" — puteadas format 3, option D ("Literal arriba, real abajo"), from the
// "Reels de Puteadas" artifact (2026-11-06). A split screen: the literal meaning on top in butter yellow with a
// suspicious Pancho, the word stamped across the middle, then the real meaning and the example below in sage.
// The app's sticker look (thick ink edge, hard shadow). Everything sits in the middle band (about y 330 to 1500)
// so no platform's top bar or captions cover it.
// 2026-11-07: no intro (frame 0 is already the first word, "forro", as the hook), a 3-second countdown before each
// real meaning (the Drake / Word of the Day ring), "Follow for more" as the close, and the 2026-11-06 cumbia under it.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import CLIPS from './clips.json';

const FPS = 30;
const C = {oat: '#F7EFE6', surf: '#FFF9F3', ink: '#3A2A20', ink2: '#7A6556', rosa: '#B44A60', salvia: '#3F7A57', butter: '#FFE08A', sage: '#A8D5BA', coral: '#C9553E', track: '#F3E2D3'};
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif', BODY = 'Figtree, "Helvetica Neue", sans-serif';
type Item = {id: string; w: string; lit: string; real: string};
export type Literal = {id: string; items: Item[]};

if (typeof document !== 'undefined') {
  const wait = delayRender('fonts');
  Promise.all(([['Gabarito', 'Gabarito_900Black.ttf', 900], ['Gabarito', 'Gabarito_800ExtraBold.ttf', 800], ['Figtree', 'Figtree_700Bold.ttf', 700], ['Figtree', 'Figtree_800ExtraBold.ttf', 800]] as const)
    .map(([fam, file, weight]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: String(weight)}).load().then(f => document.fonts.add(f))))
    .then(() => continueRender(wait), () => continueRender(wait));
}

// Swear words keep their first letter and lose the second on screen; the audio is not bleeped.
const BAD = /\b(pelotud\w*|puta|concha|conchud\w*|pajer\w*|cag\w*|mierda|culo|orto|pija|paja|fuck\w*|shit\w*|pussy|bitch|whore)\b/gi;
const T = (s: string) => s.replace(BAD, m => m[0] + '*' + m.slice(2));
const stk = (bg: string, r = 84, b = 9, sh = 14): React.CSSProperties => ({background: bg, border: `${b}px solid ${C.ink}`, borderRadius: r, boxShadow: `${sh - 2}px ${sh}px 0 ${C.ink}`});

// The artifact's CSS animations, in frames: pop, rise and stamp, with its delays d1..d4.
const DELAY = [0, 0.25, 0.6, 1.1, 1.6];
const POP = Easing.bezier(0.2, 0.9, 0.3, 1.3), RISE = Easing.bezier(0.2, 0.8, 0.2, 1), STAMP = Easing.bezier(0.2, 0.9, 0.3, 1.2);
function anim(kind: 'pop' | 'rise' | 'stamp', f: number, d = 0, rot = 0): React.CSSProperties {
  const at = f - DELAY[d] * FPS, dur = {pop: 0.38, rise: 0.45, stamp: 0.35}[kind] * FPS;
  const t = interpolate(at, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: {pop: POP, rise: RISE, stamp: STAMP}[kind]});
  const o = Math.min(1, Math.max(0, at / (dur * 0.6)));
  if (kind === 'pop') return {opacity: o, transform: `scale(${0.6 + 0.4 * t})`};
  if (kind === 'rise') return {opacity: o, transform: `translateY(${(1 - t) * 60}px)`};
  return {opacity: o, transform: `scale(${2.4 - 1.4 * t}) rotate(${rot}deg)`};
}

const FOLLOW = 105, LEAD = 7; // the clip starts 0.22 s into its scene, as in the artifact
const ASK = 90; // the 3-second countdown, after the word is said and before the real meaning
const REVEAL = 69; // the real meaning stays up 2.3 s (no example since 2026-11-07: Pancho as the Drake meme)
const SKIP = 24; // the first word starts already in place, so frame 0 (the cover) shows it whole
const sec = (id: string) => (CLIPS as Record<string, number>)[id] ?? 1.5;
export function literalTimeline(reel: Literal) {
  let t = 0;
  const items = reel.items.map(it => {
    const p0 = t, d0 = Math.round((0.22 + sec(it.id) + 0.4) * FPS) + ASK;
    const p1 = p0 + d0, d1 = REVEAL;
    t = p1 + d1;
    return {...it, p0, p1, end: t};
  });
  return {items, follow: t, total: t + FOLLOW};
}

const pop = (f: number) => (f < 0 ? 0 : spring({frame: f, fps: FPS, config: {damping: 11, stiffness: 180, mass: 0.7}}));

/** The Drake / Word of the Day countdown: a rosa ring that empties over 3 s (coral in the last second), the number popping each second. */
const Ring: React.FC<{f: number}> = ({f}) => {
  const n = Math.max(1, 3 - Math.floor(f / FPS)), left = Math.max(0, 1 - f / ASK);
  const r = 112, c = 2 * Math.PI * r, s = 0.72 + 0.28 * pop(f % FPS);
  return <div style={{position: 'relative', width: 300, height: 300, borderRadius: 150, ...stk(C.surf, 150, 8, 10)}}>
    <svg width="284" height="284" viewBox="0 0 284 284" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
      <circle cx="142" cy="142" r={r} fill="none" stroke={C.track} strokeWidth="26" />
      <circle cx="142" cy="142" r={r} fill="none" stroke={n === 1 ? C.coral : C.rosa} strokeWidth="26" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left)} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', font: `900 150px ${DISPLAY}`, color: C.ink, transform: `scale(${s})`}}>{n}</div>
  </div>;
};

// "Follow for more", in the middle band, as the other reels close.
const Follow: React.FC<{f: number}> = ({f}) => <AbsoluteFill style={{background: C.oat}}>
  <div style={{position: 'absolute', left: 80, right: 80, top: 340, display: 'grid', gap: 30, justifyItems: 'center'}}>
    {[['Follow', C.rosa, '#fff', 120, -3], ['for more Argentine', C.surf, C.ink, 72, 1.5], ['slang 🇦🇷', C.butter, C.ink, 72, -1]].map(([t, bg, col, size, rot], i) => { const a = anim('rise', f, i);
      return <div key={i} style={{...stk(bg as string, 60), padding: '22px 44px', font: `900 ${size}px/1.1 ${DISPLAY}`, color: col as string, textAlign: 'center',
        opacity: a.opacity, transform: `${a.transform} rotate(${rot}deg)`}}>{t}</div>; })}
    <div style={{...stk(C.surf, 40, 7, 9), padding: '14px 34px', font: `800 50px ${BODY}`, color: C.ink, ...anim('pop', f, 3)}}>@postaspanish</div>
  </div>
  {/* the happy Drake Pancho from the reel, in the same meme-panel card */}
  <div style={{position: 'absolute', left: 360, top: 990, width: 360, height: 380, overflow: 'hidden', ...stk('#D6EEDF', 44, 8, 10), ...(() => { const a = anim('pop', f, 4); return {opacity: a.opacity, transform: `${a.transform} rotate(-2deg)`}; })()}}>
    <Img src={staticFile('pancho/drake-yes.png')} style={{position: 'absolute', left: 6, bottom: -6, width: 350}} />
  </div>
</AbsoluteFill>;

const Split: React.FC<{it: Item; ph: 0 | 1; f: number; ask?: number}> = ({it, ph, f, ask = -1}) => {
  const lit = `“${T(it.lit)}”`, litSize = it.lit.length > 22 ? 64 : it.lit.length > 12 ? 76 : 92;
  const wSize = it.w.length > 18 ? 66 : it.w.length > 8 ? 88 : 116;
  const realSize = it.real.length > 16 ? 66 : it.real.length > 10 ? 80 : 96;
  // Both colours run edge to edge (no empty strip), but everything that matters sits in the box no platform covers:
  // x 60-930 (TikTok / Reels / Shorts keep their buttons on the right) and y 280-1400 (top bar above, caption and
  // music line below). Each Pancho is a meme panel: a sticker card that cuts him off at the chest.
  const Card: React.FC<{src: string; top: number; bg: string; rot: number}> = ({src, top, bg, rot}) =>
    <div style={{position: 'absolute', left: 540, top, width: 380, height: 400, overflow: 'hidden', ...stk(bg, 44, 8, 10), transform: `rotate(${rot}deg)`}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: 6, bottom: -6, width: 370}} />
    </div>;
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 840, background: C.butter}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 840, bottom: 0, background: C.sage}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 832, height: 16, background: C.ink}} />
    {/* top: what it says word for word, Pancho saying no */}
    <Card src="pancho/drake-no.png" top={360} bg="#FFF3C4" rot={2} />
    <div style={{position: 'absolute', left: 70, top: 300, padding: '14px 34px', ...stk(C.surf, 24, 8, 10), font: `900 52px ${DISPLAY}`, color: C.ink, letterSpacing: 4.5,
      ...(ph ? {transform: 'rotate(-6deg)'} : anim('stamp', f, 0, -6))}}>LITERALLY</div>
    <div style={{position: 'absolute', left: 70, width: 440, top: 420, font: `900 ${litSize}px/1.02 ${DISPLAY}`, color: C.ink, ...(ph ? {} : anim('rise', f, 1))}}>{lit}</div>
    {/* the word itself, across the line */}
    <div style={{position: 'absolute', left: 90, width: 840, top: 768, boxSizing: 'border-box', padding: 22, ...stk(C.surf, 60), textAlign: 'center', font: `900 ${wSize}px/1.05 ${DISPLAY}`, color: C.rosa, zIndex: 3,
      ...(ph ? {transform: 'rotate(-2deg)'} : (() => { const a = anim('pop', f); return {opacity: a.opacity, transform: `${a.transform} rotate(-2deg)`}; })())}}>{T(it.w)}</div>
    {/* bottom: what it really means, Pancho saying yes */}
    <Card src="pancho/drake-yes.png" top={990} bg="#D6EEDF" rot={-2} />
    <div style={{position: 'absolute', left: 70, top: 980, padding: '14px 34px', ...stk(ph ? C.salvia : C.surf, 24, 8, 10), font: `900 52px ${DISPLAY}`, color: ph ? '#fff' : C.ink2, letterSpacing: 4.5,
      ...(ph ? anim('stamp', f, 0, 5) : {transform: 'rotate(5deg)'})}}>REALLY</div>
    {ph ? <div style={{position: 'absolute', left: 70, width: 440, top: 1100, font: `900 ${realSize}px/1.02 ${DISPLAY}`, color: C.ink, ...anim('rise', f)}}>{T(it.real)}</div>
      : ask < 0 ? <div style={{position: 'absolute', left: 70, width: 400, top: 1060, textAlign: 'center', font: `900 260px ${DISPLAY}`, color: C.ink, opacity: 0.18}}>?</div>
      : <div style={{position: 'absolute', left: 120, top: 1080, ...anim('pop', ask)}}><Ring f={Math.min(ASK - 1, ask)} /></div>}
  </AbsoluteFill>;
};

export const LiteralReel: React.FC<{reel: Literal}> = ({reel}) => {
  const frame = useCurrentFrame();
  const tl = literalTimeline(reel);
  const cur = tl.items.find(it => frame >= it.p0 && frame < it.end);
  return <AbsoluteFill style={{background: C.oat, overflow: 'hidden'}}>
    {cur ? (frame < cur.p1 ? <Split it={cur} ph={0} f={frame - cur.p0 + (cur.p0 ? 0 : SKIP)} ask={frame - (cur.p1 - ASK)} /> : <Split it={cur} ph={1} f={frame - cur.p1} />) : null}
    {frame >= tl.follow ? <Follow f={frame - tl.follow} /> : null}
    {/* one of the two 30 s cumbias made for all our videos (2026-11-06), under the voice */}
    <Audio src={staticFile('music/cumbia-2026-a.mp3')} loop volume={f => interpolate(f, [0, 10, tl.total - 25, tl.total], [0, 0.18, 0.18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    {tl.items.flatMap(it => [it.p1 - ASK, it.p1 - ASK + 30, it.p1 - ASK + 60].map(at => <Sequence key={it.id + at} from={at} durationInFrames={10}><Audio src={staticFile('sfx/tick.wav')} volume={0.5} /></Sequence>))}
    {tl.items.map(it => <Sequence key={it.id + '-w'} from={it.p1} durationInFrames={12}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>)}
    {tl.items.flatMap(it => [
      <Sequence key={it.id} from={it.p0 + LEAD} durationInFrames={Math.ceil(sec(it.id) * FPS) + 6}><Audio src={staticFile(`vo/literal/${it.id}.mp3`)} /></Sequence>,
    ])}
  </AbsoluteFill>;
};
