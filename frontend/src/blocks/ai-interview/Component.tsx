import { fetchBlockState } from "@/blocks/block-state";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";
import { AiInterviewClient } from "./AiInterviewClient";

/**
 * An AI interview block. The config comes from the API without its rubric; any
 * props written inline in a draft are ignored, so nothing authored in the page
 * can change what the interviewer is told.
 */
export async function AiInterviewComponent({ id, title }: { id?: string; title?: string }) {
  if (id) {
    const state = await fetchBlockState(id, "AI_INTERVIEW");
    if (state) return <AiInterviewClient id={id} config={state.config} initialState={state.initialState} />;
  }

  if (id || title) {
    return (
      <PendingBlockCard
        typeLabel="AI interview"
        title={title || "AI interview in progress"}
        description="An AI mock interview is being prepared for this section."
        blockId={id}
      />
    );
  }

  return null;
}
