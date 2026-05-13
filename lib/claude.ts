import { supabase } from "./supabase";
import type { GenerateResponse } from "@/types/exercise";

type ErrorBody = { error?: string; raw?: string };

export async function generateExercises(
  prompt: string,
  count: number,
): Promise<GenerateResponse> {
  const { data, error } = await supabase.functions.invoke<GenerateResponse>(
    "generate-exercises",
    { body: { prompt, count } }
  );

  if (error) {
    // supabase.functions.invoke returns the Response object on `error.context`.
    // We have to read the body ourselves to get the JSON error our function sent.
    const body = await readErrorBody(error);
    const msg =
      body?.error ||
      (error instanceof Error ? error.message : "") ||
      "No se pudo generar";
    throw new Error(msg);
  }
  if (!data || !Array.isArray(data.sections)) {
    throw new Error("Respuesta inválida del servidor");
  }
  return data;
}

async function readErrorBody(error: unknown): Promise<ErrorBody | null> {
  const ctx = (error as { context?: unknown }).context;
  if (!ctx) return null;
  if (typeof Response !== "undefined" && ctx instanceof Response) {
    try {
      return (await ctx.clone().json()) as ErrorBody;
    } catch {
      try {
        const text = await ctx.clone().text();
        return text ? { error: text.slice(0, 200) } : null;
      } catch {
        return null;
      }
    }
  }
  if (typeof ctx === "object" && ctx !== null && "error" in ctx) {
    return ctx as ErrorBody;
  }
  return null;
}
