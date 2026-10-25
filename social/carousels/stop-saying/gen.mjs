// Stop saying carousel: fills cover.dc.html once per row in rows.json.
// The inside slides and the ending are the Drake ones (G<n>-2…8 in the Posta carousels canvas).
// Usage: node gen.mjs <out-dir>   → writes <out-dir>/SS-<id>.dc.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2];
if (!out) throw new Error('usage: node gen.mjs <out-dir>');
const tpl = readFileSync(join(here, 'cover.dc.html'), 'utf8');
const rows = JSON.parse(readFileSync(join(here, 'rows.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

mkdirSync(out, { recursive: true });
for (const r of rows) {
  const html = tpl
    .replace('{{TITLE}}', esc(`Stop saying · ${r.topic}`))
    .replace('{{TOP}}', esc(r.top))
    .replace('{{BOTTOM}}', esc(r.bottom))
    .replace('{{TOPIC}}', esc(r.topic));
  if (html.includes('{{')) throw new Error(`unfilled field in ${r.id}`);
  writeFileSync(join(out, `SS-${r.id}.dc.html`), html);
  console.log(`SS-${r.id}.dc.html`);
}
