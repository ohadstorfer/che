// A small paid test of Muapi's talking-avatar model on Pancho.
//   node muapi-test.mjs audio            record the test line (ElevenLabs, tomas)
//   node muapi-test.mjs run <solo|duo>   upload image + audio, make the clip, save it to out/muapi-test/
import fs from 'node:fs';

process.loadEnvFile(new URL('../.env', import.meta.url));
const DIR = 'out/muapi-test';
const AUDIO = `${DIR}/line.mp3`;
const LINE = 'En Argentina no decimos "tú tienes". Decimos "vos tenés". ¿Vos tenés mate?';
const IMAGES = {solo: `${DIR}/solo.png`, duo: 'out/stills/tu-vs-vos-clean.png'};
const PROMPTS = {
  solo: 'A cartoon capybara talks to the camera, friendly, mouth moving with the speech, small head movements. Flat illustrated style, background stays still.',
  duo: 'Only the capybara on the right, wearing the beret and poncho, talks. The capybara on the left stays quiet and listens. Flat illustrated style, background stays still.',
};
const API = 'https://api.muapi.ai/api/v1';

async function audio() {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/QK4xDwo9ESPHA4JNUpX3?output_format=mp3_44100_128', {
    method: 'POST',
    headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY, 'content-type': 'application/json'},
    body: JSON.stringify({text: LINE, model_id: 'eleven_v4',
      voice_settings: {stability: 0.65, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true}}),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  fs.writeFileSync(AUDIO, Buffer.from(await res.arrayBuffer()));
  console.log('saved', AUDIO, 'billed', res.headers.get('character-cost'), 'characters');
}

const key = () => {
  if (!process.env.MUAPI_API_KEY) throw new Error('MUAPI_API_KEY is not set in ../.env');
  return process.env.MUAPI_API_KEY;
};

async function upload(file, type) {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], {type}), file.split('/').pop());
  const res = await fetch(`${API}/upload_file`, {method: 'POST', headers: {'x-api-key': key()}, body: form});
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).url;
}

async function run(which) {
  const [image_url, audio_url] = await Promise.all([upload(IMAGES[which], 'image/png'), upload(AUDIO, 'audio/mpeg')]);
  const res = await fetch(`${API}/omnihuman-1-5`, {
    method: 'POST',
    headers: {'x-api-key': key(), 'content-type': 'application/json'},
    body: JSON.stringify({image_url, audio_url, prompt: PROMPTS[which], output_resolution: '720'}),
  });
  const sent = await res.json();
  if (!res.ok || !sent.request_id) throw new Error(`submit ${res.status}: ${JSON.stringify(sent).slice(0, 400)}`);
  console.log('request', sent.request_id);
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const out = await (await fetch(`${API}/predictions/${sent.request_id}/result`, {headers: {'x-api-key': key()}})).json();
    if (out.status === 'failed') throw new Error(`failed: ${JSON.stringify(out).slice(0, 400)}`);
    if (out.status === 'completed') {
      fs.writeFileSync(`${DIR}/${which}.json`, JSON.stringify(out, null, 2));
      const url = [out.outputs, out.output, out.url].flat().find(u => typeof u === 'string' && u.startsWith('http'));
      if (!url) throw new Error(`no video url in ${DIR}/${which}.json`);
      fs.writeFileSync(`${DIR}/${which}.mp4`, Buffer.from(await (await fetch(url)).arrayBuffer()));
      return console.log('saved', `${DIR}/${which}.mp4`);
    }
  }
  throw new Error(`still running after 10 minutes: ${sent.request_id}`);
}

const [cmd, which] = process.argv.slice(2);
if (cmd === 'audio') await audio();
else if (cmd === 'run' && IMAGES[which]) await run(which);
else console.log('usage: node muapi-test.mjs audio | run <solo|duo>');
