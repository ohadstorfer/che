#!/usr/bin/env node
// Records the whole course in one go: every published word and sentence, in
// every published unit, that has no clip yet or has one in the wrong voice.
//
//   npm run course:tts-all [-- --dry-run]
//
// The casting is course:tts's, unit by unit (assignVoices), so a clip gets the
// speaker it would get there. What differs is the plumbing. course:tts asks the
// database five questions per unit, and each is a CLI call of several seconds:
// over 466 units that is hours spent not recording. Here the questions are
// asked once, and clips go out in batches — recorded, uploaded, rows pointed at
// them — so stopping, or running out of credits, loses one batch at most and a
// second run records only what is still missing.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { uploadFolders } from './lib/clips.mjs';
import { queryLinked } from './lib/db.mjs';
import { q } from './lib/sql.mjs';
import { apiKey, assignVoices, clipPath, speakerGender, synthesize } from './lib/tts.mjs';

const dryRun = process.argv.includes('--dry-run');
/** Three requests at once is what the ElevenLabs plan allows. */
const AT_ONCE = 3;
const BATCH = 300;
const dir = new URL('../../.course-work/tts/_all/', import.meta.url).pathname;

// --- what to record ---------------------------------------------------------

const units = queryLinked(`select id, slug from public.units where status = 'published' order by course_order, slug`);
// Sorted by id so the pairing with the clip list never depends on what the
// database happened to return first.
const voices = queryLinked(
  `select id, provider_id, model, gender from public.voices where status = 'published' order by id`,
);
if (voices.length === 0) {
  console.error('no published voices — apply migration 20260918000007');
  process.exit(1);
}
const allWords = queryLinked(
  `select id, unit_id, form as text, audio_path, voice_id, coalesce(position, 0) as position
     from public.forms where status = 'published'`,
);
const formById = new Map(
  queryLinked(`select f.id, f.form, f.features from public.forms f join public.lemmas l on l.id = f.lemma_id`).map((f) => [f.id, f]),
);
const allSentences = queryLinked(
  `select id, unit_id, es as text, audio_path, voice_id, tokens from public.sentences where status = 'published'`,
);

const by = (rows) => Map.groupBy(rows, (r) => r.unit_id);
const wordsOf = by(allWords);
const sentencesOf = by(allSentences);

const due = [];
let total = 0;
for (const unit of units) {
  const words = (wordsOf.get(unit.id) ?? []).map((r) => ({
    ...r,
    kind: 'form',
    sortKey: `${String(r.position).padStart(4, '0')}|${r.text}`,
  }));
  const sentences = (sentencesOf.get(unit.id) ?? []).map((r) => ({
    ...r,
    kind: 'sentence',
    sortKey: r.text,
    gender: speakerGender(r.tokens ?? [], formById),
  }));
  total += words.length + sentences.length;
  // Balanced separately, as in course:tts.
  const speaker = new Map([...assignVoices(words, voices), ...assignVoices(sentences, voices)]);
  for (const c of [...words, ...sentences]) {
    const voice = speaker.get(c.id);
    if (!c.audio_path || (c.voice_id && voice.id !== c.voice_id)) due.push({ ...c, voice, slug: unit.slug });
  }
}

console.log(`${units.length} unit(s), ${total} clip(s), ${total - due.length} already recorded`);
console.log(`  ${due.length} to record: ${voices.map((v) => `${v.id} ${due.filter((c) => c.voice.id === v.id).length}`).join(', ')}`);
if (due.length === 0 || dryRun) {
  const perUnit = Map.groupBy(due, (c) => c.slug);
  for (const [slug, cs] of perUnit) console.log(`  ${String(cs.length).padStart(4)} ${slug}`);
  console.log(dryRun ? '\n--dry-run: nothing called, nothing written' : 'nothing to do');
  process.exit(0);
}

// --- record, a batch at a time ----------------------------------------------

const key = apiKey();
const stamp = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let spent = 0;
let n = 0;
let recorded = 0;
const failed = [];
/** Set when ElevenLabs says the credits are gone: nothing after that can succeed. */
let outOfCredits = false;

for (let at = 0; at < due.length && !outOfCredits; at += BATCH) {
  rmSync(dir, { recursive: true, force: true });
  const made = [];
  const queue = due.slice(at, at + BATCH);
  const worker = async () => {
    for (let clip = queue.shift(); clip && !outOfCredits; clip = queue.shift()) {
      for (let attempt = 1; ; attempt++) {
        try {
          const { mp3, cost } = await synthesize({ text: clip.text, voice: clip.voice, key });
          spent += cost;
          const path = clipPath(clip.kind, clip.id, clip.voice.id, stamp);
          mkdirSync(dirname(`${dir}${path}`), { recursive: true });
          writeFileSync(`${dir}${path}`, mp3);
          made.push({ ...clip, path });
          break;
        } catch (err) {
          if (/quota_exceeded/.test(err.message)) outOfCredits = true;
          // Someone else on the same key, or a hiccup at their end: worth a wait.
          else if (attempt < 4 && /elevenlabs (429|5\d\d)|fetch failed/.test(err.message)) {
            await sleep(2000 * attempt);
            continue;
          }
          failed.push({ ...clip, error: err.message });
          if (!outOfCredits) console.log(`  FAILED ${clip.text}: ${err.message.slice(0, 200)}`);
          break;
        }
      }
      n++;
    }
  };
  await Promise.all(Array.from({ length: AT_ONCE }, worker));
  if (made.length === 0) continue;

  // Upload, then point the rows at the clips — never the other way round: a
  // row pointing at a file that is not there yet is a silent play button.
  const arrived = await uploadFolders(dir, made.map((c) => c.path));
  const uploaded = made.filter((c) => arrived.has(c.path));
  for (const c of made) if (!arrived.has(c.path)) failed.push({ ...c, error: 'not uploaded' });
  if (uploaded.length) {
    queryLinked(
      uploaded
        .map((c) => `update public.${c.kind === 'form' ? 'forms' : 'sentences'} set audio_path = ${q(c.path)}, voice_id = ${q(c.voice.id)} where id = ${q(c.id)};`)
        .join('\n'),
    );
  }
  recorded += uploaded.length;
  console.log(`  ${recorded}/${due.length} recorded — ${spent} credit(s) — ${new Date().toISOString()} — at ${made.at(-1).slug}`);
}

console.log(`\n${recorded} clip(s) recorded, ${spent} credit(s) spent`);
if (outOfCredits) console.log('ElevenLabs is out of credits — top up and run again; it records only what is missing');
if (failed.length || recorded < due.length) {
  console.log(`${due.length - recorded} still missing — run again to retry`);
  process.exit(1);
}
