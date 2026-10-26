import { ChapterRecap } from '@buildment/learning-ui/blocks/chapter-recap/ChapterRecap';
import { fetchBlockState } from "@/blocks/block-state";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";

export async function ChapterRecapComponent({
  id,
  points,
  items,
}: {
  id?: string;
  points?: string[];
  items?: string[];
}) {
  let list = points ?? items;

  if ((!list || !Array.isArray(list) || list.length === 0) && id) {
    const state = await fetchBlockState(id, "CHAPTER_RECAP");
    if (state) list = state.config.points;
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    if (id) {
      return (
        <PendingBlockCard
          typeLabel="Chapter Recap"
          title="Key ideas in progress"
          description="Summary takeaways for this chapter are currently being finalized."
          blockId={id}
        />
      );
    }
    return null;
  }

  return <ChapterRecap points={list} />;
}
