// Lays the cumbia loop (public/music/cumbia-loop-soft.wav) quietly under finished reels, for the feeds.
// usage: node mix-music.mjs <out dir> <video.mp4>...   -> <out dir>/<name without -vN>.mp4 (an existing one is skipped)
// The video is copied as is; only the audio is mixed again. MUSIC_VOLUME (default 0.21) sets how low; MUSIC picks another track.
import {execFileSync} from 'child_process';
import fs from 'fs'; import path from 'path';

const D = 'node_modules/@remotion/compositor-darwin-arm64';
const env = {...process.env, DYLD_LIBRARY_PATH: D};
const VOLUME = Number(process.env.MUSIC_VOLUME ?? 0.21);
const MUSIC = process.env.MUSIC ?? 'public/music/cumbia-loop-soft.wav';
const [out, ...videos] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
for (const video of videos) {
  const file = path.join(out, path.basename(video).replace(/-v\d+\.mp4$/, '.mp4'));
  if (fs.existsSync(file)) continue;
  const secs = Number(execFileSync(`${D}/ffprobe`, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], {env, encoding: 'utf8'}));
  execFileSync(`${D}/ffmpeg`, ['-v', 'error', '-y', '-i', video, '-stream_loop', '-1', '-i', MUSIC,
    '-filter_complex', `[1:a]volume='${VOLUME}*min(1,t/0.5)*max(0,min(1,(${secs}-t)/1.2))':eval=frame[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', file], {env});
  console.log(file);
}
