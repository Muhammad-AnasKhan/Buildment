import { z } from "zod";

export const OpenQuestionConfigSchema = z.object({
  prompt: z.string(),
  minWords: z.number().int().min(0).default(0),
  maxWords: z.number().int().min(1).optional(),
  rubric: z.string().optional(), // mentor-only, never sent to the client
  sampleAnswer: z.string().optional(), // mentor-only unless revealed post-submit
});

export type OpenQuestionConfig = z.infer<typeof OpenQuestionConfigSchema>;

// The projection sanitizeBlockConfig() produces for the client — see
// src/mdx/sanitize.ts and docs/09-security.mdx.
export type SanitizedOpenQuestionConfig = Omit<OpenQuestionConfig, "rubric" | "sampleAnswer">;

export const OpenQuestionPayloadSchema = z.object({
  text: z.string(),
});

export type OpenQuestionPayload = z.infer<typeof OpenQuestionPayloadSchema>;
