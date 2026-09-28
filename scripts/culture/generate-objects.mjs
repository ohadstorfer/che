// Generates the object art for the culture section: the thing itself (a mate,
// a parrilla, a bandoneón) drawn in the capybara's sticker style, but with no
// character in it. The capybara stays for Hablar and for the speaker bubbles.
//
//   node scripts/culture/generate-objects.mjs              # all missing objects
//   node scripts/culture/generate-objects.mjs mate tango   # only these keys
//   FORCE=1 node scripts/culture/generate-objects.mjs mate # regenerate
//
// Then cut each one out:
//   python3 scripts/cutout-figure.py assets/images/mascot/objects/mate.png objects/mate-figure
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
const outDir = path.join(mascotDir, 'objects');
fs.mkdirSync(outDir, { recursive: true });

// The capybara sheets are only a style reference — the prompt forbids drawing him.
const REFERENCES = ['canva/mate.jpg', 'canva/empanadas.jpg'].map((f) => ({
  inline_data: { mime_type: 'image/jpeg', data: fs.readFileSync(path.join(mascotDir, f)).toString('base64') },
}));

const STYLE =
  'Use the reference images ONLY for the illustration style: thick dark-brown outlines, ' +
  'soft flat warm colors with light texture, hand-drawn cartoon sticker style. ' +
  'Do NOT draw the capybara or any animal, person, hand or face. ' +
  'Draw only the object, centered, whole object visible, slight three-quarter view, ' +
  'plain pure white background, no text, no letters, no logos, no watermark. Object: ';

const objects = JSON.parse(fs.readFileSync(path.join(root, 'scripts/culture/objects.json'), 'utf8'));
const only = process.argv.slice(2);
const todo = Object.entries(objects).filter(([name]) =>
  (only.length ? only.includes(name) : true) &&
  (process.env.FORCE || !fs.existsSync(path.join(outDir, `${name}.png`))),
);

async function generate(name, object) {
  const body = {
    contents: [{ parts: [...REFERENCES, { text: STYLE + object + '.' }] }],
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

console.log(`Generating ${todo.length} objects with ${MODEL} → ${path.relative(root, outDir)}`);
const failed = [];
let done = 0;
const queue = [...todo];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const [name, object] = queue.shift();
      try {
        await generate(name, object);
        console.log(`✓ ${++done}/${todo.length} ${name}`);
      } catch (e) {
        failed.push(name);
        console.error(`✗ ${name}: ${e.message}`);
      }
    }
  }),
);
if (failed.length) console.log(`\nFailed (${failed.length}): ${failed.join(' ')}`);
