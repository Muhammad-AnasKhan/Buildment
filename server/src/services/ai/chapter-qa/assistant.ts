import { z } from "zod";

// Per-course tutor settings. Authors declare them in course.yaml (`assistant:`), the importer
// stores the block on Course.assistant, and the question service reads it back here. The
// manifest schema and the runtime parse share these limits, so a stored block can never
// exceed what validation allowed.

export const ASSISTANT_GUIDANCE_MAX = 1500;
export const ASSISTANT_STARTER_MAX = 90;
export const ASSISTANT_STARTERS_MAX = 4;

export const assistantEfforts = ["low", "medium", "high"] as const;
export type AssistantEffort = (typeof assistantEfforts)[number];

export type CourseAssistant = {
  effort: AssistantEffort;
  guidance?: string;
  starters?: string[];
};

const stored = z.object({
  effort: z.enum(assistantEfforts).catch("low"),
  guidance: z.string().trim().min(1).max(ASSISTANT_GUIDANCE_MAX).optional().catch(undefined),
  starters: z
    .array(z.string().trim().min(3).max(ASSISTANT_STARTER_MAX))
    .max(ASSISTANT_STARTERS_MAX)
    .optional()
    .catch(undefined),
});

/** Read the JSON column. Anything unusable falls back to the default (low effort, no extras). */
export function readCourseAssistant(value: unknown): CourseAssistant {
  const parsed = stored.safeParse(value && typeof value === "object" ? value : {});
  return parsed.success ? parsed.data : { effort: "low" };
}
