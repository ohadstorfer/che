// Validates the culture lessons in docs/culture/*.yaml against docs/culture-spec.md.
// Usage: npm run culture:validate [-- file.yaml ...]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const DIR = 'docs/culture';
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_INFO_WORDS = 90; // spec says ~70; this is the hard stop

const str = (v) => typeof v === 'string' && v.trim().length > 0;
const words = (s) => s.trim().split(/\s+/).length;

export function validate(doc) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);

  const s = doc?.section;
  if (!s) return ['missing section'];
  if (!SLUG.test(s.slug ?? '')) err('section', 'bad slug');
  for (const k of ['title', 'emoji', 'summary']) if (!str(s[k])) err('section', `missing ${k}`);

  const classes = doc.classes;
  if (!Array.isArray(classes) || classes.length === 0) return [...errors, 'no classes'];
  const slugs = new Set();

  for (const [ci, c] of classes.entries()) {
    const at = `class ${c?.slug ?? ci}`;
    if (!SLUG.test(c.slug ?? '')) err(at, 'bad slug');
    if (slugs.has(c.slug)) err(at, 'duplicate slug');
    slugs.add(c.slug);
    for (const k of ['title', 'summary']) if (!str(c[k])) err(at, `missing ${k}`);

    const pages = c.pages ?? [];
    if (pages.length < 5 || pages.length > 12) err(at, `${pages.length} pages (want 5–12)`);
    if (pages[0]?.type !== 'info') err(at, 'first page must be info');
    let infoRun = 0;
    let questions = 0;

    for (const [pi, p] of pages.entries()) {
      const pat = `${at} page ${pi + 1} (${p?.type})`;
      infoRun = p.type === 'info' ? infoRun + 1 : 0;
      if (infoRun > 3) err(pat, 'more than 3 info pages in a row');
      if (p.type !== 'info') questions++;

      switch (p.type) {
        case 'info':
          if (!str(p.title) || !str(p.body)) err(pat, 'needs title and body');
          else if (words(p.body) > MAX_INFO_WORDS) err(pat, `body is ${words(p.body)} words`);
          break;
        case 'choice':
        case 'gap': {
          if (!str(p.prompt)) err(pat, 'missing prompt');
          if (p.type === 'gap' && !(str(p.text) && p.text.includes('___'))) err(pat, 'text needs ___');
          const n = p.options?.length ?? 0;
          if (n < 2 || n > 4 || !p.options.every(str)) err(pat, 'needs 2–4 options');
          if (!Number.isInteger(p.correct) || p.correct < 0 || p.correct >= n) err(pat, 'bad correct');
          if (!str(p.explain)) err(pat, 'missing explain');
          break;
        }
        case 'true_false':
          if (!str(p.statement)) err(pat, 'missing statement');
          if (typeof p.answer !== 'boolean') err(pat, 'answer must be true/false');
          if (!str(p.explain)) err(pat, 'missing explain');
          break;
        case 'order':
          if (!str(p.prompt)) err(pat, 'missing prompt');
          if (!Array.isArray(p.items) || p.items.length < 3 || p.items.length > 6 || !p.items.every(str))
            err(pat, 'needs 3–6 items');
          break;
        case 'match':
          if (!str(p.prompt)) err(pat, 'missing prompt');
          if (
            !Array.isArray(p.pairs) ||
            p.pairs.length < 3 ||
            p.pairs.length > 5 ||
            !p.pairs.every((x) => Array.isArray(x) && x.length === 2 && x.every(str))
          )
            err(pat, 'needs 3–5 pairs of [a, b]');
          break;
        default:
          err(pat, 'unknown page type');
      }
    }
    if (questions < 2) err(at, 'fewer than 2 questions');

    const vocab = c.vocabulary ?? [];
    if (vocab.length < 4 || vocab.length > 10) err(at, `${vocab.length} vocabulary words (want 4–10)`);
    for (const v of vocab) {
      if (!str(v.es) || !str(v.en)) err(at, `vocabulary entry needs es and en: ${JSON.stringify(v)}`);
      if (v.example && !(str(v.example.es) && str(v.example.en))) err(at, `example needs es and en: ${v.es}`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(DIR).filter((f) => f.endsWith('.yaml')).map((f) => join(DIR, f));
  let failed = 0;
  for (const f of files) {
    const doc = parse(readFileSync(f, 'utf8'));
    const errors = validate(doc);
    const n = doc?.classes?.length ?? 0;
    if (errors.length) {
      failed++;
      console.log(`✗ ${f}`);
      for (const e of errors) console.log(`    ${e}`);
    } else console.log(`✓ ${f} — ${n} classes`);
  }
  process.exit(failed ? 1 : 0);
}
