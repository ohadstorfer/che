// The Claude calls of the Hablar chat that are not the streamed reply: one
// structured-output call (feedback, hint, translate, summary) and one plain
// rewrite (the guard). The system prompt is always a cached block.

import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";

export { Anthropic };
export const MODEL = "claude-sonnet-5";

export type CallUsage = { input_tokens?: number | null; output_tokens?: number | null; cache_read_input_tokens?: number | null };

/** A cached system block. */
export const cachedSystem = (text: string) => [{ type: "text" as const, text, cache_control: { type: "ephemeral" as const } }];

/** One JSON object that matches `schema`, or null (refusal, cut off, or unparseable). */
export async function structured<T>(
  client: Anthropic,
  opts: { system: string; schema: Record<string, unknown>; input: string; maxTokens?: number },
): Promise<{ value: T | null; usage: CallUsage | undefined; ms: number }> {
  const t0 = Date.now();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2000,
    // deno-lint-ignore no-explicit-any
    ...({ output_config: { effort: "low", format: { type: "json_schema", schema: opts.schema } } } as any),
    system: cachedSystem(opts.system),
    messages: [{ role: "user", content: opts.input }],
  });
  const ms = Date.now() - t0;
  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    return { value: null, usage: response.usage, ms };
  }
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  try {
    return { value: JSON.parse(text) as T, usage: response.usage, ms };
  } catch {
    return { value: null, usage: response.usage, ms };
  }
}

/**
 * `structured`, streamed and without thinking, for the one call that sits in
 * front of the learner: `onText` sees the JSON as it grows, so a field can be
 * shown the moment it is complete. Left unset, thinking on this model runs
 * adaptive, and the wait before the first character is what the learner feels.
 */
export async function streamedStructured<T>(
  client: Anthropic,
  opts: { system: string; schema: Record<string, unknown>; input: string; maxTokens?: number; onText: (soFar: string) => void },
): Promise<{ value: T | null; usage: CallUsage | undefined; ms: number }> {
  const t0 = Date.now();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2000,
    // deno-lint-ignore no-explicit-any
    ...({ thinking: { type: "disabled" }, output_config: { format: { type: "json_schema", schema: opts.schema } } } as any),
    system: cachedSystem(opts.system),
    messages: [{ role: "user", content: opts.input }],
  });
  let text = "";
  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      text += ev.delta.text;
      opts.onText(text);
    }
  }
  const response = await stream.finalMessage();
  const ms = Date.now() - t0;
  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    return { value: null, usage: response.usage, ms };
  }
  try {
    return { value: JSON.parse(text) as T, usage: response.usage, ms };
  } catch {
    return { value: null, usage: response.usage, ms };
  }
}

/**
 * The verdict of a feedback object still being written: whether the line has
 * an error and its corrected form, as soon as both are complete in `soFar`.
 * A line with no error needs its `verdict` instead (a tick, a note, or
 * nothing to say about a garbled line). Null until then.
 */
export function earlyVerdict(
  soFar: string,
  line: string,
): { has_error: boolean; verdict: "correct" | "error" | "note" | "unclear"; corrected: string } | null {
  const flag = /"has_error"\s*:\s*(true|false)/.exec(soFar);
  if (!flag) return null;
  if (flag[1] === "false") {
    const kind = /"verdict"\s*:\s*"(correct|note|unclear)"/.exec(soFar);
    return kind ? { has_error: false, verdict: kind[1] as "correct" | "note" | "unclear", corrected: line } : null;
  }
  // A complete JSON string: the closing quote is present and not escaped.
  const field = /"corrected"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(soFar);
  if (!field) return null;
  try {
    return { has_error: true, verdict: "error", corrected: JSON.parse(field[1]) as string };
  } catch {
    return null;
  }
}

/** Plain text, short, no thinking — the guard's rewrite. */
export async function plain(
  client: Anthropic,
  opts: { system: string; input: string; maxTokens?: number },
): Promise<{ text: string; usage: CallUsage | undefined; ms: number }> {
  const t0 = Date.now();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 300,
    // deno-lint-ignore no-explicit-any
    ...({ thinking: { type: "disabled" } } as any),
    system: cachedSystem(opts.system),
    messages: [{ role: "user", content: opts.input }],
  });
  const text = response.stop_reason === "refusal"
    ? ""
    : response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
  return { text, usage: response.usage, ms: Date.now() - t0 };
}
