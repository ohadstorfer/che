// Culture reels → posta-videos/culture/<id>-vN.mp4 (next free N) + stills of each scene in out/culture/.
// node render-culture.mjs [id…]   (no ids = all)
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, renderStill} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {CULTURE} from './src/culture/reels.mjs';
const OUT = '/Users/ohadstorfer/che/posta-videos/culture';
const ids = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
fs.mkdirSync(OUT, {recursive: true}); fs.mkdirSync('out/culture', {recursive: true});
for (const r of CULTURE.filter(r => !ids.length || ids.includes(r.id))) {
  const composition = await selectComposition({serveUrl, id: r.id});
  let at = 0;
  for (const [i, sc] of r.scenes.entries()) { const len = Math.round(sc.s * 30); await renderStill({composition, serveUrl, output: `out/culture/${r.id}-s${i + 1}.png`, frame: at + len - 8, scale: 0.4}); at += len; }
  let n = 1; while (fs.existsSync(`${OUT}/${r.id}-v${n}.mp4`)) n++;
  await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: `${OUT}/${r.id}-v${n}.mp4`});
  console.log(`${OUT}/${r.id}-v${n}.mp4`);
}
