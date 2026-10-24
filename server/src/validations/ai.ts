import { z } from "zod";
import { AI_MODEL_ID_PATTERN } from "../shared/api/ai.js";

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
