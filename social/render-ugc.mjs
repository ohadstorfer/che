import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, renderStill} from '@remotion/renderer';
import path from 'path';
const id = process.argv[2];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id});
for (const f of [60, 200, 260]) await renderStill({composition, serveUrl, output: `out/ugc/${id}-f${f}.png`, frame: f});
await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: `out/ugc/${id}.mp4`});
console.log('done');
