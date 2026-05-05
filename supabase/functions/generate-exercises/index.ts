// Edge function: POST /functions/v1/generate-exercises
// Auth: verify_jwt is false at the gateway (so the OPTIONS preflight passes
// without CORS issues). The user's access token is validated manually below.
// Calls Claude with tool calling so the response is structured by construction.

import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { SYSTEM_PROMPT, userPrompt } from "../_shared/prompt.ts";
import { normalizeGenerateResponse } from "../_shared/parse.ts";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 8000;
const TOOL_NAME = "submit_exercise_set";

const TOOL_INPUT_SCHEMA = {
  type: "object",
  required: ["topic", "sections"],
  properties: {
    topic: { type: "string" },
    sections: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        required: ["title", "description", "exercises"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          exercises: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              required: [
                "id",
                "type",
                "section_title",
                "section_description",
                "instruction",
                "prompt",
                "correct_answer",
                "acceptable_answers",
                "explanation",
                "english_idiomatic",
                "hebrew_idiomatic",
              ],
              properties: {
                id: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "fill_blank",
                    "transform",
                    "identify_type",
                    "free_production",
                  ],
                },
                section_title: { type: "string" },
                section_description: { type: "string" },
                instruction: { type: "string" },
                prompt: { type: "string" },
                correct_answer: { type: "string" },
                acceptable_answers: {
                  type: "array",
                  items: { type: "string" },
                },
                explanation: { type: "string" },
                english_idiomatic: { type: "string" },
                hebrew_idiomatic: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) {
    return json({ error: "Falta autenticación" }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return json({ error: "Supabase no está configurado" }, { status: 500 });
  }

  const supabaseClient = createClient(supabaseUrl, anonKey);
  const { data: userRes, error: userErr } = await supabaseClient.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return json({ error: "Sesión inválida" }, { status: 401 });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json(
      { error: "ANTHROPIC_API_KEY no está configurado en la edge function" },
      { status: 500 },
    );
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return json({ error: "Falta el prompt" }, { status: 400 });
  }
  if (prompt.length > 4000) {
    return json({ error: "El prompt es demasiado largo" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    // Streaming is required at high max_tokens to avoid HTTP timeouts.
    // Prompt caching: system + tool schema are identical across requests, so we
    // mark them as ephemeral cache breakpoints (5-min TTL) to cut input-token
    // latency and cost on repeated calls.
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt(prompt) }],
      tools: [
        {
          name: TOOL_NAME,
          description:
            "Devolvé el set de ejercicios estructurado. Es la única forma válida de responder.",
          input_schema: TOOL_INPUT_SCHEMA,
          cache_control: { type: "ephemeral" },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    const resp = await stream.finalMessage();

    const toolBlock = resp.content.find(
      (b: { type: string }) => b.type === "tool_use",
    ) as { type: "tool_use"; input: unknown } | undefined;

    if (!toolBlock) {
      console.error(
        "[generate-exercises] no tool_use block in response:",
        JSON.stringify(resp.content).slice(0, 500),
      );
      return json(
        { error: "El modelo no devolvió la estructura esperada" },
        { status: 422 },
      );
    }

    const normalized = normalizeGenerateResponse(toolBlock.input);
    if (!normalized) {
      console.error(
        "[generate-exercises] tool input failed normalization:",
        JSON.stringify(toolBlock.input).slice(0, 500),
      );
      return json(
        { error: "El modelo devolvió una estructura inválida" },
        { status: 422 },
      );
    }

    return json(normalized);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error desconocido";
    console.error("[generate-exercises] Claude error:", msg);
    return json(
      { error: `Error llamando a Claude: ${msg}` },
      { status: 502 },
    );
  }
});
