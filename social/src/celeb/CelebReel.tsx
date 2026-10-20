// A "Can you understand …?" reel, in the sticker look: outlined slanted headline, the clip
// as a taped photo, the words as hard-shadow stickers. Three parts and the ending:
//   1. the clip, plain            2. each line again at half speed, its words explained,
//   3. the key line once more,       each word lit as it is said
//      at full speed              4. the app (StickerEnd)
import React, {useCallback, useRef} from 'react';
import {AbsoluteFill, Easing, Freeze, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const SLOW = 0.5;
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
export const tween = (frame: number, from: number, dur = 12) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});
// Stickers are slapped on: a short scale-up from just under full size, at their own tilt.
const slap = (frame: number, from: number, tilt = 0): React.CSSProperties => { const t = tween(frame, from); return {opacity: Math.min(1, t * 2), transform: `rotate(${tilt}deg) scale(${0.9 + 0.1 * t})`}; };
export const f = (seconds: number) => Math.round(seconds * FPS);
// The largest type size, up to `max`, at which `text` stays on one line of `width`.
export const fit = (text: string, max: number, width: number, perChar = 0.56) => Math.min(max, Math.floor(width / (text.length * perChar)));

// `say` is when each word is spoken: [start, end, the word's number in the line], in clip seconds.
export type Line = {from: number; to: number; es: (string | string[])[]; en: string; say?: number[][]; words: {word: string; means: string; note: string}[]};
export type Celeb = {id: string; who: string; source: string; full: number[]; lines: Line[]; again: {line: number; from: number; to: number}; live?: boolean; day?: number;
  // A person reacting, filmed on a green screen: she peeks into the photo after the plain play
  // (`intro`) and after each slow line (`lines`), while the clip waits. Times are seconds in her video.
  host?: {video?: string; intro: number[]; lines: number[][]; outro?: {video: string; from: number; to: number};
    // One clip per piece: with `videos`, each piece plays from its own file (times start at 0 in each).
    videos?: {intro: string; lines: string[]}};
  // 'captions' is the creator-captions look (CaptionsReel); without it, the sticker look.
  look?: string};

/** Where each part starts and how long it runs, in frames. */
export const celebTimeline = (reel: Celeb) => {
  const full = f(reel.full[1] - reel.full[0]);
  const lines = reel.lines.map(l => f((l.to - l.from) / SLOW));
  // With a host the clip waits after the plain play and after each line while she talks.
  const intro = reel.host ? f(reel.host.intro[1] - reel.host.intro[0]) : 0;
  const holds = reel.lines.map((_, i) => reel.host ? f(reel.host.lines[i][1] - reel.host.lines[i][0]) : 0);
  const starts: number[] = []; let at = full + intro;
  lines.forEach((n, i) => { starts.push(at); at += n + holds[i]; });
  const againAt = at, again = f(reel.again.to - reel.again.from);
  const endAt = againAt + again;
  return {full, intro, lines, holds, starts, againAt, again, endAt, end: endFrames(reel), total: endAt + endFrames(reel)};
};

export const Clip: React.FC<{src: string; from: number; rate?: number; muted?: boolean; style?: React.CSSProperties}> = ({src, from, rate = 1, muted, style}) =>
  <OffthreadVideo muted={muted} src={staticFile(src)} startFrom={f(from)} playbackRate={rate} style={style ?? {width: '100%', height: '100%', objectFit: 'cover'}} />;

// The clip stopped on one moment, silent, while the host talks.
export const Still: React.FC<{src: string; at: number; style?: React.CSSProperties}> = ({src, at, style}) =>
  <Freeze frame={0}><OffthreadVideo muted src={staticFile(src)} startFrom={f(at)} style={style ?? {width: '100%', height: '100%', objectFit: 'cover'}} /></Freeze>;

