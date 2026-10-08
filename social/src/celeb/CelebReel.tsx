// A "Can you understand …?" reel, in the sticker look: outlined slanted headline, the clip
// as a taped photo, the words as hard-shadow stickers. Four parts and the ending:
//   1. the clip, plain            2. each line again at half speed, its words explained
//   3. the clip with subtitles    4. the app (StickerEnd)
import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const SLOW = 0.5;
const C = {skyTop: '#BDE0F8', skyBottom: '#A1D1F3', card: '#FFF9F3', ink: '#3A2A20', rosa: '#B44A60', butter: '#FFE08A', sage: '#A8D5BA', flame: '#FF8A5B'};
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
const BODY = 'Figtree, "Helvetica Neue", sans-serif';
// A sticker: thick ink outline and a hard shadow, no blur.
const STICKER: React.CSSProperties = {border: `7px solid ${C.ink}`, boxShadow: `9px 10px 0 ${C.ink}`};

if (typeof document !== 'undefined') {
  const wait = delayRender('celeb fonts');
  Promise.all([['Gabarito', 'Gabarito_900Black.ttf', 900], ['Gabarito', 'Gabarito_800ExtraBold.ttf', 800], ['Figtree', 'Figtree_600SemiBold.ttf', 600], ['Figtree', 'Figtree_700Bold.ttf', 700], ['Figtree', 'Figtree_800ExtraBold.ttf', 800]].map(([family, file, weight]) => {
    const f = new FontFace(family as string, `url(${staticFile('fonts/' + file)})`, {weight: String(weight)});
    return f.load().then(l => document.fonts.add(l));
  })).then(() => continueRender(wait), () => continueRender(wait));
}

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (frame: number, from: number, dur = 12) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
// Stickers are slapped on: a short scale-up from just under full size, at their own tilt.
const slap = (frame: number, from: number, tilt = 0): React.CSSProperties => { const t = tween(frame, from); return {opacity: Math.min(1, t * 2), transform: `rotate(${tilt}deg) scale(${0.9 + 0.1 * t})`}; };
const f = (seconds: number) => Math.round(seconds * FPS);
// The largest type size, up to `max`, at which `text` stays on one line of `width`.
const fit = (text: string, max: number, width: number, perChar = 0.56) => Math.min(max, Math.floor(width / (text.length * perChar)));

type Line = {from: number; to: number; es: (string | string[])[]; en: string; words: {word: string; means: string; note: string}[]};
type Celeb = {id: string; who: string; source: string; full: number[]; replay: number[]; lines: Line[]; subs: [number, number, string, string][]; live?: boolean};

/** Where each part starts and how long it runs, in frames. */
export const celebTimeline = (reel: Celeb) => {
  const full = f(reel.full[1] - reel.full[0]);
  const lines = reel.lines.map(l => f((l.to - l.from) / SLOW));
  const starts: number[] = []; let at = full;
  for (const n of lines) { starts.push(at); at += n; }
  const replayAt = at, replay = f(reel.replay[1] - reel.replay[0]);
  const endAt = replayAt + replay;
  return {full, lines, starts, replayAt, replay, endAt, total: endAt + STICKER_END};
};

