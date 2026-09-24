// Generates mascot variations with Gemini image generation, using the
// reference sheet + a few approved Canva outputs to keep the character consistent.
//
//   node scripts/mascot/generate.mjs            # all missing poses
//   node scripts/mascot/generate.mjs mate tango # only these keys
//   FORCE=1 node scripts/mascot/generate.mjs mate  # regenerate even if it exists
//
// Needs GEMINI_API_KEY in .env. Model can be overridden with GEMINI_IMAGE_MODEL.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
try { process.loadEnvFile(path.join(root, '.env')); } catch {}

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Missing GEMINI_API_KEY in .env'); process.exit(1); }
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const CONCURRENCY = 3;

const mascotDir = path.join(root, 'assets/images/mascot');
const outDir = path.join(mascotDir, 'gemini');
fs.mkdirSync(outDir, { recursive: true });

const REFERENCES = [
  'reference.jpg',
  'canva/saludando.jpg',
  'canva/gaucho.jpg',
  'canva/mate.jpg',
].map((f) => ({
  inline_data: { mime_type: 'image/jpeg', data: fs.readFileSync(path.join(mascotDir, f)).toString('base64') },
}));

const STYLE =
  'Draw the exact same capybara mascot character shown in the reference images, in the exact same illustration style: ' +
  'warm brown fur, darker brown snout, small round ears, friendly dark eyes, thick dark-brown outlines, ' +
  'soft flat colors with light fur texture, hand-drawn cartoon sticker style. ' +
  'Exactly one capybara, centered, whole character visible, plain pure white background, no text, no logos, no watermark. Scene: ';

const poses = JSON.parse(fs.readFileSync(path.join(root, 'scripts/mascot/poses.json'), 'utf8'));
const only = process.argv.slice(2);
const todo = Object.entries(poses).filter(([name]) =>
  (only.length ? only.includes(name) : true) &&
  (process.env.FORCE || !fs.existsSync(path.join(outDir, `${name}.png`))),
);

async function generate(name, scene) {
  const body = {
    contents: [{ parts: [...REFERENCES, { text: STYLE + scene + '.' }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
  };
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) },
    );
    if (res.ok) {
      const json = await res.json();
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
      const data = part?.inlineData?.data ?? part?.inline_data?.data;
      if (data) {
        fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
        return;
      }
      console.warn(`  ${name}: no image returned (${json.candidates?.[0]?.finishReason ?? 'unknown'}), retrying`);
    } else {
      const text = await res.text();
      if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} ${text.slice(0, 300)}`);
      console.warn(`  ${name}: ${res.status}, retrying`);
    }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error('gave up after 4 attempts');
}

console.log(`Generating ${todo.length} images with ${MODEL} → ${path.relative(root, outDir)}`);
const failed = [];
let done = 0;
const queue = [...todo];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const [name, scene] = queue.shift();
      try {
        await generate(name, scene);
        console.log(`✓ ${++done}/${todo.length} ${name}`);
      } catch (e) {
        failed.push(name);
        console.error(`✗ ${name}: ${e.message}`);
      }
    }
  }),
);
if (failed.length) console.log(`\nFailed (${failed.length}): ${failed.join(' ')}`);
