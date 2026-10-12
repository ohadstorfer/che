// Recording what ships inside the app rather than in the database: the
// Argentine packs and the culture glossary.
//
// There is no row to point at a clip, so the pointing is done by name. A clip's
// path is a hash of what is said and who says it with which model, and a
// manifest beside the source lists the paths that exist. The build then asks
// the same function for the same path and ships it only if the manifest has it.
// An edited line is a new name (the bucket is served with a year of cache), and
// changing the model re-records everything by itself.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { promisify } from 'node:util';

import { apiKey, needsSentence, spoken, synthesize } from './tts.mjs';

const run = promisify(execFile);
const sha = (s) => createHash('sha256').update(s).digest('hex');

/** The course's two speakers (public.voices), for content with no database to read them from. */
export const VOICES = [
  { id: 'malena', provider_id: 'p7AwDmKvTdoHTBuueGvP', model: 'eleven_v4_turbo' },
  { id: 'tomas', provider_id: 'QK4xDwo9ESPHA4JNUpX3', model: 'eleven_v4_turbo' },
];

/**
 * Who says a line, decided by the line alone.
 *
 * The course balances a unit's clips against each other (assignVoices), which
 * works because a unit is finished before it is recorded. These lists grow a
 * word at a time, and a balance over the list would hand yesterday's words to
 * the other speaker whenever one is added. The text's own hash comes out half
 * and half and never moves.
 */
export const voiceFor = (text) => VOICES[parseInt(sha(text.trim()).slice(0, 2), 16) % VOICES.length];

/**
 * Where a line's clip lives in the audio bucket.
 *
 * A word that is cut out of a sentence (needsSentence) is named for that too:
 * it replaced a recording of the same word by the same voice, and the old name
 * is cached for a year.
 */
export const clipPath = (folder, text, voice = voiceFor(text)) =>
  `${folder}/${sha(`${voice.id}|${voice.model}|${text.trim()}${needsSentence(text) ? '|cut' : ''}`).slice(0, 20)}.mp3`;

export const loadManifest = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {});

const sortKeys = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

/** How many clips are in flight at once: the ElevenLabs plan allows three requests at a time. */
const AT_ONCE = 3;
const BATCH = 150;

// The clips live in S3, not in Supabase storage: a course of them is over a
// gigabyte. The app reads them through EXPO_PUBLIC_AUDIO_URL, same paths.
const BUCKET = process.env.AUDIO_S3_BUCKET ?? 'posta-audio';
const aws = (args, opts) =>
  run('aws', args, { maxBuffer: 256 * 1024 * 1024, env: { AWS_PROFILE: 'posta', ...process.env }, ...opts });

/**
 * Uploads clips sitting under `root` at their bucket paths, a whole top folder
 * per CLI call — a call per clip is seconds each, which is days over a
 * course. Returns the paths the CLI says arrived.
 */
export async function uploadFolders(root, paths) {
  const arrived = new Set();
  for (const folder of new Set(paths.map((p) => p.split('/')[0]))) {
    // A second and third go: a connection drops now and then, and the clips
    // are already paid for.
    for (let attempt = 1; attempt <= 3; attempt++) try {
      const { stdout } = await aws([
        's3', 'cp', '--recursive', `${root}${folder}`, `s3://${BUCKET}/${folder}`,
        '--no-progress', '--content-type', 'audio/mpeg',
        // Every clip has its own name, so it never changes once written.
        '--cache-control', 'public, max-age=31536000, immutable',
      ]);
      for (const m of stdout.matchAll(/ to s3:\/\/[^/]+\/(\S+)/g)) arrived.add(m[1]);
      break;
    } catch (err) {
      console.log(`  upload of ${folder}/ FAILED (try ${attempt} of 3): ${String(err.message).slice(0, 300)}`);
    }
  }
  return arrived;
}

