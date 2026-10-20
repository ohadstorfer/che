// The onboarding's clip about the chat with Pancho: one conversation at the café, in
// three beats. She says it out loud, he corrects one thing, and the card grows the
// local way to say it. Silent; the last frames hand over to the first, so it loops.
// Everything is timed in frames from the start of the take: move a beat's numbers and
// the rest follows.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Avatar, BODY, Bars, C, CHIP, Diff, Headlines, type HeadlineCue, ICON, INOUT, Icon, LEAVE, Loop, Mic, OVERLAP, STICKER, clear, press, rise, slap, tween} from './kit';

// 1 · say it out loud: Pancho's opener, her order, the tick
const P1 = 6, REC1 = 24, SAID1 = 44, TICK = 54;
// 2 · get corrected kindly: his question, her answer, the fix
const S2 = 86, P2 = 92, REC2 = 108, SAID2 = 128, FIX = 138, STRIKE = 148, ADD = 153;
// 3 · learn the local way: his question scrolls away, and the card under her line grows
const S3 = 186, UP = 188, GROW = 198, LOCAL = 208;
const ROW = 194; // one line of the thread, top to top
const END = 270;
/** The loop's length: the take, less the frames it shares with the next one's arrival. */
export const TOTAL = END - OVERLAP;

const TEXT: React.CSSProperties = {fontFamily: BODY, fontWeight: 600, fontSize: 60, lineHeight: '84px', whiteSpace: 'nowrap'};
const HIS = '78px 78px 78px 22px', HERS = '78px 78px 22px 78px'; // the tail is at the speaker's side
const LOCAL_H = 173; // the local way's block, at full height

/** One of Pancho's lines: his avatar and the bubble. A ring goes out from him twice while he says it, as the mic's does while she talks. */
const PanchoLine: React.FC<{f: number; at: number; top: number; children: string}> = ({f, at, top, children}) => {
  const since = f - at - 4, speaking = since >= 0 && since < 28;
  const ring = (since % 14) / 14;
  return <div style={{position: 'absolute', left: 60, top, display: 'flex', alignItems: 'flex-end', gap: 24, transformOrigin: '0% 100%', ...slap(f, at)}}>
    <div style={{position: 'relative', flexShrink: 0}}>
      {speaking ? <div style={{position: 'absolute', inset: 0, borderRadius: 64, background: C.rosa, opacity: 0.75 * (1 - ring), transform: `scale(${1 + 0.5 * ring})`}} /> : null}
      <div style={{position: 'relative', transform: `scale(${speaking ? 1 + 0.05 * Math.sin(Math.PI * ring) : 1})`}}><Avatar size={128} /></div>
    </div>
    <div style={{...TEXT, color: C.ink, background: C.card, padding: '34px 50px', borderRadius: HIS, boxShadow: STICKER}}>{children}</div>
  </div>;
};

/** One of her lines: the dashed bubble with her voice in it while the mic listens, then her words. */
const HerLine: React.FC<{f: number; rec: number; said: number; top: number; children: string}> = ({f, rec, said, top, children}) => <>
  <div style={{position: 'absolute', right: 60, top, height: 152, padding: '0 56px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12, borderRadius: HERS,
    border: `5px dashed ${C.rosa}`, background: C.card, transformOrigin: '100% 100%', opacity: tween(f, rec + 2, 6) * (1 - tween(f, said, 4)), transform: `scale(${0.94 + 0.06 * tween(f, rec + 2, 8)})`}}>
    <Bars f={f} n={7} w={12} h={68} color={C.rosa} />
  </div>
  <div style={{position: 'absolute', right: 60, top, ...TEXT, color: '#fff', background: C.rosa, padding: '34px 50px', borderRadius: HERS, boxShadow: STICKER, transformOrigin: '100% 100%', ...slap(f, said)}}>{children}</div>
</>;

const HEADLINES: HeadlineCue[] = [
  ['Say it', 'out loud', 0, S2 + OVERLAP],
  ['Get corrected', 'kindly', S2, S3 + OVERLAP],
  ['Learn the', 'local way', S3, END + LEAVE],
];

