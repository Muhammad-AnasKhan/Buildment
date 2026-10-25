import { fetchBlockState } from "@/blocks/block-state";
import type { VisualWalkthroughConfig } from "@/shared/blocks/visual-walkthrough/schema";
import { VisualWalkthroughClient } from "@buildment/learning-ui/blocks/visual-walkthrough/VisualWalkthroughClient";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";

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

  const state = await fetchBlockState(id, "VISUAL_WALKTHROUGH");
  if (!state) {
    return (
      <PendingBlockCard
        typeLabel="Visual Walkthrough"
        title={title || "Walkthrough slides in preparation"}
        description="The visual step-by-step walkthrough is currently being prepared."
        blockId={id}
      />
    );
  }
  return <VisualWalkthroughClient {...state.config} />;
}