const Clip: React.FC<{src: string; from: number; rate?: number}> = ({src, from, rate = 1}) =>
  <OffthreadVideo src={staticFile(src)} startFrom={f(from)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

// One outlined line of the headline. It is drawn as SVG text so the outline's corners are
// rounded: a CSS text stroke leaves sharp spikes on letters like A and W.
const Outlined: React.FC<{text: string; size: number; fill: string; stroke: number; spacing?: number}> = ({text, size, fill, stroke, spacing = 0}) =>
  <svg width={960} height={Math.round(size * 1.02)} style={{overflow: 'visible', display: 'block'}}>
    <text x={stroke / 2} y={size * 0.84} fontFamily={DISPLAY} fontWeight={900} fontSize={size} letterSpacing={spacing} fill={fill}
      stroke={C.ink} strokeWidth={stroke} strokeLinejoin="round" paintOrder="stroke fill">{text.toUpperCase()}</text>
  </svg>;

// A line is stamped on: it starts a little large and settles in a few frames, without sliding,
// so the thick outline never smears across the frame.
const stamp = (frame: number, from: number): React.CSSProperties => {
  const t = tween(frame, from, 9);
  return {opacity: frame < from ? 0 : Math.min(1, (frame - from + 1) / 2), transform: `scale(${1.1 - 0.1 * t})`, transformOrigin: '18% 60%'};
};

// Two lines, tilted: a small one in flame and a big one in butter, both outlined in ink.
const Headline: React.FC<{frame: number; small: string; big: string}> = ({frame, small, big}) =>
  <div style={{position: 'absolute', left: 60, top: 226, width: 960, display: 'flex', flexDirection: 'column', gap: 4, transform: 'rotate(-3deg)'}}>
    <div style={stamp(frame, 0)}><Outlined text={small} size={fit(small, 88, 940)} fill={C.flame} stroke={16} /></div>
    <div style={stamp(frame, 5)}><Outlined text={big} size={fit(big, 210, 940, 0.6)} fill={C.butter} stroke={22} spacing={-4} /></div>
  </div>;

const WordSticker: React.FC<{frame: number; at: number; tone: string; tilt: number; word: string; means: string; note: string}> = ({frame, at, tone, tilt, word, means, note}) =>
  <div style={{flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '26px 16px 28px', borderRadius: 40, background: tone, ...STICKER, ...slap(frame, at, tilt)}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>{word}</div>
    <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>{means}</div>
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: fit(note, 30, 400, 0.5), lineHeight: 1, color: C.ink, opacity: 0.8, whiteSpace: 'nowrap'}}>{note}</div>
  </div>;

// The sun from the Argentine flag, as a pale mark in the background: a disc with sixteen straight
// rays and sixteen wavy ones. It turns very slowly and never reacts to the voices.
const Sun: React.FC<{left: number; top: number; size: number; frame: number}> = ({left, top, size, frame}) =>
  <svg viewBox="-100 -100 200 200" width={size} height={size} style={{position: 'absolute', left, top, opacity: 0.34, transform: `rotate(${frame * 0.03}deg)`}}>
    <g fill="#FFFFFF">
      <circle r={42} />
      {Array.from({length: 16}, (_, k) => <g key={k} transform={`rotate(${k * 22.5})`}>
        <path d="M -5.5 -47 L 0 -98 L 5.5 -47 Z" />
        <path transform="rotate(11.25)" d="M -5 -47 C -11 -62 3 -72 -3 -94 C 9 -76 -1 -64 5 -47 Z" />
      </g>)}
    </g>
  </svg>;

