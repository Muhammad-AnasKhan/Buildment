// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
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

export const AI_INTERVIEW_CONTEXT_MODES = ["resume", "project", "resume-and-project", "none"] as const;
export type AiInterviewContextMode = (typeof AI_INTERVIEW_CONTEXT_MODES)[number];

/** One box the learner fills in before starting. `field` is the name used on the wire and in the session. */
export type AiInterviewContextField = {
  field: "context" | "contextWork";
  /** What the text is, which decides how the interviewer is told about it. */
  role: "resume" | "work";
  label: string;
  hint: string;
  min: number;
  max: number;
};

/** The boxes a context mode asks for, each with its own length cap. Empty for "none". */
export function contextFields(mode: AiInterviewContextMode): AiInterviewContextField[] {
  const resume: AiInterviewContextField = {
    field: "context",
    role: "resume",
    label: "Your resume",
    hint: "Paste the text of your resume. The interviewer will ask about what is in it.",
    min: AI_INTERVIEW_LIMITS.contextMinChars,
    max: AI_INTERVIEW_LIMITS.contextMaxChars,
  };
  if (mode === "resume") return [resume];
  if (mode === "project") {
    return [{ ...resume, role: "work", label: "Your project", hint: "Paste a short description of your project. The interviewer will ask about what you built." }];
  }
  if (mode === "resume-and-project") {
    return [
      resume,
      {
        field: "contextWork",
        role: "work",
        label: "Your important work",
        hint: "Paste or describe the work you are proudest of: what you built, what you did yourself, and what came of it.",
        min: AI_INTERVIEW_LIMITS.contextMinChars,
        max: AI_INTERVIEW_LIMITS.workMaxChars,
      },
    ];
  }
  return [];
}

/** The learner's pasted text by role, from what a session stores. */
export function interviewContext(
  mode: AiInterviewContextMode,
  stored: { context: string | null; contextWork: string | null }
): { resume: string | null; work: string | null } {
  if (mode === "resume") return { resume: stored.context, work: null };
  if (mode === "project") return { resume: null, work: stored.context };
  if (mode === "resume-and-project") return { resume: stored.context, work: stored.contextWork };
  return { resume: null, work: null };
}

/** Caps shared by the API, the prompts and the UI so they cannot drift apart. */
export const AI_INTERVIEW_LIMITS = {
  answerMaxChars: 2000,
  contextMaxChars: 6000,
  contextMinChars: 40,
  /** The "important work" box when a resume is asked for too. */
  workMaxChars: 4000,
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

/** Named weak points the feedback call can raise, each tied to the learner's own words. */
export const AI_INTERVIEW_FLAG_NAMES = [
  "vague-ownership",
  "unsupported-number",
  "pseudo-story",
  "invented-reason-risk",
  "jargon-without-explanation",
] as const;

export type AiInterviewFlagName = (typeof AI_INTERVIEW_FLAG_NAMES)[number];

export const AI_INTERVIEW_FLAG_LABELS: Record<AiInterviewFlagName, string> = {
  "vague-ownership": "Vague ownership",
  "unsupported-number": "Unsupported number",
  "pseudo-story": "Pseudo-story",
  "invented-reason-risk": "Invented reason risk",
  "jargon-without-explanation": "Jargon without explanation",
};

/** What each flag means, in the words the feedback prompt and the UI share. */
export const AI_INTERVIEW_FLAG_MEANINGS: Record<AiInterviewFlagName, string> = {
  "vague-ownership": 'It stays unclear what the candidate personally did ("we did", "I was involved in").',
  "unsupported-number": "A number or result is given with no way to know where it came from or how it was measured.",
  "pseudo-story": "It sounds like a story but has no real situation, decision, action or outcome that could be checked.",
  "invented-reason-risk": "A reason is given that sounds made up after the fact, so a follow-up question may expose it.",
  "jargon-without-explanation": "Technical terms are used without saying what they mean or why they matter here.",
};

export const AiInterviewFlagSchema = z.object({
  name: z.enum(AI_INTERVIEW_FLAG_NAMES),
  /** The learner's own words that triggered the flag. */
  quote: shortText(300),
});

export type AiInterviewFlag = z.infer<typeof AiInterviewFlagSchema>;

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
  /** Every flag that applies, empty when none. Feedback saved before flags existed has none. */
  flags: z.array(AiInterviewFlagSchema).max(10).default([]),
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
