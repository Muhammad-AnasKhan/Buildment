// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { z } from "zod";
import { isSafeAssetUrl } from "../../lib/asset-url";

const imageUrl = z.string().min(1).refine(isSafeAssetUrl, {
  message: "Use a local asset path or an HTTPS diagram URL.",
});

export const VisualDiagramConfigSchema = z.object({
  title: z.string().min(1).max(140),
  imageUrl,
  alt: z.string().min(8).max(500),
  caption: z.string().max(1000).optional(),
  kind: z.enum(["system", "concept", "whiteboard"]).default("concept"),
  legend: z.array(z.string().min(1).max(160)).max(8).optional(),
});

export type VisualDiagramConfig = z.infer<typeof VisualDiagramConfigSchema>;
