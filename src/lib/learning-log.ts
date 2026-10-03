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

/** The public shape accepted by the MDX component. Kept here so both the
 * editor boundary and the reader use the exact same validation rule. */
export const LearningLogQuestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  hint: z.string().optional(),
});

export const LearningLogQuestionsSchema = z.array(LearningLogQuestionSchema).min(1);
export type LearningLogQuestion = z.infer<typeof LearningLogQuestionSchema>;

/**
 * MDXEditor has historically turned expression props into quoted strings when
 * switching Rich Text/Source. Accept old published content defensively, but
 * never let the string reach a component that expects an array.
 */
export function parseLearningLogQuestions(value: unknown): LearningLogQuestion[] {
  const direct = LearningLogQuestionsSchema.safeParse(value);
  if (direct.success) return direct.data;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    const normalized = LearningLogQuestionsSchema.safeParse(parsed);
    return normalized.success ? normalized.data : [];
  } catch {
    return [];
  }
}

/** Convert the editor's broken quoted JSON prop back to an MDX expression. */
export function normalizeLearningLogQuestionProps(source: string): string {
  return source.replace(/<LearningLog\b[\s\S]*?\/?>(?:<\/LearningLog>)?/g, (tag) =>
    tag.replace(/questions=(?:"|')([\s\S]*?\])(?:"|')(?=\s+(?:[a-zA-Z]|\/?>)|\s*\/?>)/, (attribute, raw: string) => {
      const questions = parseLearningLogQuestions(raw.replace(/&quot;/g, '"'));
      return questions.length ? `questions={${JSON.stringify(questions)}}` : attribute;
    })
  );
}

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
