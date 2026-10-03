import { prisma } from "@/server/db";
import type { VisualWalkthroughConfig } from "./schema";
import { VisualWalkthroughConfigSchema } from "./schema";
import { VisualWalkthroughClient } from "./VisualWalkthroughClient";

export async function VisualWalkthroughComponent({
  id,
  title,
  steps,
}: {
  id?: string;
  title?: string;
  steps?: VisualWalkthroughConfig["steps"];
}) {
  if (title && steps && Array.isArray(steps)) {
    return <VisualWalkthroughClient title={title} steps={steps} />;
  }

  if (!id) return null;

  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? VisualWalkthroughConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VISUAL_WALKTHROUGH" || !parsed?.success) {
    return <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Visual walkthrough block {id} is missing or misconfigured.</div>;
  }
  return <VisualWalkthroughClient {...parsed.data} />;
}

