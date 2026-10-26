import { fetchBlockState } from "@/blocks/block-state";
import { Video } from "@buildment/learning-ui/components/learn/video-embed";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";

export async function VideoComponent({
  id,
  src,
  sourceUrl,
  title,
  caption,
  transcriptUrl,
}: {
  id?: string;
  src?: string;
  sourceUrl?: string;
  title?: string;
  caption?: string;
  transcriptUrl?: string;
}) {
  const directSrc = src ?? sourceUrl;
  if (directSrc) {
    return <Video src={directSrc} title={title} caption={caption} transcriptUrl={transcriptUrl} />;
  }

  if (!id) {
    return null;
  }

  const state = await fetchBlockState(id, "VIDEO");
  if (!state) {
    return (
      <PendingBlockCard
        typeLabel="Video Walkthrough"
        title={title || "Video lecture in preparation"}
        description="The video walkthrough resource is being linked or prepared."
        blockId={id}
      />
    );
  }
  return <Video src={state.config.sourceUrl} title={state.config.title} caption={state.config.caption} transcriptUrl={state.config.transcriptUrl} />;
}

