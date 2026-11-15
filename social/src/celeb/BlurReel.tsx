// The "no design" reel (design 8 in the Posta Reels preview): the clip at full width across the
// middle over a blurred, darkened copy of itself, plain white type with a shadow, the word being
// said in bold and underlined, and the host standing in the clip's lower-right corner while she
// talks. Same parts and timing as CelebReel.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Celeb, Clip, FPS, Host, Line, SLOW, Still, celebTimeline, f, fit, tween} from './CelebReel';
import {Puppet, Rig, blink} from '../versus/Puppet';
import MOUTHS from './pancho-mouths.json';

const FONT = 'Figtree, "Helvetica Neue", sans-serif';
const SHADOW = '0 2px 3px rgba(0,0,0,0.85), 0 0 22px rgba(0,0,0,0.6)';
const HOOK: [string, string, string] = ['Only 1% of Spanish learners', 'can understand this...', 'can you?'];
// TikTok covers about the top 250 px, the bottom 480 px and the right 140 px, and crops the sides a little,
// so everything sits between x 96..940 and y 250..1440.
const BAND = {top: 408, height: 692};
const SAFE_L = 96;
const HOST_BOX = {left: 430, top: BAND.top + BAND.height - 440, width: 480, show: 440};
const BODY_AT = 24;

// A reel can carry its own layout (designed in the "Pancho en los Reels" artifact); anything it leaves out keeps the numbers above.
type PBox = {left: number; top: number; width: number; show: number};
type PSet = {box: PBox; look?: 'white' | 'shadow' | 'none'; exit?: 'drop' | 'stay'};
type Cap = {left: number; top: number; width: number; size: number; en: number; gap: number; notes?: boolean};
export type BlurLayout = {band?: {top: number; height: number}; hook?: {text: string; left: number; top: number; size: number; weight?: number}[];
  titleTop?: number; cap?: Cap; pancho?: {intro?: PSet; hold?: PSet; end?: PSet}};

const COVER: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};
const CONTAIN: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'contain'};
const fade = (frame: number, from = 0): React.CSSProperties => ({opacity: tween(frame, from, 8)});

/** Every moment of the clip, in order: plain, each line slowly, the waits while the host talks, the last play. */
const Footage: React.FC<{reel: Celeb; muted?: boolean; style: React.CSSProperties}> = ({reel, muted, style}) => {
  const t = celebTimeline(reel);
  return <>
    <Sequence durationInFrames={t.full} layout="none"><Clip src={reel.source} from={reel.full[0]} muted={muted} style={style} /></Sequence>
    {t.intro > 0 && <Sequence from={t.full} durationInFrames={t.intro} layout="none"><Still src={reel.source} at={reel.full[1]} style={style} /></Sequence>}
    {reel.lines.map((l, i) => <React.Fragment key={i}>
      <Sequence from={t.starts[i]} durationInFrames={t.lines[i]} layout="none"><Clip src={reel.source} from={l.from} rate={SLOW} muted={muted} style={style} /></Sequence>
      {t.holds[i] > 0 && <Sequence from={t.starts[i] + t.lines[i]} durationInFrames={t.holds[i]} layout="none"><Still src={reel.source} at={l.to} style={style} /></Sequence>}
    </React.Fragment>)}
    {t.again > 0 && <Sequence from={t.againAt} durationInFrames={t.again} layout="none"><Clip src={reel.source} from={reel.again.from} muted={muted} style={style} /></Sequence>}
  </>;
};

// Pancho in his Argentina shirt, standing where the host stands: he rises in, talks over her voice with the
// versus mouths, sways and blinks, and drops out again. His lip-sync follows her words (pancho-mouths.mjs).
// pancho/ar-arm is versus/ar with the elbow the original drawing cut off at its right edge redrawn (Gemini, 2026-11-05): 89 px wider.
const PANCHO_RIG: Rig = {size: [632, 1069], eye: [357, 121, 27, 23], fur: '#C0804E'};
const BODY_W = 543; // box widths are the body's width, as in the artifact; the elbow sticks out past it
type Box = {left: number; top: number; width: number; show: number};
const LOOK = {shadow: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))', none: 'none',
  white: 'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 8px 14px rgba(0,0,0,0.35))'};
