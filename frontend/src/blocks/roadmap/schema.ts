import { z } from "zod";

export const RoadmapConfigSchema = z.object({
  title: z.string().min(1).max(140),
  milestones: z.array(z.object({
    id: z.string().min(1).max(80),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(280),
    state: z.enum(["upcoming", "current", "goal"]).default("upcoming"),
  })).min(2).max(12).superRefine((items, context) => {
    if (new Set(items.map((item) => item.id)).size !== items.length) {
      context.addIssue({ code: "custom", message: "Each roadmap milestone needs a unique id." });
    }
    if (items.filter((item) => item.state === "current").length > 1) {
      context.addIssue({ code: "custom", message: "A roadmap can have only one current milestone." });
    }
  }),
});

export type RoadmapConfig = z.infer<typeof RoadmapConfigSchema>;