// The ending, in the same sticker look: the question, then a wheel of four app screens with the
// app's name and the stores under it. Everything is on screen within two seconds and stays while
// the wheel turns one place a second.
// `soon` shows "Coming soon to" on the store badges; pass false once the app is on the stores.
const SCREENS = ['course', 'chat', 'culture', 'slang'];
const BODY_AT = 30; // when the screens, the name and the stores start coming in, a second after the question
const WHEEL_AT = BODY_AT + 20; // when the first screen is settled
const STICKER_END = WHEEL_AT + SCREENS.length * FPS + 10;
const PW = 322, PH = 700;
// A phone's place on the wheel: 0 is the middle, 1 the right, 2 hidden behind, 3 the left (4 is the middle again).
const AT = [0, 1, 2, 3, 4];
const place = (rel: number) => ({
  x: interpolate(rel, AT, [0, PW * 0.74, 0, -PW * 0.74, 0]),
  scale: interpolate(rel, AT, [1, 0.78, 0.6, 0.78, 1]),
  rot: interpolate(rel, AT, [0, 6, 0, -6, 0]),
  opacity: interpolate(rel, AT, [1, 1, 0, 1, 1]),
});
const rise = (frame: number, from: number, by = 60, tilt = 0): React.CSSProperties => { const t = tween(frame, from, 18); return {opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * by}px) rotate(${tilt}deg)`}; };

const StickerEnd: React.FC<{frame: number; soon?: boolean}> = ({frame, soon = true}) => {
  const step = Math.min(SCREENS.length - 1, Math.max(0, Math.floor((frame - WHEEL_AT) / FPS)));
  // The wheel's turn so far, in screens: each step starts with a half-second move to the next one.
  const turned = step === 0 ? 0 : step - 1 + tween(frame, WHEEL_AT + step * FPS, 16);
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`, overflow: 'hidden', color: C.ink, zIndex: 10}}>
    <Sun left={-240} top={980} size={820} frame={frame} />

    <div style={{position: 'absolute', left: 60, top: 226, width: 960, display: 'flex', flexDirection: 'column', gap: 2, transform: 'rotate(-3deg)'}}>
      <div style={stamp(frame, 0)}><Outlined text="Want to understand" size={82} fill={C.flame} stroke={16} /></div>
      <div style={stamp(frame, 5)}><Outlined text="Argentine" size={170} fill={C.butter} stroke={22} spacing={-3} /></div>
      <div style={stamp(frame, 9)}><Outlined text="Spanish?" size={170} fill={C.butter} stroke={22} spacing={-3} /></div>
    </div>

    <div style={{position: 'absolute', left: (1080 - PW) / 2, top: 716, width: PW, height: PH, ...rise(frame, BODY_AT, 90)}}>
      {SCREENS.map((file, k) => {
        const p = place((((k - turned) % 4) + 4) % 4);
        return <div key={file} style={{position: 'absolute', inset: 0, boxSizing: 'border-box', borderRadius: 48, overflow: 'hidden', background: C.card, ...STICKER,
          transform: `translateX(${p.x}px) scale(${p.scale}) rotate(${p.rot}deg)`, opacity: p.opacity, zIndex: Math.round(p.scale * 100)}}>
          <Img src={staticFile(`end/${file}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} />
        </div>;
      })}
    </div>

    <div style={{position: 'absolute', left: 90, top: 1426, width: 900, height: 250, boxSizing: 'border-box', padding: '0 40px', display: 'flex', alignItems: 'center', gap: 34, borderRadius: 48, background: C.card, zIndex: 200, ...STICKER, ...rise(frame, BODY_AT + 6, 70, -1.5)}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 168, height: 168, borderRadius: 38, border: `6px solid ${C.ink}`, boxSizing: 'border-box'}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 32, lineHeight: 1, letterSpacing: 4, textTransform: 'uppercase', color: C.ink, opacity: 0.75}}>Learn more in</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 108, lineHeight: 0.92, color: C.rosa}}>Posta</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 1, whiteSpace: 'nowrap'}}>Learn Argentine Spanish</div>
      </div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 1722, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, zIndex: 201, ...rise(frame, BODY_AT + 12, 50)}}>
      {soon ? <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, lineHeight: 1.05, textTransform: 'uppercase', textAlign: 'center', padding: '14px 22px', borderRadius: 24, background: C.butter, border: `5px solid ${C.ink}`, boxShadow: `6px 7px 0 ${C.ink}`, transform: 'rotate(-4deg)'}}>Coming<br />soon to</div> : null}
      {[['badge-app-store.svg', 263], ['badge-google-play.png', 295]].map(([file, w]) => <Img key={file} src={staticFile(`end/${file}`)}
        style={{height: 88, width: w as number, borderRadius: 14, boxShadow: `6px 7px 0 ${C.ink}`}} />)}
    </div>
  </AbsoluteFill>;
};

export const CelebReel: React.FC<{reel: Celeb}> = ({reel}) => {
  const frame = useCurrentFrame();
  const t = celebTimeline(reel);
  const line = reel.lines.findIndex((_, i) => frame >= t.starts[i] && frame < t.starts[i] + t.lines[i]);
  const inReplay = frame >= t.replayAt && frame < t.endAt;
  // The moment in the clip that the subtitle part is showing.
  const clipTime = reel.replay[0] + (frame - t.replayAt) / FPS;
  const sub = inReplay ? reel.subs.find(s => clipTime >= s[0] && clipTime < s[1]) : undefined;
  const photo = tween(frame, 4, 16);

  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`, overflow: 'hidden', color: C.ink}}>
    <Sun left={560} top={1240} size={820} frame={frame} />

    <div style={{position: 'absolute', left: 60, top: 124, display: 'flex', alignItems: 'center', gap: 16}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 60, height: 60, borderRadius: 16}} />
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, lineHeight: 1, color: C.ink}}>Posta</div>
    </div>

    {frame < t.full && <Headline frame={frame} small="Can you understand" big={`${reel.who}?`} />}
    {line >= 0 && <Headline frame={frame - t.starts[0]} small="Again," big="slowly." />}
    {inReplay && <Headline frame={frame - t.replayAt} small="Now you" big="get it." />}

    {/* the clip, as a photo taped to the page */}
    <div style={{position: 'absolute', left: 80, top: 560, width: 920, height: 600, boxSizing: 'border-box', border: `16px solid ${C.card}`, borderRadius: 40, overflow: 'hidden', background: '#1E1612', boxShadow: `12px 14px 0 ${C.ink}`,
      transform: `rotate(${2 + (1 - photo) * 5}deg) scale(${0.92 + 0.08 * photo})`, opacity: Math.min(1, photo * 2)}}>
      <Sequence durationInFrames={t.full} layout="none"><Clip src={reel.source} from={reel.full[0]} /></Sequence>
      {reel.lines.map((l, i) => <Sequence key={i} from={t.starts[i]} durationInFrames={t.lines[i]} layout="none"><Clip src={reel.source} from={l.from} rate={SLOW} /></Sequence>)}
      <Sequence from={t.replayAt} durationInFrames={t.replay} layout="none"><Clip src={reel.source} from={reel.replay[0]} /></Sequence>
    </div>
    <div style={{position: 'absolute', left: 440, top: 528, width: 200, height: 64, background: C.butter, opacity: 0.92 * photo, transform: 'rotate(-4deg)', boxShadow: '0 6px 10px -4px rgba(58,42,32,0.5)'}} />

    {frame < t.full && <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '30px 44px', borderRadius: 999, background: C.rosa, color: '#fff', ...STICKER, ...slap(frame, 14, -2)}}>No subtitles. Just listen.</div>
    </div>}

    {line >= 0 && (() => { const l = reel.lines[line], lf = frame - t.starts[line], n = t.lines[line];
      const text = l.es.map(p => typeof p === 'string' ? p : p[0]).join('');
      return <div key={line} style={{position: 'absolute', left: 60, right: 60, top: 1216, display: 'flex', flexDirection: 'column', gap: 34}}>
        <div style={{alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 40px 26px', borderRadius: 36, background: C.card, ...STICKER, ...slap(lf, 4, -1.5)}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: fit(text, 100, 850, 0.5), lineHeight: 1, letterSpacing: -2, whiteSpace: 'nowrap'}}>
            {l.es.map((part, k) => typeof part === 'string' ? <span key={k}>{part}</span> : <span key={k} style={{color: C.rosa}}>{part[0]}</span>)}</div>
          <div style={{fontFamily: BODY, fontWeight: 700, fontSize: fit(l.en, 40, 850, 0.5), lineHeight: 1, color: C.ink, opacity: 0.8, whiteSpace: 'nowrap'}}>{l.en}</div>
        </div>
        <div style={{display: 'flex', gap: 36, padding: '0 10px'}}>
          {l.words.map((w, k) => <WordSticker key={k} frame={lf} at={Math.round(n * (0.22 + 0.3 * k))} tone={k === 0 ? C.butter : C.sage} tilt={k === 0 ? -2 : 2} {...w} />)}
        </div>
      </div>; })()}

    {sub && <div style={{position: 'absolute', left: 60, right: 60, top: 1230, display: 'flex', justifyContent: 'center'}}>
      <div key={sub[2]} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '34px 44px', borderRadius: 40, background: C.card, textAlign: 'center', ...STICKER, ...slap(f(clipTime - sub[0]), 0, -1.5)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 80, lineHeight: 1.02, letterSpacing: -1, color: C.ink, textWrap: 'balance'} as React.CSSProperties}>{sub[2]}</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 42, lineHeight: 1.1, color: C.ink, opacity: 0.8}}>{sub[3]}</div>
      </div>
    </div>}

    {frame >= t.endAt && <StickerEnd frame={frame - t.endAt} soon={!reel.live} />}
  </AbsoluteFill>;
};
