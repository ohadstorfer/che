// Shared by the voice scripts: one ElevenLabs line to an mp3, and its loudness curve.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

process.loadEnvFile(new URL('../.env', import.meta.url));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('ELEVENLABS_API_KEY is not set — see ../.env.example');
export const FPS = 30;
export const VOICES = {
  tomas: 'QK4xDwo9ESPHA4JNUpX3', // Pancho's voice in the app (Argentina)
  mexico: 'QmPfzE500cXXHM9uQKGc', // "Isaac", from the ElevenLabs voice library
  spain: 'ozbKZapo4Cy6jU7KTHtp', // "Álvaro", from the ElevenLabs voice library (Spain)
};

/** Records `text` to `file`, and the time of every letter to `file`.json; returns the characters billed (0 if both were already there). */
export async function say(voice, text, file, {force = false, context} = {}) {
  if (fs.existsSync(file) && fs.existsSync(file + '.json') && !force) return 0;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICES[voice]}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'content-type': 'application/json'},
    body: JSON.stringify({
      text, model_id: 'eleven_v4', language_code: 'es',
      // Context the model reads and never says: keeps short lines Spanish and in voice.
      ...(context ? {previous_text: context[0], next_text: context[1]} : {}),
      voice_settings: {stability: 0.65, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true},
    }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const out = await res.json();
  fs.writeFileSync(file, Buffer.from(out.audio_base64, 'base64'));
  fs.writeFileSync(file + '.json', JSON.stringify(out.alignment));
  return Number(res.headers.get('character-cost')) || 0;
}

// Which mouth each letter shows: its own vowel, closed lips for m/b/p/v, a small opening for other consonants.
const VOWELS = {a: 'a', á: 'a', e: 'e', é: 'e', i: 'i', í: 'i', y: 'i', o: 'o', ó: 'o', u: 'u', ú: 'u', ü: 'u'};
const SHUT = 'mbpv';
/** One letter per video frame saying which mouth to draw (c closed, h half, a e i o u), from the letter times of `mp3`. */
export function mouths(mp3, frames) {
  const al = JSON.parse(fs.readFileSync(mp3 + '.json', 'utf8'));
  const letters = al.characters.map((ch, i) => {
    const c = ch.toLowerCase(), prev = (al.characters[i - 1] || '').toLowerCase(), next = (al.characters[i + 1] || '').toLowerCase();
    const silent = c === 'h' || (c === 'u' && 'qg'.includes(prev) && 'eiéí'.includes(next)); // "que", "gui": the u is not said
    return {from: al.character_start_times_seconds[i], to: al.character_end_times_seconds[i],
      shape: silent ? null : VOWELS[c] ?? (SHUT.includes(c) ? 'c' : /\p{L}/u.test(c) ? 'h' : 'c')};
  }).filter(l => l.shape);
  let out = '';
  // Drawn "on twos": one mouth per two frames. In each pair of frames a vowel wins over a consonant, since vowels are what is seen.
  for (let f = 0; f < frames; f += 2) {
    const from = f / FPS, to = (f + 2) / FPS;
    const here = letters.filter(l => l.from < to && l.to > from);
    const pick = here.find(l => 'aeiou'.includes(l.shape)) ?? here.find(l => l.shape === 'c' && l.to - l.from < 0.2) ?? here[0];
    out += (pick ? pick.shape : 'c').repeat(2);
  }
  // Lips that shut for only a frame or two in the middle of a phrase read as a flicker, not as a "p" or a pause:
  // between two open mouths they stay half open instead.
  out = out.replace(/(?<=[^c])c{1,3}(?=[^c])/g, m => 'h'.repeat(m.length));
  return out.slice(0, frames);
}

/** Loudness per video frame, 0..1, read from a 16-bit mono WAV made by afconvert (macOS). */
export function envelope(mp3) {
  const wav = mp3.replace(/\.mp3$/, '.wav');
  execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', '-c', '1', mp3, wav]);
  const buf = fs.readFileSync(wav); fs.rmSync(wav);
  const at = buf.indexOf('data') + 8;
  const pcm = new Int16Array(buf.buffer, buf.byteOffset + at, Math.floor((buf.length - at) / 2));
  const per = 22050 / FPS, out = [];
  for (let i = 0; i * per < pcm.length; i++) {
    let s = 0, n = 0;
    for (let j = Math.floor(i * per); j < Math.min(pcm.length, (i + 1) * per); j++) { s += pcm[j] * pcm[j]; n++; }
    out.push(Math.sqrt(s / Math.max(1, n)) / 32768);
  }
  const peak = Math.max(...out, 1e-6);
  return {seconds: pcm.length / 22050, env: out.map(v => +Math.min(1, v / peak).toFixed(3))};
}
