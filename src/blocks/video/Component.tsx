import { prisma } from "@/server/db";
import { Video } from "@/components/learn/video-embed";
import { VideoConfigSchema } from "./schema";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

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

  const block = await prisma.block.findUnique({ where: { id } }).catch(() => null);
  const parsed = block ? VideoConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VIDEO" || !parsed?.success) {
    return (
      <PendingBlockCard
        typeLabel="Video Walkthrough"
        title={title || "Video lecture in preparation"}
        description="The video walkthrough resource is being linked or prepared."
        blockId={id}
      />
    );
  }
  return <Video src={parsed.data.sourceUrl} title={parsed.data.title} caption={parsed.data.caption} transcriptUrl={parsed.data.transcriptUrl} />;
}

