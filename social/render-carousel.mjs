// usage: node render-carousel.mjs [id-prefix …]   -> out/carousels/<id>/01.png …, out/carousels-drake/<id>/01.png … (00 = the "Stop saying" cover)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs'; import path from 'path';
import {CAROUSELS} from './src/carousel/carousels.mjs';
import {DRAKES} from './src/carousel/drakes.mjs';
const only = process.argv.slice(2);
const root = process.env.OUT || 'out';
const wanted = c => !only.length || only.some(p => c.id.startsWith(p));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const render = async (id, dir, slides) => {
  fs.mkdirSync(dir, {recursive: true});
  for (const i of slides) {
    const composition = await selectComposition({serveUrl, id: `${id}-${i}`});
    await renderStill({composition, serveUrl, output: `${dir}/${String(i).padStart(2, '0')}.png`});
  }
  console.log('done', id);
};
// LAST=1 renders only the ending slide, for a change to the ending alone.
const range = n => process.env.LAST ? [n] : Array.from({length: n}, (_, i) => i + 1);
for (const c of CAROUSELS.filter(wanted)) await render(c.id, `${root}/carousels/${c.id}`, range(c.uses.length + 2));
for (const c of DRAKES.filter(wanted)) await render(c.id, `${root}/carousels-drake/${c.id}`, process.env.LAST ? range(c.pairs.length + 2) : [0, ...range(c.pairs.length + 2)]);
