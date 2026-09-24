// usage: node render.mjs [id-prefix]   -> out/<id>.mp4
// Background: drop backgrounds/<id>.mp4 (any name starting with the id). Missing = gradient.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'fs'; import path from 'path';
const only = process.argv[2] || '';
const entry = path.resolve('src/index.ts');
const bundled = await bundle({entryPoint: entry, publicDir: path.resolve('public')});
fs.mkdirSync('out', {recursive: true});
const {VIDEOS} = await import('./ids.mjs');
for (const id of VIDEOS.filter(i => i.startsWith(only))) {
  const f = fs.readdirSync('backgrounds').find(x => x.startsWith(id) && /\.(mp4|mov|webm)$/.test(x));
  let bg;
  if (f) { fs.copyFileSync(path.join('backgrounds', f), path.join('public/bg', f)); bg = `bg/${f}`; }
  const comp = await selectComposition({serveUrl: bundled, id, inputProps: {bg}});
  await renderMedia({composition: comp, serveUrl: bundled, codec: 'h264', outputLocation: `out/${id}.mp4`, inputProps: {bg}});
  console.log('done', id, bg ? '(with bg)' : '(gradient bg)');
}
