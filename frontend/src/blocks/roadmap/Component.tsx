import { fetchBlockState } from "@/blocks/block-state";
import type { RoadmapConfig } from "@/shared/blocks/roadmap/schema";
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

  const state = await fetchBlockState(id, "ROADMAP");
  if (!state) {
    return (
      <PendingBlockCard
        typeLabel="Learning Roadmap"
        title={title || "Roadmap milestones in preparation"}
        description="The phases and milestone checkpoints for this track are being outlined."
        blockId={id}
      />
    );
  }
  return <RoadmapClient {...state.config} />;
}


