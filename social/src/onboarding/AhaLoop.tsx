// The onboarding's aha clip, "Correct… in a textbook". She answers a question in her
// head, gets it right, and then watches three of the four words change in Buenos Aires.
// Six beats, about eleven seconds, silent, on a loop: type, stickers and Pancho's still
// poses, nothing generated. The script it follows is the "Next video · the script" board
// on the onboarding canvas. Everything is timed in frames from the start of the take.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile} from 'remotion';
import {BODY, C, CHIP, CLAMP, DISPLAY, FPS, Headlines, type HeadlineCue, ICON, INOUT, Icon, LEAVE, Loop, OVERLAP, STICKER, clear, mix, rise, slap, slowed, stamp, textWidth, tween} from './kit';

// 1 · the question on its sticker, and an empty card waiting for the answer
const ASK = 4, CARD = 14;
// 2 · the textbook answer types itself and gets its tick
const TYPE = 34, TYPING = 26, TICK = 64;
// 3 · the twist: the tick's label keeps typing, and Pancho gives it a look
const MORE = 82, LOOK = 90;
// 4 · the same sentence in Buenos Aires: three words stickered over, one by one
const S4 = 118, SWAPS = [132, 148, 164];
// 5 · and it's everywhere: three more swaps
const S5 = 214, PILLS = [220, 233, 246];
// 6 · the invitation: the button under the video is the answer
const S6 = 272, DALE = 292;
const END = 336;
/** The loop's length: the take, less the frames it shares with the next one's arrival. */
export const TOTAL = END - OVERLAP;

const HEADLINES: HeadlineCue[] = [
  ['Say it in', 'Spanish', 0, S4 + OVERLAP],
  ['Same sentence in', 'Buenos Aires', S4, S5 + OVERLAP],
  ['And it’s', 'everywhere', S5, S6 + OVERLAP],
  ['Sound like you', 'live here', S6, END + LEAVE],
];

// --- the sentence ----------------------------------------------------------------
const SIZE = 80, ROW = 112, PAD = 40, SPACE = 22, ROOM = 16, CARD_H = ROW + 80;
/** Word by word. A word with `neu` gets stickered over; `gap` is the room after it. */
const WORDS: {old: string; neu?: string; tilt?: number; gap: number}[] = [
  {old: '¿', gap: 3}, {old: 'Tú', neu: 'Vos', tilt: -3, gap: SPACE}, {old: 'eres', neu: 'sos', tilt: 2.5, gap: SPACE},
  {old: 'de', gap: SPACE}, {old: 'aquí', neu: 'acá', tilt: -2, gap: 3}, {old: '?', gap: 0},
];
const LETTERS = WORDS.reduce((n, w) => n + w.old.length + (w.gap === SPACE ? 1 : 0), 0); // what gets typed, spaces too

/** Where each word sits this frame. A sticker is wider than the word under it, so its neighbours make room as it lands. */
const layout = (f: number) => {
  const typed = interpolate(f, [TYPE, TYPE + TYPING], [0, LETTERS], CLAMP);
  const opens = SWAPS.map(at => tween(f, at, 8)); // each sticker's room, opening while its word is struck
  let x = 0, k = -1, before = 0, caret = 0;
  const words = WORDS.map((w, i) => {
    const plain = textWidth(w.old, 700, SIZE);
    const shown = Math.max(0, Math.min(w.old.length, Math.floor(typed - before)));
    before += w.old.length + (w.gap === SPACE ? 1 : 0);
    if (shown > 0) caret = x + textWidth(w.old.slice(0, shown), 700, SIZE);
    let width = plain, sticker = 0, cut = 0, on = 0;
    if (w.neu) {
      k++;
      sticker = Math.max(textWidth(w.neu, 800, SIZE) + 44, plain + 20); // it has to cover the word
      cut = tween(f, SWAPS[k], 5);
      on = tween(f, SWAPS[k] + 5, 8);
      width = mix(opens[k], plain, sticker + ROOM); // its outline and tilt need room each side
    }
    const word = {...w, x, width, plain, sticker, cut, on, shown, at: w.neu ? SWAPS[k] + 5 : 0};
    // the question marks sit tight against a word, and a little off a sticker
    x += width + (w.gap === SPACE ? SPACE : i === 0 ? w.gap + 8 * opens[0] : i === 4 ? w.gap + 8 * opens[2] : w.gap);
    return word;
  });
  return {words, width: x, caret};
};

