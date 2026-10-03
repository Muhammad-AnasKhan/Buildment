import { z } from "zod";
import { resolveVideoEmbed } from "@/components/learn/video-embed";

const httpUrl = z.string().url().refine(
  (value) => {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  },
  "Use an HTTPS URL."
).refine((value) => Boolean(resolveVideoEmbed(value)), "Use a direct video file, YouTube, Vimeo, Loom, or Wistia link.");

export const VideoConfigSchema = z.object({
  title: z.string().min(1).max(140),
  sourceUrl: httpUrl,
  caption: z.string().max(500).optional(),
  transcriptUrl: httpUrl.optional(),
  requiredWatch: z.boolean().default(false),
});

export type VideoConfig = z.infer<typeof VideoConfigSchema>;
