import { z } from "zod";
import { AI_MODEL_ID_PATTERN } from "../shared/api/ai.js";
import { AI_INTERVIEW_LIMITS } from "../shared/blocks/ai-interview/schema.js";

// Messages here never echo the submitted value: the key must not appear in an error.
const model = z
  .string()
  .trim()
  .max(120, "Model ids are at most 120 characters.")
  .refine((value) => value === "" || AI_MODEL_ID_PATTERN.test(value), "Use a model id like google/gemini-2.5-flash.")
  .transform((value) => (value === "" ? null : value));

export const aiCredentialSaveBody = z.object({
  apiKey: z
    .string({ error: "Paste your OpenRouter key." })
    .trim()
    .min(20, "That looks too short for an OpenRouter key.")
    .max(300, "That looks too long for an OpenRouter key.")
    .refine((value) => /^\S+$/.test(value), "The key cannot contain spaces."),
  model: model.nullable().optional(),
});

export const aiCredentialModelBody = z.object({ model: model.nullable() });

// ---- AI interview ------------------------------------------------------------------

export const aiInterviewStartBody = z.object({
  context: z.string().max(AI_INTERVIEW_LIMITS.contextMaxChars + 2000, "That is too long.").nullable().optional(),
});

const sessionId = z.string().trim().min(1).max(64);

export const aiInterviewAnswerBody = z.object({
  sessionId,
  answer: z
    .string({ error: "Write an answer first." })
    .trim()
    .min(1, "Write an answer first.")
    .max(AI_INTERVIEW_LIMITS.answerMaxChars, `Keep your answer under ${AI_INTERVIEW_LIMITS.answerMaxChars} characters.`),
});

export const aiInterviewSessionBody = z.object({ sessionId });
