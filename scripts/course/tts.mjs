#!/usr/bin/env node
// Records a unit: every published word and sentence that has no clip yet gets
// one, in one of the two rioplatense voices, and the row learns both where the
// clip is and who said it.
//
//   npm run course:tts -- <unit-slug> [--dry-run] [--force] [--words] [--sentences]
//
//   --dry-run    say what would be recorded, call nothing, write nothing
//   --force      re-record clips that already have audio (the old file stays in
//                the bucket; the row points at the new one)
//   --words      only the unit's words; --sentences only its sentences
//
// Speakers alternate, half and half, and the same clip gets the same speaker on
// every run — see assignVoices in lib/tts.mjs for why that is not just `i % 2`.
//
// Uploads go through the Supabase CLI, like every other script here, so no
// service key has to live on this machine.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { queryLinked } from './lib/db.mjs';
import { q } from './lib/sql.mjs';
import { apiKey, assignVoices, clipPath, speakerGender, synthesize } from './lib/tts.mjs';

const [slug, ...args] = process.argv.slice(2);
const flags = new Set(args);
if (!slug || slug.startsWith('--')) {
  console.error('usage: course:tts -- <unit-slug> [--dry-run] [--force] [--words] [--sentences]');
  process.exit(1);
}
const dryRun = flags.has('--dry-run');
const force = flags.has('--force');
// Neither flag means both kinds; either one means just that kind.
const wantWords = flags.has('--words') || !flags.has('--sentences');
const wantSentences = flags.has('--sentences') || !flags.has('--words');

const dir = new URL(`../../.course-work/tts/${slug}/`, import.meta.url).pathname;

// --- what to record ---------------------------------------------------------

const [unit] = queryLinked(`select id, title_en from public.units where slug = ${q(slug)}`);
if (!unit) {
  console.error(`no unit with slug ${slug}`);
  process.exit(1);
}

// Sorted by id so the pairing with the clip list never depends on what the
// database happened to return first.
const voices = queryLinked(
  `select id, provider_id, model, gender from public.voices where status = 'published' order by id`,
);
if (voices.length === 0) {
  console.error('no published voices — apply migration 20260918000007');
  process.exit(1);
}

/** A word's sort key is its place in the unit; a sentence's is its own text.
 *  Both are fixed, which is what keeps a second run agreeing with the first. */
const words = wantWords
  ? queryLinked(
      `select id, form as text, audio_path, voice_id, coalesce(position, 0) as position
         from public.forms
        where unit_id = ${q(unit.id)} and status = 'published'`,
    ).map((r) => ({ ...r, kind: 'form', sortKey: `${String(r.position).padStart(4, '0')}|${r.text}` }))
  : [];

// The whole lexicon, not just this unit's: a sentence can be carried by a word
// taught anywhere, and the gender rule has to be able to look any token up.
const formById = new Map(
  queryLinked(
    `select f.id, f.form, f.features from public.forms f join public.lemmas l on l.id = f.lemma_id`,
  ).map((f) => [f.id, f]),
);

const sentences = wantSentences
  ? queryLinked(
      `select id, es as text, audio_path, voice_id, tokens
         from public.sentences
        where unit_id = ${q(unit.id)} and status = 'published'`,
    ).map((r) => ({
      ...r,
      kind: 'sentence',
      sortKey: r.text,
      // A line that says who is speaking casts itself; see speakerGender.
      gender: speakerGender(r.tokens ?? [], formById),
    }))
  : [];

// Words and sentences are balanced separately, so a unit does not end up with
// every word in one voice and every sentence in the other.
const speaker = new Map([...assignVoices(words, voices), ...assignVoices(sentences, voices)]);

// A clip is due if it has no recording, or if the one it has is in the wrong
// voice — which happens when the casting rules learn something, as they did
// when names got a gender. Re-recording exactly those keeps the course true to
// the rules without a --force that would pay for every clip again.
const miscast = (c) => c.audio_path && c.voice_id && speaker.get(c.id).id !== c.voice_id;
const clips = [...words, ...sentences].filter((c) => force || !c.audio_path || miscast(c));
const recast = clips.filter((c) => !force && miscast(c)).length;
const already = words.length + sentences.length - clips.length;