/** The whole conversation, once. */
const Take: React.FC<{f: number}> = ({f}) => {
  const listening = (f >= REC1 && f < SAID1) || (f >= REC2 && f < SAID2);
  const leave = tween(f, END - LEAVE, LEAVE);
  const grown = tween(f, GROW, 12);
  const up = ROW * tween(f, UP, 12, INOUT);
  const pop = tween(f, TICK, 9);
  return <AbsoluteFill style={{opacity: 1 - leave, transform: `translateY(${-leave * 28}px) scale(${1 - 0.02 * leave})`}}>
    <Headlines f={f} cues={HEADLINES} />

    {/* 1 · at the café: he asks, she orders, and it was right */}
    {f < S2 + OVERLAP ? <AbsoluteFill style={clear(f, S2 - 4)}>
      <div style={{position: 'absolute', left: 60, top: 430, height: 84, padding: '0 34px 0 26px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 42, background: C.card, boxShadow: CHIP,
        fontFamily: BODY, fontWeight: 800, fontSize: 44, color: C.ink, transformOrigin: '0% 50%', ...slap(f, 2, -2)}}>
        <Icon code={ICON.cafe} size={48} color={C.ink} />At the café
      </div>
      <PanchoLine f={f} at={P1} top={548}>¡Buenas! ¿Qué te traigo?</PanchoLine>
      <HerLine f={f} rec={REC1} said={SAID1} top={736}>Un cortado, por favor.</HerLine>
      <div style={{position: 'absolute', right: 74, top: 908, display: 'flex', alignItems: 'center', gap: 10, fontFamily: BODY, fontWeight: 800, fontSize: 46, lineHeight: '56px', color: C.success, ...rise(f, TICK, 16)}}>
        <Icon code={ICON.tick} size={48} color={C.success} style={{transform: `scale(${0.7 + 0.3 * pop})`}} />Correct
      </div>
    </AbsoluteFill> : null}

    {/* 2 and 3 · he asks again, she slips, and the card under her line puts it right */}
    {f >= S2 ? <>
      <AbsoluteFill style={clear(f, S3)}><PanchoLine f={f} at={P2} top={430}>Dale. ¿Sos de acá?</PanchoLine></AbsoluteFill>
      <HerLine f={f} rec={REC2} said={SAID2} top={430 + ROW - up}>No. ¿Y tú eres de acá?</HerLine>
      <div style={{position: 'absolute', right: 60, top: 430 + ROW + 182 - up, padding: '30px 44px', borderRadius: '56px 18px 56px 56px', background: 'rgba(201,85,62,0.14)', ...rise(f, FIX, 26)}}>
        <div style={{...TEXT, display: 'flex', alignItems: 'center', color: C.ink}}>
          <Diff before="¿Y" removed="tú eres" fixed="vos sos" after="de acá?" struck={tween(f, STRIKE, 8)} added={tween(f, ADD, 10)} room={270} />
        </div>
        {/* the Argentinian way to say it, under a line in the same card */}
        <div style={{height: grown * LOCAL_H, overflow: 'hidden'}}>
          <div style={{marginTop: 20, paddingTop: 20, borderTop: `3px solid ${C.line}`}}>
            <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 38, lineHeight: '46px', color: C.muted, opacity: tween(f, GROW + 4, 8)}}>A more Argentinian way to say it:</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 72, lineHeight: '84px', color: C.ink, transformOrigin: '0% 60%', ...slap(f, LOCAL)}}>¿Y vos?</div>
          </div>
        </div>
      </div>
    </> : null}

    <div style={{position: 'absolute', left: 445, top: 1074, width: 190, height: 190, ...rise(f, 5, 40)}}>
      <Mic size={190} listening={listening} since={f - (f < S2 ? REC1 : REC2)} scale={[REC1, SAID1, REC2, SAID2].reduce((k, at) => k * press(f, at - 3, 6, 0.06), 1)} />
    </div>
  </AbsoluteFill>;
};

export const ChatLoop: React.FC = () => <Loop total={TOTAL} Take={Take} />;