const Sentence: React.FC<{f: number; top: number}> = ({f, top}) => {
  const {words, width, caret} = layout(f);
  const idle = f < TYPE ? (Math.floor((f - CARD) / 8) % 2 === 0 ? 1 : 0) : 1;
  const wobble = 1.6 * Math.sin(Math.PI * 2 * tween(f, LOOK + 6, 14, t => t)) * (1 - tween(f, LOOK + 6, 14, t => t));
  return <div style={{position: 'absolute', left: 540 - width / 2 - PAD, top, width: width + 2 * PAD, height: CARD_H, ...rise(f, CARD, 30)}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 46, background: C.card, boxShadow: STICKER, transform: `rotate(${wobble}deg)`}}>
      <div style={{position: 'absolute', left: PAD, top: 40, width, height: ROW}}>
        {words.map(w => <div key={w.old} style={{position: 'absolute', left: w.x, top: 0, width: w.width, height: ROW}}>
          {/* the textbook word, struck through before its sticker lands */}
          <div style={{position: 'absolute', left: (w.width - w.plain) / 2, top: 0, height: ROW, fontFamily: BODY, fontWeight: 700, fontSize: SIZE, lineHeight: `${ROW}px`, color: C.ink, whiteSpace: 'nowrap', opacity: 1 - w.on}}>
            {w.old.slice(0, w.shown)}
            {w.neu ? <div style={{position: 'absolute', left: -6, right: -6, top: '54%', height: 8, borderRadius: 4, background: C.coral, transformOrigin: '0% 50%', transform: `scaleX(${w.cut})`}} /> : null}
          </div>
          {w.neu ? <div style={{position: 'absolute', left: (w.width - w.sticker) / 2, top: (ROW - 108) / 2, width: w.sticker, height: 108, borderRadius: 24, background: C.sage, boxShadow: CHIP,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY, fontWeight: 800, fontSize: SIZE, lineHeight: 1, color: C.ink, ...stamp(f, w.at, w.tilt)}}>{w.neu}</div> : null}
        </div>)}
        {/* the caret: waiting, then writing, then gone */}
        <div style={{position: 'absolute', left: caret + 4, top: 16, width: 7, height: ROW - 32, borderRadius: 4, background: C.rosa, opacity: idle * (1 - tween(f, TYPE + TYPING + 4, 5))}} />
      </div>
    </div>
  </div>;
};

// --- Pancho, in his corner: hello, then the look, then glad ----------------------
const Pancho: React.FC<{f: number}> = ({f}) => {
  const bob = Math.sin(f / 10) * 1.1;
  const hello = tween(f, 8, 12), ducks = tween(f, LOOK - 5, 5);
  const look = spring({frame: f - LOOK, fps: FPS, config: {damping: 13, stiffness: 150, mass: 0.8}});
  const glad = tween(f, SWAPS[0] + 5, 8);
  const nod = SWAPS.reduce((n, at) => n + Math.sin(Math.PI * interpolate(f, [at + 5, at + 15], [0, 1], CLAMP)), 0);
  const gone = tween(f, S6 - 6, LEAVE);
  return <>
    {f < LOOK + 2 ? <Img src={staticFile('pancho/saludando.png')} style={{position: 'absolute', left: 664, top: 846, height: 500, transformOrigin: '50% 100%', opacity: Math.min(1, hello * 2) * (1 - ducks),
      transform: `translateY(${(1 - hello) * 60 + ducks * 80}px) rotate(${bob}deg)`}} /> : null}
    {f >= LOOK && f < SWAPS[0] + 5 ? <Img src={staticFile('pancho/sideeye.png')} style={{position: 'absolute', left: 600, top: 888, height: 500, transformOrigin: '50% 100%', opacity: Math.min(1, look * 2),
      transform: `translateY(${(1 - look) * 170}px) rotate(${-3 + bob * 0.5}deg)`}} /> : null}
    {f >= SWAPS[0] + 5 ? <Img src={staticFile('pancho/gesto-mano.png')} style={{position: 'absolute', left: 566, top: 852, height: 520, transformOrigin: '50% 100%', opacity: 1 - gone,
      transform: `translateY(${nod * 16 + gone * 90}px) scale(${0.94 + 0.06 * glad}) rotate(${bob}deg)`}} /> : null}
  </>;
};

