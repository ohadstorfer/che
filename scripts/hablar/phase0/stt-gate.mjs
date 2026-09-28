#!/usr/bin/env node
// Phase 0 gate (docs/hablar-hld.md §4.11): does ElevenLabs Scribe v2 keep the
// learner's mistakes, or quietly transcribe what they meant to say?
//
//   npm run hablar:stt-gate -- <folder> [--clips clips.yaml] [--dry-run]
//                                       [--report] [--threshold 80]
//
//   <folder>      the recordings, plus clips.yaml describing them
//                 (template: scripts/hablar/phase0/clips.example.yaml)
//   --dry-run     check the YAML and the files, estimate the audio time; no calls
//   --report      re-print the summary from <folder>/stt-gate-results.json
//                 without calling anything
//   --threshold   % of mistakes that must survive (without keyterms) to pass
//
// Each clip is sent twice, with the settings hablar-transcribe will use:
// model scribe_v2, language es, no_verbatim false, tag_audio_events false,
// temperature 0, logging off — once with no keyterms and once with them.
// For every deliberate mistake the transcript either still has it (kept), has
// the correct form instead (fixed), or has neither (lost: misheard).
//
// Raw transcripts go to <folder>/stt-gate-results.json, so the numbers can be
// re-read and re-judged without paying again.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { parse } from 'yaml';

import { apiKey } from '../../course/lib/tts.mjs';
import { bare } from '../../course/lib/rules.mjs';

const API = 'https://api.elevenlabs.io/v1';
const MIME = {
  '.m4a': 'audio/mp4', '.mp4': 'audio/mp4', '.aac': 'audio/aac', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.webm': 'audio/webm', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.flac': 'audio/flac',
};

// --- args --------------------------------------------------------------------

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const folder = argv.find((a, i) => !a.startsWith('--') && !['--clips', '--threshold'].includes(argv[i - 1]));
if (!folder) {
  console.error('usage: hablar:stt-gate -- <folder> [--clips clips.yaml] [--dry-run] [--report] [--threshold 80]');
  process.exit(1);
}
const dir = resolve(folder);
const clipsFile = resolve(dir, opt('--clips') ?? 'clips.yaml');
const resultsFile = join(dir, 'stt-gate-results.json');
const threshold = Number(opt('--threshold') ?? 80);
const dryRun = argv.includes('--dry-run');
const reportOnly = argv.includes('--report');

// --- judging (pure) ------------------------------------------------------------

/** Words only: case, accents and punctuation don't count. */
const norm = (s) => ` ${bare(s).split(/\s+/).filter(Boolean).join(' ')} `;
const contains = (hay, needle) => norm(hay).includes(norm(needle));

/** kept | fixed | lost, for one deliberate mistake in one transcript. */
function judge(transcript, { wrong, right }) {
  if (contains(transcript, wrong)) return 'kept';
  if (right && contains(transcript, right)) return 'fixed';
  return 'lost';
}

// --- load ----------------------------------------------------------------------

if (!existsSync(clipsFile)) {
  console.error(`no ${clipsFile} — copy scripts/hablar/phase0/clips.example.yaml there and record the clips`);
  process.exit(1);
}
const spec = parse(readFileSync(clipsFile, 'utf8'));
const globalKeyterms = spec.keyterms ?? [];
const clips = (spec.clips ?? []).map((c) => ({
  ...c,
  errors: c.errors ?? [],
  path: resolve(dir, c.file),
  keyterms: [...new Set([...globalKeyterms, ...(c.keyterms ?? [])])],
}));

const problems = [];
for (const c of clips) {
  if (!c.file || !c.said) problems.push(`clip ${c.file ?? '?'}: needs file and said`);
  if (!existsSync(c.path)) problems.push(`clip ${c.file}: file not found`);
  else if (!MIME[extname(c.path).toLowerCase()]) problems.push(`clip ${c.file}: unknown audio type`);
  for (const e of c.errors) {
    if (!e.wrong) problems.push(`clip ${c.file}: an error needs "wrong"`);
    else if (c.said && !contains(c.said, e.wrong)) problems.push(`clip ${c.file}: "${e.wrong}" is not in what was said`);
  }
  for (const k of c.keyterms) if (String(k).length > 50) problems.push(`clip ${c.file}: keyterm over 50 chars: ${k}`);
}

// --- report --------------------------------------------------------------------

