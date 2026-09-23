// Bundles docs/culture/*.yaml into src/lib/culture.json, the file the app
// reads. Refuses to write if any section fails validation.
// Usage: npm run culture:build
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

import { validate } from './validate.mjs';

const DIR = 'docs/culture';
const OUT = 'src/lib/culture.json';

// The order sections appear in the app. Anything not listed goes last.
const ORDER = ['mate', 'asado', 'futbol', 'alfajores', 'puteadas', 'historia-nacimiento', 'historia-moderna'];

const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));
const sections = [];
let failed = false;
for (const f of files) {
  const doc = parse(readFileSync(join(DIR, f), 'utf8'));
  const errors = validate(doc);
  if (errors.length) {
    failed = true;
    console.log(`✗ ${f}\n    ${errors.join('\n    ')}`);
    continue;
  }
  sections.push({ ...doc.section, classes: doc.classes });
}
if (failed) process.exit(1);

const rank = (s) => (ORDER.includes(s.slug) ? ORDER.indexOf(s.slug) : ORDER.length);
sections.sort((a, b) => rank(a) - rank(b) || a.slug.localeCompare(b.slug));

writeFileSync(OUT, JSON.stringify({ sections }, null, 1) + '\n');
const classes = sections.reduce((n, s) => n + s.classes.length, 0);
console.log(`wrote ${OUT}: ${sections.length} sections, ${classes} classes`);
