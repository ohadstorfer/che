// What the onboarding clips share: the app's sticker look (src/lib/theme.ts), the timing
// helpers, the tabs' outlined headline, and the pieces of the chat screen.
import React from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;

// The app's Figuritas theme.
export const C = {oat: '#F7EFE6', card: '#FFF9F3', line: '#E6D8C8', ink: '#3A2A20', muted: '#7A6556', rosa: '#B44A60', rosaDark: '#8A3347', coral: '#C9553E', accent: '#C4663F',
  success: '#3F7A57', successSoft: 'rgba(168,213,186,0.5)', dangerInk: '#94371F',
  locked: '#EADFD2', lockedIcon: '#9C8878', peach: '#FFB38A', sage: '#A8D5BA', butter: '#FFE08A', lav: '#C9B8F0', sky: '#A9D6F5', flame: '#FF8A5B'};
export const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
export const BODY = 'Figtree, "Helvetica Neue", sans-serif';
/** A sticker: a thick ink outline and a hard ink shadow, no blur. */
export const stuck = (x: number, y: number, line = 7) => `0 0 0 ${line}px ${C.ink}, ${x}px ${y}px 0 ${line}px ${C.ink}`;
export const STICKER = stuck(9, 12);
export const CHIP = stuck(6, 9, 6);
export const FLAT = '0 0 0 6px rgba(58,42,32,0.22)';

export const fonts: [string, string, number][] = [['Gabarito', 'Gabarito_900Black.ttf', 900], ['Gabarito', 'Gabarito_800ExtraBold.ttf', 800],
  ['Figtree', 'Figtree_600SemiBold.ttf', 600], ['Figtree', 'Figtree_700Bold.ttf', 700], ['Figtree', 'Figtree_800ExtraBold.ttf', 800],
  ['Ionicons', 'Ionicons.ttf', 400], ['MaterialCommunityIcons', 'MaterialCommunityIcons.ttf', 400]];
let fontsIn = false;
if (typeof document !== 'undefined') {
  const wait = delayRender('onboarding fonts');
  Promise.all(fonts.map(([family, file, weight]) => {
    const f = new FontFace(family, `url(${staticFile('fonts/' + file)})`, {weight: String(weight)});
    return f.load().then(l => document.fonts.add(l));
  })).then(() => { fontsIn = true; continueRender(wait); }, () => continueRender(wait));
}

const measured = new Map<string, number>();
/** How wide the browser sets `text`, in px: counted on a canvas, and kept once the fonts are in. */
export const textWidth = (text: string, weight: number, size: number, family = 'Figtree') => {
  if (typeof document === 'undefined') return text.length * size * 0.55;
  const font = `${weight} ${size}px ${family}`, key = `${font}|${text}`;
  const known = measured.get(key);
  if (known !== undefined) return known;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  if (fontsIn) measured.set(key, width);
  return width;
};

export const OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const INOUT = Easing.bezier(0.77, 0, 0.175, 1);
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0→1 over `dur` frames starting at `from`. */
export const tween = (frame: number, from: number, dur: number, easing = OUT) => interpolate(frame, [from, from + dur], [0, 1], {...CLAMP, easing});
/** A sticker slapped on: up from just under full size, at its own tilt (the app's useSlap). */
export const slap = (frame: number, at: number, tilt = 0): React.CSSProperties => {
  const t = tween(frame, at, 10);
  return {opacity: Math.min(1, t * 2), transform: `rotate(${tilt}deg) scale(${0.9 + 0.1 * t})`};
};
export const rise = (frame: number, at: number, by = 30): React.CSSProperties => { const t = tween(frame, at, 9); return {opacity: t, transform: `translateY(${(1 - t) * by}px)`}; };
/** A press: down to 0.97 and back, over `dur` frames. */
export const press = (frame: number, at: number, dur = 6, depth = 0.04) => 1 - depth * interpolate(frame, [at, at + dur / 2, at + dur], [0, 1, 0], CLAMP);

// The app's icons, by their code in the icon fonts it ships.
export const ICON = {cafe: 0xf1ca, tick: 0xf0e1e, arrow: 0xf133, book: 0xf1a6, albums: 0xf110, chat: 0xf213, play: 0xf4c6, flame: 0xf313, flameLine: 0xf314, check: 0xf21d, mic: 0xf036c, send: 0xf005d};
export const Icon: React.FC<{code: number; size: number; color: string; style?: React.CSSProperties}> = ({code, size, color, style}) => (
  <span style={{fontFamily: code > 0xffff ? 'MaterialCommunityIcons' : 'Ionicons', fontSize: size, lineHeight: 1, color, display: 'block', ...style}}>{String.fromCodePoint(code)}</span>
);

