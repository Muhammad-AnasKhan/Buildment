import { z } from "zod";

const imageUrl = z.string().url().refine(
  (value) => {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  },
  "Use an HTTPS image URL."
);

export const VisualWalkthroughConfigSchema = z.object({
  title: z.string().min(1).max(140),
  steps: z.array(z.object({
    id: z.string().min(1).max(80),
    title: z.string().min(1).max(140),
    description: z.string().min(1).max(1000),
    imageUrl,
    alt: z.string().min(8).max(500),
  })).min(2).max(12),
});

export type VisualWalkthroughConfig = z.infer<typeof VisualWalkthroughConfigSchema>;
