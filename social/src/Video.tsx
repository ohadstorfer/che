import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence} from 'remotion';
import type {Video} from './data';

export const FPS = 30;
export const CONTENT_S = 7;
export const END_S = 3;
export const DURATION = (CONTENT_S + END_S) * FPS;

const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
const stroke = '0 3px 0 rgba(0,0,0,.55), 0 0 18px rgba(0,0,0,.6)';

const Bg: React.FC<{bg?: string; tint: string}> = ({bg, tint}) => (
  <AbsoluteFill style={{background: `linear-gradient(160deg, ${tint}, #000)`}}>
    {bg ? <OffthreadVideo src={staticFile(bg)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
    <AbsoluteFill style={{background: 'rgba(0,0,0,.35)'}} />
  </AbsoluteFill>
);

const Row: React.FC<{l: string; r?: string; at: number; layout: Video['layout']; n: number}> = ({l, r, at, layout, n}) => {
  const frame = useCurrentFrame();
  const s = spring({frame: frame - at, fps: FPS, config: {damping: 14, stiffness: 160}});
  const base = {opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${0.92 + 0.08 * s})`, fontFamily: FONT, fontWeight: 900, color: '#fff', textShadow: stroke, textAlign: 'center' as const};
  if (layout === 'stack') {
    return <div style={{...base, marginBottom: 26}}>
      <div style={{fontSize: 84, lineHeight: 1.05}}>{l}</div>
      <div style={{fontSize: 46, color: '#FFD43B', fontWeight: 800}}>{r}</div></div>;
  }
  const size = n > 7 ? 60 : 68;
  return <div style={{...base, fontSize: size, lineHeight: 1.25}}>
    {l}{r ? <> <span style={{color: '#FFD43B'}}>= {r}</span></> : null}</div>;
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({frame, fps: FPS, config: {damping: 12}});
  return <AbsoluteFill style={{background: '#3E5641', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#F1EEE6', textAlign: 'center', padding: 70}}>
    <Img src={staticFile('cap.png')} style={{height: 520, transform: `scale(${0.8 + 0.2 * s})`}} />
    <div style={{fontSize: 66, fontWeight: 900, lineHeight: 1.1, marginTop: 30}}>Want to learn<br />Argentine Spanish?</div>
    <div style={{fontSize: 44, fontWeight: 600, marginTop: 24, opacity: 0.9}}>Learn it in the app</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 44, background: '#F1EEE6', color: '#2B3C2E', borderRadius: 40, padding: '20px 44px'}}>
      <Img src={staticFile('icon.png')} style={{width: 96, height: 96, borderRadius: 22}} />
      <div style={{fontSize: 64, fontWeight: 900}}>Che</div>
    </div>
    <div style={{fontSize: 36, marginTop: 28, opacity: 0.85}}>Download now · link in bio</div>
  </AbsoluteFill>;
};

export const Reel: React.FC<{video: Video; bg?: string}> = ({video, bg}) => {
  const frame = useCurrentFrame();
  const {lines} = video;
  const per = Math.floor(((CONTENT_S - 1.2) * FPS) / lines.length);
  const titleS = spring({frame, fps: FPS, config: {damping: 14}});
  return <AbsoluteFill>
    <Sequence durationInFrames={CONTENT_S * FPS}>
      <Bg bg={bg} tint={video.tint} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 60px'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: '#fff', textAlign: 'center', textShadow: stroke, marginBottom: 50, opacity: titleS, transform: `scale(${0.9 + 0.1 * titleS})`}}>{video.title}</div>
        {lines.map((ln, i) => <Row key={i} {...ln} at={20 + i * per} layout={video.layout} n={lines.length} />)}
      </AbsoluteFill>
    </Sequence>
    <Sequence from={CONTENT_S * FPS}><End /></Sequence>
  </AbsoluteFill>;
};
