import { z } from "zod";

// Server-only config for a <Quiz> block — never sent to the client as-is.
// See sanitizeBlockConfig in src/mdx/sanitize.ts for the client projection.
export const QuizOptionSchema = z.object({
  id: z.string(),
  // YAML treats unquoted numbers/booleans as scalars. Keep option IDs and grading keys unchanged.
  label: z.preprocess(value => typeof value === "number" || typeof value === "boolean" ? String(value) : value, z.string()),
});

export const QuizConfigSchema = z.object({
  quizType: z.enum(["single", "multiple", "true-false"]).default("single"),
  prompt: z.string(),
  options: z.array(QuizOptionSchema).min(2),
  correctOptionIds: z.array(z.string()).min(1),
  explanation: z.string().optional(),
  allowRetry: z.boolean().default(true),
});

export type QuizConfig = z.infer<typeof QuizConfigSchema>;

/** Compare legacy imported labels by their display value, preserving malformed configs for validation. */
export function normalizeQuizConfig(config: unknown): unknown {
  const parsed = QuizConfigSchema.safeParse(config);
  return parsed.success ? parsed.data : config;
}

// The projection sanitizeBlockConfig() produces for the client — see
// src/mdx/sanitize.ts and docs/09-security.mdx.
export type SanitizedQuizConfig = Omit<QuizConfig, "correctOptionIds">;

export const QuizPayloadSchema = z.object({
  selected: z.array(z.string()),
});

export type QuizPayload = z.infer<typeof QuizPayloadSchema>;