console.log(`${unit.title_en} (${slug})`);
console.log(`  ${words.length} word(s), ${sentences.length} sentence(s)`);
if (already) console.log(`  ${already} already recorded${force ? ' — re-recording (--force)' : ' — skipping'}`);
if (recast) console.log(`  ${recast} in the wrong voice — re-recording`);
console.log(`  ${clips.length} to record, in ${voices.map((v) => v.id).join(' / ')}\n`);

if (clips.length === 0) {
  console.log('nothing to do');
  process.exit(0);
}

const tally = new Map(voices.map((v) => [v.id, 0]));
for (const c of clips) tally.set(speaker.get(c.id).id, tally.get(speaker.get(c.id).id) + 1);

if (dryRun) {
  for (const c of clips) {
    // `cast` marks a line the text itself decided, so a reviewer can see the
    // rule working rather than take the split on trust.
    const why = c.gender ? `cast ${c.gender}` : '';
    console.log(`  ${speaker.get(c.id).id.padEnd(7)} ${c.kind.padEnd(8)} ${c.text.padEnd(34)} ${why}`);
  }
  console.log(`\n--dry-run: ${[...tally].map(([v, n]) => `${v} ${n}`).join(', ')} — nothing called, nothing written`);
  process.exit(0);
}

// --- record -----------------------------------------------------------------

const key = apiKey();
// A clean directory per run, so a failed run leaves nothing behind to upload.
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const stamp = Date.now();
const done = [];
const failed = [];
/** Credits ElevenLabs billed, as it reported them — not the character count,
 *  which overstates it. The only figure worth planning a budget from. */
let spent = 0;

for (const [i, clip] of clips.entries()) {
  const voice = speaker.get(clip.id);
  const label = `${i + 1}/${clips.length} ${voice.id.padEnd(7)} ${clip.text}`;
  try {
    const { mp3, cost } = await synthesize({ text: clip.text, voice, key });
    spent += cost;
    const path = clipPath(clip.kind, clip.id, voice.id, stamp);
    const local = `${dir}${path.replace('/', '-')}`;
    writeFileSync(local, mp3);
    done.push({ ...clip, voice, path, local });
    console.log(`  ${label} — ${(mp3.length / 1024).toFixed(0)} kB`);
  } catch (err) {
    failed.push({ ...clip, error: err.message });
    console.log(`  ${label} — FAILED: ${err.message}`);
  }
}

if (failed.length) console.log(`\n${failed.length} clip(s) failed; the rest are being uploaded`);
if (done.length === 0) process.exit(1);

// --- upload, then point the rows at the clips -------------------------------
//
// In that order, and never the other way round: a row pointing at a file that
// is not there yet is a silent play button, and the app's audio cache would
// remember the miss.

console.log(`\nuploading ${done.length} clip(s)…`);
const uploaded = [];
for (const clip of done) {
  try {
    execFileSync(
      'npx',
      ['--yes', 'supabase@2', 'storage', 'cp', clip.local, `ss:///audio/${clip.path}`,
       '--linked', '--experimental', '--content-type', 'audio/mpeg',
       // Every clip has its own name, so it never changes once written.
       '--cache-control', 'max-age=31536000'],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    uploaded.push(clip);
  } catch {
    console.log(`  upload FAILED: ${clip.path}`);
  }
}

if (uploaded.length === 0) {
  console.error('nothing uploaded — rows left untouched');
  process.exit(1);
}

const writes = uploaded.map((c) =>
  `update public.${c.kind === 'form' ? 'forms' : 'sentences'} set audio_path = ${q(c.path)}, voice_id = ${q(c.voice.id)} where id = ${q(c.id)};`,
);
queryLinked(writes.join('\n'));

console.log(`\n${uploaded.length} clip(s) recorded: ${[...tally].map(([v, n]) => `${v} ${n}`).join(', ')}`);
console.log(`${spent} credit(s) spent`);
if (failed.length) {
  console.log(`${failed.length} still missing — run again to retry:`);
  for (const f of failed) console.log(`  ${f.text}: ${f.error}`);
  process.exit(1);
}
