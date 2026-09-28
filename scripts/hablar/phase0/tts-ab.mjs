#!/usr/bin/env node
// Phase 0 (docs/hablar-hld.md §4.5, §4.11): which model should speak Tomás's
// live replies — eleven_flash_v2_5 (fast) or eleven_multilingual_v2 (the one
// the course is recorded with)? Synthesizes the same Tomás lines with both,
// through the /stream endpoint hablar-reply will use, and writes a page to
// listen to them side by side, with time-to-first-byte for each.
//
//   npm run hablar:tts-ab [-- --dry-run] [--stability 0.85] [--out <dir>]
//
// Output (default .course-work/hablar/tts-ab/, which git ignores):
//   index.html            the A/B page — open it in a browser
//   flash-N.mp3 / multi-N.mp3
//   clips.json            the list playback-test.html plays by default
//   playback-test.html    a copy, so the whole folder can be served to a phone
//
// Cost: every line twice. The dry run prints the character count.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { apiKey } from '../../course/lib/tts.mjs';
import { TOMAS } from '../lib/content.mjs';

const API = 'https://api.elevenlabs.io/v1';
const MODELS = [
  { key: 'flash', id: 'eleven_flash_v2_5' },
  { key: 'multi', id: 'eleven_multilingual_v2' },
];

// Replies as Tomás would give them: recasts, voseo, questions, lunfardo,
// numbers and prices — the things rioplatense prosody lives or dies on.
// Each is one reply; `previous_text` chains its sentences like hablar-reply does.
const LINES = [
  '¡Buenas! ¿Qué te traigo? Tenemos medialunas recién hechas.',
  'Ah, ¿querés una manzana? Dale, te pongo un kilo. ¿Algo más?',
  '¿Vos sos de Canadá? ¡Qué bueno! ¿Y hace cuánto que estás acá?',
  'El alfajor sale dos mil quinientos pesos. ¿Me pagás con transferencia o en efectivo?',
  'Che, posta, el sábado vamos a hacer un asado re lindo. ¿Te sumás?',
  'Bueno, me tengo que ir. ¡Nos vemos, eh! Cuidate.',
];

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : dflt;
};
const dryRun = argv.includes('--dry-run');
const stability = Number(opt('--stability', 0.85));
const out = resolve(opt('--out', new URL('../../../.course-work/hablar/tts-ab/', import.meta.url).pathname));

const chars = LINES.reduce((n, l) => n + l.length, 0) * MODELS.length;
console.log(`${LINES.length} line(s) × ${MODELS.length} models in ${TOMAS.id}, ~${chars} characters, stability ${stability}`);
if (dryRun) {
  for (const l of LINES) console.log(`  ${l}`);
  console.log(`\n--dry-run: nothing called, nothing written (would write to ${out})`);
  process.exit(0);
}

/** Splits a reply into sentences the way hablar-reply's sentence pipe will. */
const sentences = (text) => text.match(/[^.!?…]+[.!?…]+["”»)]*\s*/g)?.map((s) => s.trim()) ?? [text];

async function speak(text, model, previous) {
  const t0 = performance.now();
  const res = await fetch(`${API}/text-to-speech/${TOMAS.provider_id}/stream?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: model,
      ...(previous ? { previous_text: previous } : {}),
      voice_settings: { stability, similarity_boost: 0.85, style: 0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  const reader = res.body.getReader();
  const chunks = [];
  let ttfb = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    ttfb ??= Math.round(performance.now() - t0);
    chunks.push(value);
  }
  return { mp3: Buffer.concat(chunks), ttfb, total: Math.round(performance.now() - t0) };
}

const key = apiKey();
mkdirSync(out, { recursive: true });
const rows = [];
const clips = [];
for (const [i, line] of LINES.entries()) {
  const row = { line, takes: {} };
  for (const m of MODELS) {
    // One file per reply, made sentence by sentence and joined — exactly what
    // the learner hears when hablar-reply streams it. mp3 frames concatenate.
    const parts = [];
    const timings = [];
    let previous = '';
    for (const s of sentences(line)) {
      const r = await speak(s, m.id, previous);
      parts.push(r.mp3);
      timings.push(r);
      previous = `${previous} ${s}`.trim();
    }
    const file = `${m.key}-${i + 1}.mp3`;
    writeFileSync(`${out}/${file}`, Buffer.concat(parts));
    parts.forEach((p, j) => writeFileSync(`${out}/${m.key}-${i + 1}-s${j + 1}.mp3`, p));
    if (m.key === MODELS[0].key) parts.forEach((_, j) => clips.push(`${m.key}-${i + 1}-s${j + 1}.mp3`));
    row.takes[m.key] = { file, ttfb: timings[0].ttfb, total: timings.reduce((n, t) => n + t.total, 0) };
    console.log(`  ${m.key.padEnd(5)} ${i + 1}: first byte ${timings[0].ttfb} ms, all ${row.takes[m.key].total} ms`);
  }
  rows.push(row);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tomás TTS A/B</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--muted:#666;--line:#e5e5e5}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#999;--line:#333}}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:0 auto;padding:16px}
table{width:100%;border-collapse:collapse}td,th{border-top:1px solid var(--line);padding:10px 6px;vertical-align:top;text-align:left}
audio{width:100%}small{color:var(--muted)}label{display:block;margin-top:4px}
</style></head><body>
<h1>Tomás: Flash v2.5 vs Multilingual v2</h1>
<p><small>Same lines, same voice, sentence by sentence through <code>/stream</code> as hablar-reply will.
Stability ${stability}. Listen for rioplatense melody (questions, <i>sh</i>), voseo stress (querés, sos), numbers.
Columns are in random order per row so you don't know which is which until you reveal.</small></p>
<p><button onclick="document.body.classList.toggle('reveal')">Reveal / hide models</button></p>
<style>.m{display:none}.reveal .m{display:inline}</style>
<table><tr><th>Line</th><th>A</th><th>B</th><th>Pick</th></tr>
${rows
  .map((r, i) => {
    const order = Math.random() < 0.5 ? ['flash', 'multi'] : ['multi', 'flash'];
    const cell = (k) => `<td><audio controls preload="none" src="${r.takes[k].file}"></audio>
<small class="m">${k === 'flash' ? 'eleven_flash_v2_5' : 'eleven_multilingual_v2'} · first byte ${r.takes[k].ttfb} ms · total ${r.takes[k].total} ms</small></td>`;
    return `<tr><td>${esc(r.line)}</td>${order.map(cell).join('')}<td>
<label><input type="radio" name="p${i}" value="${order[0]}"> A</label><label><input type="radio" name="p${i}" value="${order[1]}"> B</label></td></tr>`;
  })
  .join('\n')}
</table>
<p><button onclick="tally()">Count my picks</button> <span id="tally"></span></p>
<script>
function tally(){const n={flash:0,multi:0};document.querySelectorAll('input:checked').forEach(i=>n[i.value]++);
document.getElementById('tally').textContent='flash '+n.flash+' · multilingual '+n.multi;}
</script>
</body></html>
`;
writeFileSync(`${out}/index.html`, html);
writeFileSync(`${out}/clips.json`, JSON.stringify(clips, null, 1) + '\n');
copyFileSync(new URL('./playback-test.html', import.meta.url), `${out}/playback-test.html`);
console.log(`\nwrote ${out}/index.html — open it and listen`);
console.log(`for the iPhone test: npx serve ${out}  → http://<this-mac's-ip>:3000/playback-test.html`);
