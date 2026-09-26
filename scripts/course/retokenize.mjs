// Re-splits stored sentences with the current tokenizer, for when the tokenizer
// or the lexicon changed after they were written: "la plata" once resolved to
// the city La Plata, and "sí, claro" never matched its form. Only sentences
// whose Spanish matches the pattern are touched; a token that keeps its surface
// keeps its gloss, and a token that splits in two passes its gloss to the piece
// that carries the meaning (the longest word).
//
//   npm run course:retokenize -- '<regex over es, case-insensitive>' [--dry-run]
import { queryLinked } from './lib/db.mjs';
import { jsonb, q } from './lib/sql.mjs';
import { availableForms } from './lib/outline.mjs';
import { buildIndex, tokenize } from './lib/tokenize.mjs';
import { loadOutlineFromDb } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const pattern = args.find((a) => !a.startsWith('--'));
if (!pattern) {
  console.error("usage: course:retokenize -- '<regex>' [--dry-run]");
  process.exit(1);
}
const dryRun = args.includes('--dry-run');

const outline = loadOutlineFromDb();
const unitById = new Map(outline.units.map((u) => [u.id, u]));
const everything = buildIndex(outline.forms);
const indexes = new Map();
const indexFor = (unit) => {
  if (!indexes.has(unit.id)) indexes.set(unit.id, buildIndex(availableForms(outline, unit.course_order)));
  return indexes.get(unit.id);
};

const rows = queryLinked(`select id, unit_id, es, tokens from public.sentences where es ~* ${q(pattern)}`);
const writes = [];
for (const s of rows) {
  const unit = unitById.get(s.unit_id);
  if (!unit) continue;
  const old = s.tokens ?? [];
  const tokens = tokenize(s.es, indexFor(unit)).map((t) => {
    // A word taught later still links to its form, as when the sentence was written.
    const forms = t.forms.length ? t.forms : (tokenize(t.core, everything)[0]?.forms ?? []);
    return { surface: t.surface, form_ids: forms.map((f) => f.id) };
  });
  // Carry glosses over by word position: a token over the same words keeps its
  // gloss; an old token now split in several gives its gloss to the longest
  // piece; a new token that merges old ones gets none (its dictionary gloss shows).
  const spans = (list) => {
    let at = 0;
    return list.map((t) => {
      const n = t.surface.split(' ').length;
      const span = [at, at + n];
      at += n;
      return span;
    });
  };
  const oldSpans = spans(old);
  const newSpans = spans(tokens);
  old.forEach((o, k) => {
    if (!o.gloss) return;
    const [a, b] = oldSpans[k];
    const inside = tokens.filter((_, m) => newSpans[m][0] >= a && newSpans[m][1] <= b);
    if (!inside.length) return;
    const heir = inside.reduce((x, y) => (y.surface.length > x.surface.length ? y : x));
    heir.gloss ??= o.gloss;
  });
  const same = JSON.stringify(old.map((t) => [t.surface, t.form_ids])) === JSON.stringify(tokens.map((t) => [t.surface, t.form_ids]));
  if (same) continue;
  console.log(`${s.es}\n  ${old.map((t) => t.surface).join(' | ')}\n  ${tokens.map((t) => t.surface).join(' | ')}`);
  writes.push(`update public.sentences set tokens = ${jsonb(tokens)} where id = ${q(s.id)};`);
}
console.log(`\n${writes.length} of ${rows.length} sentence(s) re-split`);
if (dryRun) {
  console.log('--dry-run: nothing written');
  process.exit(0);
}
for (let i = 0; i < writes.length; i += 500) queryLinked(writes.slice(i, i + 500).join('\n'));
console.log('written');
