// ---------------------------------------------------------------------------
// How a tip is laid out. Tips are written as Markdown prose (`**bold**`,
// `*italic*`) with the odd table of forms as pipe rows, and each one is shaped
// differently: a rule in one line, a rule and its examples, a paradigm. This
// reads the shape so the screen can give each part its own treatment: the
// first sentence as the lead, Spanish with its English as a pair, a whole
// Spanish sentence as an example on its own sticker, and a table as a table.
//
// Pure, so it can be run over every tip in the course (scripts/course/test).
// ---------------------------------------------------------------------------

export type TipSpan = { kind: 'plain' | 'strong' | 'em'; text: string };

export type TipBlock =
  /** The first sentence: what the tip is about. */
  | { kind: 'lead'; spans: TipSpan[] }
  | { kind: 'text'; spans: TipSpan[] }
  /** Spanish sentences given as examples, one per line. */
  | { kind: 'examples'; lines: string[] }
  /** Spanish with its English, written `**es** — *en*`. */
  | { kind: 'pairs'; rows: { es: string; en: string }[] }
  /** `head` is the row that names the columns, when the table has one. */
  | { kind: 'table'; head: string[] | null; rows: string[][] };

/** A lead longer than this is a paragraph, and reads better at body size. */
const LEAD_MAX = 150;

const SENTENCE_END = /[.!?…:]["”)]?$/;
const SENTENCE_START = /^["“(]?[A-ZÁÉÍÓÚÑ¿¡]/;

/** `**bold**` and `*italic*` as spans; everything else as written. */
export function tipSpans(text: string): TipSpan[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part): TipSpan => {
      if (part.startsWith('**') && part.length > 4) return { kind: 'strong', text: part.slice(2, -2) };
      if (part.startsWith('*') && part.length > 2) return { kind: 'em', text: part.slice(1, -1) };
      return { kind: 'plain', text: part };
    });
}

/** The cells of a pipe row: `| yo | **soy** |` → ['yo', '**soy**']. */
const tableCells = (line: string) => line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/**
 * A table of forms. A first row names the columns when its first cell is
 * empty, or when it is the only row with nothing marked in it. Four columns with no such row, and labels in the third, are two
 * pairs written side by side to save paper (`| yo | estoy | vos | estás |`):
 * on a phone they read better as one pair per row.
 */
function table(lines: string[]): TipBlock {
  let rows = lines.map(tableCells);
  const marked = (r: string[]) => r.some((c) => c.includes('**'));
  const pairs = rows[0][0] !== '' && rows.every((r) => r.length === 4 && !r[2].includes('**'));
  if (pairs) {
    rows = rows.flatMap((r) => [r.slice(0, 2), r.slice(2)]).filter((r) => r.some(Boolean));
    return { kind: 'table', head: null, rows };
  }
  const head =
    rows.length > 1 && (rows[0][0] === '' || (rows.length > 2 && !marked(rows[0]) && rows.slice(1).every(marked))) ? rows[0] : null;
  return { kind: 'table', head, rows: head ? rows.slice(1) : rows };
}

