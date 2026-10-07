// Records the culture glossary — the bold Spanish she can tap in a reading — in
// the course's two voices, uploads the clips to the `audio` bucket and notes
// each one in docs/culture/audio.json. Then run `npm run culture:build` so the
// bundled JSON points at them.
// Usage: npm run culture:tts [-- --dry-run] [--force]   (after culture:build)
import { readFileSync } from 'node:fs';

import { record } from '../course/lib/clips.mjs';
import { MANIFEST, clipOf, spokenByKey } from './audio.mjs';

const { sections, glossary } = JSON.parse(readFileSync('src/lib/culture.json', 'utf8'));

const lines = new Map();
for (const [key, text] of spokenByKey(sections, glossary)) {
  const c = clipOf(text);
  lines.set(c.path, { text, voice: c.voice, path: c.path, where: key.slice(0, 26) });
}

const recorded = await record({
  name: 'Culture glossary',
  lines: [...lines.values()],
  manifestFile: MANIFEST,
  workDir: new URL('../../.course-work/culture/tts/', import.meta.url).pathname,
  flags: new Set(process.argv.slice(2)),
});
if (recorded) console.log('now run: npm run culture:build');
