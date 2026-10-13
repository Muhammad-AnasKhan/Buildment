import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
import { MandatoryReadCard } from "@/components/learn/mandatory-read-card";
import { PendingBlockCard } from "@/components/learn/pending-block-card";
import { MustReadConfigSchema } from "./schema";

export async function MustReadComponent({
  id,
  title,
  url,
  href,
  description,
  summary,
  source,
  readMinutes,
}: {
  id?: string;
  title?: string;
  url?: string;
  href?: string;
  description?: string;
  summary?: string;
  source?: string;
  readMinutes?: number;
}) {
  const directUrl = url ?? href;
  const directTitle = title;
  const directDescription = description ?? summary;

  if (directUrl && directTitle && directDescription) {
    const user = await getSessionUser();
    const latest = user && id ? await getLatestBlockResponse(id, user.id) : null;
    return (
      <MandatoryReadCard
        blockId={id}
        initialRead={Boolean(latest && latest.status !== "DRAFT")}
        title={directTitle}
        href={directUrl}
        source={source}
        summary={directDescription}
        readMinutes={readMinutes}
      />
    );
  }

  if (!id) {
    return null;
  }

  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? MustReadConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "MUST_READ" || !parsed?.success) {
    return (
      <PendingBlockCard
        typeLabel="Mandatory Reading"
        title={title || "Reading assignment in progress"}
        description="Assigned documentation or article details are being configured."
        blockId={id}
      />
    );
  }
  const user = await getSessionUser();
  const latest = user ? await getLatestBlockResponse(id, user.id) : null;
  return (
    <MandatoryReadCard
      blockId={id}
      initialRead={Boolean(latest && latest.status !== "DRAFT")}
      title={parsed.data.title}
      href={parsed.data.url}
      source={parsed.data.source}
      summary={parsed.data.description}
      readMinutes={parsed.data.readMinutes}
    />
  );
}
