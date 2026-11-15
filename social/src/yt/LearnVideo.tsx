// "How to Learn Argentine Spanish": the 16:9 YouTube video, in the sticker look of the reels.
// Pancho stands at the left edge and talks (lip-synced to Tomás's voice); what he names pops up on the right as
// stickers, phones and screens. One component for every video in videos.mjs; times come from timing/<id>.json (yt-vo.mjs).
import React from 'react';
import {AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';
import {Puppet, blink, type Rig} from '../versus/Puppet';
import {tween} from '../celeb/CelebReel';

export const FPS = 30, W = 1920, H = 1080;
const GAP = 21; // frames of quiet between chapters
const END_HOLD = 4 * FPS; // the end card stays after the last word
const C = {skyTop: '#BDE0F8', skyBottom: '#A1D1F3', card: '#FFF9F3', ink: '#3A2A20', rosa: '#B44A60', butter: '#FFE08A', sage: '#A8D5BA', flame: '#FF8A5B', screen: '#22303f'};
const DISPLAY = 'Gabarito, "Trebuchet MS", sans-serif';
const BODY = 'Figtree, "Helvetica Neue", sans-serif';
const STICKER: React.CSSProperties = {border: `7px solid ${C.ink}`, boxShadow: `9px 10px 0 ${C.ink}`};
export type Timing = Record<string, {seconds: number; mouth: string; cues: {at: number; then?: number; marks?: number[]}[]}>;

if (typeof document !== 'undefined') {
  const wait = delayRender('yt fonts');
  Promise.all([['Gabarito', 'Gabarito_900Black.ttf', 900], ['Gabarito', 'Gabarito_800ExtraBold.ttf', 800], ['Figtree', 'Figtree_700Bold.ttf', 700], ['Figtree', 'Figtree_800ExtraBold.ttf', 800]].map(([family, file, weight]) =>
    new FontFace(family as string, `url(${staticFile('fonts/' + file)})`, {weight: String(weight)}).load().then(l => document.fonts.add(l))))
    .then(() => continueRender(wait), () => continueRender(wait));
}

const sec = (s: number) => Math.round(s * FPS);
/** Where each chapter starts, in frames, and the whole length. */
export const ytTimeline = (video: any, T: Timing) => {
  const starts: number[] = []; let at = 10;
  for (const ch of video.chapters) { starts.push(at); at += Math.ceil(T[ch.id].seconds * FPS) + GAP; }
  return {starts, total: at - GAP + END_HOLD};
};

const slap = (frame: number, from: number, tilt = 0): React.CSSProperties => {
  const t = tween(frame, from, 10);
  return {opacity: Math.min(1, t * 2), transform: `rotate(${tilt}deg) scale(${0.86 + 0.14 * t})`};
};

const Sticker: React.FC<{el: any; frame: number; from: number}> = ({el, frame, from}) =>
  <div style={{...STICKER, ...slap(frame, from, el.tilt ?? 0), background: (C as any)[el.color ?? 'card'], borderRadius: 30, padding: '20px 38px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, maxWidth: 1180}}>
    {el.es ? <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, lineHeight: 1.05, color: el.color === 'rosa' ? C.card : C.ink, textAlign: 'center'}}>{el.es}</div> : null}
    {el.en ? <div style={{fontFamily: el.es ? BODY : DISPLAY, fontWeight: el.es ? 700 : 800, fontSize: el.es ? 38 : 60, color: el.color === 'rosa' ? C.card : C.ink, textAlign: 'center', lineHeight: 1.15}}>{el.en}</div> : null}
  </div>;

const Bubble: React.FC<{text: string; label?: string; frame: number; from: number}> = ({text, label, frame, from}) =>
  <div style={{position: 'relative', ...slap(frame, from, -1.5), maxWidth: 1120}}>
    {label ? <div style={{...STICKER, borderWidth: 5, boxShadow: `6px 7px 0 ${C.ink}`, position: 'absolute', left: 40, top: -44, zIndex: 2, background: label === 'Argentina' ? C.rosa : C.butter, color: label === 'Argentina' ? C.card : C.ink, borderRadius: 999, padding: '6px 28px', fontFamily: BODY, fontWeight: 800, fontSize: 36}}>{label}</div> : null}
    <div style={{...STICKER, background: C.card, borderRadius: 44, padding: '40px 56px', fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, lineHeight: 1.12, color: C.ink, textAlign: 'center'}}>{text}</div>
    {/* the tail points down-left, at Pancho */}
    <svg width="120" height="90" style={{position: 'absolute', left: -62, bottom: 30}} viewBox="0 0 120 90">
      <path d="M120 10 L4 80 L120 62" fill={C.card} stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
      <rect x="112" y="14" width="14" height="44" fill={C.card} />
    </svg>
  </div>;

const Phone: React.FC<{children: React.ReactNode; frame: number; from: number; tilt?: number; height?: number}> = ({children, frame, from, tilt = 0, height = 760}) =>
  <div style={{...slap(frame, from, tilt), height, width: height * 1206 / 2622, borderRadius: 58, border: `14px solid ${C.ink}`, boxShadow: `12px 14px 0 ${C.ink}`, overflow: 'hidden', background: C.ink}}>
    {children}
  </div>;

const AppLoop: React.FC = () => <Loop durationInFrames={sec(8)}><OffthreadVideo muted src={staticFile('end/app-highlights.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>;

const Logo: React.FC<{frame: number; from: number; big?: boolean}> = ({frame, from, big}) =>
  <div style={{...slap(frame, from, 2), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
    <Img src={staticFile('posta-icon.png')} style={{width: big ? 220 : 200, height: big ? 220 : 200, borderRadius: 48, ...STICKER}} />
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: big ? 120 : 104, color: C.ink, lineHeight: 1}}>Posta</div>
    <div style={{...STICKER, background: C.butter, borderRadius: 999, padding: '10px 30px', fontFamily: BODY, fontWeight: 800, fontSize: 36, color: C.ink}}>Argentine Spanish app</div>
  </div>;

const Strike: React.FC<{el: any; frame: number; from: number; then: number}> = ({el, frame, from, then}) => {
  const cut = tween(frame, then, 9), show = tween(frame, then + 9, 10);
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
    <div style={{position: 'relative', ...slap(frame, from, -2)}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, whiteSpace: 'nowrap', color: C.ink, opacity: 1 - 0.55 * cut}}>{el.from}</div>
      <div style={{position: 'absolute', left: -20, top: '52%', height: 16, borderRadius: 8, background: C.rosa, width: `calc(${cut * 100}% + 40px)`, opacity: cut > 0 ? 1 : 0}} />
    </div>
    {frame >= then + 9 ? <div style={{...STICKER, ...slap(frame, then + 9, 2), opacity: show, background: C.rosa, borderRadius: 30, padding: '20px 44px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, whiteSpace: 'nowrap', color: C.card}}>{el.to}</div> : null}
  </div>;
};

const Tv: React.FC<{el: any; frame: number; from: number}> = ({el, frame, from}) =>
  <div style={{...slap(frame, from, -1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
    {el.label ? <div style={{...STICKER, background: el.es ? C.rosa : C.card, color: el.es ? C.card : C.ink, borderRadius: 999, padding: '10px 34px', fontFamily: BODY, fontWeight: 800, fontSize: 40}}>{el.label}</div> : null}
    <div style={{...STICKER, width: 1060, height: 560, borderRadius: 32, background: `linear-gradient(160deg, #3d5470, ${C.screen})`, position: 'relative', overflow: 'hidden'}}>
      {/* a scene: two capybaras at a bar table */}
      <Img src={staticFile('pancho/sideeye.png')} style={{position: 'absolute', left: 120, bottom: 0, height: 360}} />
      <Img src={staticFile('pancho/mate.png')} style={{position: 'absolute', right: 120, bottom: -40, height: 420, transform: 'scaleX(-1)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: 'rgba(0,0,0,.72)', color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 46, padding: '10px 26px', borderRadius: 10}}>{el.cc}</div>
      </div>
      <div style={{position: 'absolute', right: 22, top: 20, background: '#fff', color: C.ink, fontFamily: BODY, fontWeight: 800, fontSize: 28, padding: '4px 14px', borderRadius: 8}}>CC · {el.es || /¿/.test(el.cc) ? 'ES' : 'EN'}</div>
    </div>
  </div>;

// One word in three countries: the English meaning on top, Argentina big in rosa, Spain and Mexico smaller beside it.
const Compare: React.FC<{el: any; frame: number; from: number}> = ({el, frame, from}) => {
  const cell = (country: string, word: string, main: boolean, delay: number) =>
    <div style={{...slap(frame, from + delay), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: main ? 420 : 280}}>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: main ? C.rosa : C.ink, opacity: main ? 1 : 0.7}}>{country.toUpperCase()}</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: main ? 84 : 58, color: main ? C.rosa : C.ink, opacity: main ? 1 : 0.75, whiteSpace: 'nowrap'}}>{word}</div>
    </div>;
  return <div style={{...STICKER, ...slap(frame, from, -0.6), background: C.card, borderRadius: 28, padding: '14px 36px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 38, color: C.ink, opacity: 0.8}}>{el.en}</div>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 30}}>
      {cell('Argentina', el.ar, true, 0)}{cell('Spain', el.es, false, 5)}{cell('Mexico', el.mx, false, 9)}
    </div>
  </div>;
};

const Steps: React.FC<{items: string[]; frame: number; from: number}> = ({items, frame, from}) =>
  <div style={{display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'stretch', width: 1040}}>
    {items.map((s, i) => <div key={s} style={{...STICKER, ...slap(frame, from + i * 7, i % 2 ? 1 : -1), background: i % 2 ? C.card : C.butter, borderRadius: 26, padding: '14px 30px', display: 'flex', alignItems: 'center', gap: 26}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: C.rosa, width: 50, textAlign: 'center'}}>{i + 1}</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.ink, whiteSpace: 'nowrap'}}>{s}</div>
    </div>)}
  </div>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const Week: React.FC<{frame: number; from: number; marks: number[]}> = ({frame, from, marks}) => {
  const chip = (text: string, bg: string, at: number, key: string) => frame >= at ?
    <div key={key} style={{...slap(frame, at), background: bg, border: `5px solid ${C.ink}`, borderRadius: 16, padding: '10px 0', fontFamily: BODY, fontWeight: 800, fontSize: 30, color: bg === C.rosa ? C.card : C.ink, textAlign: 'center'}}>{text}</div> : <div key={key} style={{height: 61}} />;
  return <div style={{...slap(frame, from), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 100, color: C.ink}}>Your week</div>
    <div style={{display: 'flex', gap: 16}}>
      {DAYS.map((d, i) => <div key={d} style={{...STICKER, borderWidth: 5, boxShadow: `6px 7px 0 ${C.ink}`, background: C.card, borderRadius: 20, width: 166, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 42, color: C.ink, textAlign: 'center'}}>{d}</div>
        {chip('app', C.rosa, marks[0] + i * 3, 'a')}
        {i === 1 || i === 5 ? chip('episode', C.skyBottom, marks[1] + (i === 5 ? 6 : 0), 'e') : <div style={{height: 61}} />}
        {i === 3 ? chip('class', C.butter, marks[2], 'c') : <div style={{height: 61}} />}
      </div>)}
    </div>
    <div style={{display: 'flex', gap: 50, fontFamily: BODY, fontWeight: 800, fontSize: 42, color: C.ink}}>
      <span style={{opacity: frame >= marks[0] ? 1 : 0}}>10 min a day</span>
      <span style={{opacity: frame >= marks[1] ? 1 : 0}}>2 episodes</span>
      <span style={{opacity: frame >= marks[2] ? 1 : 0}}>1 class</span>
    </div>
  </div>;
};

const End: React.FC<{frame: number; from: number; guide: string}> = ({frame, from, guide}) =>
  <div style={{display: 'flex', alignItems: 'center', gap: 56}}>
    <Phone frame={frame} from={from} tilt={-3} height={780}><AppLoop /></Phone>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <Logo frame={frame} from={from + 6} big />
      <div style={{...slap(frame, from + 14), display: 'flex', gap: 24, alignItems: 'flex-start'}}>
        <Img src={staticFile('end/badge-google-play.png')} style={{height: 96}} />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
          <Img src={staticFile('end/badge-app-store.svg')} style={{height: 96}} />
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 26, color: C.ink, letterSpacing: 2}}>COMING SOON</div>
        </div>
      </div>
      <div style={{...slap(frame, from + 22), ...STICKER, borderWidth: 5, boxShadow: `6px 7px 0 ${C.ink}`, background: C.card, borderRadius: 18, padding: '10px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: BODY, color: C.ink}}>
        <span style={{fontWeight: 800, fontSize: 24, letterSpacing: 2}}>FREE GUIDE</span>
        <span style={{fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>{guide}</span>
      </div>
    </div>
  </div>;

function Element({el, frame, from, cue, guide}: {el: any; frame: number; from: number; cue: any; guide: string}) {
  switch (el.kind) {
    case 'bubble': return <Bubble text={el.text} label={el.label} frame={frame} from={from} />;
    case 'compare': return <Compare el={el} frame={frame} from={from} />;
    case 'steps': return <Steps items={el.items} frame={frame} from={from} />;
    case 'strike': return <Strike el={el} frame={frame} from={from} then={cue.then} />;
    case 'phone': return <Phone frame={frame} from={from} tilt={el.tilt}><Img src={staticFile(el.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Phone>;
    case 'phonevid': return <Phone frame={frame} from={from} tilt={-3}><AppLoop /></Phone>;
    case 'logo': return <Logo frame={frame} from={from + 8} />;
    case 'tv': return <Tv el={el} frame={frame} from={from} />;
    case 'week': return <Week frame={frame} from={from} marks={cue.marks} />;
    case 'end': return <End frame={frame} from={from} guide={guide} />;
    default: return <Sticker el={el} frame={frame} from={from} />;
  }
}

/** The stage for one chapter: the cues of the group being shown, each from the moment it is said. */
const Stage: React.FC<{ch: any; start: number; frame: number; T: Timing; guide: string}> = ({ch, start, frame, T, guide}) => {
  const cues = ch.cues.map((c: any, i: number) => ({...c, from: start + sec(T[ch.id].cues[i].at), then: start + sec(T[ch.id].cues[i].then ?? 0), marks: T[ch.id].cues[i].marks?.map((m: number) => start + sec(m))}));
  let g = -1;
  cues.forEach((c: any, i: number) => { if (c.group && frame >= c.from) g = i; });
  if (g < 0) return null;
  const shown = [];
  for (let i = g; i < cues.length && (i === g || !cues[i].group); i++) if (frame >= cues[i].from) shown.push({...cues[i], i});
  const wide = shown.some(c => ['tv', 'week', 'end', 'steps', 'bubble', 'strike', 'compare'].includes(c.el.kind));
  return <div style={{position: 'absolute', left: 640, right: 50, top: ch.title ? 200 : 80, bottom: 50, display: 'flex', flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', alignContent: 'center', gap: 40}}>
    {shown.map(c => <Element key={c.i} el={c.el} frame={frame} from={c.from} cue={c} guide={guide} />)}
  </div>;
};

const Header: React.FC<{ch: any; frame: number; from: number}> = ({ch, frame, from}) =>
  <div style={{position: 'absolute', left: 640, right: 50, top: 50, display: 'flex', justifyContent: 'center'}}>
    <div style={{...STICKER, ...slap(frame, from, -1.5), background: C.card, borderRadius: 999, padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 22}}>
      {ch.step ? <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.rosa}}>{ch.step}</span> : null}
      <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, color: C.ink}}>{ch.title}</span>
    </div>
  </div>;

export const LearnVideo: React.FC<{video: any; timing: Timing}> = ({video, timing: T}) => {
  const frame = useCurrentFrame();
  const CHAPTERS = video.chapters;
  const {starts} = ytTimeline(video, T);
  let k = 0; starts.forEach((s, i) => { if (frame >= s) k = i; });
  const ch: any = CHAPTERS[k], start = starts[k], local = frame - start;
  const mouth = T[ch.id].mouth[local] ?? 'c';
  // The Argentinian Pancho (celeste y blanca), as in the versus and blur reels. The drawing faces left, so it is mirrored.
  const rig: Rig = {size: [632, 1069], eye: [357, 121, 27, 23], fur: '#C0804E'};
  // c1 opens on the hook line alone; its title comes in with the third cue.
  const headerAt = k === 0 ? start + sec(T[ch.id].cues[2].at) : start;
  const isEnd = k === CHAPTERS.length - 1 && frame >= start + sec(T[ch.id].cues.at(-1)!.at);
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`}}>
    {/* soft clouds */}
    <div style={{position: 'absolute', left: 1240, top: 120, width: 520, height: 150, borderRadius: 999, background: 'rgba(255,255,255,.35)', transform: `translateX(${-(frame % 3000) * 0.05}px)`}} />
    <div style={{position: 'absolute', left: 700, top: 820, width: 640, height: 170, borderRadius: 999, background: 'rgba(255,255,255,.25)', transform: `translateX(${(frame % 3000) * 0.04}px)`}} />
    {CHAPTERS.map((c: any, i: number) => <Sequence key={c.id} from={starts[i]}><Audio src={staticFile(`vo/${video.vo}/${c.id}.mp3`)} /></Sequence>)}
    {frame >= headerAt && !isEnd ? <Header ch={ch} frame={frame} from={headerAt} /> : null}
    <Stage ch={{...ch, title: frame >= headerAt && !isEnd}} start={start} frame={frame} T={T} guide={video.guide} />
    <div style={{position: 'absolute', left: 20, bottom: -40, transform: 'scaleX(-1)'}}>
      <Puppet id="yt-pancho" sprite="ar-arm/ar" rig={rig} height={1010} mouth={mouth} lean={2.5 * Math.sin(frame / 40)} lid={blink(frame, 1.3)} wave={0} />
    </div>
  </AbsoluteFill>;
};

/** The thumbnail, 1280x720: the video's headline lines on the left, a Pancho drawing on the right. */
export const LearnThumb: React.FC<{video: any}> = ({video}) => {
  const t = video.thumb;
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.skyTop}, ${C.skyBottom})`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 56, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6}}>
      {t.lines.map(([text, color, size]: [string, string, number]) => <div key={text} style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: (C as any)[color], lineHeight: 1}}>{text}</div>)}
      <div style={{...STICKER, alignSelf: 'flex-start', marginTop: 22, background: C.butter, borderRadius: 999, padding: '8px 30px', fontFamily: BODY, fontWeight: 800, fontSize: 38, color: C.ink}}>{t.pill}</div>
    </div>
    <Img src={staticFile(t.image)} style={{position: 'absolute', right: -10, bottom: -40, height: 660, ...t.imageStyle}} />
    <div style={{...STICKER, position: 'absolute', right: 300, top: 50, transform: 'rotate(6deg)', background: C.card, borderRadius: 32, padding: '12px 30px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 72, color: C.rosa, whiteSpace: 'nowrap', ...t.stickerStyle}}>{t.sticker}</div>
  </AbsoluteFill>;
};
