// A silent test of the puppet: Pancho talks, then points at three answer cards one after the other,
// raises a finger, and ends happy. No voice yet: the mouth follows a made-up talking pattern.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {PanchoRig, RigScript} from './PanchoRig';

export const RIG_TEST_FRAMES = 420;

// made-up speech: mouth shapes held 3 frames each during the talking stretches
function fakeTalk(total: number, stretches: [number, number][]) {
  const shapes = 'haeohiaucheaoih';
  let s = '';
  for (let f = 0; f < total; f++) {
    const on = stretches.some(([a, b]) => f >= a && f < b);
    s += on ? shapes[Math.floor(f / 3 + Math.sin(f / 3) * 2 + 15) % shapes.length] : 'c';
  }
  return s;
}

const SCRIPT: RigScript = {
  face: [{at: 8, pose: 'eye-cam'}, {at: 290, pose: 'brow-up'}, {at: 350, pose: 'happy'}],
  armB: [{at: 20, pose: 'b-open'}, {at: 70, pose: 'rest'}, {at: 350, pose: 'b-mid'}],
  armA: [{at: 90, pose: 'point-ul'}, {at: 150, pose: 'point-l'}, {at: 210, pose: 'point-dl'}, {at: 270, pose: 'rest'}, {at: 290, pose: 'a-up'}, {at: 350, pose: 'a-mid'}],
  mouth: fakeTalk(RIG_TEST_FRAMES, [[15, 68], [95, 130], [155, 190], [215, 250], [295, 335], [355, 395]]),
};

const CARDS = [
  {text: 'vos tenés', y: 640, at: 90},
  {text: 'tú tienes', y: 1040, at: 150},
  {text: 'usted tiene', y: 1420, at: 210},
];

export const RigTest: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#BFE6D6', fontFamily: 'Inter, sans-serif'}}>
    {CARDS.map((c, i) => {
      const lit = frame >= c.at && frame < c.at + 60;
      const pop = interpolate(frame - c.at, [0, 6, 12], [1, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return <div key={i} style={{position: 'absolute', left: 40, top: c.y - 60, width: 310, padding: '34px 0', borderRadius: 28, textAlign: 'center',
        fontSize: 46, fontWeight: 800, color: lit ? '#fff' : '#3b2a20', background: lit ? '#E8457A' : '#fff',
        boxShadow: '0 8px 0 rgba(0,0,0,0.12)', transform: `scale(${lit ? pop : 1})`}}>{c.text}</div>;
    })}
    <div style={{position: 'absolute', left: 350, top: 1920 - 1450}}>
      <PanchoRig frame={frame} script={SCRIPT} height={1450} />
    </div>
  </AbsoluteFill>;
};
