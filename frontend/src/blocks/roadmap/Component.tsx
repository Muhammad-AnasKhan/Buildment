import { prisma } from "@/server/db";
import type { RoadmapConfig } from "./schema";
import { RoadmapConfigSchema } from "./schema";
import { RoadmapClient } from "./RoadmapClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function RoadmapComponent({
  id,
  title,
  milestones,
}: {
  id?: string;
  title?: string;
  milestones?: RoadmapConfig["milestones"];
}) {
  if (title && milestones && Array.isArray(milestones) && milestones.length > 0) {
    return <RoadmapClient title={title} milestones={milestones} />;
  }

  if (!id) return null;

  const block = await prisma.block.findUnique({ where: { id } }).catch(() => null);
  const parsed = block ? RoadmapConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "ROADMAP" || !parsed?.success) {
    return (
      <PendingBlockCard
        typeLabel="Learning Roadmap"
        title={title || "Roadmap milestones in preparation"}
        description="The phases and milestone checkpoints for this track are being outlined."
        blockId={id}
      />
    );
  }
  return <RoadmapClient {...parsed.data} />;
}