// The host, cut out of her green screen and standing in the bottom-left corner of the photo.
// She rises into the frame, talks, and drops out again. Her video carries her voice.
// `box` is where she stands and how much of her shows: left, top or bottom, width, and the height that is visible.
export const Host: React.FC<{src: string; from: number; frames: number; box?: {left: number; top?: number; bottom?: number; width: number; show: number}; outline?: string}> = ({src, from, frames, box = {left: 6, bottom: 0, width: 440, show: 440}, outline = C.card}) => {
  const HOST_W = box.width, HOST_H = Math.round(HOST_W * 16 / 9);
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const onVideoFrame = useCallback((image: CanvasImageSource) => {
    const c = canvas.current, ctx = c?.getContext('2d', {willReadFrequently: true});
    if (!c || !ctx) return;
    ctx.drawImage(image, 0, 0, c.width, c.height);
    const shot = ctx.getImageData(0, 0, c.width, c.height), p = shot.data;
    // How many times greener a pixel is than it is red or blue decides how see-through it is
    // (a ratio, because the generated video's green is pale and uneven); what is kept loses its green cast.
    for (let i = 0; i < p.length; i += 4) {
      const most = Math.max(p[i], p[i + 2]), green = p[i + 1] / (most + 1);
      if (green <= 1.08 || p[i + 1] < 36) continue;
      p[i + 3] = green >= 1.2 ? 0 : Math.round(255 * (1.2 - green) / 0.12);
      p[i + 1] = most;
    }
    ctx.putImageData(shot, 0, 0);
  }, []);
  const up = tween(frame, 0, 10) * (1 - tween(frame, frames - 7, 7));
  return <div style={{position: 'absolute', left: box.left, top: box.top, bottom: box.bottom, width: HOST_W, height: box.show, overflow: 'hidden'}}>
    <OffthreadVideo src={staticFile(src)} startFrom={f(from)} onVideoFrame={onVideoFrame} style={{position: 'absolute', width: 2, height: 2, opacity: 0}} />
    <canvas ref={canvas} width={540} height={960} style={{position: 'absolute', left: 0, top: -Math.round(HOST_H * 0.17), width: HOST_W, height: HOST_H,
      transform: `translateY(${(1 - up) * (box.show + 20)}px)`, filter: `drop-shadow(4px 0 0 ${outline}) drop-shadow(-4px 0 0 ${outline}) drop-shadow(0 -4px 0 ${outline})`}} />
  </div>;
};

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
const Headline: React.FC<{frame: number; small: string; big: string; big2?: string}> = ({frame, small, big, big2}) => {
  // Three lines (the series title) sit a little higher and smaller so they stay above the photo.
  const bigSize = big2 ? Math.min(fit(big, 112, 940, 0.6), fit(big2, 112, 940, 0.6)) : fit(big, 210, 940, 0.6);
  return <div style={{position: 'absolute', left: 60, top: big2 ? 192 : 226, width: 960, display: 'flex', flexDirection: 'column', gap: big2 ? 0 : 4, transform: 'rotate(-3deg)'}}>
    <div style={stamp(frame, 0)}><Outlined text={small} size={fit(small, big2 ? 96 : 88, 940)} fill={C.flame} stroke={big2 ? 14 : 16} /></div>
    <div style={stamp(frame, 5)}><Outlined text={big} size={bigSize} fill={C.butter} stroke={big2 ? 18 : 22} spacing={-4} /></div>
    {big2 && <div style={stamp(frame, 9)}><Outlined text={big2} size={bigSize} fill={C.butter} stroke={18} spacing={-4} /></div>}
  </div>;
};

const WordSticker: React.FC<{frame: number; at: number; tone: string; tilt: number; word: string; means: string; note: string}> = ({frame, at, tone, tilt, word, means, note}) =>
  <div style={{flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '26px 16px 28px', borderRadius: 40, background: tone, ...STICKER, ...slap(frame, at, tilt)}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>{word}</div>
    <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>{means}</div>
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: fit(note, 30, 400, 0.5), lineHeight: 1, color: C.ink, opacity: 0.8, whiteSpace: 'nowrap'}}>{note}</div>
  </div>;

