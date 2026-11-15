import React from 'react';
import {registerRoot, Composition, Still} from 'remotion';
import {Reel, DURATION, FPS} from './Video';
import {VIDEOS} from './data';
import {PanchoReel, timeline} from './pancho/PanchoReel';
import {REELS} from './pancho/reels.mjs';
import {VersusReel, timeline as versusTimeline} from './versus/VersusReel';
import {VERSUS} from './versus/reels.mjs';
import {VeoReel, veoTimeline} from './versus/VeoReel';
import {CelebReel, celebTimeline} from './celeb/CelebReel';
import {CaptionsReel} from './celeb/CaptionsReel';
import {BlurReel} from './celeb/BlurReel';
import {CELEBS} from './celeb/reels.mjs';
import {WIDTH as ONB_W, HEIGHT as ONB_H} from './onboarding/kit';
import {CoreLoop, TOTAL as CORE_TOTAL} from './onboarding/CoreLoop';
import {ChatLoop, TOTAL as CHAT_TOTAL} from './onboarding/ChatLoop';
import {AhaLoop, FRAMES as AHA_TOTAL} from './onboarding/AhaLoop';
import {CourseLoop, FRAMES as COURSE_TOTAL} from './onboarding/CourseLoop';
import {COURSES} from './onboarding/reels.mjs';
import {UgcReel, cardFrames, girlFrames} from './ugc/UgcReel';
import {StoreShotsClose, STORE_CLOSE_FRAMES} from './ugc/StoreShotsClose';
import {UGC} from './ugc/reels.mjs';
import {WordSlide, WIDTH as CAR_W, HEIGHT as CAR_H} from './carousel/WordSlide';
import {CAROUSELS} from './carousel/carousels.mjs';
import {DrakeSlide} from './carousel/DrakeSlide';
import {DRAKES} from './carousel/drakes.mjs';
import {QuizReel, quizTimeline} from './carousel/QuizReel';
import {WordQuizReel, wordQuizTimeline} from './carousel/WordQuizReel';
import {WORD_QUIZZES} from './carousel/wordquiz.mjs';
import {StoreShot, StoreHeader, LandingScreen, LANDING_SCREEN, HEADER as STORE_HEADER, SIZES as STORE_SIZES} from './store/StoreShot';
import {SHOTS as STORE_SHOTS} from './store/shots.mjs';
import {CultureReel, cultureTimeline} from './culture/CultureReel';
import {CULTURE} from './culture/reels.mjs';
import {LiteralReel, literalTimeline} from './literal/LiteralReel';
import {LITERAL} from './literal/reels.mjs';
import {BoxReel, boxTimeline} from './box/BoxReel';
import {BOX} from './box/reels.mjs';
import {LearnVideo, LearnThumb, ytTimeline} from './yt/LearnVideo';
import {VIDEOS as YT_VIDEOS} from './yt/videos.mjs';
import {RigTest, RIG_TEST_FRAMES} from './rig/RigTest';

// Clips are recorded by pancho-vo.mjs / versus-vo.mjs; a reel with no recording yet is skipped.
const clipsFor = (dir: string, id: string) => { try { return require(`./${dir}/${id}.json`); } catch { return null; } };

