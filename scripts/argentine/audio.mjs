// Which clips the Argentine packs want: each word, and its example.
import { clipPath, voiceFor } from '../course/lib/clips.mjs';

export const MANIFEST = new URL('../../docs/argentine/audio.json', import.meta.url).pathname;

/** A word and its example are said by the same speaker, so a card sounds like one person. */
export function clipsOf(w) {
  const voice = voiceFor(w.es);
  return {
    voice,
    word: clipPath('argentine', w.es, voice),
    example: clipPath('argentine', w.example.es, voice),
  };
}