/** Where the first sentence of some plain text ends, or -1. `more` says something follows the text. */
function firstSentenceEnd(text: string, more: boolean) {
  const inside = /[.!?…]["”)]?\s+(?=["“(]?[A-ZÁÉÍÓÚÑ¿¡])/.exec(text);
  if (inside) return inside.index + inside[0].length;
  return more && /[.!?…]["”)]?\s+$/.test(text) ? text.length : -1;
}

const text = (spans: TipSpan[]) => spans.map((s) => s.text).join('');

/**
 * A paragraph, taken apart where it has a shape of its own:
 *   · its first sentence, which says what the tip is about;
 *   · `**Spanish** — *English*` ending a clause, as a pair;
 *   · an italic Spanish sentence standing on its own, as an example.
 * Only the paragraph that opens the tip has a first sentence to set apart.
 * The prose between them stays a paragraph. *¿Sos vos?* in the middle of an
 * English sentence stays where it is.
 */
function prose(block: string, opens: boolean): TipBlock[] {
  const spans = tipSpans(block.replace(/\s*\n\s*/g, ' '));
  const out: TipBlock[] = [];
  let line: TipSpan[] = [];
  /** The first sentence has been set apart, or something else already opens the tip. */
  let opened = !opens;
  const flush = () => {
    if (text(line).trim()) {
      // Trim the paragraph's own edges, not the spaces between its spans.
      const first = line[0];
      const last = line[line.length - 1];
      if (first.kind === 'plain') first.text = first.text.trimStart();
      if (last.kind === 'plain') last.text = last.text.trimEnd();
      out.push({ kind: 'text', spans: line.filter((s) => s.text) });
      opened = true;
    }
    line = [];
  };
  /** The prose so far has ended, or introduces what comes next with a colon. */
  const ended = () => {
    const before = text(line).trim();
    return before === '' || SENTENCE_END.test(before) || before.endsWith(';');
  };

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const next = spans[i + 1];

    // **Spanish** — *English*, closing its clause.
    const gloss = spans[i + 2];
    const after = spans[i + 3];
    if (
      span.kind === 'strong' &&
      next?.kind === 'plain' &&
      /^\s+[—–]\s+$/.test(next.text) &&
      gloss?.kind === 'em' &&
      (!after || (after.kind === 'plain' && /^\s*([;.]|$)/.test(after.text))) &&
      ended()
    ) {
      flush();
      const last = out[out.length - 1];
      const pair = { es: span.text, en: gloss.text };
      if (last?.kind === 'pairs') last.rows.push(pair);
      else out.push({ kind: 'pairs', rows: [pair] });
      opened = true;
      if (after) after.text = after.text.replace(/^\s*[;.]?\s*/, '');
      i += 2;
      continue;
    }

    // Spanish with no gloss, in a run of pairs: `**te paso el link**;`.
    const run = out[out.length - 1];
    if (
      span.kind === 'strong' &&
      run?.kind === 'pairs' &&
      text(line).trim() === '' &&
      (!next || (next.kind === 'plain' && /^\s*([;.]|$)/.test(next.text)))
    ) {
      line = [];
      run.rows.push({ es: span.text, en: '' });
      if (next) next.text = next.text.replace(/^\s*[;.]?\s*/, '');
      continue;
    }

    // A Spanish sentence on its own.
    if (
      span.kind === 'em' &&
      /^[¿¡"“]?[A-ZÁÉÍÓÚÑ]/.test(span.text) &&
      /[.?!…]["”]?$/.test(span.text) &&
      /\s/.test(span.text.trim()) &&
      (!next || (next.kind === 'plain' && (next.text.trim() === '' || SENTENCE_START.test(next.text.trim())))) &&
      ended()
    ) {
      flush();
      const last = out[out.length - 1];
      if (last?.kind === 'examples') last.lines.push(span.text);
      else out.push({ kind: 'examples', lines: [span.text] });
      opened = true;
      continue;
    }

    if (span.kind === 'plain' && !opened) {
      const cut = firstSentenceEnd(span.text, !!next);
      if (cut >= 0) {
        line.push({ kind: 'plain', text: span.text.slice(0, cut) });
        flush();
        line.push({ kind: 'plain', text: span.text.slice(cut) });
        continue;
      }
    }
    line.push(span);
  }
  flush();
  return out;
}

export function tipLayout(body: string): TipBlock[] {
  // Runs of pipe rows are tables and the rest is prose, whether or not a blank
  // line was left between them: a table glued to its paragraph is still a table.
  const groups: { rows: boolean; lines: string[] }[] = [];
  for (const paragraph of body.split(/\n{2,}/)) {
    let last: (typeof groups)[number] | undefined;
    for (const line of paragraph.split(/\n/).map((l) => l.trim()).filter(Boolean)) {
      const rows = line.startsWith('|');
      if (!last || last.rows !== rows) groups.push((last = { rows, lines: [] }));
      last.lines.push(line);
    }
  }
  const blocks = groups.flatMap((g, i) => (g.rows ? [table(g.lines)] : prose(g.lines.join(' '), i === 0)));
  const first = blocks[0];
  if (first?.kind === 'text' && text(first.spans).length <= LEAD_MAX) {
    blocks[0] = { kind: 'lead', spans: first.spans };
  }
  return blocks;
}