const PAD = 12; // room around him for the white outline, which the box would otherwise cut
const Pancho: React.FC<{src: string; from: number; frames: number; box: Box; look?: keyof typeof LOOK; stay?: boolean}> = ({src, from, frames, box, look = 'shadow', stay}) => {
  const frame = useCurrentFrame();
  const up = tween(frame, 0, 10) * (stay ? 1 : 1 - tween(frame, frames - 7, 7));
  const mouths = (MOUTHS as Record<string, string>)[src.replace('celeb/', '')] ?? (MOUTHS as Record<string, string>)[src] ?? '';
  const mouth = mouths[f(from) + frame] ?? 'c';
  const lean = 5 * Math.sin(frame / 38) + 2.5 * Math.sin(frame / 17) - (mouth === 'c' ? 0 : 4);
  return <div style={{position: 'absolute', left: box.left - PAD, top: box.top - PAD, width: Math.ceil(box.width * PANCHO_RIG.size[0] / BODY_W) + 2 * PAD, height: box.show + PAD, overflow: 'hidden'}}>
    <Sequence durationInFrames={frames} layout="none"><Audio src={staticFile(src)} startFrom={f(from)} /></Sequence>
    <div style={{position: 'absolute', left: PAD, top: PAD + Math.round((1 - up) * (box.show + PAD)), filter: LOOK[look]}}>
      <Puppet id={`pancho-${from}`} sprite="ar-arm/ar" rig={PANCHO_RIG} height={box.width * 1069 / BODY_W} mouth={mouth} lean={lean} lid={blink(frame, 1)} wave={0} />
    </div>
  </div>;
};
const Speaker: React.FC<{reel: Celeb; src: string; from: number; frames: number; box: Box; look?: keyof typeof LOOK; stay?: boolean}> = ({reel, look, stay, ...p}) =>
  reel.pancho ? <Pancho {...p} look={look} stay={stay} /> : <Host {...p} outline="#fff" />;

// The line in plain white. The word being said at `clipTime` is bold and underlined; every
// word has the same space for the underline, so nothing moves when it changes.
const Caption: React.FC<{frame: number; line: Line; clipTime: number; top: number; notes?: number; cap?: Cap}> = ({frame, line, clipTime, top, notes = 0, cap}) => {
  const text = line.es.map(p => typeof p === 'string' ? p : p[0]).join('');
  const said = line.say?.find(([from, to], i, all) => clipTime >= from - 0.03 && clipTime < Math.min(to + 0.12, all[i + 1]?.[0] ?? Infinity));
  const size = cap ? cap.size : text.length > 26 ? fit(text, 80, 1500, 0.52) : fit(text, 80, 760, 0.52);
  if (cap && cap.notes === false) notes = 0;
  let n = -1;
  return <div style={{position: 'absolute', left: cap?.left ?? SAFE_L, width: cap?.width ?? 840, top: cap?.top ?? top, display: 'flex', flexDirection: 'column', gap: cap?.gap ?? 12, color: '#fff', textShadow: SHADOW, ...fade(frame)}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.12, whiteSpace: 'pre-line', textWrap: 'balance'} as React.CSSProperties}>
      {/* punctuation stays on its word's line: each chunk between spaces never breaks */}
      {text.split(/(\s+)/).filter(Boolean).map((chunk, c) => /^\s+$/.test(chunk) ? chunk : <span key={c} style={{whiteSpace: 'nowrap'}}>
        {chunk.split(/([\p{L}\p{N}’']+)/u).filter(Boolean).map((piece, k) => {
          if (!/[\p{L}\p{N}]/u.test(piece)) return <span key={k}>{piece}</span>;
          n += 1; const on = said?.[2] === n;
          return <span key={k} style={{display: 'inline-block', fontWeight: on ? 800 : 700, opacity: on ? 1 : 0.82, borderBottom: `8px solid ${on ? '#fff' : 'transparent'}`, lineHeight: 1.04}}>{piece}</span>;
        })}
      </span>)}
    </div>
    <div style={{fontFamily: FONT, fontWeight: 600, fontSize: cap ? cap.en : fit(line.en, 42, 760, 0.5), lineHeight: 1.1}}>{line.en}</div>
    {notes > 0 && <div style={{display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, fontFamily: FONT, fontSize: 32, lineHeight: 1.15}}>
      {line.words.map((w, k) => <div key={k} style={{opacity: tween(frame, Math.round(notes * (0.22 + 0.3 * k)), 8)}}>
        <b style={{fontWeight: 800}}>{w.word}</b> · {w.means} <span style={{opacity: 0.8, fontSize: 27}}>({w.note})</span></div>)}
    </div>}
  </div>;
};

