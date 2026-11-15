// usage: node yt-upload.mjs [--limit N] [--dry] [--start YYYY-MM-DD] [--only <id>] [--private]
//   Uploads the next YouTube long videos in src/yt/schedule.mjs through the YouTube Data API, one a day at 12:00
//   Buenos Aires time (YouTube publishes each on its date by itself; until then it is private). Sends the title,
//   description, chapters and tags (src/yt/meta.mjs), the English subtitles and the thumbnail. Files come from
//   ~/che/posta-videos/youtube/<id>.mp4 / -thumb.png / .en.srt. Done uploads are kept in src/yt/uploaded.json, so
//   running it again continues where it stopped (e.g. after the daily API quota runs out).
//   Needs YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN in ../.env (node yt-auth.mjs once).
import fs from 'node:fs'; import os from 'node:os';
import {ORDER} from './src/yt/schedule.mjs';
import {meta} from './src/yt/meta.mjs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const DRY = process.argv.includes('--dry'), LIMIT = Number(arg('--limit', 99)), ONLY = arg('--only'), PRIVATE = process.argv.includes('--private');
const DIR = `${os.homedir()}/che/posta-videos/youtube`, STATE = new URL('./src/yt/uploaded.json', import.meta.url);
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter(l => /^\w+=/.test(l)).map(l => [l.split('=')[0], l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));

// next publish day: the day after the last one scheduled (or --start, or today), at 12:00 ART = 15:00 UTC
const HOUR_UTC = 15;
const last = Object.values(state).map(s => s.publishAt).filter(Boolean).sort().at(-1);
let day = arg('--start') ? new Date(arg('--start') + 'T00:00:00Z') : last ? new Date(new Date(last).getTime() + 864e5) : new Date();
day = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), HOUR_UTC));

async function token() {
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', body: new URLSearchParams({client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: env.YT_REFRESH_TOKEN, grant_type: 'refresh_token'})});
  const t = await r.json(); if (!t.access_token) throw new Error('token: ' + JSON.stringify(t)); return t.access_token;
}
async function ok(r, what) { if (r.ok) return r.json().catch(() => ({})); const t = await r.text(); const e = new Error(`${what} ${r.status}: ${t.slice(0, 400)}`); e.quota = /quotaExceeded|uploadLimitExceeded/.test(t); throw e; }

const todo = (ONLY ? [ONLY] : ORDER).filter(id => !state[id]).slice(0, LIMIT);
const auth = DRY ? '' : `Bearer ${await token()}`;
for (const id of todo) {
  const m = meta(id), file = `${DIR}/${id}.mp4`;
  if (!fs.existsSync(file)) { console.log('stop: not rendered yet:', id); break; }
  const publishAt = day <= new Date(Date.now() + 15 * 60e3) ? null : day.toISOString();
  console.log(id, '→', publishAt ?? 'public now', '|', m.title);
  if (DRY) { day = new Date(day.getTime() + 864e5); continue; }
  const body = {
    snippet: {title: m.title, description: m.description, tags: m.tags, categoryId: '27', defaultLanguage: 'en', defaultAudioLanguage: 'en'},
    status: {privacyStatus: publishAt || PRIVATE ? 'private' : 'public', ...(publishAt && !PRIVATE ? {publishAt} : {}), selfDeclaredMadeForKids: false, containsSyntheticMedia: false, embeddable: true},
  };
  try {
    const size = fs.statSync(file).size;
    const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST', headers: {Authorization: auth, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(size)}, body: JSON.stringify(body)});
    if (!start.ok) await ok(start, 'start upload');
    const up = await ok(await fetch(start.headers.get('location'), {method: 'PUT', headers: {'Content-Type': 'video/mp4', 'Content-Length': String(size)}, body: fs.readFileSync(file)}), 'upload');
    const videoId = up.id;
    state[id] = {videoId, publishAt, uploadedAt: new Date().toISOString(), status: up.status};
    fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
    console.log('  uploaded https://youtu.be/' + videoId, up.status?.privacyStatus, up.status?.publishAt ?? '');
    // subtitles: multipart (metadata + srt)
    const srt = `${DIR}/${id}.en.srt`;
    if (fs.existsSync(srt)) {
      const B = 'posta' + Date.now();
      const mp = `--${B}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({snippet: {videoId, language: 'en', name: 'English'}})}\r\n--${B}\r\nContent-Type: application/x-subrip\r\n\r\n${fs.readFileSync(srt, 'utf8')}\r\n--${B}--`;
      try { await ok(await fetch('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', {method: 'POST', headers: {Authorization: auth, 'Content-Type': `multipart/related; boundary=${B}`}, body: mp}), 'captions'); state[id].captions = true; console.log('  subtitles ok'); }
      catch (e) { console.log('  subtitles failed:', e.message); if (e.quota) throw e; }
    }
    const thumb = `${DIR}/${id}-thumb.png`;
    if (fs.existsSync(thumb)) {
      try { await ok(await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {method: 'POST', headers: {Authorization: auth, 'Content-Type': 'image/png'}, body: fs.readFileSync(thumb)}), 'thumbnail'); state[id].thumb = true; console.log('  thumbnail ok'); }
      catch (e) { console.log('  thumbnail failed (channel needs phone verification?):', e.message.slice(0, 160)); if (e.quota) throw e; }
    }
    fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.log('  FAILED:', e.message);
    if (e.quota) { console.log('Daily YouTube quota used up: run again tomorrow, it continues from here.'); break; }
    break;
  }
  day = new Date(day.getTime() + 864e5);
}
