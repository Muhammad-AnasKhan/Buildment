import { prisma } from "@/server/db";
import { Video } from "@/components/learn/video-embed";
import { VideoConfigSchema } from "./schema";

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

  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? VideoConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "VIDEO" || !parsed?.success) {
    return <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Video block {id} is missing or misconfigured.</div>;
  }
  return <Video src={parsed.data.sourceUrl} title={parsed.data.title} caption={parsed.data.caption} transcriptUrl={parsed.data.transcriptUrl} />;
}

