// Pancho as a cut-out puppet: a body plus layers (arms, eye, mouth) that were all cut from Gemini edits
// of one drawing (rig/cut-rig.py), so any mix of them lines up.
// The idle life (breathing, a slow sway, blinking, small arm drift) follows the frame number on its own;
// a video only says WHAT happens WHEN: which arm pose, which face, which mouth shape.
import React from 'react';
import {Img, staticFile} from 'remotion';
import RIG from '../../public/pancho/rig/rig.json';
import {blink} from '../versus/Puppet';

type Box = {x: number; y: number; w: number; h: number; angle?: number};
const LAYERS = RIG.layers as unknown as Record<string, Record<string, Box>>;
const PIVOT = RIG.pivot as Record<string, [number, number]>;
const [CW, CH] = RIG.canvas as [number, number];
const FEET: [number, number] = [CW * 0.5, 2300]; // the body breathes and sways from here

export type Key<T> = {at: number; pose: T};
export type RigScript = {
  armA?: Key<string>[];   // arm on the left of the picture: rest, a-mid, point-ul, point-l, point-dl, a-up, a-finger
  armB?: Key<string>[];   // arm on the right of the picture: rest, b-mid, b-open
  face?: Key<string | null>[]; // eye-cam, brow-up, happy, eye-half ... or null for the plain face
  mouth?: string;         // one letter per frame: c closed, h half, a e i o u (as in the versus reels)
};

const MOUTH: Record<string, string | null> = {c: null, h: 'm-half', a: 'm-a', e: 'm-e', i: 'm-i', o: 'm-o', u: 'm-u'};
const MID: Record<string, string> = {'arm-a': 'a-mid', 'arm-b': 'b-mid'};
const MOVE = 8; // frames an arm takes to go from one drawing to the next
const MAX_TURN = 10; // degrees a drawing may turn around the shoulder on its way

const ease = (t: number) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
const backOut = (t: number) => { t = Math.min(Math.max(t, 0), 1); const s = 1.6; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const turn = (from: number, to: number) => ((to - from + 540) % 360) - 180; // shortest way round, in degrees

function current<T>(keys: Key<T>[] | undefined, frame: number, rest: T): {now: T; prev: T; since: number} {
  let now = rest, prev = rest, since = 1e9;
  for (const k of keys ?? []) if (k.at <= frame) { prev = now; now = k.pose; since = frame - k.at; }
  return {now, prev, since};
}

/** The arm drawings to show this frame, each with its turn (degrees, around the shoulder) and opacity.
 *  Between two drawings the old one swings toward the new one's direction and fades out, while the new one
 *  swings in from the old direction with a little overshoot, so the eye reads one arm moving.
 *  A big swing goes through the half-raised drawing so the arm never jumps across the body. */
function armFrame(group: string, keys: Key<string>[] | undefined, frame: number): {pose: string; rot: number; op: number}[] {
  const {now, prev, since} = current(keys, frame, 'rest');
  const L = LAYERS[group];
  if (since >= MOVE * 2 || prev === now) return [{pose: now, rot: 0, op: 1}];
  const big = Math.abs(turn(L[prev].angle!, L[now].angle!)) > 75 && prev !== MID[group] && now !== MID[group];
  const legs: [string, string, number][] = big ? [[prev, MID[group], 0], [MID[group], now, MOVE * 0.8]] : [[prev, now, 0]];
  for (let i = legs.length - 1; i >= 0; i--) {
    const [a, b, start] = legs[i];
    const len = big ? MOVE * 0.8 : MOVE;
    const t = (since - start) / len;
    if (t < 0) continue;
    if (t >= 1) return [{pose: b, rot: 0, op: 1}];
    // A drawing only turns a little (a big turn tears the arm off the shoulder), and the swap is almost a cut:
    // one frame of overlap, like a smear frame in a cartoon. The overshoot as the new drawing lands sells the move.
    const d = Math.max(-MAX_TURN, Math.min(MAX_TURN, turn(L[a].angle!, L[b].angle!)));
    const ka = a === 'rest' ? 0.3 : 1, kb = b === 'rest' ? 0.3 : 1; // the resting arms are thin strips: barely turn them
    const SWAP = 0.4;
    if (t < SWAP) return [{pose: a, rot: d * ka * ease(t / SWAP), op: 1}];
    const u = (t - SWAP) / (1 - SWAP);
    return [
      ...(u < 0.2 ? [{pose: a, rot: d * ka, op: 0.5}] : []),
      {pose: b, rot: -d * kb * (1 - backOut(u)), op: 1},
    ];
  }
  return [{pose: prev, rot: 0, op: 1}];
}

const Layer: React.FC<{name: string; box: Box; style?: React.CSSProperties}> = ({name, box, style}) =>
  <Img src={staticFile(`pancho/rig/${name}.png`)} style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, ...style}} />;

/** Every drawing of a group stays mounted and only the shown ones are visible: swapping `src` flashes while it decodes. */
const Group: React.FC<{group: string; show: Record<string, React.CSSProperties>}> = ({group, show}) => <>
  {Object.entries(LAYERS[group]).map(([pose, box]) =>
    <Layer key={pose} name={`${group}-${pose}`} box={box} style={show[pose] ?? {opacity: 0}} />)}
</>;

export const PanchoRig: React.FC<{frame: number; script: RigScript; height: number; seed?: number}> = ({frame, script, height, seed = 0.3}) => {
  const k = height / CH;
  const T = frame / 30;
  // breathing: a slow rise of the chest, from the feet up; a slower sway on top
  const breath = Math.sin(T * Math.PI * 2 / 3.4 + seed * 4);
  const sway = Math.sin(T * Math.PI * 2 / 6.1 + seed * 7) * 0.7;
  const mouthKey = script.mouth?.[frame] ?? 'c';
  const talking = mouthKey !== 'c' ? 1 : 0;
  const bob = Math.sin(T * Math.PI * 2 * 2.2) * 4 * talking;

  const face = current(script.face, frame, null).now;
  const lid = face === 'happy' ? 0 : blink(frame, seed);
  const eye = lid > 0.75 ? 'eye-closed' : lid > 0.3 ? 'eye-half' : face;

  const arm = (group: string, keys?: Key<string>[]) => {
    const show: Record<string, React.CSSProperties> = {};
    const [px, py] = PIVOT[group];
    const drift = Math.sin(T * Math.PI * 2 / 3.4 + seed * 4 + (group === 'arm-a' ? 0.6 : 1.4)) * 1.2;
    for (const {pose, rot, op} of armFrame(group, keys, frame))
      show[pose] = {opacity: op, transformOrigin: `${px}px ${py}px`, transform: `rotate(${rot + drift}deg)`};
    return show;
  };

  return <div style={{position: 'relative', width: CW * k, height: CH * k}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: CW, height: CH, transformOrigin: '0 0', transform: `scale(${k})`}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${FEET[0]}px ${FEET[1]}px`,
        transform: `translateY(${-bob}px) rotate(${sway}deg) scale(${1 - breath * 0.002}, ${1 + breath * 0.007})`}}>
        <Layer name="body" box={LAYERS.body.body} />
        <Group group="eye" show={eye ? {[eye]: {}} : {}} />
        <Group group="mouth" show={MOUTH[mouthKey] ? {[MOUTH[mouthKey]!]: {}} : {}} />
        <Group group="arm-b" show={arm('arm-b', script.armB)} />
        <Group group="arm-a" show={arm('arm-a', script.armA)} />
      </div>
    </div>
  </div>;
};
