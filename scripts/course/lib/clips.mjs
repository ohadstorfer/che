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

import { apiKey, spoken, synthesize } from './tts.mjs';

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

/** Where a line's clip lives in the `audio` bucket. */
export const clipPath = (folder, text, voice = voiceFor(text)) =>
  `${folder}/${sha(`${voice.id}|${voice.model}|${text.trim()}`).slice(0, 20)}.mp3`;

export const loadManifest = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {});

const sortKeys = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

/** How many clips are in flight at once: the ElevenLabs plan allows three requests at a time. */
const AT_ONCE = 3;
const BATCH = 150;

/**
 * Uploads clips sitting under `root` at their bucket paths, a whole top folder
 * per CLI call — a call per clip is four seconds each, which is days over a
 * course. Returns the paths the CLI says arrived.
 */
export async function uploadFolders(root, paths) {
  const arrived = new Set();
  for (const folder of new Set(paths.map((p) => p.split('/')[0]))) {
    // A second and third go: the CLI's connection drops now and then, and the
    // clips are already paid for.
    for (let attempt = 1; attempt <= 3; attempt++) try {
      const { stdout } = await run('npx', [
        '--yes', 'supabase@2', 'storage', 'cp', '-r', `${root}${folder}`, 'ss:///audio/',
        '--linked', '--experimental', '--jobs', '8', '--content-type', 'audio/mpeg',
        // Every clip has its own name, so it never changes once written.
        '--cache-control', 'max-age=31536000',
      ], { maxBuffer: 64 * 1024 * 1024 });
      const report = JSON.parse(stdout.trim().split('\n').findLast((l) => l.startsWith('{')));
      for (const u of report.uploaded ?? []) arrived.add(u.to.replace(/^\/audio\//, ''));
      break;
    } catch (err) {
      console.log(`  upload of ${folder}/ FAILED (try ${attempt} of 3): ${String(err.message).slice(0, 300)}`);
    }
  }
  return arrived;
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
