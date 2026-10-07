#!/usr/bin/env node
// Records the Argentine packs — every word and its example — in the course's
// two voices, uploads the clips to the `audio` bucket and notes each one in
// docs/argentine/audio.json. Then run `npm run argentine:build` so the bundled
// JSON points at them.
//
//   npm run argentine:tts [-- --dry-run] [--force]
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { record } from '../course/lib/clips.mjs';
import { MANIFEST, clipsOf } from './audio.mjs';

const { words } = parse(readFileSync(new URL('../../docs/argentine/words.yaml', import.meta.url), 'utf8'));

const lines = new Map();
for (const w of words) {
  const c = clipsOf(w);
  lines.set(c.word, { text: w.es, voice: c.voice, path: c.word, where: 'word' });
  lines.set(c.example, { text: w.example.es, voice: c.voice, path: c.example, where: `example · ${w.es}` });
}

const recorded = await record({
  name: 'Argentine words',
  lines: [...lines.values()],
  manifestFile: MANIFEST,
  workDir: new URL('../../.course-work/argentine/tts/', import.meta.url).pathname,
  flags: new Set(process.argv.slice(2)),
});
if (recorded) console.log('now run: npm run argentine:build');
