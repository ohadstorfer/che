// The onboarding's "what's inside" loop: four things the app does, one at a time,
// drawn in the app's own sticker look (src/lib/theme.ts). Silent, and the last frame
// hands over to the first, so it can run on a loop above a button.
// Every scene is timed in frames from its own start; change a scene's `dur` and the
// rest follows.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame} from 'remotion';
import {Avatar, BODY, Bars, C, CHIP, CLAMP, DISPLAY, Diff, FLAT, FPS, FlagSun, Headline, ICON, INOUT, Icon, LEAVE, Mic, OVERLAP, STICKER, Tap, mix, press, rise, slap, tween} from './kit';

// --- 1 · the chat --------------------------------------------------------------
const Chat: React.FC<{f: number}> = ({f}) => {
  const REC = 9, SAID = 24, FIX = 32, STRIKE = 42, ADD = 47; // she talks, her line lands, Pancho's fix
  const recording = f >= REC && f < SAID;
  const struck = tween(f, STRIKE, 8), added = tween(f, ADD, 10);
  const text: React.CSSProperties = {fontFamily: BODY, fontWeight: 600, fontSize: 64, lineHeight: '88px', whiteSpace: 'nowrap'};
  return <>
    {/* Pancho asks */}
    <div style={{position: 'absolute', left: 60, top: 420, display: 'flex', alignItems: 'flex-end', gap: 26, transformOrigin: '0% 100%', ...slap(f, 2)}}>
      <Avatar size={134} />
      <div style={{...text, color: C.ink, background: C.card, padding: '36px 52px', borderRadius: '80px 80px 80px 22px', boxShadow: STICKER}}>Dale. ¿Sos de acá?</div>
    </div>

    {/* she is talking: the dashed bubble, with her voice in it */}
    <div style={{position: 'absolute', right: 60, top: 634, height: 160, padding: '0 60px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, borderRadius: '80px 80px 22px 80px',
      border: `5px dashed ${C.rosa}`, background: C.card, transformOrigin: '100% 100%', opacity: tween(f, REC + 2, 6) * (1 - tween(f, SAID, 4)), transform: `scale(${0.94 + 0.06 * tween(f, REC + 2, 8)})`}}>
      <Bars f={f} n={7} w={13} h={72} color={C.rosa} />
    </div>
    {/* her line */}
    <div style={{position: 'absolute', right: 60, top: 634, ...text, color: '#fff', background: C.rosa, padding: '36px 52px', borderRadius: '80px 80px 22px 80px', boxShadow: STICKER,
      transformOrigin: '100% 100%', ...slap(f, SAID)}}>No. ¿Y tú eres de acá?</div>

    {/* the fix: what she said, with one thing changed */}
    <div style={{position: 'absolute', right: 60, top: 842, display: 'flex', alignItems: 'center', padding: '30px 44px', borderRadius: '56px 18px 56px 56px', background: 'rgba(201,85,62,0.14)',
      ...text, fontSize: 60, lineHeight: '84px', color: C.ink, ...rise(f, FIX, 26)}}>
      <Diff before="¿Y" removed="tú eres" fixed="vos sos" after="de acá?" struck={struck} added={added} room={270} />
    </div>

    {/* the mic: rosa at rest, durazno with a ring while it listens */}
    <div style={{position: 'absolute', left: 445, top: 1074, width: 190, height: 190, ...rise(f, 5, 40)}}>
      <Mic size={190} listening={recording} since={f - REC} scale={press(f, REC - 3, 6, 0.06) * press(f, SAID - 3, 6, 0.06)} />
    </div>
  </>;
};

