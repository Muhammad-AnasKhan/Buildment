import { z } from "zod";

export const LearningLogAnswerSchema = z.object({
  text: z.string(),
  updatedAt: z.string(),
});

export const LearningLogDataSchema = z.object({
  version: z.literal(1),
  answers: z.record(z.string(), LearningLogAnswerSchema),
});

export type LearningLogData = z.infer<typeof LearningLogDataSchema>;
export type LearningLogAnswers = Record<string, string>;

export function parseLearningLog(raw: unknown): LearningLogData {
  const parsed = LearningLogDataSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return { version: 1, answers: {} };
}

export function learningLogToAnswers(data: LearningLogData): LearningLogAnswers {
  const out: LearningLogAnswers = {};
  for (const [id, entry] of Object.entries(data.answers)) {
    out[id] = entry.text;
  }
  return out;
}
