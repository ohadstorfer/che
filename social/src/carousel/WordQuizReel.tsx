// "Argentinian word of the day" quiz reel (9:16), one per day from wordquiz.mjs:
// big series intro → the word → 3 rounds (a line, three meanings, the Drake reels' 3-second countdown, the right one turns green)
// → "Follow for more words each day". The app's sticker look: oat paper, ink outlines with hard shadows, butter outlined headline, rosa.
// Laid out on a 360×640 board scaled ×3, the same board as the artifact draft it came from.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

export type WordQuiz = {
  id: string; day: number; word: string; marks: string[]; hook: string;
  rounds: {say: string; options: [string, string, string]; answer: number}[];
};

const FPS = 30;
const OAT = '#F7EFE6', SURFACE = '#FFF9F3', INK = '#3A2A20', INK2 = '#7A6556', ROSA = '#B44A60', CORAL = '#C9553E', SAGE = '#A8D5BA', BUTTER = '#FFE08A', TRACK = '#F3E2D3';
const DISPLAY = "'Gabarito', sans-serif", UI = "'Figtree', system-ui, sans-serif";
const STICK = `0 0 0 2.5px ${INK}, 3px 4px 0 2.5px ${INK}`;
const CHIP = `0 0 0 2px ${INK}, 2px 3px 0 2px ${INK}`;

if (typeof document !== 'undefined') {
  const wait = delayRender('word quiz fonts');
  Promise.all([
    ...[700, 800].map(w => new FontFace('Figtree', `url(${staticFile(`fonts/Figtree_${w === 700 ? '700Bold' : '800ExtraBold'}.ttf`)})`, {weight: String(w)})),
    ...[800, 900].map(w => new FontFace('Gabarito', `url(${staticFile(`fonts/Gabarito_${w === 800 ? '800ExtraBold' : '900Black'}.ttf`)})`, {weight: String(w)})),
  ].map(f => f.load().then(l => document.fonts.add(l))))
    .then(() => continueRender(wait), () => continueRender(wait));
}

// Timeline in frames.
const INTRO = 66;   // "Argentinian word of the day" — also the cover, so it is complete on frame 0
const WORD = 72;    // the word and its hook
const ASK_AT = 18;  // the countdown starts once the line and the options are in
const ASK = 90;     // 3-second countdown
const ROUND = 150;  // the answer stays up for the rest
const FOLLOW = 90;
export const wordQuizTimeline = (rounds = 3) => {
  const word = INTRO, first = INTRO + WORD, follow = first + rounds * ROUND;
  return {word, first, follow, total: follow + FOLLOW};
};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (f: number, from: number, dur: number) => interpolate(f, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
const pop = (f: number) => (f < 0 ? 0 : spring({frame: f, fps: FPS, config: {damping: 11, stiffness: 180, mass: 0.7}}));
/** Slides up and fades in from frame `at`. */
const up = (f: number, at: number): React.CSSProperties => {const t = tween(f, at, 12); return {opacity: t, transform: `translateY(${(1 - t) * 18}px)`};};
/** Pops in (0.6 → 1) from frame `at`. */
const popIn = (f: number, at: number): React.CSSProperties => {const t = pop(f - at); return {opacity: Math.min(1, t * 2), transform: `scale(${0.6 + 0.4 * t})`};};
/** Slapped on like a sticker: big and twisted, settling at `rot`. */
const slap = (f: number, at: number, rot = -4): React.CSSProperties => {const t = pop(f - at); return {opacity: Math.min(1, t * 2.5), transform: `scale(${1.8 - 0.8 * t}) rotate(${-10 + (rot + 10) * t}deg)`};};

const outlined = (size: number, stroke: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 0.92, color: BUTTER, WebkitTextStroke: `${stroke}px ${INK}`, paintOrder: 'stroke fill', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
} as React.CSSProperties);
/** The headline word as large as fits the 320-wide column. */
const wordSize = (w: string) => Math.min(130, Math.floor(310 / (w.length * 0.82)));

