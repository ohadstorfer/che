// Renders the store-screenshots reel close: out/end/end-store-shots.mp4 (+ a few check frames).
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const id = 'end-store-shots';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id});
for (const f of [10, 28, 100, 240, 265]) await renderStill({composition, serveUrl, output: `out/end/${id}-f${f}.png`, frame: f});
await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: `out/end/${id}.mp4`});
console.log('done', composition.durationInFrames);