// --- 2 · the slang -------------------------------------------------------------
const WORDS: [string, string, string, number, number, number][] = [ // word, meaning, tile, tilt, x, y
  ['birra', 'beer', C.sky, -4, -22, 14],
  ['laburo', 'work', C.peach, 3.5, 20, -8],
  ['quilombo', 'a total mess', C.lav, -1.5, 0, 0],
];
const Slang: React.FC<{f: number}> = ({f}) => {
  const up = spring({frame: f - 3, fps: FPS, config: {damping: 14, stiffness: 170, mass: 0.8}});
  const last = 3 + (WORDS.length - 1) * 13;
  return <>
    {/* Pancho, up from behind the cards; a nod as each one lands */}
    <Img src={staticFile('pancho/gesto-mano.png')} style={{position: 'absolute', left: 372, top: 420, height: 560, transformOrigin: '50% 100%',
      transform: `translateY(${(1 - up) * 150}px) rotate(${Math.sin(f / 9) * 1.2 + 3 * (1 - tween(f, last, 14))}deg)`, opacity: Math.min(1, up * 2)}} />
    {WORDS.map(([word, means, tile, tilt, x, y], k) => (
      <div key={word} style={{position: 'absolute', left: 150 + x, top: 830 + y, width: 780, height: 400, boxSizing: 'border-box', borderRadius: 84, background: tile, boxShadow: STICKER,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, ...slap(f, 3 + k * 13, tilt)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: -4, color: C.ink}}>{word}</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 62, lineHeight: 1.2, color: 'rgba(58,42,32,0.72)'}}>{means}</div>
      </div>
    ))}
  </>;
};

// --- 3 · the culture -----------------------------------------------------------
const Culture: React.FC<{f: number}> = ({f}) => {
  const MOVE = 26, PICK = 37, RIGHT = 44; // the finger sets off, picks, and the answer is right
  const picked = tween(f, PICK + 2, 5), right = tween(f, RIGHT, 8);
  const go = tween(f, MOVE, 12, INOUT);
  const pop = spring({frame: f - RIGHT, fps: FPS, config: {damping: 9, stiffness: 190, mass: 0.7}});
  const option = (label: string, top: number, at: number, isRight: boolean) => (
    <div style={{position: 'absolute', left: 60, top, width: 960, height: 142, boxSizing: 'border-box', padding: '0 34px 0 58px', borderRadius: 71, boxShadow: STICKER,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: BODY, fontWeight: 800, fontSize: 62, color: C.ink,
      background: isRight ? interpolateColors(right, [0, 1], [interpolateColors(picked, [0, 1], [C.card, C.butter]), C.sage]) : C.card,
      opacity: slap(f, at).opacity as number * (isRight ? 1 : 1 - 0.5 * right), transform: `scale(${(0.9 + 0.1 * tween(f, at, 10)) * (isRight ? press(f, PICK, 6) : 1)})`}}>
      {label}
      {isRight ? <div style={{width: 84, height: 84, borderRadius: 42, background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: Math.min(1, right * 2), transform: `scale(${0.6 + 0.4 * pop})`}}><Icon code={ICON.check} size={56} color="#fff" /></div> : null}
    </div>
  );
  return <>
    {/* the class's tile: the question, and Pancho with his mate */}
    <div style={{position: 'absolute', left: 60, top: 446, width: 960, height: 376, borderRadius: 84, background: C.sage, boxShadow: STICKER, ...slap(f, 2, -1)}}>
      <div style={{position: 'absolute', left: 56, top: 0, bottom: 0, width: 540, display: 'flex', alignItems: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, lineHeight: '78px', letterSpacing: -1, color: C.ink}}>
        Say “gracias” for a mate and…</div>
      <div style={{position: 'absolute', right: 36, top: 28, width: 320, height: 320, borderRadius: 160, background: 'rgba(255,255,255,0.45)'}} />
      <Img src={staticFile('pancho/mate.png')} style={{position: 'absolute', right: 30, bottom: 16, height: 440, transformOrigin: '50% 100%',
        transform: `translateY(${(1 - tween(f, 5, 12)) * 40 - 18 * Math.sin(Math.PI * tween(f, RIGHT, 14, Easing.linear))}px) rotate(${Math.sin(f / 10) * 1.2}deg)`, opacity: tween(f, 5, 6)}} />
    </div>
    {option('you get more', 884, 9, false)}
    {option('you’re done', 1066, 12, true)}
    <Tap x={mix(go, 880, 760)} y={mix(go, 1310, 1142)} show={tween(f, MOVE, 5) * (1 - tween(f, RIGHT, 6))} down={interpolate(f, [PICK, PICK + 3, PICK + 6], [0, 1, 0], CLAMP)} />
  </>;
};

