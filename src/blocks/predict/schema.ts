import { z } from "zod";

export const PredictOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const PredictContextSchema = z
  .object({
    method: z.string().optional(),
    url: z.string().optional(),
    bearer: z.string().optional(),
    responseHint: z.string().optional(),
  })
  .optional();

export const PredictConfigSchema = z.object({
  prompt: z.string(),
  options: z.array(PredictOptionSchema).min(2),
  correctOptionId: z.string(),
  explanation: z.string().optional(),
  allowRetry: z.boolean().default(true),
  context: PredictContextSchema,
});

export type PredictConfig = z.infer<typeof PredictConfigSchema>;

export type SanitizedPredictConfig = Omit<PredictConfig, "correctOptionId">;

export const PredictPayloadSchema = z.object({
  selected: z.string(),
});

export type PredictPayload = z.infer<typeof PredictPayloadSchema>;
