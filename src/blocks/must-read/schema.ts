import { z } from "zod";

export const MustReadConfigSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  source: z.string().optional(),
  readMinutes: z.number().int().positive().optional(),
  required: z.boolean().default(true),
  completionRule: z.literal("confirm_read").default("confirm_read"),
});

export type MustReadConfig = z.infer<typeof MustReadConfigSchema>;
export const MustReadPayloadSchema = z.object({ complete: z.boolean() });
export type MustReadPayload = z.infer<typeof MustReadPayloadSchema>;