// --- 4 · the course ------------------------------------------------------------
const COIN_W = 190, COIN_H = 164, CUR_W = 410, CUR_H = 196, PAD = 14, BORDER = 8;
/** One step on the path. `lit` 0 = a coin, 1 = the rosa Start pill. A coin is done (its unit's durazno) or still locked. */
const Step: React.FC<{x: number; y: number; glyph: number; lit: number; done: boolean; filled?: number; scale?: number; f: number}> = ({x, y, glyph, lit, done, filled = 0, scale = 1, f}) => {
  const w = mix(lit, COIN_W, CUR_W), h = mix(lit, COIN_H, CUR_H);
  const breathe = 0.5 + 0.5 * Math.sin(f / 6.5);
  return <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${scale})`}}>
    <div style={{position: 'absolute', inset: -(PAD + BORDER), borderRadius: 999, border: `${BORDER}px solid rgba(180,74,96,${(0.35 + 0.45 * breathe) * lit})`, transform: `scale(${1 + 0.025 * breathe})`}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 999, overflow: 'hidden', background: interpolateColors(lit, [0, 1], [done ? C.peach : C.locked, C.rosa]), boxShadow: done || lit > 0.5 ? STICKER : FLAT}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - Math.min(1, lit * 2)}}>
        <Icon code={glyph} size={72} color={done ? C.ink : C.lockedIcon} />
      </div>
      {/* the lesson, going by */}
      <div style={{position: 'absolute', inset: 0, background: 'rgba(138,51,71,0.6)', clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)`, opacity: Math.max(0, lit * 2 - 1)}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: CUR_W, height: '100%', display: 'flex', alignItems: 'center', gap: 26, paddingLeft: (CUR_H - 148) / 2, boxSizing: 'border-box', opacity: Math.max(0, lit * 2 - 1)}}>
        <div style={{width: 148, height: 148, borderRadius: 74, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon code={ICON.play} size={70} color="#fff" style={{marginLeft: 8}} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 62, lineHeight: 1, color: '#fff'}}>Start</div>
      </div>
    </div>
  </div>;
};
const Course: React.FC<{f: number}> = ({f}) => {
  const MOVE = 9, TAP = 19, DONE = 31, NEXT = 35, STREAK = 42; // tap Start, the lesson goes by, the step is done, the next opens, the streak grows
  const go = tween(f, MOVE, 12, INOUT);
  const done = tween(f, DONE, 12, INOUT), next = tween(f, NEXT, 12, INOUT);
  const tick = tween(f, STREAK, 9);
  const pop = spring({frame: f - STREAK, fps: FPS, config: {damping: 8, stiffness: 200, mass: 0.6}});
  const jump = spring({frame: f - STREAK, fps: FPS, config: {damping: 7, stiffness: 160, mass: 0.7}});
  const hop = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - STREAK) / 12)));
  const steps: [number, number, number][] = [[420, 492, ICON.book], [300, 722, ICON.albums], [300, 952, ICON.book], [380, 1182, ICON.chat]];
  return <>
    <div style={slap(f, 2)}><Step f={f} x={steps[0][0]} y={steps[0][1]} glyph={steps[0][2]} lit={0} done /></div>
    <div style={slap(f, 5)}><Step f={f} x={steps[1][0]} y={steps[1][1]} glyph={steps[1][2]} lit={0} done /></div>
    <div style={slap(f, 8)}><Step f={f} x={steps[2][0]} y={steps[2][1]} glyph={steps[2][2]} lit={1 - done} done filled={tween(f, TAP + 3, DONE - TAP - 3, Easing.linear)} scale={press(f, TAP, 6)} /></div>
    <div style={slap(f, 11)}><Step f={f} x={steps[3][0]} y={steps[3][1]} glyph={steps[3][2]} lit={next} done={false} /></div>

    {/* the streak, on its butter sticker */}
    <div style={{position: 'absolute', left: 772, top: 432, ...slap(f, 6, 3)}}>
      <div style={{height: 112, padding: '0 40px 0 28px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 56, background: C.butter, boxShadow: CHIP, transform: `scale(${1 + 0.16 * (pop - tick)})`}}>
        <div style={{position: 'relative', width: 58, height: 58, transformOrigin: '50% 100%', transform: `scale(${1 + 0.3 * hop}) rotate(${-8 * hop}deg)`}}>
          <Icon code={ICON.flame} size={58} color={C.flame} style={{position: 'absolute'}} />
          <Icon code={ICON.flameLine} size={58} color={C.ink} style={{position: 'absolute'}} />
        </div>
        <div style={{position: 'relative', width: 66, height: 60, overflow: 'hidden', fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, lineHeight: '60px', color: C.ink, fontVariantNumeric: 'tabular-nums'}}>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${-tick * 60}px)`}}>17</div>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - tick) * 60}px)`}}>18</div>
        </div>
      </div>
    </div>

    <Img src={staticFile('pancho/futbol-gol.png')} style={{position: 'absolute', left: 612, top: 716, height: 580, transformOrigin: '50% 100%',
      transform: `translateY(${(1 - tween(f, 6, 12)) * 50 - 70 * hop}px) scale(${1 - 0.03 * hop + 0.03 * (jump - 1)}, ${1 + 0.05 * hop})`, opacity: tween(f, 6, 6)}} />
    <Tap x={mix(go, 600, 350)} y={mix(go, 1290, 984)} show={tween(f, MOVE, 5) * (1 - tween(f, TAP + 8, 6))} down={interpolate(f, [TAP, TAP + 3, TAP + 6], [0, 1, 0], CLAMP)} />
  </>;
};

