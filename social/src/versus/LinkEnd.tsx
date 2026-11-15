// The "Link in bio" ending (designed by the user in the "Cierre Link in Bio" artifact, 2026-11-05):
// the headline on top, the phone from the UGC close playing the class highlights, and a
// "Link in bio" sticker with the app icon under it. Render it inside a <Sequence> that starts
// at the card, so the phone's video starts from its first frame.
import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {paperTop: '#F7EFE6', paperBottom: '#EFE4D8', card: '#FFF9F3', ink: '#3A2A20', rosa: '#B44A60'};
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
const STICK = `0 0 0 5px ${C.ink}, 7px 9px 0 5px ${C.ink}`; // the artifact's sticker edge at this size

// The artifact's values, at 1080 x 1920.
const L = {titleY: 286, titleSize: 74, phoneW: 472, phoneY: 462, linkY: 1478, linkSize: 78, linkR: -2, iconSize: 92};

const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const tween = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT});

// `title`: one line per \n, *words* in rosa. Each kind of reel has its own (set as `endTitle` on the reel).
const Title: React.FC<{text: string}> = ({text}) => <>{text.split('\n').map((line, i) => <div key={i}>
  {line.split('*').map((part, k) => k % 2 ? <span key={k} style={{color: C.rosa}}>{part}</span> : part)}</div>)}</>;

export const LinkEnd: React.FC<{title?: string; titleSize?: number}> = ({title = 'There’s an app for learning *Argentinian Spanish!*', titleSize = L.titleSize}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleIn = tween(frame, 2, 14);
  const rise = spring({frame: frame - 4, fps, config: {damping: 16, stiffness: 120}});
  // the sticker is slapped down: in a little big, then settles
  const slap = spring({frame: frame - 12, fps, config: {damping: 12, stiffness: 180}});
  // The phone keeps the proportions of the UGC close (720 x 1500, bezel 16, corners 104 / 90).
  const W = L.phoneW, k = W / 720, H = Math.round(1500 * k), bez = 16 * k;
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.paperTop}, ${C.paperBottom})`, opacity: tween(frame, 0, 8), overflow: 'hidden', fontFamily: DISPLAY, color: C.ink, zIndex: 10}}>
    <div style={{position: 'absolute', left: 60, right: 60, top: L.titleY, textAlign: 'center', fontWeight: 900, fontSize: titleSize, lineHeight: 1.04, letterSpacing: -1.5, textWrap: 'balance',
      opacity: titleIn, transform: `translateY(${(1 - titleIn) * -30}px)`} as React.CSSProperties}>
      <Title text={title} />
    </div>
    <div style={{position: 'absolute', left: (1080 - W) / 2, top: L.phoneY, width: W, height: H, borderRadius: 104 * k, background: '#1E1612', overflow: 'hidden',
      boxShadow: '0 50px 80px -30px rgba(20,15,10,0.6)', opacity: Math.min(1, rise * 2), transform: `translateY(${interpolate(rise, [0, 1], [220, 0])}px)`}}>
      <div style={{position: 'absolute', left: bez, top: bez, right: bez, bottom: bez, borderRadius: 90 * k, overflow: 'hidden', background: C.paperTop}}>
        <OffthreadVideo src={staticFile('end/app-highlights.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      {/* covers the recording's own island and its red recording dot */}
      <div style={{position: 'absolute', left: 204 * k, top: 22 * k, width: 300 * k, height: 70 * k, borderRadius: 999, background: '#0E0A08'}} />
    </div>
    <div style={{position: 'absolute', left: 0, width: 1080, top: L.linkY, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: Math.round(L.linkSize * 0.32), padding: `${Math.round(L.linkSize * 0.3)}px ${Math.round(L.linkSize * 0.55)}px`,
        borderRadius: Math.round(L.linkSize * 0.45), background: C.card, boxShadow: STICK, fontWeight: 900, fontSize: L.linkSize, lineHeight: 1, letterSpacing: -2, whiteSpace: 'nowrap',
        opacity: frame < 12 ? 0 : 1, transform: `rotate(${L.linkR}deg) scale(${interpolate(slap, [0, 1], [1.25, 1])})`}}>
        <Img src={staticFile('ugc/icon-manteca.png')} style={{width: L.iconSize, height: L.iconSize, borderRadius: L.iconSize * 0.22, boxShadow: `0 0 0 4px ${C.ink}`}} />
        <span>Link in <span style={{color: C.rosa}}>bio</span> 👆</span>
      </div>
    </div>
  </AbsoluteFill>;
};
