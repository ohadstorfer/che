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
// The recording itself is the one the Argentine packs and the culture glossary
// use (record in ../course/lib/clips.mjs): batches, three clips at a time.
//
// A line's path is a hash of voice, model and text (clipPath in
// lib/content.mjs), so a re-run skips everything already recorded and an
// edited line is simply a new clip. Nothing here reads or writes the database.
import { record } from '../course/lib/clips.mjs';
import {
  MANIFEST,
  TOMAS,
  clipPath,
  loadCultureIds,
  loadScenarios,
  recordableLines,
  validate,
} from './lib/content.mjs';

const doc = loadScenarios();
const errors = validate(doc, { cultureIds: loadCultureIds() });
if (errors.length) {
  console.log(`✗ docs/hablar/scenarios.yaml — fix before recording\n    ${errors.join('\n    ')}`);
  process.exit(1);
}

const recorded = await record({
  name: 'Hablar',
  lines: recordableLines(doc).map((l) => ({ ...l, voice: TOMAS, path: clipPath(l.text), where: `${l.kind} · ${l.where}` })),
  manifestFile: MANIFEST,
  workDir: new URL('../../.course-work/hablar/tts/', import.meta.url).pathname,
  flags: new Set(process.argv.slice(2)),
});
if (recorded) console.log('now run: npm run hablar:build');
