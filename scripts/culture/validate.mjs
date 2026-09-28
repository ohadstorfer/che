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
          else
            for (const it of p.items)
              if (/\b(1[5-9]\d\d|20\d\d)\b/.test(it) || /\d{1,2}(:\d\d)?\s?[ap]\.?\s?m\.?\b/i.test(it))
                err(pat, `order item gives away the answer (year/time): ${it}`);
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
    // Glossary: Spanish that shows up bold in the reading but isn't practiced. Tappable, never tested.
    for (const g of c.glossary ?? []) {
      if (!str(g.es) || !str(g.en)) err(at, `glossary entry needs es and en: ${JSON.stringify(g)}`);
    }
  }
  return errors;
}

// Warnings: things that make the class worse without breaking it. The word review at
// the end builds "pick the meaning" from the class's own glosses, so two glosses that
// say the same thing give a question with two right answers.
const fold = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¡!¿?….,;:()"'“”—–]/g, ' ');
const STOP = new Set(
  'a an the of to in on at for and or with from as by is it its be you your someone something lit one ones very really just not no made slang said thing person short'.split(' '),
);
const contentWords = (s) => new Set(fold(s).split(/[\s/]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const ARTICLE = /^(el|la|los|las|un|una|unos|unas)\s+/;

/** Where a vocabulary word may be taught: anything the learner reads before answering, never an explain. */
function taughtText(pages) {
  const parts = [];
  for (const p of pages) {
    parts.push(p.title, p.body, p.fun_fact, p.word?.es, p.scenario, p.prompt, p.statement, p.text);
    for (const o of p.options ?? []) parts.push(o);
    for (const it of p.items ?? []) parts.push(it);
    for (const pr of p.pairs ?? []) parts.push(...pr);
  }
  return fold(parts.filter(Boolean).join(' ')).replace(/\*/g, '').replace(/\s+/g, ' ');
}

/** True if a form of the word (or a close inflection of it) shows up in the text. */
function appears(es, text) {
  return es.split('/').some((form) => {
    const f = fold(form).replace(/\*/g, '').trim().replace(ARTICLE, '').replace(/\s+/g, ' ');
    if (!f) return false;
    if (text.includes(f)) return true;
    // Allow a changed ending (tomar → tomás, extrañar → extraña): match on the stem.
    const stem = f.length > 5 ? f.slice(0, -2) : null;
    return stem ? text.includes(stem) : false;
  });
}

export function lint(doc) {
  const warnings = [];
  for (const c of doc?.classes ?? []) {
    const at = `class ${c.slug}`;
    const text = taughtText(c.pages ?? []);
    const vocab = c.vocabulary ?? [];
    for (const v of vocab) {
      if (!str(v.es) || !str(v.en)) continue;
      if (!appears(v.es, text)) warnings.push(`${at}: vocabulary "${v.es}" never appears in the pages (explains don't count)`);
      const head = fold(v.es).replace(ARTICLE, '').replace(/\s+/g, ' ').trim();
      if (head.length > 3 && ` ${fold(v.en).replace(/\s+/g, ' ')} `.includes(` ${head} `))
        warnings.push(`${at}: gloss of "${v.es}" contains the word itself ("${v.en}")`);
    }
    for (let i = 0; i < vocab.length; i++)
      for (let j = i + 1; j < vocab.length; j++) {
        const a = contentWords(vocab[i].en ?? '');
        const b = contentWords(vocab[j].en ?? '');
        const shared = [...b].filter((w) => a.has(w));
        // Two glosses collide when every content word of the shorter one is also in the other.
        const small = Math.min(a.size, b.size);
        if (small > 0 && shared.length === small)
          warnings.push(`${at}: glosses of "${vocab[i].es}" and "${vocab[j].es}" share "${shared.join(', ')}"`);
      }
  }
  return warnings;
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
    for (const w of lint(doc)) console.log(`    ⚠ ${w}`);
  }
  process.exit(failed ? 1 : 0);
}
