import { prisma } from "@/server/db";
import { VisualWalkthroughConfigSchema } from "./schema";
import { VisualWalkthroughClient } from "./VisualWalkthroughClient";

export async function VisualWalkthroughComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? VisualWalkthroughConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VISUAL_WALKTHROUGH" || !parsed?.success) {
    return <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Visual walkthrough block {id} is missing or misconfigured.</div>;
  }
  return <VisualWalkthroughClient {...parsed.data} />;
}
