import { z } from "zod";

// AI_INTERVIEW: a text mock interview with an AI interviewer, run on the
// learner's own OpenRouter key. The rubric is server-only (see
// utils/sanitize-block-config.ts) and is never sent to the client or copied into
// a session. Author format: the ```aiinterview fence, see docs/12-ai-interview.mdx.

export const AI_INTERVIEW_FOCUS_AREAS = [
  "ownership",
  "impact",
  "five-whys",
  "resume",
  "best-technical",
  "storytelling",
  "case-study",
  "strengths-weaknesses",
] as const;

export type AiInterviewFocus = (typeof AI_INTERVIEW_FOCUS_AREAS)[number];

export const AI_INTERVIEW_FOCUS_LABELS: Record<AiInterviewFocus, string> = {
  ownership: "Ownership",
  impact: "Impact",
  "five-whys": "Five whys",
  resume: "Resume walk-through",
  "best-technical": "Best technical work",
  storytelling: "Storytelling",
  "case-study": "Case study",
  "strengths-weaknesses": "Strengths and weaknesses",
};

export const AI_INTERVIEW_CONTEXT_MODES = ["resume", "project", "none"] as const;
export type AiInterviewContextMode = (typeof AI_INTERVIEW_CONTEXT_MODES)[number];

/** Caps shared by the API, the prompts and the UI so they cannot drift apart. */
export const AI_INTERVIEW_LIMITS = {
  answerMaxChars: 2000,
  contextMaxChars: 6000,
  contextMinChars: 40,
  defaultMaxTurns: 10,
  maxTurnsCeiling: 20,
  defaultWhyDepth: 5,
  whyDepthCeiling: 8,
  rubricMaxChars: 4000,
} as const;

export const AiInterviewFocusSchema = z.enum(AI_INTERVIEW_FOCUS_AREAS);

export const AiInterviewConfigSchema = z.object({
  title: z.string().trim().min(1).max(120),
  /** The first question, written by the author. Shown without calling the model. */
  opening: z.string().trim().min(1).max(600),
  focus: z
    .array(AiInterviewFocusSchema)
    .min(1)
    .max(AI_INTERVIEW_FOCUS_AREAS.length * 2)
    .transform((areas) => [...new Set(areas)])
    .default(["ownership", "impact", "five-whys"]),
  /** What the learner pastes before starting: a resume, a project write-up, or nothing. */
  context: z.enum(AI_INTERVIEW_CONTEXT_MODES).default("none"),
  /** Answers the learner can give before the interview must be finished. */
  maxTurns: z.number().int().min(1).max(AI_INTERVIEW_LIMITS.maxTurnsCeiling).default(AI_INTERVIEW_LIMITS.defaultMaxTurns),
  /** Follow-up "why" questions on one thread before moving to the next focus area. */
  whyDepth: z.number().int().min(1).max(AI_INTERVIEW_LIMITS.whyDepthCeiling).default(AI_INTERVIEW_LIMITS.defaultWhyDepth),
  /** What a strong interview shows. Server-only. */
  rubric: z.string().trim().max(AI_INTERVIEW_LIMITS.rubricMaxChars).optional(),
});

export type AiInterviewConfig = z.infer<typeof AiInterviewConfigSchema>;

/** What the client receives: everything except the rubric. */
export type SanitizedAiInterviewConfig = Omit<AiInterviewConfig, "rubric">;

/** The ```aiinterview fence: the config plus the block-level `required` flag. Unknown keys are errors. */
export const AiInterviewFenceSchema = z.strictObject({
  ...AiInterviewConfigSchema.shape,
  required: z.boolean().optional(),
});

// ---- Sessions ----------------------------------------------------------------

export type AiInterviewTurn = {
  role: "interviewer" | "candidate";
  content: string;
  /** The focus area an interviewer question belongs to. */
  focus?: AiInterviewFocus;
  /** 0 for the first question on a thread, then 1, 2, ... for each follow-up "why". */
  depth?: number;
  at: string;
};

export const AiInterviewTurnSchema = z.object({
  role: z.enum(["interviewer", "candidate"]),
  content: z.string(),
  focus: AiInterviewFocusSchema.optional(),
  depth: z.number().int().min(0).optional(),
  at: z.string(),
});

export const AiInterviewTranscriptSchema = z.array(AiInterviewTurnSchema);

const shortText = (max: number) => z.string().trim().min(1).max(max);

/** Structured feedback returned by the finish call and saved with the session. */
export const AiInterviewFeedbackSchema = z.object({
  strengths: z.array(shortText(400)).min(1).max(5),
  weaknesses: z
    .array(z.object({ point: shortText(400), fix: shortText(500) }))
    .min(1)
    .max(5),
  focusNotes: z.array(z.object({ focus: AiInterviewFocusSchema, note: shortText(600) })).max(AI_INTERVIEW_FOCUS_AREAS.length),
  nextSteps: z
    .array(shortText(400))
    .min(3)
    .transform((steps) => steps.slice(0, 3) as [string, string, string]),
});

export type AiInterviewFeedback = z.infer<typeof AiInterviewFeedbackSchema>;

/** Stored on the Response when a session finishes, so mentors read it in the existing report. */
export const AiInterviewPayloadSchema = z.object({
  sessionId: z.string(),
  turns: z.number().int().min(0),
  transcript: AiInterviewTranscriptSchema,
  feedback: AiInterviewFeedbackSchema,
});

export type AiInterviewPayload = z.infer<typeof AiInterviewPayloadSchema>;
