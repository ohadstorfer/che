// Streaming sentence splitter for Pancho's reply (docs/hablar-hld.md §4.5 step 5).
//
// Text deltas go in as they arrive; whole sentences come out, each one ready for
// the rioplatense guard and then TTS. A sentence ends at . ! ? or … (runs like
// "?!" or "..." count once), plus any closing quote or bracket, followed by
// whitespace. So an opening ¿ or ¡ always starts the next sentence with its
// words, abbreviations ("Sr.", "p. ej.") and initials ("J. L. Borges") don't
// cut, and "3.5" has no space to cut at. A run-on is forced out at 200
// characters, at the last space or comma before that.

const ABBREVIATIONS = new Set([
  "sr", "sra", "srta", "dr", "dra", "lic", "ing", "prof", "av", "avda", "etc", "ej", "p", "pág", "aprox",
  "tel", "nro", "núm", "vs", "ud", "uds", "mr", "mrs",
]);

const ENDERS = ".!?…";
const CLOSERS = `"'”’»)]`;
export const MAX_SENTENCE = 200;

/** Index just past the sentence end in `buf`, or -1. Needs the whitespace after it, so a delta can't split "..." or "?!". */
export function findSentenceEnd(buf: string): number {
  for (let i = 0; i < buf.length; i++) {
    if (!ENDERS.includes(buf[i])) continue;
    let j = i;
    while (j + 1 < buf.length && ENDERS.includes(buf[j + 1])) j++;
    while (j + 1 < buf.length && CLOSERS.includes(buf[j + 1])) j++;
    if (j + 1 >= buf.length) return -1; // might still continue
    if (!/\s/.test(buf[j + 1])) {
      i = j;
      continue;
    }
    if (buf[i] === "." && j === i && isAbbreviation(buf.slice(0, i))) {
      i = j;
      continue;
    }
    return j + 1;
  }
  return -1;
}

function isAbbreviation(before: string): boolean {
  const word = before.match(/(\p{L}+)$/u)?.[1];
  if (!word) return false;
  if (word.length === 1 && word === word.toLocaleUpperCase("es")) return true; // an initial
  return ABBREVIATIONS.has(word.toLocaleLowerCase("es"));
}

/** Where to force a cut in an over-long buffer: after the last comma or space before the limit. */
function forcedCut(buf: string): number {
  const head = buf.slice(0, MAX_SENTENCE);
  const comma = head.lastIndexOf(", ");
  if (comma > MAX_SENTENCE / 2) return comma + 1;
  const space = head.lastIndexOf(" ");
  return space > 0 ? space : MAX_SENTENCE;
}

export class SentenceSplitter {
  private buf = "";

  /** Feed a delta; returns the sentences it completed, trimmed, in order. */
  push(delta: string): string[] {
    this.buf += delta;
    const out: string[] = [];
    for (;;) {
      let end = findSentenceEnd(this.buf);
      if (end === -1 && this.buf.length > MAX_SENTENCE) end = forcedCut(this.buf);
      if (end === -1) break;
      const sentence = this.buf.slice(0, end).trim();
      this.buf = this.buf.slice(end).replace(/^\s+/, "");
      if (sentence) out.push(sentence);
    }
    return out;
  }

  /** What's left once the stream is done. */
  flush(): string | null {
    const rest = this.buf.trim();
    this.buf = "";
    return rest || null;
  }
}
