// Which clips the culture classes want: the Spanish she can tap in a reading.
import { clipPath, voiceFor } from '../course/lib/clips.mjs';
import { glossKey } from './validate.mjs';

export const MANIFEST = 'docs/culture/audio.json';

/**
 * What to say for each glossary entry, by its key.
 *
 * The glossary keys a span folded — "qué hacés" — and that is not how it is
 * said: the question marks are what carry the intonation. So the words come
 * from the reading itself, as written there. Where a span is marked more than
 * once the longest spelling wins, which is the one with its punctuation on. An
 * entry no class marks any more is said as its key.
 */
export function spokenByKey(sections, glossary) {
  const out = new Map(Object.keys(glossary).map((k) => [k, k]));
  for (const s of sections)
    for (const c of s.classes)
      for (const p of c.pages ?? [])
        for (const t of [p.text, p.body, p.fun_fact, p.scenario, p.prompt, p.statement])
          for (const m of (t ?? '').matchAll(/\*\*([^*]+)\*\*|\[([^\]]+)\]/g)) {
            const span = (m[1] ?? m[2]).replace(/[“”"]/g, '').trim();
            const key = glossKey(span);
            if (out.has(key) && span.length > out.get(key).length) out.set(key, span);
          }
  return out;
}

export const clipOf = (text) => ({ voice: voiceFor(text), path: clipPath('culture', text) });
