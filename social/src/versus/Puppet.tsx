// One drawing, made to move like a puppet: it sways from the feet up, blinks,
// talks with seven mouth drawings (closed, half open and the five vowels), and (if the rig has a raised hand) waves.
// Nothing here is keyframed per video; it all follows the frame number and the voice.
import React from 'react';
import {Img, staticFile} from 'remotion';

/** Where the moving parts are, in the drawing's own pixels. */
export type Rig = {
  size: [number, number];
  eye: [number, number, number, number]; // centre x, centre y, radius x, radius y
  fur: string; // the colour around the eye, for the eyelid
  hand?: {cutX: number; cutY: number; pivot: [number, number]}; // a raised hand: everything right of cutX and above cutY
};
// The mouth drawings (cut-cast.py), and which one each letter of a clip's `mouth` string shows.
const MOUTHS = ['closed', 'half', 'a', 'e', 'i', 'o', 'u'] as const;
export const SHAPE: Record<string, (typeof MOUTHS)[number]> = {c: 'closed', h: 'half', a: 'a', e: 'e', i: 'i', o: 'o', u: 'u'};
const LINE = '#4A2E1C';

/** How closed the eye is this frame (0 open, 1 shut). A blink every 2 to 3 seconds, never on a fixed beat. */
export function blink(frame: number, seed: number) {
  const PERIOD = 78, SHAPE = [0.55, 1, 1, 0.6, 0.2];
  for (const n of [Math.floor(frame / PERIOD) - 1, Math.floor(frame / PERIOD)]) {
    const at = Math.round(34 + seed * 11 + n * PERIOD + 14 * Math.sin(n * 2.3 + seed));
    if (frame >= at && frame < at + SHAPE.length) return SHAPE[frame - at];
  }
  return 0;
}

// The sway is a sideways push that is strongest at the head and zero at the feet,
// done with an SVG displacement map: a top-to-bottom gradient whose red channel is the push.
const BEND_MAP = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="256"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
  [[0, 255], [0.2, 232], [0.4, 196], [0.6, 160], [0.8, 136], [1, 128]].map(([o, r]) => `<stop offset="${o}" stop-color="rgb(${r},128,128)"/>`).join('') +
  `</linearGradient></defs><rect width="8" height="256" fill="url(#g)"/></svg>`);

export const Puppet: React.FC<{id: string; sprite: string; rig: Rig; height: number; mouth: string; lean: number; lid: number; wave: number}> = ({id, sprite, rig, height, mouth, lean, lid, wave}) => {
  const [W, H] = rig.size, k = height / H;
  const [ex, ey, rx, ry] = rig.eye;
  const h = rig.hand;
  const stack = (style: React.CSSProperties) => MOUTHS.map((m, i) => <Img key={m} src={staticFile(`pancho/${sprite}-${m}.png`)}
    style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: m === (SHAPE[mouth] ?? 'closed') ? 1 : 0, ...style}} />);
  return <div style={{width: W * k, height: H * k}}>
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id={id} x="-15%" y="0%" width="130%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={BEND_MAP} preserveAspectRatio="none" result="map" />
        {/* a pixel is read from `scale * (red - 0.5)` to its right, so a lean to the right is a negative scale */}
        <feDisplacementMap in="SourceGraphic" in2="map" scale={-2 * lean} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `scale(${k})`, filter: `url(#${id})`}}>
      {/* All the mouths stay mounted; only one shows. Swapping `src` would flash while it decodes. */}
      {stack(h ? {clipPath: `polygon(0 0, ${h.cutX}px 0, ${h.cutX}px ${h.cutY}px, ${W}px ${h.cutY}px, ${W}px ${H}px, 0 ${H}px)`} : {})}
      {h ? <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: `${h.pivot[0]}px ${h.pivot[1]}px`, transform: `rotate(${wave}deg)`}}>
        {/* the hand, cut along the forearm and faded into the arm below so the joint does not show */}
        <Img src={staticFile(`pancho/${sprite}-closed.png`)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H,
          clipPath: `polygon(${h.cutX}px 0, ${W}px 0, ${W}px ${h.cutY + 44}px, ${h.cutX}px ${h.cutY + 44}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, #000 ${h.cutY}px, transparent ${h.cutY + 44}px)`}} />
      </div> : null}
      {/* the eyelid comes down from the top; fully shut it leaves a small curved line */}
      {lid > 0 ? <div style={{position: 'absolute', left: ex - rx - 4, top: ey - ry - 4, width: 2 * rx + 8, height: 2 * ry + 8, borderRadius: '50%', background: rig.fur,
        boxSizing: 'border-box', borderBottom: `7px solid ${LINE}`, clipPath: `inset(0 0 ${(1 - lid) * 100}% 0)`}} /> : null}
    </div>
  </div>;
};
