// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { z } from "zod";

export const ChapterRecapConfigSchema = z.object({
  points: z.array(z.string()).min(1).max(8),
});

export type ChapterRecapConfig = z.infer<typeof ChapterRecapConfigSchema>;