function report(results) {
  const modes = ['plain', 'keyterms'];
  const tally = Object.fromEntries(modes.map((m) => [m, { kept: 0, fixed: 0, lost: 0, byKind: {}, ms: [], clean: [0, 0] }]));

  for (const r of results) {
    console.log(`\n${r.file}  said: ${r.said}`);
    for (const m of modes) {
      const out = r[m];
      if (!out) continue;
      const t = tally[m];
      if (out.error) {
        console.log(`  ${m.padEnd(8)} ERROR ${out.error}`);
        continue;
      }
      t.ms.push(out.ms);
      const verdicts = r.errors.map((e) => ({ e, v: judge(out.text, e) }));
      for (const { e, v } of verdicts) {
        t[v]++;
        const k = (t.byKind[e.kind ?? 'other'] ??= { kept: 0, total: 0 });
        k.total++;
        if (v === 'kept') k.kept++;
      }
      if (r.errors.length === 0) {
        t.clean[1]++;
        if (norm(out.text) === norm(r.said)) t.clean[0]++;
      }
      const marks = verdicts.map(({ e, v }) => `${v === 'kept' ? '✓' : '✗'} ${v} "${e.wrong}"`).join(' · ') ||
        (norm(out.text) === norm(r.said) ? '✓ clean' : '≠ differs from what was said');
      console.log(`  ${m.padEnd(8)} ${out.text}\n           ${marks}  (${out.ms} ms)`);
    }
  }

  console.log('\n=== summary ===');
  const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : '—');
  const median = (xs) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);
  for (const m of modes) {
    const t = tally[m];
    const total = t.kept + t.fixed + t.lost;
    if (!total && !t.ms.length) continue;
    console.log(`${m === 'plain' ? 'without keyterms' : 'with keyterms   '}: ${pct(t.kept, total)} kept (${t.kept}/${total}), ` +
      `${t.fixed} fixed by STT, ${t.lost} misheard · control clips clean ${t.clean[0]}/${t.clean[1]} · median ${median(t.ms)} ms`);
    for (const [kind, k] of Object.entries(t.byKind)) console.log(`    ${kind.padEnd(10)} ${pct(k.kept, k.total)} (${k.kept}/${k.total})`);
  }
  const p = tally.plain;
  const total = p.kept + p.fixed + p.lost;
  if (total) {
    const rate = (100 * p.kept) / total;
    console.log(`\ngate: ${rate >= threshold ? 'PASS' : 'FAIL'} — ${rate.toFixed(0)}% of mistakes survive without keyterms (threshold ${threshold}%)`);
    const k = tally.keyterms;
    const kt = k.kept + k.fixed + k.lost;
    if (kt) console.log(`keyterms ${k.kept >= p.kept ? 'do not hurt' : `erase ${p.kept - k.kept} more mistake(s)`} — ` +
      `${k.kept >= p.kept ? 'safe to send' : 'send fewer, or none, of the corrected forms'}`);
  }
}

if (reportOnly) {
  if (!existsSync(resultsFile)) {
    console.error(`no ${resultsFile} yet — run without --report first`);
    process.exit(1);
  }
  report(JSON.parse(readFileSync(resultsFile, 'utf8')).results);
  process.exit(0);
}

if (problems.length) {
  console.log(`✗ ${clipsFile}\n    ${problems.join('\n    ')}`);
  process.exit(1);
}

// --- dry run -------------------------------------------------------------------

/** Seconds of audio, from macOS's afinfo, or guessed from size (~64 kbit/s). */
function seconds(path) {
  try {
    const out = execFileSync('afinfo', [path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const m = /estimated duration:\s*([\d.]+)/.exec(out);
    if (m) return Number(m[1]);
  } catch {
    /* not macOS, or not a type afinfo knows */
  }
  return statSync(path).size / 8000;
}

const audio = clips.reduce((n, c) => n + seconds(c.path), 0);
const withKeyterms = clips.filter((c) => c.keyterms.length).length;
const calls = clips.length + withKeyterms;
const billed = audio * (1 + withKeyterms / Math.max(1, clips.length));
const nErrors = clips.reduce((n, c) => n + c.errors.length, 0);
console.log(`${clips.length} clip(s), ${nErrors} deliberate mistake(s), ${audio.toFixed(0)} s of audio`);
console.log(`${calls} Scribe call(s) (${clips.length} plain + ${withKeyterms} with keyterms) ≈ ${(billed / 60).toFixed(1)} min billed`);

if (dryRun) {
  for (const c of clips) console.log(`  ${basename(c.file).padEnd(12)} ${c.said}  [${c.errors.map((e) => e.wrong).join(', ')}]`);
  console.log('\n--dry-run: nothing called');
  process.exit(0);
}

// --- transcribe ----------------------------------------------------------------

async function transcribe(c, keyterms) {
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('file', new Blob([readFileSync(c.path)], { type: MIME[extname(c.path).toLowerCase()] }), basename(c.path));
  form.append('language_code', 'es');
  form.append('tag_audio_events', 'false');
  form.append('no_verbatim', 'false');
  form.append('temperature', '0');
  for (const k of keyterms) form.append('keyterms', k);
  const t0 = performance.now();
  const res = await fetch(`${API}/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });
  const ms = Math.round(performance.now() - t0);
  if (!res.ok) return { error: `${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`, ms };
  const body = await res.json();
  return { text: body.text ?? '', language: body.language_code, ms };
}

const key = apiKey();
const results = [];
for (const [i, c] of clips.entries()) {
  process.stdout.write(`${i + 1}/${clips.length} ${c.file}…`);
  const r = { file: c.file, said: c.said, errors: c.errors, keyterms: c.keyterms };
  r.plain = await transcribe(c, []);
  if (c.keyterms.length) r.keyterms = await transcribe(c, c.keyterms);
  results.push(r);
  process.stdout.write(' done\n');
  // Saved as it goes: a failure halfway keeps what was already paid for.
  writeFileSync(resultsFile, JSON.stringify({ at: new Date().toISOString(), results }, null, 1) + '\n');
}
report(results);
console.log(`\nraw transcripts: ${resultsFile}`);
