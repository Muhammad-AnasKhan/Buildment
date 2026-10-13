import { z } from "zod";

export const ProjectPreviewConfigSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string()).min(1).max(8),
  techStack: z.array(z.string()).optional(),
});

export type ProjectPreviewConfig = z.infer<typeof ProjectPreviewConfigSchema>;