const Root: React.FC = () => React.createElement(React.Fragment, null,
  VIDEOS.map(v => React.createElement(Composition, {key: v.id, id: v.id, component: Reel as any, durationInFrames: DURATION, fps: FPS, width: 1080, height: 1920, defaultProps: {video: v}})),
  REELS.map((r: any) => { const clips = clipsFor('pancho', r.id); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: PanchoReel as any, durationInFrames: timeline(r, clips).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  VERSUS.filter((r: any) => r.veo).map((r: any) => { const clips = clipsFor('versus', r.voices); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: VeoReel as any, durationInFrames: veoTimeline(r).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  VERSUS.filter((r: any) => !r.veo).map((r: any) => { const clips = clipsFor('versus', r.id); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: VersusReel as any, durationInFrames: versusTimeline(r, clips).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  CELEBS.map((r: any) => React.createElement(Composition, {key: r.id, id: r.id, component: (r.look === 'captions' ? CaptionsReel : r.look === 'blur' ? BlurReel : CelebReel) as any, durationInFrames: celebTimeline(r).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r}})),
  React.createElement(Composition, {id: 'onb-core', component: CoreLoop, durationInFrames: CORE_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  React.createElement(Composition, {id: 'onb-chat', component: ChatLoop, durationInFrames: CHAT_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  React.createElement(Composition, {id: 'onb-aha', component: AhaLoop, durationInFrames: AHA_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  COURSES.map((c: any) => React.createElement(Composition, {key: c.id, id: c.id, component: CourseLoop as any, durationInFrames: COURSE_TOTAL, fps: FPS, width: ONB_W, height: ONB_H, defaultProps: {why: c.why, tier: c.tier}})),
  UGC.map((r: any) => React.createElement(Composition, {key: r.id, id: r.id, component: UgcReel as any, durationInFrames: girlFrames(r) + cardFrames(r), fps: 30, width: 1080, height: 1920, defaultProps: {reel: r}})),
  CAROUSELS.flatMap((c: any) => Array.from({length: c.uses.length + 2}, (_, i) => React.createElement(Still, {key: `${c.id}-${i + 1}`, id: `${c.id}-${i + 1}`, component: WordSlide as any, width: CAR_W, height: CAR_H, defaultProps: {c, slide: i}}))),
  DRAKES.flatMap((c: any) => [0, ...Array.from({length: c.pairs.length + 2}, (_, i) => i + 1)].map(n => React.createElement(Still, {key: `${c.id}-${n}`, id: `${c.id}-${n}`, component: DrakeSlide as any, width: CAR_W, height: CAR_H, defaultProps: {c, slide: n === 0 ? -1 : n - 1}}))),
  WORD_QUIZZES.map((q: any) => React.createElement(Composition, {key: q.id, id: q.id, component: WordQuizReel as any, durationInFrames: wordQuizTimeline(q.rounds.length).total, fps: 30, width: 1080, height: 1920, defaultProps: {q}})),
  DRAKES.map((c: any) => React.createElement(Composition, {key: `quiz-${c.id}`, id: `quiz-${c.id}`, component: QuizReel as any, durationInFrames: quizTimeline().total, fps: 30, width: 1080, height: 1920, defaultProps: {c}})),
  STORE_SHOTS.flatMap((s: any) => ((s.stores ?? ['ios', 'play']) as ('ios' | 'play')[]).map(size => React.createElement(Still, {key: `${s.id}-${size}`, id: `${s.id}-${size}`, component: StoreShot as any, width: STORE_SIZES[size].w, height: STORE_SIZES[size].h, defaultProps: {shot: s, size}}))),
  React.createElement(Composition, {id: 'end-store-shots', component: StoreShotsClose, durationInFrames: STORE_CLOSE_FRAMES, fps: 30, width: 1080, height: 1920}),
  ['01', '03', '04', '05', '06', '09'].map(n => React.createElement(Still, {key: n, id: `landing-screen-${n}`, component: LandingScreen as any, width: LANDING_SCREEN.w, height: LANDING_SCREEN.h, defaultProps: {screen: `store/screen-${n}.png`}})),
  BOX.map((r: any) => { const clips = clipsFor('box', r.id); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: BoxReel as any, durationInFrames: boxTimeline(r, clips).total, fps: 30, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  LITERAL.map((r: any) => React.createElement(Composition, {key: r.id, id: r.id, component: LiteralReel as any, durationInFrames: literalTimeline(r).total, fps: 30, width: 1080, height: 1920, defaultProps: {reel: r}})),
  CULTURE.map((r: any) => React.createElement(Composition, {key: r.id, id: r.id, component: CultureReel as any, durationInFrames: cultureTimeline(r).total, fps: 30, width: 1080, height: 1920, defaultProps: {reel: r}})),
  YT_VIDEOS.map((v: any) => { const timing = clipsFor('yt/timing', v.id); return timing ? React.createElement(Composition, {key: v.id, id: v.id, component: LearnVideo as any, durationInFrames: ytTimeline(v, timing).total, fps: 30, width: 1920, height: 1080, defaultProps: {video: v, timing}}) : null; }),
  YT_VIDEOS.map((v: any) => React.createElement(Still, {key: v.id + '-thumb', id: v.id + '-thumb', component: LearnThumb as any, width: 1280, height: 720, defaultProps: {video: v}})),
  React.createElement(Composition, {id: 'rig-test', component: RigTest, durationInFrames: RIG_TEST_FRAMES, fps: 30, width: 1080, height: 1920}),
  React.createElement(Still, {id: 'store-header', component: StoreHeader, width: STORE_HEADER.w, height: STORE_HEADER.h}));
registerRoot(Root);