const PAIRS: [old: string, neu: string, top: number, tilt: number, side: 'left' | 'right'][] = [
  ['autobús', 'bondi', 420, -2, 'left'],
  ['dinero', 'guita', 612, 1.5, 'right'],
  ['OK', 'dale', 804, -1.5, 'left'],
];

/** The whole clip, once. */
const Take: React.FC<{f: number}> = ({f}) => {
  const leave = tween(f, END - LEAVE, LEAVE);
  const cardTop = 596 - 156 * tween(f, S4, 12, INOUT); // up into the room the question leaves
  const labelLeft = 540 - layout(0).width / 2 - PAD + 16;
  const more = '… in a textbook.';
  const roll = SWAPS.reduce((n, at) => n + tween(f, at + 5, 7), 0); // the counter: one, two, three
  const bump = Math.sin(Math.PI * tween(f, SWAPS[2] + 5, 10, t => t));
  const dale = spring({frame: f - DALE, fps: FPS, config: {damping: 10, stiffness: 180, mass: 0.7}});
  return <AbsoluteFill style={{opacity: 1 - leave, transform: `translateY(${-leave * 28}px) scale(${1 - 0.02 * leave})`}}>
    <Headlines f={f} cues={HEADLINES} />

    {f < S6 + OVERLAP ? <Pancho f={f} /> : null}

    {/* 1 · the question */}
    {f < S4 + OVERLAP ? <AbsoluteFill style={clear(f, S4 - 6)}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 366, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '38px 54px', borderRadius: 46, background: C.butter, boxShadow: STICKER, fontFamily: BODY, fontWeight: 800, fontSize: 78, lineHeight: '92px', color: C.ink, whiteSpace: 'nowrap', ...slap(f, ASK, 1.5)}}>Are you from here?</div>
      </div>
    </AbsoluteFill> : null}

    {/* 2, 3 and 4 · the answer, its tick, and what Buenos Aires does to it */}
    {f >= CARD && f < S5 + OVERLAP ? <AbsoluteFill style={clear(f, S5 - 4)}>
      <Sentence f={f} top={cardTop} />
      {f < S4 + OVERLAP ? <div style={clear(f, S4 - 4)}>
        <div style={{position: 'absolute', left: labelLeft, top: 596 + CARD_H + 24, display: 'flex', alignItems: 'center', gap: 12, fontFamily: BODY, fontWeight: 800, fontSize: 54, lineHeight: '64px', whiteSpace: 'pre', ...rise(f, TICK, 16)}}>
          <Icon code={ICON.tick} size={56} color={C.success} style={{transform: `scale(${0.7 + 0.3 * tween(f, TICK, 9)})`}} />
          <span><span style={{color: C.success}}>Correct</span><span style={{color: C.ink}}>{more.slice(0, Math.floor(interpolate(f, [MORE, MORE + 18], [0, more.length], CLAMP)))}</span></span>
        </div>
      </div> : null}
      {/* the count, on its own sticker */}
      <div style={{position: 'absolute', left: 64, top: 694, transformOrigin: '20% 50%', ...stamp(f, SWAPS[0] + 5, -3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 104, padding: '0 44px', borderRadius: 52, background: C.butter, boxShadow: STICKER, fontFamily: DISPLAY, fontWeight: 900, fontSize: 58, color: C.ink,
          whiteSpace: 'nowrap', transform: `scale(${1 + 0.1 * bump})`}}>
          <div style={{position: 'relative', width: 34, height: 70, overflow: 'hidden'}}>
            {[1, 2, 3].map(n => <div key={n} style={{position: 'absolute', inset: 0, lineHeight: '70px', textAlign: 'center', transform: `translateY(${(n - roll) * 70}px)`}}>{n}</div>)}
          </div>
          of 4 words changed
        </div>
      </div>
    </AbsoluteFill> : null}

    {/* 5 · three more, fast: the textbook word struck, the local one beside it */}
    {f >= S5 && f < S6 + OVERLAP ? <AbsoluteFill style={clear(f, S6 - 4)}>
      {PAIRS.map(([old, neu, top, tilt, side], k) => <div key={old} style={{position: 'absolute', [side]: 60, top, height: 150, padding: '0 58px 0 52px', display: 'flex', alignItems: 'center', gap: 30, borderRadius: 75,
        background: C.card, boxShadow: STICKER, transformOrigin: side === 'left' ? '0% 50%' : '100% 50%', ...slap(f, PILLS[k], tilt)}}>
        <div style={{position: 'relative', fontFamily: BODY, fontWeight: 700, fontSize: 62, lineHeight: 1, color: C.muted}}>
          {old}<div style={{position: 'absolute', left: -6, right: -6, top: '56%', height: 7, borderRadius: 4, background: C.coral, transformOrigin: '0% 50%', transform: `scaleX(${tween(f, PILLS[k] + 3, 5)})`}} />
        </div>
        <Icon code={ICON.arrow} size={52} color={C.muted} />
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, lineHeight: 1, letterSpacing: -2, color: C.rosaDark, transformOrigin: '0% 60%', ...slap(f, PILLS[k] + 5)}}>{neu}</div>
      </div>)}
    </AbsoluteFill> : null}

    {/* 6 · Pancho with his mate, and his one word */}
    {f >= S6 ? <>
      <div style={{position: 'absolute', left: 124, top: 600, width: 580, height: 580, borderRadius: 290, background: C.sage, boxShadow: STICKER, ...slap(f, S6 + 3)}} />
      <Img src={staticFile('pancho/mate.png')} style={{position: 'absolute', left: 170, top: 524, height: 700, transformOrigin: '50% 100%', opacity: tween(f, S6 + 5, 6),
        transform: `translateY(${(1 - tween(f, S6 + 5, 12)) * 60}px) rotate(${Math.sin(f / 10) * 1.1}deg)`}} />
      <div style={{position: 'absolute', left: 604, top: 424, padding: '24px 52px 30px', borderRadius: '70px 70px 70px 18px', background: C.card, boxShadow: STICKER, fontFamily: DISPLAY, fontWeight: 900, fontSize: 104,
        lineHeight: 1.1, letterSpacing: -2, color: C.rosaDark, whiteSpace: 'nowrap', transformOrigin: '0% 100%', opacity: Math.min(1, dale * 3), transform: `scale(${0.8 + 0.2 * dale})`}}>¿Dale?</div>
    </> : null}
  </AbsoluteFill>;
};

// Time to read it (the user, 2026-10-11: "siguen demasiado rápidos, el usuario no tiene tiempo para entender nada"):
// the timings above stay as written; the clip plays them 40% slower and rests after each beat has landed and before it starts to leave —
// the tick, the twist, the three words changed (the longest: that is the point of the clip), the pills, and ¿Dale?
const READ = slowed(TOTAL, 1.4, [[TICK + 16, 24], [S4 - LEAVE - 2, 30], [S5 - LEAVE - 2, 54], [S6 - LEAVE - 2, 36], [END - LEAVE - 6, 45]]);
export const FRAMES = READ.frames;
export const AhaLoop: React.FC = () => <Loop total={TOTAL} Take={Take} at={READ.at} />;
