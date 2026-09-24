import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Reel, DURATION, FPS} from './Video';
import {VIDEOS} from './data';

const Root: React.FC = () => React.createElement(React.Fragment, null,
  VIDEOS.map(v => React.createElement(Composition, {key: v.id, id: v.id, component: Reel as any, durationInFrames: DURATION, fps: FPS, width: 1080, height: 1920, defaultProps: {video: v}})));
registerRoot(Root);
