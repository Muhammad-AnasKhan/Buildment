import { z } from "zod";

export const LearningLogAnswerSchema = z.object({
  text: z.string(),
  updatedAt: z.string(),
});

export const ChecklistItemStateSchema = z.object({
  checked: z.boolean(),
  updatedAt: z.string(),
});

export const LearningLogDataSchema = z.object({
  version: z.literal(1),
  answers: z.record(z.string(), LearningLogAnswerSchema).default({}),
  checklist: z.record(z.string(), ChecklistItemStateSchema).optional(),
});

export type LearningLogData = z.infer<typeof LearningLogDataSchema>;
export type LearningLogAnswers = Record<string, string>;
export type ChecklistState = Record<string, boolean>;

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

export function learningLogToChecklist(data: LearningLogData): ChecklistState {
  const out: ChecklistState = {};
  if (!data.checklist) return out;
  for (const [id, entry] of Object.entries(data.checklist)) {
    out[id] = entry.checked;
  }
  return out;
}
