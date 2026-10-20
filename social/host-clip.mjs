// Makes a host clip: her lines in one voice, then her photo lip-synced to them on green.
//   node host-clip.mjs <name> <voice id>   (her usual voice: Martina, oq8K6jJPiW08295EbH2y)
//   --reuse-audio: use the mp3 already recorded for <name> (from an --audio-only run) instead of recording again, so the approved timing cannot change. One line only.
//   --audio-only: record the lines and print the timing, no avatar video (cents, not dollars): use it to approve script and timing first.
//   node host-clip.mjs <name> <voice id> "line 1" "line 2" ...
// Writes public/celeb/host-<name>.mp4 (+ a copy in posta-videos/sources/host) and prints where each
// line starts and ends in her video, in seconds (for `host.intro` / `host.lines` / `host.outro`).
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

process.loadEnvFile(new URL('../.env', import.meta.url));
const args = process.argv.slice(2), audioOnly = args.includes('--audio-only'), reuse = args.includes('--reuse-audio');
const [name, voice, ...lines] = args.filter(a => !a.startsWith('--'));
if (!lines.length && !reuse) { console.log('usage: node host-clip.mjs <name> <voice id> "line 1" "line 2" ...'); process.exit(1); }
const SRC = '/Users/ohadstorfer/che/posta-videos/sources/host';
const PHOTO = `${SRC}/her.jpg`;
const PROMPT = 'A young woman films herself with her phone and talks to the camera like a social media creator: lively, amused, natural head movements, raised eyebrows, small nods and smiles, lips matching the speech. The camera is steady. The green screen background stays perfectly flat, uniform and unchanged.';

// One take for all the lines (gluing separate mp3 files makes the model read only the first one).
// The timestamps tell where each line starts and ends.
const audioFile = `${SRC}/${name}-line.mp3`;
let parts, times, cost = 0;
if (reuse) {
  parts = [fs.readFileSync(audioFile)];
  times = [[0, +(parts[0].length * 8 / 128000).toFixed(2)]];
} else {
  const text = lines.join(' ');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY, 'content-type': 'application/json'},
    body: JSON.stringify({text, model_id: 'eleven_v4', voice_settings: {stability: 0.5, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true}}),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const tts = await res.json();
  cost = res.headers.get('character-cost');
  const al = tts.alignment; let at = 0;
  times = lines.map((l, k) => { const i = text.indexOf(l, at), j = i + l.length - 1; at = j;
    return [k === 0 ? 0 : +al.character_start_times_seconds[i].toFixed(2), +al.character_end_times_seconds[j].toFixed(2)]; });
  // a line runs until the next one starts
  for (let k = 0; k < times.length - 1; k++) times[k][1] = times[k + 1][0];
  parts = [Buffer.from(tts.audio_base64, 'base64')];
}
const audio = `${SRC}/${name}-line.mp3`;
fs.writeFileSync(audio, Buffer.concat(parts));
console.log('audio saved', audio, 'billed', cost, 'characters');
console.log('times', JSON.stringify(times));
if (audioOnly) { console.log('audio only: no avatar video made'); process.exit(0); }
const params = `${SRC}/${name}.params.json`;
fs.writeFileSync(params, JSON.stringify({image_url: PHOTO, audio_url: audio, prompt: PROMPT, output_resolution: '720'}));
const out = `${SRC}/${name}.mp4`;
execFileSync('node', ['muapi.mjs', 'omnihuman-1-5', params, out], {stdio: 'inherit'});
fs.copyFileSync(out, `public/celeb/host-${name}.mp4`);
console.log('done', name, JSON.stringify(times));
