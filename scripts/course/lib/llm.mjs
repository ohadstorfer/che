// The two model calls of the pipeline, with the answers' shapes enforced by
// structured outputs: the generator returns candidates, the judge returns a
// score card per sentence. Both check for a refusal before reading anything.
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { GENERATOR_EFFORT, GENERATOR_MODEL, JUDGE_EFFORT, JUDGE_MODEL } from '../config.mjs';

let client = null;
function anthropic() {
  if (client) return client;
  // The key lives in the project's .env (see .env.example) unless already set.
  if (!process.env.ANTHROPIC_API_KEY) {
    try {
      process.loadEnvFile(new URL('../../../.env', import.meta.url));
    } catch {
      /* no .env: the SDK reports the missing key */
    }
  }
  client = new Anthropic();
  return client;
}

const Candidates = z.object({
  sentences: z.array(
    z.object({
      target: z.string().describe('the target word exactly as listed'),
      role: z.enum(['intro', 'drill']),
      es: z.string(),
      en: z.string(),
      en_alt: z.array(z.string()),
      difficulty: z.number().int().min(1).max(4),
      loose: z.array(z.string()).describe('Spanish words the English renders idiomatically rather than word for word; usually empty'),
    }),
  ),
});

const Scores = z.object({
  scores: z.array(
    z.object({
      id: z.number().int(),
      naturalness: z.number().int().min(1).max(5),
      grammaticality: z.number().int().min(1).max(5),
      coherence: z.number().int().min(1).max(5),
      logic: z.number().int().min(1).max(5),
      porteno: z.boolean(),
      register_ok: z.boolean(),
      english_natural: z.boolean(),
      issue: z.string(),
      rewrite: z.string(),
    }),
  ),
});

async function call({ model, effort, system, user, schema }) {
  const response = await anthropic().messages.parse({
    model,
    max_tokens: 32000,
    output_config: { effort, format: zodOutputFormat(schema) },
    system,
    messages: [{ role: 'user', content: user }],
  });
  if (response.stop_reason === 'refusal') throw new Error(`the model declined: ${response.stop_details?.category ?? 'no category'}`);
  if (response.stop_reason === 'max_tokens') throw new Error('the answer was cut off at max_tokens');
  if (!response.parsed_output) throw new Error('the answer did not match the schema');
  return { output: response.parsed_output, usage: response.usage };
}

export const draftSentences = ({ system, user }) =>
  call({ model: GENERATOR_MODEL, effort: GENERATOR_EFFORT, system, user, schema: Candidates }).then((r) => ({
    candidates: r.output.sentences,
    usage: r.usage,
  }));

export const judgeSentences = ({ system, user }) =>
  call({ model: JUDGE_MODEL, effort: JUDGE_EFFORT, system, user, schema: Scores }).then((r) => ({
    scores: r.output.scores,
    usage: r.usage,
  }));
