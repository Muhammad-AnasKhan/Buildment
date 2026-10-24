import { LearningObjectivesView } from '@buildment/learning-ui/blocks/learning-objectives/LearningObjectivesView';
import { fetchBlockState } from "@/blocks/block-state";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function LearningObjectivesComponent({
  id,
  objectives,
  items,
}: {
  id?: string;
  objectives?: string[];
  items?: string[];
}) {
  let list = objectives ?? items;

  if ((!list || !Array.isArray(list) || list.length === 0) && id) {
    const state = await fetchBlockState(id, "LEARNING_OBJECTIVES");
    if (state) list = state.config.objectives;
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    if (id) {
      return (
        <PendingBlockCard
          typeLabel="Learning Objectives"
          title="Objectives in preparation"
          description="The learning goals for this chapter are currently being finalized."
          blockId={id}
        />
      );
    }
    return null;
  }

  return <LearningObjectivesView id={id} objectives={list} />;
}