const Title: React.FC<{frame: number; text: string; top?: number}> = ({frame, text, top = 270}) =>
  <div style={{position: 'absolute', left: SAFE_L, top, right: 140, fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1, color: '#fff', textShadow: SHADOW, ...fade(frame)}}>{text}</div>;

// The ending: the clip's last moment blurred and dark behind the question, a frosted card with
// the app, the store badges, and the host standing under them to say her closing line.
const GLASS: React.CSSProperties = {background: 'rgba(255,255,255,0.14)', border: '2px solid rgba(255,255,255,0.38)', backdropFilter: 'blur(26px)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)'};
const rise = (frame: number, from: number, by = 50): React.CSSProperties => { const t = tween(frame, from, 18); return {opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * by}px)`}; };
const End: React.FC<{frame: number; reel: Celeb}> = ({frame, reel}) => {
  const outro = reel.host?.outro;
  const pop = tween(frame, BODY_AT, 16);
  return <AbsoluteFill style={{background: '#000', color: '#fff', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -200, top: -100, width: 1480, height: 2120, filter: 'blur(46px) brightness(0.42) saturate(1.15)'}}><Still src={reel.source} at={reel.again.to} style={COVER} /></div>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 40%, rgba(0,0,0,0.55))'}} />

    <div style={{position: 'absolute', left: SAFE_L, top: 250, width: 880, fontFamily: FONT, color: '#fff', textShadow: SHADOW}}>
      <div style={{fontWeight: 600, fontSize: 64, lineHeight: 1.1, whiteSpace: 'nowrap', opacity: 0.92, ...rise(frame, 0, 30)}}>Want to understand</div>
      <div style={{fontWeight: 800, fontSize: 150, lineHeight: 1.02, letterSpacing: -4, whiteSpace: 'nowrap', ...rise(frame, 5, 40)}}>Argentinian</div>
      <div style={{fontWeight: 800, fontSize: 172, lineHeight: 1.02, letterSpacing: -5, whiteSpace: 'nowrap', ...rise(frame, 10, 50)}}>Spanish?</div>
    </div>

    <div style={{position: 'absolute', left: SAFE_L, top: 668, width: 840, height: 220, padding: '0 44px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 36, borderRadius: 60, fontFamily: FONT, ...GLASS,
      opacity: Math.min(1, pop * 1.6), transform: `translateY(${(1 - pop) * 60}px)`}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 176, height: 176, borderRadius: 42, boxShadow: '0 12px 28px rgba(0,0,0,0.4)', transform: `scale(${0.8 + 0.2 * tween(frame, BODY_AT + 4, 14)}) rotate(${(1 - tween(frame, BODY_AT + 4, 14)) * -8}deg)`}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 6, textShadow: SHADOW}}>
        <div style={{fontWeight: 700, fontSize: 32, letterSpacing: 5, textTransform: 'uppercase', opacity: 0.85}}>Learn more in</div>
        <div style={{fontWeight: 800, fontSize: 124, lineHeight: 0.95, letterSpacing: -2}}>Posta</div>
      </div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 905, display: 'flex', justifyContent: 'center', paddingRight: 100, alignItems: 'center', gap: 22, fontFamily: FONT, ...rise(frame, BODY_AT + 12, 40)}}>
      {[['badge-app-store.svg', 263], ['badge-google-play.png', 295]].map(([file, w]) => <Img key={file} src={staticFile(`end/${file}`)} style={{height: 88, width: w as number, borderRadius: 14, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}} />)}
    </div>
    {outro && (() => { const p = (reel.layout as BlurLayout | undefined)?.pancho?.end;
      return <Sequence from={8} layout="none"><Speaker reel={reel} src={outro.video} from={outro.from} frames={f(outro.to - outro.from) + 12}
        box={p?.box ?? {left: 240, top: 1005, width: 480, show: 390}} look={p?.look} stay={p ? p.exit === 'stay' : false} /></Sequence>; })()}
  </AbsoluteFill>;
};

export const BlurReel: React.FC<{reel: Celeb}> = ({reel}) => {
  const frame = useCurrentFrame();
  const t = celebTimeline(reel);
  const line = reel.lines.findIndex((_, i) => frame >= t.starts[i] && frame < t.starts[i] + t.lines[i] + t.holds[i]);
  const inAgain = frame >= t.againAt && frame < t.endAt;
  const hook = reel.hook ?? HOOK;
  const L: BlurLayout = reel.layout ?? {};
  const band = L.band ?? BAND, titleTop = L.titleTop ?? 270, capTop = band.top + band.height + 20;
  const pIntro = L.pancho?.intro, pHold = L.pancho?.hold;

  return <AbsoluteFill style={{background: '#000', overflow: 'hidden', color: '#fff'}}>
    {/* the clip twice: blurred and dark to fill the screen, then whole across the middle */}
    <div style={{position: 'absolute', left: -200, top: -100, width: 1480, height: 2120, filter: 'blur(38px) brightness(0.5)'}}><Footage reel={reel} muted style={COVER} /></div>
    <div style={{position: 'absolute', left: 0, top: band.top, width: 1080, height: band.height, overflow: 'hidden'}}><Footage reel={reel} style={CONTAIN} /></div>

    {frame < t.full && <div style={{fontFamily: FONT, fontWeight: 800, color: '#fff', textShadow: SHADOW, whiteSpace: 'nowrap', ...fade(frame)}}>
      {/* the first frame, laid out in the First Frame Editor (or the reel's own layout) */}
      {L.hook ? L.hook.map((h, i) => <div key={i} style={{position: 'absolute', left: h.left, top: h.top, fontSize: h.size, fontWeight: h.weight ?? 800, lineHeight: 1.04}}>{h.text}</div>) : <>
      <div style={{position: 'absolute', left: SAFE_L, top: 245, fontSize: 64, lineHeight: 1.04}}>{hook[0]}</div>
      <div style={{position: 'absolute', left: SAFE_L, top: 335, fontSize: 56, lineHeight: 1.04}}>{hook[1]}</div>
      <div style={{position: 'absolute', left: SAFE_L, top: 1150, fontSize: 130, lineHeight: 1.04}}>{hook[2]}</div></>}
    </div>}

    {t.intro > 0 && frame >= t.full && frame < t.full + t.intro && <Title frame={frame - t.full} text="Did you catch that?" top={titleTop} />}
    {line >= 0 && <Title frame={frame - t.starts[0]} text="Again, slowly." top={titleTop} />}
    {inAgain && <Title frame={frame - t.againAt} text="Now you hear it." top={titleTop} />}

    {line >= 0 && (() => { const l = reel.lines[line], lf = frame - t.starts[line];
      return <Caption key={line} frame={lf} line={l} clipTime={Math.min(l.to, l.from + lf / FPS * SLOW)} top={capTop} notes={reel.short ? 0 : t.lines[line]} cap={L.cap} />; })()}
    {inAgain && <Caption frame={frame - t.againAt} line={reel.lines[reel.again.line]} clipTime={reel.again.from + (frame - t.againAt) / FPS} top={capTop} cap={L.cap} />}

    {/* the host, while the clip waits */}
    {reel.host && t.intro > 0 && <Sequence from={t.full} durationInFrames={t.intro} layout="none"><Speaker reel={reel} src={(reel.host.videos?.intro ?? reel.host.video)!} from={reel.host.intro[0]} frames={t.intro} box={pIntro?.box ?? HOST_BOX} look={pIntro?.look} stay={pIntro?.exit === 'stay'} /></Sequence>}
    {reel.host && !reel.short && reel.lines.map((_, i) => <Sequence key={i} from={t.starts[i] + t.lines[i]} durationInFrames={t.holds[i]} layout="none">
      <Speaker reel={reel} src={(reel.host!.videos?.lines[i] ?? reel.host!.video)!} from={reel.host!.lines[i][0]} frames={t.holds[i]} box={pHold?.box ?? HOST_BOX} look={pHold?.look} stay={pHold?.exit === 'stay'} /></Sequence>)}

    {frame >= t.endAt && <Sequence from={t.endAt} layout="none"><End frame={frame - t.endAt} reel={reel} /></Sequence>}
  </AbsoluteFill>;
};
