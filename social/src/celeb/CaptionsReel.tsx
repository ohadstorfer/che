// The "Can you understand …?" reel in the creator-captions look, for a reel with a host: the
// clip at full width over a blurred copy of itself, a white title box, big white captions with
// the spoken word in a yellow block, one definition tag at a time, and the host cut out at the
// bottom right while she talks. Same parts and timing as CelebReel, and the same ending.
import React from 'react';
import {AbsoluteFill, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Celeb, Clip, FPS, Host, Line, SLOW, Still, StickerEnd, celebTimeline, f, fit, tween} from './CelebReel';

const FONT = 'Montserrat, "Helvetica Neue", Arial, sans-serif';
const YELLOW = '#FFE600', DARK = '#111111';

if (typeof document !== 'undefined') {
  const wait = delayRender('caption fonts');
  Promise.all([800, 900].map(weight => {
    const face = new FontFace('Montserrat', `url(${staticFile(`fonts/Montserrat_${weight}.ttf`)})`, {weight: String(weight)});
    return face.load().then(l => document.fonts.add(l));
  })).then(() => continueRender(wait), () => continueRender(wait));
}

// A round black outline around white type, made of shadows in a ring: a CSS text stroke
// leaves sharp spikes on letters like A and W.
const outline = (r: number) => ({textShadow: Array.from({length: 24}, (_, k) => `${(Math.cos(k * Math.PI / 12) * r).toFixed(1)}px ${(Math.sin(k * Math.PI / 12) * r).toFixed(1)}px 0 #000`).join(', ')});
const pop = (frame: number, from: number, tilt = 0): React.CSSProperties => { const t = tween(frame, from, 9); return {opacity: frame < from ? 0 : Math.min(1, t * 2), transform: `rotate(${tilt}deg) scale(${0.9 + 0.1 * t})`}; };

const COVER: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};
const BAND = {top: 430, height: 640};
const HOST_BOX = {left: 520, top: 1380, width: 560, show: 540};

/** Every moment of the clip, in order: plain, each line slowly, the waits while the host talks, the last play. */
const Footage: React.FC<{reel: Celeb; muted?: boolean}> = ({reel, muted}) => {
  const t = celebTimeline(reel);
  return <>
    <Sequence durationInFrames={t.full} layout="none"><Clip src={reel.source} from={reel.full[0]} muted={muted} style={COVER} /></Sequence>
    {t.intro > 0 && <Sequence from={t.full} durationInFrames={t.intro} layout="none"><Still src={reel.source} at={reel.full[1]} style={COVER} /></Sequence>}
    {reel.lines.map((l, i) => <React.Fragment key={i}>
      <Sequence from={t.starts[i]} durationInFrames={t.lines[i]} layout="none"><Clip src={reel.source} from={l.from} rate={SLOW} muted={muted} style={COVER} /></Sequence>
      {t.holds[i] > 0 && <Sequence from={t.starts[i] + t.lines[i]} durationInFrames={t.holds[i]} layout="none"><Still src={reel.source} at={l.to} style={COVER} /></Sequence>}
    </React.Fragment>)}
    <Sequence from={t.againAt} durationInFrames={t.again} layout="none"><Clip src={reel.source} from={reel.again.from} muted={muted} style={COVER} /></Sequence>
  </>;
};

// The line in capitals, a word per block. The word being said at `clipTime` is dark on yellow
// and tilted; the others are white with a black outline. Every block has the same padding, so
// nothing moves when the yellow one changes.
const Caption: React.FC<{frame: number; line: Line; clipTime: number}> = ({frame, line, clipTime}) => {
  const text = line.es.map(p => typeof p === 'string' ? p : p[0]).join('');
  const said = line.say?.find(([from, to], i, all) => clipTime >= from - 0.03 && clipTime < Math.min(to + 0.12, all[i + 1]?.[0] ?? Infinity));
  const size = fit(text, 108, 1500, 0.62);
  return <div style={{position: 'absolute', left: 36, top: 1104, width: 1010, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, ...pop(frame, 3)}}>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px 6px', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -2, textTransform: 'uppercase'}}>
      {text.split(' ').map((word, n) => { const on = said?.[2] === n;
        return <div key={n} style={{padding: '8px 16px 12px', borderRadius: 22, whiteSpace: 'nowrap', background: on ? YELLOW : 'transparent', color: on ? DARK : '#fff',
          transform: `rotate(${on ? -3 : 0}deg)`, ...(on ? {} : outline(7))}}>{word}</div>; })}
    </div>
    <div style={{maxWidth: 450, marginLeft: 16, fontFamily: FONT, fontWeight: 800, fontSize: 40, lineHeight: 1.12, color: '#fff', ...outline(5)}}>{line.en}</div>
  </div>;
};

