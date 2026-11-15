// A reel close made of the 8 Google Play screenshots (1080×1920, the reel's own size): each one holds
// for a beat, then swipes left like the store carousel; "Link in bio" closes it.
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {StoreShot} from '../store/StoreShot';
import {SHOTS} from '../store/shots.mjs';
import {FPS, LinkInBio} from './UgcReel';

const PLAY = (SHOTS as any[]).filter(s => (s.stores ?? ['ios', 'play']).includes('play'));
const HOLD = 24, SWIPE = 8, STEP = HOLD + SWIPE;
const SHOTS_FRAMES = (PLAY.length - 1) * STEP + HOLD + 6;
const LINK = 1 * FPS;
export const STORE_CLOSE_FRAMES = SHOTS_FRAMES + LINK;

const Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  // How many shots have swiped away so far, eased inside each swipe.
  const pos = PLAY.reduce((sum, _, i) => i === PLAY.length - 1 ? sum
    : sum + interpolate(frame, [i * STEP + HOLD, (i + 1) * STEP], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.23, 1, 0.32, 1)}), 0);
  return (
    <AbsoluteFill style={{background: '#F7EFE6', overflow: 'hidden'}}>
      {PLAY.map((s, i) => Math.abs(i - pos) < 1.01 && (
        <AbsoluteFill key={s.id} style={{transform: `translateX(${(i - pos) * 1080}px)`}}>
          <StoreShot shot={s} size="play" />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

export const StoreShotsClose: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={SHOTS_FRAMES}><Carousel /></Sequence>
    <Sequence from={SHOTS_FRAMES}><LinkInBio /></Sequence>
  </AbsoluteFill>
);
