// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { z } from "zod";
import { isSafeAssetUrl } from "../../lib/asset-url";

const imageUrl = z.string().min(1).refine(isSafeAssetUrl, {
  message: "Use a local asset path or an HTTPS image URL.",
});

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
