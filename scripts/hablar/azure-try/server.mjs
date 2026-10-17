#!/usr/bin/env node
// Try Azure's Argentine voices (es-AR-TomasNeural, es-AR-ElenaNeural) as a
// cheaper Pancho: type a line, pick a speed, hear it. Nothing is saved.
//
//   node scripts/hablar/azure-try/server.mjs   → http://localhost:8791
//
// Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (e.g. eastus) in .env, from
// an Azure "Speech" resource (the free F0 tier covers 0.5M characters a month).
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const PORT = 8791;
const ROOT = new URL('../../../', import.meta.url).pathname;
try {
  process.loadEnvFile(`${ROOT}.env`);
} catch { /* already in the environment */ }
const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
if (!KEY || !REGION) throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION missing from .env');

const VOICES = new Set(['es-AR-TomasNeural', 'es-AR-ElenaNeural']);
const escape = (t) => t.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

// Porteño speech has a wide, "singing" melody and short pauses after the
// little words that open a phrase (Che, Mirá, Bueno, Dale…). Tomás is a plain
// neural voice (no styles), so the tuning is all SSML: a wider pitch range, a
// pitch offset, those pauses, and no padding silence before or after.
const OPENERS = /(^|[.!?¿¡]\s*)(Che|Mirá|Bueno|Dale|Ah|Uh|Uy|Che, mirá|Pero bueno|Viste),/g;

function ssmlFor({ text, voice, speed, tune }) {
  let body = escape(text);
  const rate = `${Math.round((speed - 1) * 100)}%`;
  let prosody = `rate="${rate}"`;
  if (tune) {
    prosody += ` pitch="${tune.pitch >= 0 ? '+' : ''}${tune.pitch}%" range="${tune.range >= 0 ? '+' : ''}${tune.range}%"`;
    if (tune.pauses) body = body.replace(OPENERS, (m, pre, word) => `${pre}${word},<break time="${tune.pauseMs}ms"/>`);
  }
  const trim = '<mstts:silence type="Leading-exact" value="0ms"/><mstts:silence type="Tailing-exact" value="0ms"/>';
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-AR"><voice name="${voice}">${tune ? trim : ''}<prosody ${prosody}>${body}</prosody></voice></speak>`;
}

async function speak(opts) {
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      // Tomás and Elena are 48 kHz voices; the old 24 kHz format threw half of that away.
      'X-Microsoft-OutputFormat': opts.tune ? 'audio-48khz-192kbitrate-mono-mp3' : 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'posta-azure-try',
    },
    body: ssmlFor(opts),
  });
  if (!res.ok) throw new Error(`azure tts ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

const body = (req) => new Promise((ok, fail) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => ok(Buffer.concat(chunks).toString()));
  req.on('error', fail);
});

createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(readFileSync(new URL('./index.html', import.meta.url)));
    }
    if (req.method === 'POST' && req.url === '/api/speak') {
      const { text, voice, speed, tune } = JSON.parse(await body(req));
      if (typeof text !== 'string' || !text.trim() || text.length > 500 || !VOICES.has(voice)) {
        res.writeHead(400, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: 'bad request' }));
      }
      const t0 = Date.now();
      const clamp = (n, lo, hi, d) => Math.min(hi, Math.max(lo, Number.isFinite(Number(n)) ? Number(n) : d));
      const mp3 = await speak({
        text: text.trim(),
        voice,
        speed: clamp(speed, 0.7, 1.2, 1),
        tune: tune ? { pitch: clamp(tune.pitch, -20, 20, 0), range: clamp(tune.range, -50, 100, 0), pauses: !!tune.pauses, pauseMs: clamp(tune.pauseMs, 0, 600, 150) } : null,
      });
      res.writeHead(200, { 'content-type': 'audio/mpeg', 'x-ms': String(Date.now() - t0) });
      return res.end(mp3);
    }
    res.writeHead(404).end();
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: String(err).slice(0, 300) }));
  }
}).listen(PORT, () => console.log(`Azure voice try → http://localhost:${PORT}`));
