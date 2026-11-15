// The content library: finished videos and images live on S3, not on this disk (user's flow, 2026-11-06).
// Made here → approved → pushed to s3://posta-audio/library/<path under posta-videos> → checked there → deleted here.
//   node library.mjs status [folder]        what is only here, in both places, or only on S3
//   node library.mjs push <path...>         upload (each file carries its md5 as S3 metadata) and check it
//   node library.mjs prune <path...>        delete the local copy, only if S3 has the same size and md5
//   node library.mjs pull <path...>         bring a file back from S3 to edit it
// Paths are relative to ~/che/posta-videos (a folder means everything in it). The dashboard (library-server.mjs) uses the same functions.
// Never managed: sources/, casts/, end-card/ — the video scripts read them from disk.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const run = promisify(execFile);
export const ROOT = path.join(os.homedir(), 'che/posta-videos');
export const BUCKET = 'posta-audio', PREFIX = 'library/';
const KEEP = new Set(['sources', 'casts', 'end-card']);
const MEDIA = /\.(mp4|mov|webm|jpg|jpeg|png|webp|gif|mp3|wav|m4a)$/i;
const aws = async (...a) => (await run('aws', ['--profile', 'posta', ...a], {maxBuffer: 64 << 20})).stdout;

const md5 = file => new Promise((ok, bad) => {
  const h = crypto.createHash('md5'); fs.createReadStream(file).on('data', d => h.update(d)).on('end', () => ok(h.digest('hex'))).on('error', bad);
});
const managed = rel => !KEEP.has(rel.split('/')[0]) && !rel.split('/').some(p => p.startsWith('.'));

/** Media files under ROOT (or one folder of it), as paths relative to ROOT. */
export function localFiles(folder = '') {
  const out = [], walk = dir => {
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, e.name), rel = path.relative(ROOT, full);
      if (!managed(rel)) continue;
      if (e.isDirectory()) walk(full); else if (MEDIA.test(e.name)) out.push(rel);
    }
  };
  walk(path.join(ROOT, folder));
  return out;
}

/** S3 objects under library/ (or one folder of it): relative path → size. */
export async function s3Files(folder = '') {
  const json = await aws('s3api', 'list-objects-v2', '--bucket', BUCKET, '--prefix', PREFIX + folder, '--query', 'Contents[].[Key,Size]', '--output', 'json');
  return new Map((JSON.parse(json || 'null') || []).map(([k, s]) => [k.slice(PREFIX.length), s]));
}

/** Everything, merged: [{path, local, s3, size, where}] — where is 'local', 'both' or 's3'. 'both' only means same size; push/prune check md5. */
export async function status(folder = '') {
  const remote = await s3Files(folder), rows = new Map();
  for (const rel of localFiles(folder)) {
    const size = fs.statSync(path.join(ROOT, rel)).size;
    rows.set(rel, {path: rel, local: size, s3: remote.get(rel) ?? null});
  }
  for (const [rel, size] of remote) if (!rows.has(rel)) rows.set(rel, {path: rel, local: null, s3: size});
  return [...rows.values()].map(r => ({...r, where: r.local == null ? 's3' : r.s3 == null ? 'local' : r.s3 === r.local ? 'both' : 'different'}))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** True when S3 holds exactly this local file (same size and the md5 stored at upload). */
export async function verify(rel) {
  const file = path.join(ROOT, rel);
  let head;
  try { head = JSON.parse(await aws('s3api', 'head-object', '--bucket', BUCKET, '--key', PREFIX + rel, '--output', 'json')); } catch { return false; }
  return head.ContentLength === fs.statSync(file).size && head.Metadata?.md5 === await md5(file);
}

const TYPES = {mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4'};
const expand = rels => rels.flatMap(r => fs.existsSync(path.join(ROOT, r)) && fs.statSync(path.join(ROOT, r)).isDirectory() ? localFiles(r) : [r]);

/** Uploads and checks; returns [{path, ok}]. Already-verified files are not sent again. */
export async function push(rels, log = console.log) {
  const out = [];
  for (const rel of expand(rels)) {
    if (!managed(rel)) { out.push({path: rel, ok: false, why: 'not managed'}); log(`skipped ${rel} (not managed)`); continue; }
    if (await verify(rel)) { out.push({path: rel, ok: true, why: 'already there'}); log(`already on S3 ${rel}`); continue; }
    const file = path.join(ROOT, rel), sum = await md5(file);
    await aws('s3', 'cp', file, `s3://${BUCKET}/${PREFIX}${rel}`, '--metadata', `md5=${sum}`, '--content-type', TYPES[rel.split('.').pop().toLowerCase()] || 'application/octet-stream', '--only-show-errors');
    const ok = await verify(rel); out.push({path: rel, ok}); log(`${ok ? 'pushed' : 'FAILED'} ${rel}`);
  }
  return out;
}

/** Deletes local copies, each only after S3 is checked to hold the same file. */
export async function prune(rels, log = console.log) {
  const out = [];
  for (const rel of expand(rels)) {
    if (!(await verify(rel))) { out.push({path: rel, ok: false, why: 'not verified on S3 — kept'}); log(`kept ${rel} (not on S3 yet)`); continue; }
    fs.rmSync(path.join(ROOT, rel)); out.push({path: rel, ok: true}); log(`deleted local ${rel}`);
  }
  return out;
}

/** Brings files back from S3 (for re-editing). */
export async function pull(rels, log = console.log) {
  for (const rel of rels) {
    fs.mkdirSync(path.dirname(path.join(ROOT, rel)), {recursive: true});
    await aws('s3', 'cp', `s3://${BUCKET}/${PREFIX}${rel}`, path.join(ROOT, rel), '--only-show-errors'); log(`pulled ${rel}`);
  }
}

/** A link to watch an S3 file (valid one hour). */
export const presign = async rel => (await aws('s3', 'presign', `s3://${BUCKET}/${PREFIX}${rel}`, '--expires-in', '3600')).trim();

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'status') {
    const rows = await status(rest[0] || ''), sum = w => rows.filter(r => r.where === w);
    for (const r of rows) console.log(r.where.padEnd(9), r.path);
    console.log(`\nonly here ${sum('local').length} · both ${sum('both').length} · only S3 ${sum('s3').length} · different ${sum('different').length}`);
  } else if (cmd === 'push') await push(rest);
  else if (cmd === 'prune') await prune(rest);
  else if (cmd === 'pull') await pull(rest);
  else console.log('usage: node library.mjs status|push|prune|pull <paths relative to ~/che/posta-videos>');
}
