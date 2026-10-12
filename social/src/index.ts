import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Reel, DURATION, FPS} from './Video';
import {VIDEOS} from './data';
import {PanchoReel, timeline} from './pancho/PanchoReel';
import {REELS} from './pancho/reels.mjs';
import {VersusReel, timeline as versusTimeline} from './versus/VersusReel';
import {VERSUS} from './versus/reels.mjs';
import {VeoReel, veoTimeline} from './versus/VeoReel';
import {CelebReel, celebTimeline} from './celeb/CelebReel';
import {CaptionsReel} from './celeb/CaptionsReel';
import {CELEBS} from './celeb/reels.mjs';
import {WIDTH as ONB_W, HEIGHT as ONB_H} from './onboarding/kit';
import {CoreLoop, TOTAL as CORE_TOTAL} from './onboarding/CoreLoop';
import {ChatLoop, TOTAL as CHAT_TOTAL} from './onboarding/ChatLoop';
import {AhaLoop, FRAMES as AHA_TOTAL} from './onboarding/AhaLoop';
import {CourseLoop, FRAMES as COURSE_TOTAL} from './onboarding/CourseLoop';
import {COURSES} from './onboarding/reels.mjs';

// Clips are recorded by pancho-vo.mjs / versus-vo.mjs; a reel with no recording yet is skipped.
const clipsFor = (dir: string, id: string) => { try { return require(`./${dir}/${id}.json`); } catch { return null; } };

const Root: React.FC = () => React.createElement(React.Fragment, null,
  VIDEOS.map(v => React.createElement(Composition, {key: v.id, id: v.id, component: Reel as any, durationInFrames: DURATION, fps: FPS, width: 1080, height: 1920, defaultProps: {video: v}})),
  REELS.map((r: any) => { const clips = clipsFor('pancho', r.id); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: PanchoReel as any, durationInFrames: timeline(r, clips).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  VERSUS.filter((r: any) => r.veo).map((r: any) => { const clips = clipsFor('versus', r.voices); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: VeoReel as any, durationInFrames: veoTimeline(r).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  VERSUS.filter((r: any) => !r.veo).map((r: any) => { const clips = clipsFor('versus', r.id); return clips ? React.createElement(Composition, {key: r.id, id: r.id, component: VersusReel as any, durationInFrames: versusTimeline(r, clips).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r, clips}}) : null; }),
  CELEBS.map((r: any) => React.createElement(Composition, {key: r.id, id: r.id, component: (r.look === 'captions' ? CaptionsReel : CelebReel) as any, durationInFrames: celebTimeline(r).total, fps: FPS, width: 1080, height: 1920, defaultProps: {reel: r}})),
  React.createElement(Composition, {id: 'onb-core', component: CoreLoop, durationInFrames: CORE_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  React.createElement(Composition, {id: 'onb-chat', component: ChatLoop, durationInFrames: CHAT_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  React.createElement(Composition, {id: 'onb-aha', component: AhaLoop, durationInFrames: AHA_TOTAL, fps: FPS, width: ONB_W, height: ONB_H}),
  COURSES.map((c: any) => React.createElement(Composition, {key: c.id, id: c.id, component: CourseLoop as any, durationInFrames: COURSE_TOTAL, fps: FPS, width: ONB_W, height: ONB_H, defaultProps: {why: c.why, tier: c.tier}})));
registerRoot(Root);