const RAYS = Array.from({length: 16}, (_, k) => k * 22.5);
const Sun: React.FC<{x: number; y: number; size: number; f: number}> = ({x, y, size, f}) => (
  <svg style={{position: 'absolute', left: x, top: y, width: size, height: size, opacity: 0.6, transform: `rotate(${f * 0.3}deg)`}} viewBox="-100 -100 200 200">
    <g fill={BUTTER}><circle r={42} />{RAYS.map(d => <g key={d} transform={`rotate(${d})`}><path d="M -5.5 -47 L 0 -98 L 5.5 -47 Z" /><path transform="rotate(11.25)" d="M -5 -47 C -11 -62 3 -72 -3 -94 C 9 -76 -1 -64 5 -47 Z" /></g>)}</g>
  </svg>
);

const Chip: React.FC<{children: React.ReactNode; style?: React.CSSProperties; bg?: string}> = ({children, style, bg = BUTTER}) => (
  <span style={{display: 'inline-block', fontFamily: DISPLAY, fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', padding: '5px 10px', borderRadius: 99, background: bg, boxShadow: CHIP, ...style}}>{children}</span>
);

const TopBar: React.FC<{day: number}> = ({day}) => (
  <div style={{position: 'absolute', left: 20, right: 20, top: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    <Chip>WORD OF THE DAY</Chip>
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 13, color: INK2, letterSpacing: '0.06em'}}>DAY {day}</span>
  </div>
);

/** The taught word inside a line, on a butter swatch. */
const Marked: React.FC<{text: string; marks: string[]}> = ({text, marks}) => {
  const re = new RegExp(`(^|[^\\p{L}])(${marks.join('|')})(?=[^\\p{L}]|$)`, 'giu');
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length;
    out.push(text.slice(last, start), <span key={start} style={{background: BUTTER, borderRadius: '0.18em', padding: '0 0.1em', margin: '0 -0.04em', boxShadow: `0 0 0 1.5px ${INK}`}}>{m[2]}</span>);
    last = start + m[2].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
};

/** The Drake reels' countdown: a rosa ring that empties over 3 s (coral in the last second), the number popping each second. */
const Ring: React.FC<{f: number}> = ({f}) => {
  const n = Math.max(1, 3 - Math.floor(f / FPS));
  const left = Math.max(0, 1 - f / ASK);
  const r = 38, c = 2 * Math.PI * r;
  const s = 0.72 + 0.28 * pop(f % FPS);
  return <div style={{position: 'relative', width: 96, height: 96}}>
    <svg width="96" height="96" viewBox="0 0 96 96" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
      <circle cx="48" cy="48" r={r} fill="none" stroke={TRACK} strokeWidth="9" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={n === 1 ? CORAL : ROSA} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left)} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: INK, transform: `scale(${s})`}}>{n}</div>
  </div>;
};

const Intro: React.FC<{q: WordQuiz; f: number}> = ({q, f}) => (
  <AbsoluteFill style={{display: 'grid', justifyItems: 'center', alignContent: 'center', textAlign: 'center', gap: 4}}>
    <Sun x={30} y={170} size={300} f={f} />
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, lineHeight: 1, letterSpacing: '0.02em', position: 'relative'}}>ARGENTINIAN</div>
    <div style={{...outlined(62, 9), lineHeight: 0.95, transform: 'rotate(-4deg)', marginTop: 6, position: 'relative'}}>WORD OF<br />THE DAY</div>
    <Chip style={{marginTop: 26, fontSize: 15, padding: '7px 14px', justifySelf: 'center', position: 'relative'}}>DAY {q.day}</Chip>
  </AbsoluteFill>
);

const Word: React.FC<{q: WordQuiz; f: number; t: number}> = ({q, f, t}) => (
  <AbsoluteFill style={{display: 'grid', placeItems: 'center', alignContent: 'center', textAlign: 'center'}}>
    <TopBar day={q.day} />
    <Sun x={30} y={120} size={300} f={t} />
    <div style={{...outlined(wordSize(q.word), Math.round(wordSize(q.word) * 0.15)), ...slap(f, 4)}}>{q.word.toUpperCase()}</div>
    <div style={{fontFamily: UI, fontWeight: 700, fontSize: 20, lineHeight: 1.3, maxWidth: 270, marginTop: 22, ...up(f, 20)}}>{q.hook}</div>
  </AbsoluteFill>
);

