#!/usr/bin/env node
// Records the first class's own lines (src/components/first-class.tsx): the
// slang examples DALE and RE, rewritten there for the café, in the voice that
// says each word on its pack card (so a card sounds like one person), and
// Pancho's three lines on the call in Tomás's. Same recording and upload as
// the Argentine packs (record in ../course/lib/clips.mjs); the paths it prints
// go into first-class.tsx (`example.audio`, a turn's `audio`).
//
//   node scripts/first-class/tts.mjs [--dry-run] [--force]
import { VOICES, clipPath, record } from '../course/lib/clips.mjs';

const malena = VOICES.find((v) => v.id === 'malena');
const tomas = VOICES.find((v) => v.id === 'tomas');
// dale and re are both Malena's on their pack cards (src/lib/argentine.json).
const lines = [
  { text: '¿Un café? ¡Dale!', voice: malena, where: 'example · dale' },
  { text: '¡La medialuna está re rica!', voice: malena, where: 'example · re' },
  // Pancho's three lines on the call: Tomás, Pancho's voice in Hablar.
  { text: '¡Hola! ¿Qué hacés?', voice: tomas, where: 'call · 1' },
  { text: '¡Qué rico! Che, el domingo hago un asado. ¿Venís?', voice: tomas, where: 'call · 2' },
  { text: '¡Genial! ¡Nos vemos el domingo! ¡Chau!', voice: tomas, where: 'call · 3' },
].map((l) => ({ ...l, path: clipPath('argentine', l.text, l.voice) }));

await record({
  name: 'First class',
  lines,
  manifestFile: new URL('../../docs/first-class/audio.json', import.meta.url).pathname,
  workDir: new URL('../../.course-work/first-class/tts/', import.meta.url).pathname,
  flags: new Set(process.argv.slice(2)),
});
for (const l of lines) console.log(`${l.where}: ${l.path}`);
