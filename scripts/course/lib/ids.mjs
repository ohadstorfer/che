// Deterministic ids for course content.
//
// Every row the pipeline writes — a unit, a form, a sentence — gets a UUIDv5
// derived from what it *is* rather than a random one. Re-seeding the outline
// or rebuilding the demo therefore lands on the same ids, so a learner's
// progress (which points at those ids) survives every re-run.

import { createHash } from 'node:crypto';

/** Fixed namespace for Che's course. Never change it: every id depends on it. */
const NAMESPACE = 'c4e1b7a2-5d3f-4a8e-9b61-2f0d7c3e8a14';

export function uuid5(name) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const hash = createHash('sha1')
    .update(Buffer.concat([ns, Buffer.from(name, 'utf8')]))
    .digest();
  const b = Buffer.from(hash.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const lemmaKey = (lemma, pos) => `${lemma}|${pos}`;

export const ids = {
  unit: (slug) => uuid5(`unit:${slug}`),
  lesson: (unitSlug, ordinal) => uuid5(`lesson:${unitSlug}:${ordinal}`),
  tip: (unitSlug, index) => uuid5(`tip:${unitSlug}:${index}`),
  lemma: (lemma, pos) => uuid5(`lemma:${lemmaKey(lemma, pos)}`),
  form: (lemma, pos, form) => uuid5(`form:${lemmaKey(lemma, pos)}:${form}`),
  sentence: (unitSlug, es) => uuid5(`sentence:${unitSlug}:${es.trim()}`),
  slot: (lessonId, ordinal) => uuid5(`slot:${lessonId}:${ordinal}`),
};