// A line's Spanish and English on one sticker. The word being said at `clipTime` sits on a
// butter marker; a line that repeats lights its words again each time.
const LineCard: React.FC<{frame: number; line: Line; clipTime: number}> = ({frame, line, clipTime}) => {
  const text = line.es.map(p => typeof p === 'string' ? p : p[0]).join('');
  const said = line.say?.find(([from, to], i, all) => clipTime >= from - 0.03 && clipTime < Math.min(to + 0.12, all[i + 1]?.[0] ?? Infinity));
  let n = -1;
  // A long line takes two rows, sized as if it were half as long.
  const long = text.length > 26;
  return <div style={{alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 40px 26px', borderRadius: 36, background: C.card, ...STICKER, ...slap(frame, 4, -1.5)}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: long ? fit(text, 100, 1800, 0.5) : fit(text, 100, 850, 0.5), lineHeight: 1.06, letterSpacing: -2, whiteSpace: long ? 'pre-wrap' : 'pre', maxWidth: 860, textAlign: 'center', textWrap: 'balance'} as React.CSSProperties}>
      {line.es.flatMap((part, k) => (typeof part === 'string' ? part : part[0]).split(/([\p{L}\p{N}’']+)/u).filter(Boolean).map((piece, j) => {
        const color = typeof part === 'string' ? undefined : C.rosa;
        if (!/[\p{L}\p{N}]/u.test(piece)) return <span key={`${k}-${j}`} style={{color}}>{piece}</span>;
        n += 1; const on = said?.[2] === n;
        return <span key={`${k}-${j}`} style={{display: 'inline-block', color, borderRadius: 14, background: on ? C.butter : 'transparent', boxShadow: on ? `0 0 0 8px ${C.butter}` : 'none', transform: `scale(${on ? 1.06 : 1})`}}>{piece}</span>;
      }))}</div>
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: fit(line.en, 40, 850, 0.5), lineHeight: 1, color: C.ink, opacity: 0.8, whiteSpace: 'nowrap'}}>{line.en}</div>
  </div>;
};

// The sun from the Argentinian flag, as a pale mark in the background: a disc with sixteen straight
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

// The ending, in the same sticker look: the question, then the app's name and the stores under
// it. Everything is on screen within two seconds and holds.
// `soon` shows "Coming soon to" on the store badges; pass false once the app is on the stores.
const BODY_AT = 30; // when the name and the stores start coming in, a second after the question
const STICKER_END = BODY_AT + 75;
const OUTRO_AT = 8; // when the host starts her closing line, just after the question lands
// The ending lasts as long as her closing line when she has one.
const endFrames = (reel: Celeb) => reel.host?.outro ? Math.max(STICKER_END, OUTRO_AT + f(reel.host.outro.to - reel.host.outro.from) + 12) : STICKER_END;
const rise = (frame: number, from: number, by = 60, tilt = 0): React.CSSProperties => { const t = tween(frame, from, 18); return {opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * by}px) rotate(${tilt}deg)`}; };

// With a host, everything sits higher and she stands under the badges, saying her closing line.
export const StickerEnd: React.FC<{frame: number; soon?: boolean; outro?: {video: string; from: number; to: number}}> = ({frame, soon = true, outro}) => {
  const up = outro ? 150 : 0;
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`, overflow: 'hidden', color: C.ink, zIndex: 10}}>
    <Sun left={-240} top={1180} size={820} frame={frame} />

    <div style={{position: 'absolute', left: 60, top: 420 - up, width: 960, display: 'flex', flexDirection: 'column', gap: 2, transform: 'rotate(-3deg)'}}>
      <div style={stamp(frame, 0)}><Outlined text="Want to understand" size={82} fill={C.flame} stroke={16} /></div>
      <div style={stamp(frame, 5)}><Outlined text="Argentinian" size={140} fill={C.butter} stroke={22} spacing={-3} /></div>
      <div style={stamp(frame, 9)}><Outlined text="Spanish?" size={170} fill={C.butter} stroke={22} spacing={-3} /></div>
    </div>

    <div style={{position: 'absolute', left: 90, top: 1010 - up, width: 900, height: 250, boxSizing: 'border-box', padding: '0 40px', display: 'flex', alignItems: 'center', gap: 34, borderRadius: 48, background: C.card, zIndex: 200, ...STICKER, ...rise(frame, BODY_AT + 6, 70, -1.5)}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 168, height: 168, borderRadius: 38, border: `6px solid ${C.ink}`, boxSizing: 'border-box'}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 32, lineHeight: 1, letterSpacing: 4, textTransform: 'uppercase', color: C.ink, opacity: 0.75}}>Learn more in</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 108, lineHeight: 0.92, color: C.rosa}}>Posta</div>
        {/* TODO: the app is "Posta: Argentinian Spanish" since 2026-10-15. Update this line and re-render when the user says so. */}
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 1, whiteSpace: 'nowrap'}}>Learn Argentinian Spanish</div>
      </div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 1330 - up, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, zIndex: 201, ...rise(frame, BODY_AT + 12, 50)}}>
      {soon ? <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, lineHeight: 1.05, textTransform: 'uppercase', textAlign: 'center', padding: '14px 22px', borderRadius: 24, background: C.butter, border: `5px solid ${C.ink}`, boxShadow: `6px 7px 0 ${C.ink}`, transform: 'rotate(-4deg)'}}>Coming<br />soon to</div> : null}
      {[['badge-app-store.svg', 263], ['badge-google-play.png', 295]].map(([file, w]) => <Img key={file} src={staticFile(`end/${file}`)}
        style={{height: 88, width: w as number, borderRadius: 14, boxShadow: `6px 7px 0 ${C.ink}`}} />)}
    </div>
    {outro && <Sequence from={OUTRO_AT} layout="none"><Host src={outro.video} from={outro.from} frames={f(outro.to - outro.from) + 12} box={{left: 250, top: 1300, width: 580, show: 620}} /></Sequence>}
  </AbsoluteFill>;
};

