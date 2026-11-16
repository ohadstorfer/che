#!/usr/bin/env node
// Records the first class's own slang examples (src/components/first-class.tsx:
// DALE and RE, rewritten there for the café) in the voice that says each word
// on its pack card, so a card sounds like one person. Same recording and
// upload as the Argentine packs (record in ../course/lib/clips.mjs); the paths
// it prints go into first-class.tsx as `example.audio`.
//
//   node scripts/first-class/tts.mjs [--dry-run] [--force]
import { VOICES, clipPath, record } from '../course/lib/clips.mjs';

const malena = VOICES.find((v) => v.id === 'malena');
// dale and re are both Malena's on their pack cards (src/lib/argentine.json).
const lines = [
  { text: '¿Un café? ¡Dale!', voice: malena, where: 'example · dale' },
  { text: '¡La medialuna está re rica!', voice: malena, where: 'example · re' },
].map((l) => ({ ...l, path: clipPath('argentine', l.text, l.voice) }));

await record({
  name: 'First class',
  lines,
  manifestFile: new URL('../../docs/first-class/audio.json', import.meta.url).pathname,
  workDir: new URL('../../.course-work/first-class/tts/', import.meta.url).pathname,
  flags: new Set(process.argv.slice(2)),
});
for (const l of lines) console.log(`${l.where}: ${l.path}`);
