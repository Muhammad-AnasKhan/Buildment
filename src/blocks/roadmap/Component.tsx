import { prisma } from "@/server/db";
import type { RoadmapConfig } from "./schema";
import { RoadmapConfigSchema } from "./schema";
import { RoadmapClient } from "./RoadmapClient";

export async function RoadmapComponent({
  id,
  title,
  milestones,
}: {
  id?: string;
  title?: string;
  milestones?: RoadmapConfig["milestones"];
}) {
  if (title && milestones && Array.isArray(milestones)) {
    return <RoadmapClient title={title} milestones={milestones} />;
  }

  if (!id) return null;

  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? RoadmapConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "ROADMAP" || !parsed?.success) {
    return <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Roadmap block {id} is missing or misconfigured.</div>;
  }
  return <RoadmapClient {...parsed.data} />;
}