export const CelebReel: React.FC<{reel: Celeb}> = ({reel}) => {
  const frame = useCurrentFrame();
  const t = celebTimeline(reel);
  const line = reel.lines.findIndex((_, i) => frame >= t.starts[i] && frame < t.starts[i] + t.lines[i] + t.holds[i]);
  const inAgain = frame >= t.againAt && frame < t.endAt;
  const photo = tween(frame, 4, 16);

  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`, overflow: 'hidden', color: C.ink}}>
    <Sun left={560} top={1240} size={820} frame={frame} />

    <div style={{position: 'absolute', left: 60, top: 124, display: 'flex', alignItems: 'center', gap: 16}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 60, height: 60, borderRadius: 16}} />
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, lineHeight: 1, color: C.ink}}>Posta</div>
    </div>

    {frame < t.full + t.intro && (reel.day
      ? <Headline frame={frame} small={`Day ${reel.day} of`} big="Understanding" big2="Argentinians" />
      : <Headline frame={frame} small="Can you understand" big={`${reel.who}?`} />)}
    {line >= 0 && <Headline frame={frame - t.starts[0]} small="Again," big="slowly." />}
    {inAgain && <Headline frame={frame - t.againAt} small="Now you" big="hear it." />}

    {/* the clip, as a photo taped to the page */}
    <div style={{position: 'absolute', left: 80, top: 560, width: 920, height: 600, boxSizing: 'border-box', border: `16px solid ${C.card}`, borderRadius: 40, overflow: 'hidden', background: '#1E1612', boxShadow: `12px 14px 0 ${C.ink}`,
      transform: `rotate(${2 + (1 - photo) * 5}deg) scale(${0.92 + 0.08 * photo})`, opacity: Math.min(1, photo * 2)}}>
      <Sequence durationInFrames={t.full} layout="none"><Clip src={reel.source} from={reel.full[0]} /></Sequence>
      {reel.host && <Sequence from={t.full} durationInFrames={t.intro} layout="none"><Still src={reel.source} at={reel.full[1]} /><Host src={(reel.host.videos?.intro ?? reel.host.video)!} from={reel.host.intro[0]} frames={t.intro} /></Sequence>}
      {reel.host && reel.lines.map((l, i) => <Sequence key={`host-${i}`} from={t.starts[i] + t.lines[i]} durationInFrames={t.holds[i]} layout="none"><Still src={reel.source} at={l.to} /><Host src={(reel.host!.videos?.lines[i] ?? reel.host!.video)!} from={reel.host!.lines[i][0]} frames={t.holds[i]} /></Sequence>)}
      <Sequence from={t.againAt} durationInFrames={t.again} layout="none"><Clip src={reel.source} from={reel.again.from} /></Sequence>
      {reel.lines.map((l, i) => <Sequence key={i} from={t.starts[i]} durationInFrames={t.lines[i]} layout="none"><Clip src={reel.source} from={l.from} rate={SLOW} /></Sequence>)}
    </div>
    <div style={{position: 'absolute', left: 440, top: 528, width: 200, height: 64, background: C.butter, opacity: 0.92 * photo, transform: 'rotate(-4deg)', boxShadow: '0 6px 10px -4px rgba(58,42,32,0.5)'}} />

    {frame < t.full + t.intro && <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '30px 44px', borderRadius: 999, background: C.rosa, color: '#fff', ...STICKER, ...slap(frame, 14, -2)}}>No subtitles. Just listen.</div>
    </div>}

    {line >= 0 && (() => { const l = reel.lines[line], lf = frame - t.starts[line], n = t.lines[line];
      return <div key={line} style={{position: 'absolute', left: 60, right: 60, top: 1216, display: 'flex', flexDirection: 'column', gap: 34}}>
        <LineCard frame={lf} line={l} clipTime={Math.min(l.to, l.from + lf / FPS * SLOW)} />
        <div style={{display: 'flex', gap: 36, padding: '0 10px'}}>
          {l.words.map((w, k) => <WordSticker key={k} frame={lf} at={Math.round(n * (0.22 + 0.3 * k))} tone={k === 0 ? C.butter : C.sage} tilt={k === 0 ? -2 : 2} {...w} />)}
        </div>
      </div>; })()}

    {inAgain && <div style={{position: 'absolute', left: 60, right: 60, top: 1250, display: 'flex', flexDirection: 'column'}}>
      <LineCard frame={frame - t.againAt} line={reel.lines[reel.again.line]} clipTime={reel.again.from + (frame - t.againAt) / FPS} />
    </div>}

    {frame >= t.endAt && <Sequence from={t.endAt} layout="none"><StickerEnd frame={frame - t.endAt} soon={!reel.live} outro={reel.host?.outro} /></Sequence>}
  </AbsoluteFill>;
};
