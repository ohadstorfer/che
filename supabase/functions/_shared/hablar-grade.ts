// Grading one learner line for the summary: one structured call with the
// cached grading prompt, cleaned and written to the turn's `feedback`.
//
// hablar-reply grades each line in the background while Pancho answers it, so
// hablar-end only has the lines left that weren't graded yet (a line whose
// grading failed, or a chat from an older build) and the summary to write.

import { claudeUsage, type Session, type Usage } from "./hablar.ts";
import { cleanFeedback, FEEDBACK_SCHEMA, FEEDBACK_SYSTEM, feedbackInput, type Feedback } from "./hablar-prompt.ts";
import { Anthropic, MODEL, structured } from "./hablar-claude.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

/** The words a unit chat's scene taught: never graded as mistakes. */
export const scenePhrases = (session: Session): string[] =>
  ((session as { scenario?: { key_phrases?: { es: string }[] } }).scenario?.key_phrases ?? []).map((p) => p.es);

/**
 * Grades her line and stores the result. Returns the cleaned feedback (null
 * when the call gave nothing usable); the usage row goes into `usage`. Throws
 * on a failed call, so the caller can report it.
 */
export async function gradeLine(opts: {
  client: Anthropic;
  db: SupabaseClient;
  session: Session;
  turn: { id: string; text: string; meta?: Record<string, unknown> | null };
  /** What Pancho said just before her line. */
  tomasBefore: string | null;
  phrases: string[];
  usage: Usage[];
}): Promise<Feedback | null> {
  const { client, db, session, turn } = opts;
  const meta = (turn.meta ?? {}) as { lang?: string; unsure?: unknown; plain?: unknown };
  const english = meta.lang === "en";
  const unsure = Array.isArray(meta.unsure) ? meta.unsure.filter((w): w is string => typeof w === "string") : [];
  const plain = typeof meta.plain === "string" && !english ? meta.plain : undefined;
  const { value, usage: u, ms } = await structured<Feedback>(client, {
    system: FEEDBACK_SYSTEM,
    schema: FEEDBACK_SCHEMA as unknown as Record<string, unknown>,
    input: feedbackInput({
      level: session.level,
      tomasBefore: opts.tomasBefore,
      line: turn.text,
      english,
      unsure,
      plain,
      phrases: opts.phrases,
    }),
  });
  opts.usage.push(claudeUsage({ conversation_id: session.id, turn_id: turn.id, model: MODEL, stage: "feedback", ms }, u));
  if (!value) return null;
  const feedback = cleanFeedback(value, turn.text, english, plain, unsure);
  // Only onto the words it graded: a line re-recorded meanwhile keeps no stale grade.
  const { error } = await db.from("conversation_turns").update({ feedback }).eq("id", turn.id).eq("text", turn.text);
  if (error) console.error("feedback save failed", error.message);
  return feedback;
}
