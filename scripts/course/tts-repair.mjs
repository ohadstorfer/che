#!/usr/bin/env node
// Finds recordings too short to be a word and makes them again.
//
//   npm run course:tts-repair [-- --dry-run]
//
// A clip under its minimum size (`minBytes`) is not speech: it is the fifth of a second of nothing
// the model returns for some words (see `takes` in lib/tts.mjs). The size is
// read from the bucket's listing, so nothing is downloaded. Course clips are re-recorded
// here, in the voice they already have, under a new name. Clips that ship in
// the bundle are named for their text, so those are removed — file and
// manifest line — and the recorder for that content makes them again.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { clipSizes, removeClips, uploadFolders } from './lib/clips.mjs';
import { queryLinked } from './lib/db.mjs';
import { q } from './lib/sql.mjs';
import { apiKey, clipPath, minBytes, synthesize } from './lib/tts.mjs';

const dryRun = process.argv.includes('--dry-run');
const BUNDLED = ['argentine', 'culture', 'hablar'];
const root = new URL('../../', import.meta.url).pathname;
const dir = `${root}.course-work/tts/_repair/`;

const sizes = await clipSizes(['cards', 'sentences', ...BUNDLED]);

// A row whose clip is not in the bucket at all is not this script's to fix.
const short = queryLinked(`
  select 'form' as kind, id, form as text, audio_path, voice_id from public.forms where status = 'published' and audio_path is not null
  union all
  select 'sentence', id, es, audio_path, voice_id from public.sentences where status = 'published' and audio_path is not null`,
).filter((c) => sizes.get(c.audio_path) < minBytes(c.text));

const manifests = BUNDLED.map((d) => {
  const file = `${root}docs/${d}/audio.json`;
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  return { d, file, manifest, bad: Object.keys(manifest).filter((p) => (sizes.get(p) ?? 0) < minBytes(manifest[p].text)) };
});

console.log(`course: ${short.length} clip(s) too short`);
for (const c of short) console.log(`  ${c.voice_id.padEnd(7)} ${c.text}`);
for (const m of manifests) {
  console.log(`${m.d}: ${m.bad.length} clip(s) too short`);
  for (const p of m.bad) console.log(`  ${m.manifest[p].voice.padEnd(7)} ${m.manifest[p].text}`);
}
if (dryRun) {
  console.log('\n--dry-run: nothing called, nothing written');
  process.exit(0);
}

// --- the course -------------------------------------------------------------

if (short.length) {
  const voices = new Map(queryLinked(`select id, provider_id, model from public.voices`).map((v) => [v.id, v]));
  const key = apiKey();
  const stamp = Date.now();
  rmSync(dir, { recursive: true, force: true });
  const made = [];
  let spent = 0;
  for (const c of short) {
    const { mp3, cost } = await synthesize({ text: c.text, voice: voices.get(c.voice_id), key });
    spent += cost;
    if (mp3.length < minBytes(c.text)) {
      console.log(`  STILL SHORT: ${c.text} (${mp3.length} bytes) — left as it was`);
      continue;
    }
    const path = clipPath(c.kind, c.id, c.voice_id, stamp);
    mkdirSync(dirname(`${dir}${path}`), { recursive: true });
    writeFileSync(`${dir}${path}`, mp3);
    made.push({ ...c, path });
  }
  const arrived = await uploadFolders(dir, made.map((c) => c.path));
  const uploaded = made.filter((c) => arrived.has(c.path));
  if (uploaded.length)
    queryLinked(
      uploaded
        .map((c) => `update public.${c.kind === 'form' ? 'forms' : 'sentences'} set audio_path = ${q(c.path)} where id = ${q(c.id)};`)
        .join('\n'),
    );
  console.log(`\ncourse: ${uploaded.length} of ${short.length} re-recorded, ${spent} credit(s) spent`);
}

// --- the bundle -------------------------------------------------------------

for (const m of manifests) {
  if (!m.bad.length) continue;
  await removeClips(m.bad);
  for (const p of m.bad) delete m.manifest[p];
  writeFileSync(m.file, JSON.stringify(m.manifest, null, 1) + '\n');
  console.log(`${m.d}: ${m.bad.length} removed — now run: npm run ${m.d}:tts && npm run ${m.d}:build`);
}