// --- the headline --------------------------------------------------------------
// The tabs' headline (components/sticker.tsx): a small line over a big one, butter
// with a thick ink outline, tilted.
export const BOARD = 960;
export const fit = (text: string, max: number, perChar: number) => Math.min(max, Math.floor((BOARD - 20) / (text.length * perChar)));
export const Line: React.FC<{text: string; size: number; y: number; stroke: number; spacing?: number}> = ({text, size, y, stroke, spacing = 0}) => {
  const shared = {x: stroke / 2, y, fontFamily: 'Gabarito', fontWeight: 900, fontSize: size, letterSpacing: spacing};
  return <>
    <text {...shared} fill={C.ink} stroke={C.ink} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">{text}</text>
    <text {...shared} fill={C.butter}>{text}</text>
  </>;
};
/** `bigFirst` puts the big line on top and the small one under it ("CULTURE lessons"). */
export const Headline: React.FC<{small: string; big: string; width: number; bigFirst?: boolean}> = ({small, big, width, bigFirst = false}) => {
  const a = small.toUpperCase(), b = big.toUpperCase();
  const sizeA = fit(a, 88, 0.56), sizeB = fit(b, 210, 0.6);
  const height = Math.round(sizeA * 1.02 + sizeB * 1.02 + 14);
  return <svg width={width} height={width * height / BOARD} viewBox={`0 0 ${BOARD} ${height}`} style={{overflow: 'visible', display: 'block'}}>
    <Line text={a} size={sizeA} y={bigFirst ? sizeB * 0.98 + sizeA * 0.86 + 6 : sizeA * 0.86} stroke={16} />
    <Line text={b} size={sizeB} y={bigFirst ? sizeB * 0.84 : sizeA * 1.02 + sizeB * 0.84 + 6} stroke={22} spacing={-4} />
  </svg>;
};

export const RAYS = Array.from({length: 16}, (_, k) => k * 22.5);
/** The sun from the flag, as on the course path. */
export const FlagSun: React.FC<{size: number; turn: number; style?: React.CSSProperties}> = ({size, turn, style}) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{position: 'absolute', opacity: 0.6, transform: `rotate(${turn}deg)`, ...style}}>
    <g fill={C.butter}>
      <circle r={42} />
      {RAYS.map(deg => <g key={deg} transform={`rotate(${deg})`}>
        <path d="M -5.5 -47 L 0 -98 L 5.5 -47 Z" />
        <path transform="rotate(11.25)" d="M -5 -47 C -11 -62 3 -72 -3 -94 C 9 -76 -1 -64 5 -47 Z" />
      </g>)}
    </g>
  </svg>
);

/** The finger: where she taps. `show` fades it, `down` presses it. */
export const Tap: React.FC<{x: number; y: number; show: number; down: number}> = ({x, y, show, down}) => (
  <div style={{position: 'absolute', left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: 46, boxSizing: 'border-box', background: 'rgba(58,42,32,0.26)',
    border: '6px solid rgba(255,255,255,0.95)', boxShadow: '0 0 0 3px rgba(58,42,32,0.3)', opacity: show, transform: `scale(${1 - 0.2 * down})`, zIndex: 50}} />
);
export const mix = (t: number, a: number, b: number) => a + (b - a) * t;
export const LEAVE = 7; // frames a scene takes to clear the stage
export const OVERLAP = 4; // the next scene is already arriving for the last of them
/** Gone by `at + LEAVE`: up a little and out. */
export const clear = (f: number, at: number): React.CSSProperties => { const t = tween(f, at, LEAVE); return {opacity: 1 - t, transform: `translateY(${-36 * t}px)`}; };
/** A sticker pressed on from above: down from a little over full size, at its own tilt. */
export const stamp = (frame: number, at: number, tilt = 0): React.CSSProperties => {
  const t = tween(frame, at, 8);
  return {opacity: Math.min(1, t * 3), transform: `rotate(${tilt}deg) scale(${1.2 - 0.2 * t})`};
};

/** A take's headlines, each on stage from `from` until `until`: slapped on, then up and out as the next one lands. */
export type HeadlineCue = [small: string, big: string, from: number, until: number];
export const Headlines: React.FC<{f: number; cues: HeadlineCue[]}> = ({f, cues}) => <>
  {cues.map(([small, big, from, until]) => f >= from && f < until ? <div key={big} style={{position: 'absolute', left: 64, top: 56, ...clear(f, until - LEAVE)}}>
    <div style={{transformOrigin: '0% 50%', ...slap(f, from, -3)}}><Headline small={small} big={big} width={760} /></div>
  </div> : null)}
</>;

/** A take on a loop of `total` frames: the sun behind it, and the take before this one still leaving as this one arrives. */
/** A take given time to be read: `pace` stretches all of it (1.4 = 40% longer), and each `[at, rest]` stop holds it still
 *  at the take's own frame `at` for `rest` frames of the clip. Returns the clip's length and the take's frame for a clip frame. */
