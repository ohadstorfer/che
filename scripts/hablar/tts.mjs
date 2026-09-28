#!/usr/bin/env node
// Records Hablar's static lines — every scenario opener and key phrase, and
// the free-chat and culture openers — in the `tomas` voice, uploads them to
// the `audio` bucket like course:tts does, and notes each one in
// docs/hablar/audio.json. Then run `npm run hablar:build` so the bundled JSON
// points at them.
//
//   npm run hablar:tts [-- --dry-run] [--force]
//
//   --dry-run   list what would be recorded and the characters it would cost;
//               call nothing, write nothing
//   --force     re-record lines already in the manifest (same path: the old
//               file is overwritten, and the year-long cache may keep serving
//               it — prefer editing the text, which gives a new path)
//
// A line's path is a hash of voice, model and text (clipPath in
// lib/content.mjs), so a re-run skips everything already recorded and an
// edited line is simply a new clip. Nothing here reads or writes the database.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { apiKey, spoken, synthesize } from '../course/lib/tts.mjs';
import {
  MANIFEST,
  TOMAS,
  clipPath,
  loadCultureIds,
  loadManifest,
  loadScenarios,
  recordableLines,
  validate,
} from './lib/content.mjs';

const flags = new Set(process.argv.slice(2));
const dryRun = flags.has('--dry-run');
const force = flags.has('--force');

const doc = loadScenarios();
const errors = validate(doc, { cultureIds: loadCultureIds() });
if (errors.length) {
  console.log(`✗ docs/hablar/scenarios.yaml — fix before recording\n    ${errors.join('\n    ')}`);
  process.exit(1);
}

const manifest = loadManifest();
const all = recordableLines(doc).map((l) => ({ ...l, path: clipPath(l.text) }));
const due = all.filter((l) => force || !manifest[l.path]);
// What ElevenLabs bills is the spoken text; the carrier context is free.
const chars = due.reduce((n, l) => n + spoken(l.text).length, 0);

console.log(`Hablar: ${all.length} line(s), ${all.length - due.length} already recorded`);
console.log(`  ${due.length} to record in ${TOMAS.id} (${TOMAS.model}), ~${chars} characters\n`);
if (due.length === 0) {
  console.log('nothing to do');
  process.exit(0);
}

if (dryRun) {
  for (const l of due) console.log(`  ${l.kind.padEnd(6)} ${l.where.padEnd(26)} ${l.text}  → ${l.path}`);
  console.log(`\n--dry-run: ${due.length} clip(s), ~${chars} characters — nothing called, nothing written`);
  process.exit(0);
}

// --- record -----------------------------------------------------------------

const key = apiKey();
const dir = new URL('../../.course-work/hablar/tts/', import.meta.url).pathname;
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

let spent = 0;
const failed = [];
const saveManifest = () => writeFileSync(MANIFEST, JSON.stringify(sortKeys(manifest), null, 1) + '\n');

for (const [i, line] of due.entries()) {
  const label = `${i + 1}/${due.length} ${line.text}`;
  try {
    const { mp3, cost } = await synthesize({ text: line.text, voice: TOMAS, key });
    spent += cost;
    const local = `${dir}${line.path.replace('/', '-')}`;
    writeFileSync(local, mp3);
    // Upload before the manifest learns the path: a path in the bundle with no
    // file behind it is a silent ▶️ that the app's cache would remember.
    execFileSync(
      'npx',
      ['--yes', 'supabase@2', 'storage', 'cp', local, `ss:///audio/${line.path}`,
       '--linked', '--experimental', '--content-type', 'audio/mpeg',
       '--cache-control', 'max-age=31536000'],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    manifest[line.path] = {
      text: line.text,
      voice: TOMAS.id,
      model: TOMAS.model,
      recorded_at: new Date().toISOString(),
    };
    saveManifest(); // after every clip, so a crash loses nothing already paid for
    console.log(`  ${label} — ${(mp3.length / 1024).toFixed(0)} kB`);
  } catch (err) {
    failed.push({ ...line, error: err.message });
    console.log(`  ${label} — FAILED: ${err.message}`);
  }
}

console.log(`\n${due.length - failed.length} clip(s) recorded and uploaded, ${spent} credit(s) spent`);
console.log('now run: npm run hablar:build');
if (failed.length) {
  console.log(`${failed.length} failed — run again to retry`);
  process.exit(1);
}

function sortKeys(o) {
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
}
