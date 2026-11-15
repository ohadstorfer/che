// usage: OUT=approved node render-reels.mjs <composition id> …   -> <OUT>/reels/<id>.mp4
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'fs'; import path from 'path';
const root = process.env.OUT || 'out';
fs.mkdirSync(`${root}/reels`, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const id of process.argv.slice(2)) {
  const out = `${root}/reels/${id}.mp4`;
  if (fs.existsSync(out)) continue;
  try {
    const composition = await selectComposition({serveUrl, id});
    await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: `${out}.tmp.mp4`});
    fs.renameSync(`${out}.tmp.mp4`, out);
    console.log('done', id);
  } catch (e) {
    console.log('FAILED', id, e.message);
  }
}
