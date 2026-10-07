// Runs one Muapi model and saves what it returns.
//   node muapi.mjs <model> <params.json> <output file>
// In the params, any value that is a path to a local file is uploaded first and
// replaced by its URL (also inside arrays).
import fs from 'node:fs';

process.loadEnvFile(new URL('../.env', import.meta.url));
const API = 'https://api.muapi.ai/api/v1';
const key = process.env.MUAPI_API_KEY;
if (!key) throw new Error('MUAPI_API_KEY is not set in ../.env');
const TYPES = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4'};

async function upload(file) {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], {type: TYPES[file.split('.').pop()]}), file.split('/').pop());
  const res = await fetch(`${API}/upload_file`, {method: 'POST', headers: {'x-api-key': key}, body: form});
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).url;
}
const local = v => typeof v === 'string' && !v.startsWith('http') && /\.\w{3,4}$/.test(v) && fs.existsSync(v);
const resolve = async v => Array.isArray(v) ? Promise.all(v.map(resolve)) : local(v) ? upload(v) : v;

const [model, paramsFile, output] = process.argv.slice(2);
if (!output) { console.log('usage: node muapi.mjs <model> <params.json> <output file>'); process.exit(1); }
const params = JSON.parse(fs.readFileSync(paramsFile, 'utf8'));
for (const k of Object.keys(params)) params[k] = await resolve(params[k]);

const res = await fetch(`${API}/${model}`, {method: 'POST', headers: {'x-api-key': key, 'content-type': 'application/json'}, body: JSON.stringify(params)});
const sent = await res.json();
if (!res.ok || !sent.request_id) throw new Error(`submit ${res.status}: ${JSON.stringify(sent).slice(0, 400)}`);
console.log('request', sent.request_id);
for (let i = 0; i < 180; i++) {
  await new Promise(r => setTimeout(r, 5000));
  const out = await (await fetch(`${API}/predictions/${sent.request_id}/result`, {headers: {'x-api-key': key}})).json();
  if (out.status === 'failed') throw new Error(`failed: ${JSON.stringify(out).slice(0, 400)}`);
  if (out.status !== 'completed') continue;
  const url = [out.outputs, out.output?.video, out.output, out.url].flat().find(u => typeof u === 'string' && u.startsWith('http'));
  if (!url) throw new Error(`no file url in the result: ${JSON.stringify(out).slice(0, 400)}`);
  fs.writeFileSync(output, Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log('saved', output);
  process.exit(0);
}
throw new Error(`still running after 15 minutes: ${sent.request_id}`);
