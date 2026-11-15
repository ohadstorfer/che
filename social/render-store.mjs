// Renders the store screenshots: out/store/ios/posta-NN.png (1260×2736) and out/store/play/posta-NN.png (1080×1920).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import {SHOTS} from './src/store/shots.mjs';
const only = process.argv[2]; // optional: "ios" or "play"
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const size of only ? [only] : ['ios', 'play'])
  for (const [i, s] of SHOTS.filter(s => (s.stores ?? ['ios', 'play']).includes(size)).entries()) {
    const id = `${s.id}-${size}`;
    const composition = await selectComposition({serveUrl, id});
    await renderStill({composition, serveUrl, output: `out/store/${size}/posta-${String(i + 1).padStart(2, '0')}.png`, imageFormat: 'png'});
  }
console.log('done');