const Round: React.FC<{q: WordQuiz; i: number; f: number}> = ({q, i, f}) => {
  const r = q.rounds[i];
  const revealed = f >= ASK_AT + ASK;
  const rv = f - ASK_AT - ASK;
  const verdict = revealed ? tween(rv, 0, 8) : 0;
  return <AbsoluteFill>
    <TopBar day={q.day} />
    <div style={{position: 'absolute', left: 20, top: 84, fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, ...up(f, 0)}}>Round {i + 1}/{q.rounds.length}</div>
    <div style={{position: 'absolute', left: 20, right: 20, top: 134, padding: '22px 16px', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, lineHeight: 1.2, background: SURFACE, borderRadius: 18, boxShadow: STICK, ...popIn(f, 3)}}>
      <Marked text={r.say} marks={q.marks} />
    </div>
    <div style={{position: 'absolute', left: 20, right: 20, top: 262, display: 'grid', gap: 14}}>
      {r.options.map((o, k) => {
        const yes = k === r.answer;
        return <div key={k} style={{padding: '13px 16px', fontFamily: UI, fontWeight: 700, fontSize: 19, borderRadius: 16, boxShadow: STICK,
          background: yes && revealed ? SAGE : SURFACE, ...up(f, 8 + k * 3),
          ...(revealed ? (yes ? {transform: `scale(${1 + 0.04 * pop(rv)})`} : {opacity: 1 - 0.65 * verdict}) : {})}}>{o}</div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 132, top: 446, opacity: revealed ? 1 - tween(rv, 0, 6) : tween(f, ASK_AT - 6, 6)}}>
      <Ring f={Math.min(ASK - 1, Math.max(0, f - ASK_AT))} />
    </div>
    <Img src={staticFile('pancho/sideeye.png')} style={{position: 'absolute', right: -6, bottom: 30, width: 110, transform: `translateY(${-5 * Math.sin(f / 9)}px)`}} />
  </AbsoluteFill>;
};

const Follow: React.FC<{f: number; t: number}> = ({f, t}) => (
  <AbsoluteFill style={{display: 'grid', justifyItems: 'center', alignContent: 'center', textAlign: 'center', gap: 8}}>
    <Sun x={-60} y={380} size={260} f={t} />
    <div style={{...outlined(74, 10), ...slap(f, 2)}}>Follow</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, lineHeight: 1.05, maxWidth: 300, marginTop: 10, ...up(f, 14)}}>for more words each day</div>
    <Chip bg={SURFACE} style={{marginTop: 16, fontSize: 16, padding: '8px 16px', ...popIn(f, 26)}}>@postaspanish</Chip>
    <Img src={staticFile('pancho/saludando.png')} style={{width: 150, marginTop: 10, ...up(f, 32)}} />
  </AbsoluteFill>
);

export const WordQuizReel: React.FC<{q: WordQuiz}> = ({q}) => {
  const frame = useCurrentFrame();
  const tl = wordQuizTimeline(q.rounds.length);
  let scene: React.ReactNode;
  if (frame < tl.word) scene = <Intro q={q} f={frame} />;
  else if (frame < tl.first) scene = <Word q={q} f={frame - tl.word} t={frame} />;
  else if (frame < tl.follow) scene = <Round q={q} i={Math.floor((frame - tl.first) / ROUND)} f={(frame - tl.first) % ROUND} />;
  else scene = <Follow f={frame - tl.follow} t={frame} />;

  return <AbsoluteFill style={{background: OAT, color: INK, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 360, height: 640, transform: 'scale(3)', transformOrigin: '0 0'}}>{scene}</div>

    {/* the two 30 s cumbias made for all our videos (2026-11-06), alternating day by day */}
    <Audio src={staticFile(`music/cumbia-2026-${q.day % 2 ? 'a' : 'b'}.mp3`)} loop volume={f => interpolate(f, [0, 10, tl.total - 25, tl.total], [0, 0.21, 0.21, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    {[tl.word, tl.follow].map(at => <Sequence key={at} from={at} durationInFrames={12}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>)}
    {q.rounds.map((_, i) => {
      const at = tl.first + i * ROUND;
      return <React.Fragment key={i}>
        <Sequence from={at} durationInFrames={12}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} /></Sequence>
        {[0, 1, 2].map(s => <Sequence key={s} from={at + ASK_AT + s * FPS} durationInFrames={4}><Audio src={staticFile('sfx/tick.wav')} volume={0.7} /></Sequence>)}
        <Sequence from={at + ASK_AT + ASK} durationInFrames={22}><Audio src={staticFile('sfx/ding.wav')} volume={0.6} /></Sequence>
      </React.Fragment>;
    })}
  </AbsoluteFill>;
};
