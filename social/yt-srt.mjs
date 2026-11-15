// usage: node yt-srt.mjs <video id>   Writes the YouTube video's subtitles (out/yt/<id>.en.srt) and chapter times from the voice timings.
import fs from 'fs';
import {video} from './src/yt/videos.mjs';
const V = video(process.argv[2]), YT_ID = V.id, CHAPTERS = V.chapters;
const T = JSON.parse(fs.readFileSync(`src/yt/timing/${YT_ID}.json`, 'utf8'));
const ts = s => { const ms = Math.round(s * 1000); const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
let at = 10; const out = [], chapters = [];
for (const ch of CHAPTERS) {
  const start = at / 30;
  chapters.push(`${Math.floor(start / 60)}:${String(Math.floor(start % 60)).padStart(2, '0')} ${ch.step ? ch.step + ': ' : ''}${ch.title}`);
  const al = JSON.parse(fs.readFileSync(`public/vo/${V.vo}/${ch.id}.mp3.json`, 'utf8'));
  // words with their times, then cues of up to ~42 characters that break at sentence ends
  const words = []; let cur = null;
  al.characters.forEach((c, i) => {
    if (/\s/.test(c)) { cur = null; return; }
    if (!cur) { cur = {w: '', from: al.character_start_times_seconds[i]}; words.push(cur); }
    cur.w += c; cur.to = al.character_end_times_seconds[i];
  });
  let line = [];
  const flush = () => { if (!line.length) return; out.push({from: start + line[0].from, to: start + line.at(-1).to + 0.15, text: line.map(w => w.w).join(' ').replace(/[“”]/g, '')}); line = []; };
  for (const w of words) {
    if (line.length && (line.map(x => x.w).join(' ').length + w.w.length > 42)) flush();
    line.push(w);
    if (/[.?!:]["”]?$/.test(w.w)) flush();
  }
  flush();
  at += Math.ceil(T[ch.id].seconds * 30) + 21;
}
fs.mkdirSync('out/yt', {recursive: true});
// a cue ends where the next one starts, at the latest
fs.writeFileSync(`out/yt/${YT_ID}.en.srt`, out.map((c, i) => `${i + 1}\n${ts(c.from)} --> ${ts(Math.min(c.to, out[i + 1]?.from ?? c.to))}\n${c.text}\n`).join('\n'));
console.log(chapters.join('\n'));
