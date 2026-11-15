// usage: node render-yt.mjs <video id> [--stills]   Renders one YouTube video (src/yt) to out/yt/<id>.mp4 and its thumbnail;
//   --stills: only one check frame a second after every cue, to out/yt/check/.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs'; import path from 'path';
import {video} from './src/yt/videos.mjs';
const V = video(process.argv[2]), YT_ID = V.id, CHAPTERS = V.chapters;
const T = JSON.parse(fs.readFileSync(`src/yt/timing/${YT_ID}.json`, 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: YT_ID});
fs.mkdirSync(`out/yt/check/${YT_ID}`, {recursive: true});
if (process.argv.includes('--stills')) {
  let at = 10;
  for (const ch of CHAPTERS) {
    for (const [i, c] of T[ch.id].cues.entries()) {
      const f = at + Math.round((c.marks?.at(-1) ?? c.then ?? c.at) * 30) + 30;
      await renderStill({composition, serveUrl, output: `out/yt/check/${YT_ID}/${ch.id}-${i}.png`, frame: Math.min(f, composition.durationInFrames - 1), scale: 0.5});
    }
    at += Math.ceil(T[ch.id].seconds * 30) + 21;
  }
  await renderStill({composition, serveUrl, output: `out/yt/check/${YT_ID}/last.png`, frame: composition.durationInFrames - 1, scale: 0.5});
} else {
  const thumb = await selectComposition({serveUrl, id: YT_ID + '-thumb'});
  await renderStill({composition: thumb, serveUrl, output: `out/yt/${YT_ID}-thumb.png`});
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 18, outputLocation: `out/yt/${YT_ID}.mp4`});
}
console.log('done', composition.durationInFrames, 'frames');
