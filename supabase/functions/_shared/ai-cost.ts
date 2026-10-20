// What the AI cost, estimated from hablar_usage (one row per Claude or
// ElevenLabs call, written by the hablar functions). cost-alert sums a day
// with it; the prices are list prices, so the bills are the truth and this is
// the alarm.
//
// Prices in US$. Claude per million tokens (platform.claude.com pricing):
// cache reads are 0.1× input on Haiku, cache writes (5-minute) 1.25× input.
// ElevenLabs: Flash v2.5 TTS on the API plan, $0.05 per 1,000 characters
// (docs/monetization-hld.md 5.4.2); Scribe STT ≈ $0.40 an hour — check both
// against the ElevenLabs plan in use.

export interface UsageTotal {
  provider: string;
  model: string | null;
  stage: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  audio_seconds: number;
  tts_chars: number;
}

interface TokenPrice {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const CLAUDE_PRICES: Record<string, TokenPrice> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};
/** A model not listed is priced as the dearest one, and named in the alert. */
const UNKNOWN_CLAUDE = CLAUDE_PRICES["claude-opus-5-5"];

export const TTS_PER_CHAR = 0.05 / 1000;
export const STT_PER_SECOND = 0.4 / 3600;

export interface CostLine {
  provider: string;
  model: string | null;
  stage: string;
  calls: number;
  usd: number;
}

export interface CostEstimate {
  usd: number;
  lines: CostLine[];
  /** Claude models with no price here (priced as Opus). */
  unknownModels: string[];
}

const n = (v: unknown) => Number(v ?? 0) || 0;

export function lineCost(row: UsageTotal): { usd: number; unknown: boolean } {
  if (row.provider === "anthropic") {
    const price = (row.model && CLAUDE_PRICES[row.model]) || null;
    const p = price ?? UNKNOWN_CLAUDE;
    const usd = (n(row.input_tokens) * p.input + n(row.output_tokens) * p.output + n(row.cache_read_tokens) * p.cacheRead +
      n(row.cache_write_tokens) * p.cacheWrite) / 1e6;
    return { usd, unknown: !price };
  }
  if (row.provider === "elevenlabs") {
    return { usd: n(row.tts_chars) * TTS_PER_CHAR + n(row.audio_seconds) * STT_PER_SECOND, unknown: false };
  }
  return { usd: 0, unknown: false };
}

export function estimateCost(rows: UsageTotal[]): CostEstimate {
  const lines: CostLine[] = [];
  const unknown = new Set<string>();
  let usd = 0;
  for (const row of rows) {
    const c = lineCost(row);
    if (c.unknown) unknown.add(row.model ?? "(no model)");
    usd += c.usd;
    lines.push({ provider: row.provider, model: row.model, stage: row.stage, calls: n(row.calls), usd: c.usd });
  }
  lines.sort((a, b) => b.usd - a.usd);
  return { usd, lines, unknownModels: [...unknown] };
}

export const dollars = (usd: number) => `US$${usd.toFixed(2)}`;
