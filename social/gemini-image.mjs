// Edits or generates one image with the Gemini API (the fallback when Gemini in Chrome cannot be used).
//   node gemini-image.mjs <out.jpg> "<prompt>" [input image ...]
// Needs GEMINI_API_KEY in ../.env. The model can be overridden with GEMINI_IMAGE_MODEL.
// Every frame of a cast must come from the same route: the API and the Gemini app return different sizes.
import fs from 'node:fs';

process.loadEnvFile(new URL('../.env', import.meta.url));
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY is not set in ../.env');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const TYPES = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp'};

const [out, prompt, ...inputs] = process.argv.slice(2);
if (!prompt) { console.log('usage: node gemini-image.mjs <out.jpg> "<prompt>" [input image ...]'); process.exit(1); }
const parts = [...inputs.map(f => ({inline_data: {mime_type: TYPES[f.split('.').pop().toLowerCase()], data: fs.readFileSync(f).toString('base64')}})), {text: prompt}];
const body = {contents: [{parts}], generationConfig: {responseModalities: ['IMAGE'], imageConfig: {aspectRatio: '9:16'}}};

for (let attempt = 1; attempt <= 4; attempt++) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {method: 'POST', headers: {'content-type': 'application/json', 'x-goog-api-key': key}, body: JSON.stringify(body)});
  if (res.ok) {
    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
    const data = part?.inlineData?.data ?? part?.inline_data?.data;
    if (data) { fs.writeFileSync(out, Buffer.from(data, 'base64')); console.log('saved', out); process.exit(0); }
    console.warn(`no image returned (${json.candidates?.[0]?.finishReason ?? 'unknown'}), retrying`);
  } else {
    const text = await res.text();
    // Out of quota or a bad key will not get better by retrying: say so and stop, so the caller can fall back.
    if (res.status !== 429 && res.status < 500) throw new Error(`gemini ${res.status}: ${text.slice(0, 300)}`);
    console.warn(`gemini ${res.status}, retrying`);
  }
  await new Promise(r => setTimeout(r, 5000 * attempt));
}
throw new Error('gemini: gave up after 4 attempts');