// --- the loop ------------------------------------------------------------------
const SCENES: {small: string; big: string; dur: number; Body: React.FC<{f: number}>}[] = [
  {small: 'Talk with', big: 'Pancho', dur: 96, Body: Chat},
  {small: 'Pick up the', big: 'slang', dur: 66, Body: Slang},
  {small: 'Get the', big: 'culture', dur: 78, Body: Culture},
  {small: 'A few minutes', big: 'a day', dur: 84, Body: Course},
];
export const TOTAL = SCENES.reduce((n, s) => n + s.dur - OVERLAP, 0);

export const CoreLoop: React.FC = () => {
  const frame = useCurrentFrame();
  let start = 0;
  return <AbsoluteFill style={{background: C.oat, overflow: 'hidden'}}>
    {/* a sixteenth of a turn per loop: the sun has sixteen rays, so the loop closes on itself */}
    <FlagSun size={620} turn={frame / TOTAL * 22.5} style={{left: 690, top: -230}} />
    {SCENES.map(({small, big, dur, Body}) => {
      // Counted round the loop, so the last scene is still leaving as the first one arrives.
      const f = (((frame - start) % TOTAL) + TOTAL) % TOTAL;
      start += dur - OVERLAP;
      if (f >= dur) return null;
      const leave = tween(f, dur - LEAVE, LEAVE);
      return <AbsoluteFill key={big} style={{opacity: 1 - leave, transform: `translateY(${-leave * 28}px) scale(${1 - 0.02 * leave})`}}>
        <div style={{position: 'absolute', left: 64, top: 56, transformOrigin: '0% 50%', ...slap(f, 0, -3)}}><Headline small={small} big={big} width={760} /></div>
        <Body f={f} />
      </AbsoluteFill>;
    })}
  </AbsoluteFill>;
};