// One word explained: the word on yellow, its meaning and a note on white, tilted like labels
// stuck on. They stay in the left half, clear of the host.
const Tag: React.FC<{frame: number; word: string; means: string; note: string}> = ({frame, word, means, note}) =>
  <div style={{position: 'absolute', left: 50, top: 1560, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, transformOrigin: 'left center', ...pop(frame, 0, -3)}}>
    <div style={{background: YELLOW, color: DARK, fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1, padding: '14px 24px', borderRadius: 18, whiteSpace: 'nowrap'}}>{word}</div>
    <div style={{background: '#fff', color: DARK, fontFamily: FONT, fontWeight: 900, fontSize: fit(means, 50, 400, 0.62), lineHeight: 1, padding: '13px 22px', borderRadius: 16, whiteSpace: 'nowrap'}}>= {means}</div>
    <div style={{background: '#fff', color: DARK, fontFamily: FONT, fontWeight: 800, fontSize: fit(note, 32, 420, 0.58), lineHeight: 1, padding: '11px 18px', borderRadius: 13, whiteSpace: 'nowrap'}}>{note}</div>
  </div>;

export const CaptionsReel: React.FC<{reel: Celeb}> = ({reel}) => {
  const frame = useCurrentFrame();
  const t = celebTimeline(reel);
  const line = reel.lines.findIndex((_, i) => frame >= t.starts[i] && frame < t.starts[i] + t.lines[i] + t.holds[i]);
  const inAgain = frame >= t.againAt && frame < t.endAt;
  const title = line >= 0 ? 'Again, slowly.' : inAgain ? 'Now you hear it.' : `Can you understand ${reel.who}?`;
  const titleAt = line >= 0 ? t.starts[0] : inAgain ? t.againAt : 0;

  return <AbsoluteFill style={{background: DARK, overflow: 'hidden', color: '#fff'}}>
    {/* the clip twice: blurred and dark to fill the screen, then whole across the middle */}
    <div style={{position: 'absolute', left: -200, top: -100, width: 1480, height: 2120, filter: 'blur(38px) brightness(0.5)'}}><Footage reel={reel} muted /></div>
    <div style={{position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', background: '#000'}}><Footage reel={reel} /></div>

    <div style={{position: 'absolute', left: 60, top: 90, display: 'flex', alignItems: 'center', gap: 14}}>
      <Img src={staticFile('posta-icon.png')} style={{width: 52, height: 52, borderRadius: 12}} />
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, lineHeight: 1}}>Posta</div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
      <div key={title} style={{background: '#fff', color: DARK, fontFamily: FONT, fontWeight: 800, fontSize: 50, lineHeight: 1.15, padding: '22px 34px', borderRadius: 22, whiteSpace: 'nowrap', ...pop(frame, titleAt)}}>{title}</div>
    </div>

    {frame < t.full + t.intro && <div style={{position: 'absolute', left: 50, top: 1130, width: 800, fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.04, letterSpacing: -2, textTransform: 'uppercase', ...outline(7), ...pop(frame, 12)}}>
      No subtitles.<br />Just listen.</div>}

    {line >= 0 && (() => { const l = reel.lines[line], lf = frame - t.starts[line], span = t.lines[line] + t.holds[line];
      // The first word's tag comes in as the line gets going; the second takes its place halfway.
      const second = Math.round(span * 0.56), first = Math.round(t.lines[line] * 0.2);
      const k = lf >= second && l.words[1] ? 1 : 0;
      return <React.Fragment key={line}>
        <Caption frame={lf} line={l} clipTime={Math.min(l.to, l.from + lf / FPS * SLOW)} />
        {lf >= first && <Tag key={k} frame={lf - (k ? second : first)} {...l.words[k]} />}
      </React.Fragment>; })()}

    {inAgain && <Caption frame={frame - t.againAt} line={reel.lines[reel.again.line]} clipTime={reel.again.from + (frame - t.againAt) / FPS} />}

    {/* the host, while the clip waits */}
    {reel.host && <Sequence from={t.full} durationInFrames={t.intro} layout="none"><Host src={reel.host.video} from={reel.host.intro[0]} frames={t.intro} box={HOST_BOX} outline="#fff" /></Sequence>}
    {reel.host && reel.lines.map((_, i) => <Sequence key={i} from={t.starts[i] + t.lines[i]} durationInFrames={t.holds[i]} layout="none">
      <Host src={reel.host!.video} from={reel.host!.lines[i][0]} frames={t.holds[i]} box={HOST_BOX} outline="#fff" /></Sequence>)}

    {frame >= t.endAt && <Sequence from={t.endAt} layout="none"><StickerEnd frame={frame - t.endAt} soon={!reel.live} outro={reel.host?.outro} /></Sequence>}
  </AbsoluteFill>;
};