export const slowed = (total: number, pace: number, stops: [number, number][]) => {
  const frames = Math.round(total * pace + stops.reduce((n, [, rest]) => n + rest, 0));
  const at = (frame: number) => {
    let take = 0, clip = 0;
    for (const [stop, rest] of stops) {
      const reach = (stop - take) * pace;
      if (frame < clip + reach) return take + (frame - clip) / pace;
      clip += reach; take = stop;
      if (frame < clip + rest) return take;
      clip += rest;
    }
    return take + (frame - clip) / pace;
  };
  return {frames, at};
};
/** `at` turns the clip's frame into the take's (see `slowed`): without it the take plays as it was timed. */
export const Loop: React.FC<{total: number; Take: React.FC<{f: number}>; at?: (frame: number) => number}> = ({total, Take, at}) => {
  const clip = useCurrentFrame();
  const frame = at ? at(clip) : clip;
  return <AbsoluteFill style={{background: C.oat, overflow: 'hidden'}}>
    {/* a sixteenth of a turn per loop: the sun has sixteen rays, so the loop closes on itself */}
    <FlagSun size={620} turn={frame / total * 22.5} style={{left: 690, top: -230}} />
    {frame < OVERLAP ? <Take f={frame + total} /> : null}
    <Take f={frame} />
  </AbsoluteFill>;
};

// --- the chat's pieces (src/app/hablar-chat.tsx) ---------------------------------
/** A voice: bars that move with the frame. `live` 0 = at rest; `speed` scales how fast they move (1 = talking pace). */
export const Bars: React.FC<{f: number; n: number; w: number; h: number; color: string; live?: number; speed?: number}> = ({f, n, w, h, color, live = 1, speed = 1}) => <>
  {Array.from({length: n}, (_, k) => <div key={k} style={{width: w, height: h, borderRadius: Math.ceil(w / 2), background: color, transform: `scaleY(${0.3 + 0.7 * live * Math.abs(Math.sin(f * 0.55 * speed + k * 1.9))})`}} />)}
</>;
/** Pancho, head and shoulders, on his butter disc. */
export const Avatar: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: C.butter, boxShadow: STICKER, overflow: 'hidden', display: 'flex', justifyContent: 'center', flexShrink: 0}}>
    <Img src={staticFile('pancho/saludando.png')} style={{height: Math.round(size * 1.73), marginTop: Math.round(size * 0.06)}} />
  </div>
);
/** The mic, filling its parent: rosa at rest; durazno, with a ring going out, while it listens. `since` counts frames from when it began to; `period` is one ring's length in frames. */
export const Mic: React.FC<{size: number; listening: boolean; since: number; scale: number; period?: number}> = ({size, listening, since, scale, period = 30}) => {
  const ring = (since % period) / period;
  return <>
    {listening ? <div style={{position: 'absolute', inset: 0, borderRadius: size / 2, background: C.accent, opacity: 0.45 * (1 - ring), transform: `scale(${1 + 0.45 * ring})`}} /> : null}
    <div style={{position: 'absolute', inset: 0, borderRadius: size / 2, background: listening ? C.accent : C.rosa, boxShadow: STICKER, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${scale})`}}>
      <Icon code={listening ? ICON.send : ICON.mic} size={Math.round(size * 0.453)} color="#fff" />
    </div>
  </>;
};
/** What she said with the fix in it: the wrong words struck through (`struck` 0→1) and the right ones let in beside them (`added` 0→1, up to `room` px wide). */
export const Diff: React.FC<{before: string; removed: string; fixed: string; after: string; struck: number; added: number; room: number}> = ({before, removed, fixed, after, struck, added, room}) => <>
  <span>{before}&nbsp;</span>
  <span style={{position: 'relative', padding: '0 8px', borderRadius: 10, color: interpolateColors(struck, [0, 1], [C.ink, C.dangerInk]), background: `rgba(201,85,62,${0.16 * struck})`}}>
    {removed}
    <span style={{position: 'absolute', left: 4, right: 4, top: '52%', height: 6, borderRadius: 3, background: C.dangerInk, transformOrigin: '0% 50%', transform: `scaleX(${struck})`}} />
  </span>
  <span style={{display: 'block', overflow: 'hidden', maxWidth: added * room, opacity: Math.min(1, added * 1.6)}}>
    <span style={{display: 'block', marginLeft: 14, padding: '0 12px', borderRadius: 10, fontWeight: 800, color: C.success, background: C.successSoft, transformOrigin: '0% 50%', transform: `scale(${0.9 + 0.1 * added})`}}>{fixed}</span>
  </span>
  <span>&nbsp;{after}</span>
</>;
