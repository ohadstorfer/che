// Refreshes the data snapshots build-learn.mjs reads, from the live DB (read-only):
//   data/word-sentences.json  up to 3 short published course sentences per slang word
//   data/verbs.json           vos forms + example sentences of the top course verbs
// Needs the Supabase CLI login (npx supabase@2 --linked). Then run build-learn.mjs.
//   node scripts/site/fetch-data.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(import.meta.dirname, 'data');
const EXTRA_WORDS = ['copado', 'morfar', 'mango'];

// Words whose plain match misses most sentences (verbs) or catches another sense.
// Postgres regex, matched case-insensitively against the sentence.
const PATTERNS = {
  zafar: '\\m(zaf[aáeé]\\w*|zafar)\\M',
  bancar: '\\m(banc[aá]\\w*|banqu\\w+)\\M',
  fijarse: '\\m(fij[aáeé]te|me fijo|fijate|se fija\\w*|fijarse|fijamos)\\M',
  charlar: '\\m(charl[aáeé]\\w*)\\M',
  apurar: '\\m(apur[aáeé]\\w*)\\M',
  joder: '\\m(jod[eéií]\\w*|joder)\\M',
  'dar bola': '\\m(da|das|dan|dio|dieron|doy|dar|dame|dale|den) bola\\M',
  viste: '(viste\\?|, viste,)',
  loco: '(, loco[.?!,]|^loco,)',
};

function run(sql) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'posta-site-')), 'q.sql');
  fs.writeFileSync(file, sql);
  const out = execFileSync('npx', ['supabase@2', 'db', 'query', '--linked', '-o', 'json', '-f', file],
    { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
  return JSON.parse(out).rows;
}

const lit = (s) => `'${s.replace(/'/g, "''")}'`;
const reEscape = (s) => s.replace(/[.?*+()[\]\\^$|{}]/g, '\\$&');

const words = yaml.load(fs.readFileSync(path.join(ROOT, 'docs/argentine/words.yaml'), 'utf8')).words
  .filter((w) => w.rank === 1 || EXTRA_WORDS.includes(w.es));
const values = words.map((w) => `(${lit(w.es)}, ${lit(PATTERNS[w.es] ?? `(^|[^[:alpha:]])${reEscape(w.es)}($|[^[:alpha:]])`)})`).join(',\n');

const sentences = run(`
with w(es, re) as (values ${values}),
m as (
  select w.es as word, s.es, s.en, row_number() over (partition by w.es order by length(s.es), s.es) rn
  from w join sentences s on s.status = 'published' and length(s.es) between 18 and 90 and s.es ~* w.re
)
select word, es, en from m where rn <= 4 order by word, rn;`);
fs.writeFileSync(path.join(DATA, 'word-sentences.json'), JSON.stringify(sentences, null, 1));

const verbs = run(fs.readFileSync(path.join(import.meta.dirname, 'sql/verbs.sql'), 'utf8'))[0].j;
fs.writeFileSync(path.join(DATA, 'verbs.json'), JSON.stringify(typeof verbs === 'string' ? JSON.parse(verbs) : verbs, null, 1));

console.log(`word-sentences.json: ${sentences.length} sentences for ${new Set(sentences.map((r) => r.word)).size}/${words.length} words`);
