import type { SessionRecord } from "@/types/exercise";

const MONTHS_ES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

export function formatMateDate(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day} · ${month} · ${year}`;
}

export const FALLBACK_SUGGESTIONS = [
  "subjuntivo presente",
  "condicionales reales",
  "voseo · imperativo",
];

export function topSuggestions(
  sessions: SessionRecord[],
  fallback: string[] = FALLBACK_SUGGESTIONS,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sessions) {
    const t = (s.topic || s.prompt || "").trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length === 3) break;
  }
  if (out.length < 3) {
    for (const f of fallback) {
      const t = f.trim().toLowerCase();
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
      if (out.length === 3) break;
    }
  }
  return out.slice(0, 3);
}
