import { z } from "zod";

const imageUrl = z.string().url().refine(
  (value) => {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  },
  "Use an HTTPS diagram URL."
);

export const VisualDiagramConfigSchema = z.object({
  title: z.string().min(1).max(140),
  imageUrl,
  alt: z.string().min(8).max(500),
  caption: z.string().max(1000).optional(),
  kind: z.enum(["system", "concept", "whiteboard"]).default("concept"),
  legend: z.array(z.string().min(1).max(160)).max(8).optional(),
});

export type VisualDiagramConfig = z.infer<typeof VisualDiagramConfigSchema>;
