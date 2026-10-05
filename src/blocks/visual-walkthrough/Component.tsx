import { prisma } from "@/server/db";
import type { VisualWalkthroughConfig } from "./schema";
import { VisualWalkthroughConfigSchema } from "./schema";
import { VisualWalkthroughClient } from "./VisualWalkthroughClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function VisualWalkthroughComponent({
  id,
  title,
  steps,
}: {
  id?: string;
  title?: string;
  steps?: VisualWalkthroughConfig["steps"];
}) {
  if (title && steps && Array.isArray(steps) && steps.length > 0) {
    return <VisualWalkthroughClient title={title} steps={steps} />;
  }

  if (!id) return null;

  const block = await prisma.block.findUnique({ where: { id } }).catch(() => null);
  const parsed = block ? VisualWalkthroughConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VISUAL_WALKTHROUGH" || !parsed?.success) {
    return (
      <PendingBlockCard
        typeLabel="Visual Walkthrough"
        title={title || "Walkthrough slides in preparation"}
        description="The visual step-by-step walkthrough is currently being prepared."
        blockId={id}
      />
    );
  }
  return <VisualWalkthroughClient {...parsed.data} />;
}

