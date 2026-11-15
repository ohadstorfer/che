// usage: node render-pancho.mjs [id-prefix] [--stills 20,80,...] [--to <folder>]
//   -> out/<id>.mp4, or out/stills/<id>-<frame>.jpg with --stills.
//   --to moves each finished video to <folder>/<id>-v<N>.mp4, N being one more than the highest version already there.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs'; import path from 'path'; import {execFileSync} from 'child_process';
import {REELS} from './src/pancho/reels.mjs';
import {VERSUS} from './src/versus/reels.mjs';
import {CELEBS} from './src/celeb/reels.mjs';
import {ONBOARDING} from './src/onboarding/reels.mjs';
import {LITERAL} from './src/literal/reels.mjs';
import {BOX} from './src/box/reels.mjs';
const args = process.argv.slice(2);
const si = args.indexOf('--stills');
const stills = si >= 0 ? args[si + 1].split(',').map(Number) : null;
const ti = args.indexOf('--to');
const to = ti >= 0 ? args[ti + 1] : null;
const only = args.find((a, i) => !a.startsWith('--') && (si < 0 || i !== si + 1) && (ti < 0 || i !== ti + 1)) || '';
let library = null; // keys under s3://posta-audio/library/, read once when --missing needs them
const inLibrary = () => library ??= (() => { try { return execFileSync('aws', ['--profile', 'posta', 's3', 'ls', 's3://posta-audio/library/', '--recursive'], {encoding: 'utf8'}).split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean); } catch { return []; } })();
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
fs.mkdirSync('out/stills', {recursive: true});
// The bundle is a copy of public/ in the temp folder, and nothing clears it for us: without this every run leaves ~70 MB behind.
try {
for (const {id} of [...REELS, ...VERSUS, ...CELEBS, ...ONBOARDING, ...BOX, ...LITERAL].filter(r => r.id.startsWith(only))) {
  // --missing (with --to): skip a reel that already has a video there, to resume a batch that stopped
  // (a reel already moved to the S3 library, library.mjs, counts as done too)
  if (to && !stills && args.includes('--missing') && ((fs.existsSync(to) && fs.readdirSync(to).some(f => f.startsWith(id + '-v'))) || inLibrary().some(k => k.split('/').pop().startsWith(id + '-v')))) continue;
  const composition = await selectComposition({serveUrl, id});
  if (stills) for (const frame of stills) await renderStill({composition, serveUrl, frame, output: `out/stills/${id}-${String(frame).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80});
  else await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: `out/${id}.mp4`});
  console.log('done', id, stills ? `${stills.length} stills` : `${composition.durationInFrames} frames`);
  if (to && !stills) {
    // versions already made count whether they are still here or were moved to the S3 library
    const taken = [...fs.readdirSync(to), ...inLibrary().map(k => k.split('/').pop())].map(f => f.startsWith(id + '-v') ? parseInt(f.slice(id.length + 2), 10) : 0);
    const file = path.join(to, `${id}-v${Math.max(0, ...taken.filter(Number.isFinite)) + 1}.mp4`);
    fs.renameSync(`out/${id}.mp4`, file); console.log('saved', file);
  }
}
} finally { fs.rmSync(serveUrl, {recursive: true, force: true}); }
