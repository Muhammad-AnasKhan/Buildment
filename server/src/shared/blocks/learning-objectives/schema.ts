import { z } from "zod";

export const LearningObjectivesConfigSchema = z.object({
  objectives: z.array(z.string()).min(1).max(10),
});

export type LearningObjectivesConfig = z.infer<typeof LearningObjectivesConfigSchema>;
