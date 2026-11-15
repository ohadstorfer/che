// Renders the landing page's phone screens: out/landing/screen-NN.png (780 wide, with the 9:41 bar).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const n of ['01', '03', '04', '05', '06', '09']) {
  const composition = await selectComposition({serveUrl, id: `landing-screen-${n}`});
  await renderStill({composition, serveUrl, output: `out/landing/screen-${n}.png`, imageFormat: 'png'});
}
console.log('done');