/** path -> bytes, for every clip in the bucket under these top folders. */
export async function clipSizes(folders) {
  const sizes = new Map();
  for (const folder of folders) {
    const { stdout } = await aws([
      's3api', 'list-objects-v2', '--bucket', BUCKET, '--prefix', `${folder}/`,
      '--query', 'Contents[].[Key,Size]', '--output', 'text',
    ]);
    for (const line of stdout.split('\n')) {
      const [key, size] = line.split('\t');
      if (size) sizes.set(key, Number(size));
    }
  }
  return sizes;
}

/** Takes clips out of the bucket. */
export async function removeClips(paths) {
  for (const p of paths) await aws(['s3', 'rm', `s3://${BUCKET}/${p}`, '--only-show-errors']);
}

/**
 * Records every line not yet in the manifest and uploads it.
 *
 * `lines` are `{ text, voice, path, where }`, unique by path. Flags are the
 * ones every recorder here takes: --dry-run and --force. Resolves to whether
 * anything was recorded, which is when the bundle wants rebuilding.
 */
export async function record({ name, lines, manifestFile, workDir, flags }) {
  const dryRun = flags.has('--dry-run');
  const force = flags.has('--force');
  const manifest = loadManifest(manifestFile);
  const due = lines.filter((l) => force || !manifest[l.path]);
  // What ElevenLabs bills is the spoken text; the carrier context is free.
  const chars = due.reduce((n, l) => n + spoken(l.text).length, 0);
  const count = (id) => due.filter((l) => l.voice.id === id).length;
  const tally = VOICES.filter((v) => count(v.id)).map((v) => `${v.id} ${count(v.id)}`).join(', ');

  console.log(`${name}: ${lines.length} line(s), ${lines.length - due.length} already recorded`);
  console.log(`  ${due.length} to record (${tally}) in ${due[0]?.voice.model ?? VOICES[0].model}, ~${chars} characters\n`);
  if (due.length === 0) {
    console.log('nothing to do');
    return false;
  }

  if (dryRun) {
    for (const l of due) console.log(`  ${l.voice.id.padEnd(7)} ${l.where.padEnd(28)} ${l.text}`);
    console.log(`\n--dry-run: ${due.length} clip(s), ~${chars} characters — nothing called, nothing written`);
    return false;
  }

  const key = apiKey();

  let spent = 0;
  let n = 0;
  const failed = [];
  // A batch at a time: recorded, uploaded, then noted in the manifest, so a
  // crash loses one batch at most of what was already paid for.
  for (let at = 0; at < due.length; at += BATCH) {
    rmSync(workDir, { recursive: true, force: true });
    const made = [];
    const queue = due.slice(at, at + BATCH);
    const worker = async () => {
      for (let line = queue.shift(); line; line = queue.shift()) {
        try {
          const { mp3, cost } = await synthesize({ text: line.text, voice: line.voice, key });
          spent += cost;
          mkdirSync(dirname(`${workDir}${line.path}`), { recursive: true });
          writeFileSync(`${workDir}${line.path}`, mp3);
          made.push(line);
          console.log(`  ${++n}/${due.length} ${line.voice.id.padEnd(7)} ${line.text}`);
        } catch (err) {
          failed.push(line);
          console.log(`  ${++n}/${due.length} ${line.text} — FAILED: ${String(err.message).slice(0, 300)}`);
        }
      }
    };
    await Promise.all(Array.from({ length: AT_ONCE }, worker));

    // Upload before the manifest learns a path: a path in the bundle with no
    // file behind it is a silent ▶️ that the app's cache would remember.
    const up = await uploadFolders(workDir, made.map((l) => l.path));
    for (const line of made) {
      if (!up.has(line.path)) {
        failed.push(line);
        console.log(`  upload FAILED: ${line.text}`);
        continue;
      }
      manifest[line.path] = {
        text: line.text,
        voice: line.voice.id,
        model: line.voice.model,
        recorded_at: new Date().toISOString(),
      };
    }
    writeFileSync(manifestFile, JSON.stringify(sortKeys(manifest), null, 1) + '\n');
  }

  console.log(`\n${due.length - failed.length} clip(s) recorded and uploaded, ${spent} credit(s) spent`);
  if (failed.length) {
    console.log(`${failed.length} failed — run again to retry`);
    process.exitCode = 1;
  }
  return failed.length < due.length;
}
