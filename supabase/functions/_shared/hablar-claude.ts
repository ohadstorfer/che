// The Claude calls of the Hablar chat that are not the streamed reply: one
// structured-output call (end-of-chat grading, hint, translate, summary) and one plain
// rewrite (the guard). The system prompt is always a cached block.

import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";

export { Anthropic };
// Haiku 5.5 thinks by default (effort "medium"); every call here asks for "low",
// and the ones that sit in front of the learner turn thinking off. It also
// refuses temperature/top_p and an assistant prefill, so none is sent.
export const MODEL = "claude-haiku-5-5";
const LOW_EFFORT = { effort: "low" };

export type CallUsage = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

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
    ...({ output_config: { ...LOW_EFFORT, format: { type: "json_schema", schema: opts.schema } } } as any),
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

/** The same words, whatever the accents, capitals and punctuation — all of which the transcript decides, not her. */
export function sameWords(a: string, b: string): boolean {
  const key = (t: string) =>
    t.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return key(a) === key(b);
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
    ...({ thinking: { type: "disabled" }, output_config: LOW_EFFORT } as any),
    system: cachedSystem(opts.system),
    messages: [{ role: "user", content: opts.input }],
  });
  const text = response.stop_reason === "refusal"
    ? ""
    : response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
  return { text, usage: response.usage, ms: Date.now() - t0 };
}
